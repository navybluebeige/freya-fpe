const prisma = require('../prisma/client');

// ─── Mes conversations ────────────────────────────────────────────────────────
const getConversations = async (user) => {
  if (user.role === 'patient') {
    return prisma.conversation.findMany({
      where: { patientId: user.id },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true } },
        _count: { select: { messages: { where: { isRead: false, senderId: { not: user.id } } } } }
      }
    });
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
  return prisma.conversation.findMany({
    where: { doctorId: doctor.id },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      patient: { select: { firstName: true, lastName: true, avatar: true } },
      messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { content: true, createdAt: true } },
      _count: { select: { messages: { where: { isRead: false, senderId: { not: user.id } } } } }
    }
  });
};

// ─── Créer ou récupérer une conversation ──────────────────────────────────────
const getOrCreateConversation = async (patientId, doctorId) => {
  const existing = await prisma.conversation.findUnique({ where: { doctorId_patientId: { doctorId, patientId } } });
  if (existing) return existing;
  return prisma.conversation.create({ data: { doctorId, patientId } });
};

// ─── Messages d'une conversation ─────────────────────────────────────────────
const getMessages = async (conversationId, userId) => {
  // Marquer comme lus
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, isRead: false },
    data: { isRead: true }
  });

  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } }
  });
};

// ─── Envoyer un message ───────────────────────────────────────────────────────
const sendMessage = async (conversationId, senderId, content) => {
  if (!content?.trim()) throw { status: 400, message: 'Message vide.' };

  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv) throw { status: 404, message: 'Conversation introuvable.' };

  // Vérifier que l'expéditeur fait partie de la conversation
  const docUser = await prisma.user.findFirst({ where: { doctor: { id: conv.doctorId } }, select: { id: true } });
  const isParticipant = senderId === conv.patientId || senderId === docUser.id;
  if (!isParticipant) throw { status: 403, message: 'Accès refusé.' };

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId, senderId, content: content.trim() },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } } }
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date() } })
  ]);

  // Notification au destinataire
  const recipientId = senderId === conv.patientId ? docUser.id : conv.patientId;
  const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { firstName: true } });
  await prisma.notification.create({
    data: { userId: recipientId, type: 'new_message', title: `Message de ${sender.firstName}`, body: content.trim().substring(0, 100), data: { conversationId } }
  });

  return message;
};

module.exports = { getConversations, getOrCreateConversation, getMessages, sendMessage };