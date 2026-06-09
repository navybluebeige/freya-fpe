const jwt     = require('jsonwebtoken');
const prisma  = require('../prisma/client');

// ─── Vérifie le token JWT ─────────────────────────────────────────────────────
const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Session expirée. Veuillez vous connecter.' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // $queryRaw — bypass de la validation enum Prisma pour supporter tous les rôles (incl. laboratory)
    const rows = await prisma.$queryRaw`
      SELECT id, email, phone, role, "firstName", last_name AS "lastName",
             is_active AS "isActive", clinic_id AS "clinicId"
      FROM users WHERE id = ${decoded.id} LIMIT 1
    `;
    const user = rows?.[0];

    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });

    // Sécurité : Vérifie si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte désactivé.' });
    }
    req.user = user;
    next();
  } catch (error) {
    // Il est préférable de logger l'erreur côté serveur pour le debug
    console.error("Erreur Auth Middleware:", error.message);
    return res.status(401).json({ error: 'Votre session a expiré.' });
  }
};

// ─── Vérifie le rôle ──────────────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
 if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès réservé aux ' + roles.join(' ou ') });
 } 
 next();
};

module.exports = { auth, requireRole };