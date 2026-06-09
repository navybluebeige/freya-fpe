const prisma = require('../prisma/client');
const messageService = require('../services/messageService');

const getConversations = async (req, res, next) => {
  try { res.json(await messageService.getConversations(req.user)); } catch (err) { next(err); }
};
const createConversation = async (req, res, next) => {
  try {
    let patientId, doctorId;
    if (req.user.role === 'patient') {
      patientId = req.user.id;
      doctorId = req.body.doctorId;
    } else if (req.user.role === 'doctor') {
      patientId = req.body.patientId;
      const doc = await prisma.doctor.findUnique({ where: { userId: req.user.id }, select: { id: true } });
      if (!doc) return res.status(404).json({ error: 'Profil médecin introuvable.' });
      doctorId = doc.id;
    } else {
      return res.status(403).json({ error: 'Seuls les médecins et patients peuvent créer des conversations.' });
    }
    res.json(await messageService.getOrCreateConversation(patientId, doctorId));
  } catch (err) { next(err); }
};
const getMessages = async (req, res, next) => {
  try { res.json(await messageService.getMessages(req.params.id, req.user.id)); } catch (err) { next(err); }
};
const sendMessage = async (req, res, next) => {
  try { res.status(201).json(await messageService.sendMessage(req.params.id, req.user.id, req.body.content)); } catch (err) { next(err); }
};

module.exports = { getConversations, createConversation, getMessages, sendMessage };