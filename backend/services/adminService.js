const prisma = require('../prisma/client');

// ─── Stats globales ───────────────────────────────────────────────────────────
const getStats = async () => {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

  const [users, totalDoctors, approvedDoctors, pendingDoctors, totalAppts, todayAppts, clinics, totalLabs] = await Promise.all([
    prisma.user.count({ where: { role: 'patient' } }),
    prisma.doctor.count(),
    prisma.doctor.count({ where: { adminApproved: true } }),
    prisma.doctor.count({ where: { adminApproved: false } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.clinic.count(),
    prisma.user.count({ where: { role: 'laboratory' } }),
  ]);

  return { totalPatients: users, totalDoctors, approvedDoctors, pendingDoctors, totalAppointments: totalAppts, appointmentsToday: todayAppts, totalClinics: clinics, totalLabs };
};

// ─── Médecins en attente ──────────────────────────────────────────────────────
const getPendingDoctors = async () => {
  return prisma.doctor.findMany({
    where: { adminApproved: false },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } } }
  });
};

// ─── Approuver / Refuser un médecin ──────────────────────────────────────────
const approveDoctor = async (doctorId, approved, reason) => {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { userId: true } });
  if (!doctor) throw { status: 404, message: 'Médecin introuvable.' };

  await Promise.all([
    prisma.doctor.update({ where: { id: doctorId }, data: { adminApproved: approved } }),
    prisma.user.update({ where: { id: doctor.userId }, data: { isActive: approved } }),
  ]);

  const title = approved ? '✅ Compte validé !' : '❌ Demande refusée';
  const body  = approved
    ? 'Félicitations ! Votre compte médecin Freya a été validé. Vous pouvez maintenant vous connecter.'
    : `Votre demande a été refusée. ${reason || ''}`;

  await prisma.notification.create({ data: { userId: doctor.userId, type: 'admin_decision', title, body } });

  // Créer l'abonnement d'essai si approuvé
  if (approved) {
    const now = new Date();
    const endDate = new Date(now); endDate.setDate(endDate.getDate() + 30);
    await prisma.subscription.create({ data: { doctorId, plan: 'trial', amount: 0, status: 'trial', startDate: now, endDate } });
  }

  return { message: `Médecin ${approved ? 'approuvé' : 'refusé'}.` };
};

// ─── Tous les médecins ────────────────────────────────────────────────────────
const getAllDoctors = async ({ search, wilaya, approved } = {}) => {
  return prisma.doctor.findMany({
    where: {
      ...(wilaya   && { wilaya }),
      ...(approved !== undefined && { adminApproved: approved === '1' }),
      ...(search   && { user: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } }),
    },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, email: true, isActive: true, createdAt: true } } }
  });
};

// ─── Activer / désactiver un utilisateur ─────────────────────────────────────
const toggleUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true } });
  if (!user) throw { status: 404, message: 'Utilisateur introuvable.' };
  await prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  return { message: `Compte ${user.isActive ? 'désactivé' : 'activé'}.` };
};

// ─── Cliniques ────────────────────────────────────────────────────────────────
const getClinics = () => prisma.clinic.findMany({ orderBy: { createdAt: 'desc' } });

const addClinic = async (data) => {
  const clinic = await prisma.clinic.create({ data: { ...data, adminApproved: true } });
  return { message: 'Clinique ajoutée.', clinicId: clinic.id };
};

// ─── Tous les patients ────────────────────────────────────────────────────────
const getAllPatients = async ({ search } = {}) => {
  return prisma.user.findMany({
    where: {
      role: 'patient',
      ...(search && { OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName:  { contains: search, mode: 'insensitive' } },
        { email:     { contains: search, mode: 'insensitive' } },
      ]}),
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, wilaya: true, isActive: true, createdAt: true },
  });
};

// ─── Tous les rendez-vous ────────────────────────────────────────────────────
const getAllAppointments = async ({ status, search, page = 1, limit = 30 } = {}) => {
  const where = {
    ...(status && { status }),
    ...(search && { OR: [
      { patient: { firstName: { contains: search, mode: 'insensitive' } } },
      { patient: { lastName:  { contains: search, mode: 'insensitive' } } },
    ]}),
  };
  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'desc' },
      take: Number(limit),
      skip,
      include: {
        patient: { select: { firstName: true, lastName: true, email: true } },
        doctor:  { select: { specialite: true, user: { select: { firstName: true, lastName: true } } } },
        clinic:  { select: { name: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);
  return { appointments, total, page: Number(page), limit: Number(limit) };
};

// ─── Tous les laboratoires ────────────────────────────────────────────────────
const getAllLabs = async ({ search } = {}) => {
  return prisma.clinic.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      users: { select: { id: true, firstName: true, lastName: true, email: true, isActive: true, createdAt: true } },
    },
  });
};

// ─── Activer/suspendre un laboratoire ────────────────────────────────────────
const toggleLab = async (clinicId) => {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { adminApproved: true } });
  if (!clinic) throw { status: 404, message: 'Laboratoire introuvable.' };
  const newState = !clinic.adminApproved;
  await prisma.clinic.update({ where: { id: clinicId }, data: { adminApproved: newState } });
  await prisma.user.updateMany({ where: { clinicId, role: 'laboratory' }, data: { isActive: newState } });
  return { message: `Laboratoire ${newState ? 'activé' : 'suspendu'}.`, active: newState };
};

// ─── Supprimer un utilisateur ─────────────────────────────────────────────────
const deleteUser = async (userId) => {
  await prisma.user.delete({ where: { id: userId } });
  return { message: 'Utilisateur supprimé.' };
};

module.exports = { getStats, getPendingDoctors, approveDoctor, getAllDoctors, toggleUser, getClinics, addClinic, getAllPatients, getAllAppointments, getAllLabs, toggleLab, deleteUser };