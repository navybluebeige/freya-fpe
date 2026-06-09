const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
const { sendWelcomePatient, sendWelcomeDoctor, sendWelcomeLab } = require('../services/emailService');

// ─── INSCRIPTION ───
router.post(['/register', '/register/patient'], async (req, res) => {
  try {
    const { email, phone, firstName, lastName, password, role } = req.body;

    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length === 0) {
      return res.status(400).json({ error: "Email ou téléphone requis." });
    }

    const existingUser = await prisma.user.findFirst({ where: { OR: conditions } });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email ou numéro de téléphone est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const effectiveRole = role || 'patient';
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        firstName,
        lastName,
        password: hashedPassword,
        role: effectiveRole,
        isActive: true,
        isVerified: false,
        patientProfile: (effectiveRole === 'patient') ? { create: {} } : undefined,
      }
    });

    // Auto-créer le profil Doctor si role === 'doctor'
    if (effectiveRole === 'doctor') {
      const { specialite, wilaya, city, cabinetAddress } = req.body;
      await prisma.doctor.create({
        data: {
          userId: user.id,
          specialite: specialite || 'Médecin généraliste',
          wilaya: wilaya || 'Alger',
          city: city || null,
          cabinetAddress: cabinetAddress || null,
          adminApproved: true,
          ordreVerified: false,
          consultationPrice: 2000,
          languages: 'Arabe,Français',
          experienceYears: 0,
        }
      });
      // Créneaux par défaut : Dim-Jeu + Sam, 08h-12h et 14h-18h
      const doctorRec = await prisma.doctor.findUnique({ where: { userId: user.id }, select: { id: true } });
      const defaultSlots = [];
      for (const day of [6, 0, 1, 2, 3, 4]) {
        defaultSlots.push({ doctorId: doctorRec.id, dayOfWeek: day, startTime: '08:00', endTime: '12:00', slotDuration: 30, isAvailable: true });
        defaultSlots.push({ doctorId: doctorRec.id, dayOfWeek: day, startTime: '14:00', endTime: '18:00', slotDuration: 30, isAvailable: true });
      }
      await prisma.availability.createMany({ data: defaultSlots });
    }

    // Auto-créer la clinique si role === 'laboratory'
    if (effectiveRole === 'laboratory') {
      const { clinicName, wilaya, city, address } = req.body;
      const clinic = await prisma.clinic.create({
        data: {
          name: clinicName || `Laboratoire ${firstName}`,
          address: address || wilaya || 'Algérie',
          wilaya: wilaya || 'Alger',
          city: city || null,
          phone: phone || null,
          email: email || null,
          specialites: 'Laboratoire,Analyses,Hématologie,Biochimie',
          adminApproved: true,
        }
      });
      await prisma.user.update({ where: { id: user.id }, data: { clinicId: clinic.id } });
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'registration',
        title: 'Bienvenue sur Freya !',
        body: `Bonjour ${firstName}, votre compte a été créé avec succès.`,
      }
    })
    try {
      if (effectiveRole === 'patient')    await sendWelcomePatient(email, firstName);
      if (effectiveRole === 'doctor')     await sendWelcomeDoctor(email, firstName);
      if (effectiveRole === 'laboratory') await sendWelcomeLab(email, req.body.clinicName || firstName);
    } catch (e) { console.warn('Email non envoyé:', e.message); }

    res.status(201).json({ message: "Compte créé avec succès", userId: user.id, role: effectiveRole });
  } catch (error) {
    console.error("Erreur Register:", error);
    res.status(500).json({ error: "Erreur lors de l'inscription." });
  }
});

// ─── CONNEXION ───
router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, phone: rawPhone, password } = req.body;
    const email = rawEmail?.trim() || null;
    const phone = rawPhone?.trim() || null;
    console.log(`[LOGIN] email="${email}" phone="${phone}" password="${password ? '***' : 'VIDE'}"`);

    if (!email && !phone) {
      return res.status(400).json({ error: "Email ou téléphone requis." });
    }

    // $queryRaw — bypass de la validation enum Prisma pour supporter tous les rôles
    let rows;
    if (email) {
      rows = await prisma.$queryRaw`
        SELECT id, email, phone, role, "firstName", last_name AS "lastName",
               password, is_active AS "isActive", is_verified AS "isVerified",
               wilaya, clinic_id AS "clinicId"
        FROM users WHERE email = ${email} LIMIT 1
      `;
    } else {
      rows = await prisma.$queryRaw`
        SELECT id, email, phone, role, "firstName", last_name AS "lastName",
               password, is_active AS "isActive", is_verified AS "isVerified",
               wilaya, clinic_id AS "clinicId"
        FROM users WHERE phone = ${phone} LIMIT 1
      `;
    }

    const user = rows?.[0];
    if (!user) {
      console.log('[LOGIN] 401 - utilisateur non trouvé');
      return res.status(401).json({ error: "Identifiants incorrects." });
    }
    if (!user.isActive) return res.status(403).json({ error: "Compte désactivé." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('[LOGIN] 401 - mauvais mot de passe pour:', email || phone);
      return res.status(401).json({ error: "Identifiants incorrects." });
    }

    if (user.role === 'doctor') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: user.id },
        select: { adminApproved: true }
      });
      if (!doctor?.adminApproved) {
        return res.status(403).json({ error: "Votre compte médecin est en attente de validation par l'administrateur." });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'votre_cle_secrete',
      { expiresIn: process.env.JWT_EXPIRATION_IN || '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    console.log('[LOGIN] 200 OK - rôle:', user.role);
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Erreur Login:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// ─── ROUTES PROTÉGÉES ───
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);

// ─── SUPPRESSION DE COMPTE ───
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { password: true } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    const valid = await bcrypt.compare(password || '', user.password);
    if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect.' });
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Compte supprimé.' });
  } catch (err) {
    console.error('Delete account:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte.' });
  }
});

module.exports = router;
