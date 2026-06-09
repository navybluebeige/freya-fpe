const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const prisma  = require('../prisma/client');

// ─── Inscription patient ──────────────────────────────────────────────────────
const registerPatient = async ({ email, password, firstName, lastName, phone, wilaya }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email déjà utilisé.' };

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email, password: hashed, role: 'patient',
      firstName, lastName, phone, wilaya,
      isActive: true, isVerified: true,
      patientProfile: { create: {} }
    },
    select: { id: true, email: true, role: true, firstName: true, lastName: true }
  });

  const token = _signToken(user.id, user.role);
  return { token, user };
};

// ─── Inscription médecin ──────────────────────────────────────────────────────
const registerDoctor = async ({ email, password, firstName, lastName, phone, specialite, ordreNumber, wilaya, city, cabinetAddress, consultationPrice, bio }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'Email déjà utilisé.' };

  const existingOrdre = await prisma.doctor.findUnique({ where: { ordreNumber } });
  if (existingOrdre) throw { status: 409, message: 'Numéro d\'ordre déjà enregistré.' };

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email, password: hashed, role: 'doctor',
      firstName, lastName, phone, wilaya,
      doctor: {
        create: { specialite, ordreNumber, wilaya, city, cabinetAddress, consultationPrice: consultationPrice || 2000, bio }
      }
    },
    select: { id: true, email: true, role: true, firstName: true, lastName: true, doctor: { select: { id: true } } }
  });

  // Notifier l'admin
  await prisma.notification.create({
    data: {
      userId: user.id, type: 'registration',
      title: 'Inscription en attente',
      body: 'Votre compte médecin est en cours de vérification. Vous serez notifié sous 48h.',
    }
  });

  return { message: 'Inscription soumise. En attente de validation par l\'administrateur.', userId: user.id };
};

// ─── Connexion ────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Email ou mot de passe incorrect.' };
  if (!user.isActive) throw { status: 403, message: 'Compte désactivé.' };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: 'Email ou mot de passe incorrect.' };

  // Vérifier validation admin pour médecin
  if (user.role === 'doctor') {
    const doctor = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { adminApproved: true } });
    if (!doctor?.adminApproved) throw { status: 403, message: 'Votre compte médecin est en attente de validation.' };
  }

  const token = _signToken(user.id, user.role);
  const { password: _, ...userData } = user;
  return { token, user: userData };
};

// ─── Profil utilisateur connecté ──────────────────────────────────────────────
const getMe = async (userId, role) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, role: true, firstName: true, lastName: true,
      phone: true, wilaya: true, avatar: true, createdAt: true,
      doctor: role === 'doctor' ? { include: { availabilities: true, subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 } } } : false,
      patientProfile: role === 'patient' ? true : false,
    }
  });
  if (!user) throw { status: 404, message: 'Utilisateur introuvable.' };
  return user;
};

// ─── Mise à jour profil ───────────────────────────────────────────────────────
const updateProfile = async (userId, { firstName, lastName, phone, wilaya }) => {
  await prisma.user.update({ where: { id: userId }, data: { firstName, lastName, phone, wilaya } });
  return { message: 'Profil mis à jour.' };
};

// ─── Changement mot de passe ──────────────────────────────────────────────────
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw { status: 400, message: 'Mot de passe actuel incorrect.' };
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: 'Mot de passe modifié avec succès.' };
};

// ─── Utilitaire ───────────────────────────────────────────────────────────────
const _signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION_IN || '7d' });

module.exports = { registerPatient, registerDoctor, login, getMe, updateProfile, changePassword };