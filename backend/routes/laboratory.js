// routes/laboratory.js
// Utilise la table "clinics" du schéma existant pour les laboratoires
// Les labos sont des cliniques avec specialites contenant "Laboratoire" ou "Analyses"

const router  = require('express').Router();
const prisma  = require('../prisma/client');

// GET /api/laboratory  — recherche publique des laboratoires
router.get('/', async (req, res) => {
  try {
    const { wilaya, name, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const where = {
      adminApproved: true,
      OR: [
        { specialites: { contains: 'Laboratoire', mode: 'insensitive' } },
        { specialites: { contains: 'Analyses',    mode: 'insensitive' } },
        { specialites: { contains: 'Biologie',    mode: 'insensitive' } },
        { name:        { contains: 'Laboratoire', mode: 'insensitive' } },
        { name:        { contains: 'Biolab',      mode: 'insensitive' } },
        { name:        { contains: 'Bio-Lab',     mode: 'insensitive' } },
        { name:        { contains: 'Analyse',     mode: 'insensitive' } },
        { name:        { contains: 'Biologie',    mode: 'insensitive' } },
      ],
    };

    if (wilaya) {
      where.wilaya = { contains: wilaya, mode: 'insensitive' };
      delete where.OR; // simplifier quand wilaya est fournie
      where.AND = [
        { adminApproved: true },
        { wilaya: { contains: wilaya, mode: 'insensitive' } },
        {
          OR: [
            { specialites: { contains: 'Laboratoire', mode: 'insensitive' } },
            { specialites: { contains: 'Analyses',    mode: 'insensitive' } },
            { specialites: { contains: 'Biologie',    mode: 'insensitive' } },
            { name:        { contains: 'Laboratoire', mode: 'insensitive' } },
            { name:        { contains: 'Biolab',      mode: 'insensitive' } },
            { name:        { contains: 'Bio-Lab',     mode: 'insensitive' } },
            { name:        { contains: 'Analyse',     mode: 'insensitive' } },
            { name:        { contains: 'Biologie',    mode: 'insensitive' } },
          ]
        }
      ];
      delete where.OR;
      delete where.wilaya;
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    const [labs, total] = await Promise.all([
      prisma.clinic.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.clinic.count({ where }),
    ]);

    // Adapter la réponse au format attendu par le frontend
    const formatted = labs.map(l => ({
      id:           l.id,
      name:         l.name,
      address:      l.address,
      wilaya:       l.wilaya,
      city:         l.city,
      phone:        l.phone,
      analyses:     l.specialites,   // le frontend lit "analyses"
      openingHours: l.description,   // le frontend lit "openingHours"
      description:  l.description,
      adminApproved:l.adminApproved,
    }));

    res.json({ labs: formatted, total, page: parseInt(page) });
  } catch (err) {
    console.error('Lab search error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/laboratory/:id
router.get('/:id', async (req, res) => {
  try {
    const lab = await prisma.clinic.findUnique({ where: { id: req.params.id } });
    if (!lab) return res.status(404).json({ error: 'Laboratoire introuvable.' });
    res.json({
      ...lab,
      analyses:     lab.specialites,
      openingHours: lab.description,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
