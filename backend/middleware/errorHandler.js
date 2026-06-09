// ─── Gestionnaire d'erreurs global ───────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} —`, err.message);

  // Erreurs Prisma connues
  if (err.code === 'P2002') return res.status(409).json({ error: 'Cette valeur existe déjà (doublon).' });
  if (err.code === 'P2025') return res.status(404).json({ error: 'Enregistrement introuvable.' });
  if (err.code === 'P2003') return res.status(400).json({ error: 'Référence invalide.' });

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erreur serveur interne.' });
};

// ─── Erreur 404 ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} introuvable.` });
};

module.exports = { errorHandler, notFound };