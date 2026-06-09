// v3.0 — inscription médecin/labo auto-profil, design moderne, 3 comptes scénario
require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { appointmentsRouter, messagesRouter, recordsRouter, reviewsRouter, adminRouter, notificationsRouter } = require('./routes/index');

const app = express();


// ─── Middleware globaux ───────────────────────────────────────────────────────

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/doctors',       require('./routes/doctors'));
app.use('/api/laboratory',    require('./routes/laboratory'));
app.use('/api/labo',          require('./routes/labo'));
app.use('/api/appointments',  appointmentsRouter);
app.use('/api/messages',      messagesRouter);
app.use('/api/records',       recordsRouter);
app.use('/api/reviews',       reviewsRouter);
app.use('/api/admin',         adminRouter);
app.use('/api/notifications', notificationsRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Freya API v2', time: new Date() }));

// ─── Erreurs ──────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Freya API v2 démarrée → http://localhost:${PORT}`);
  console.log(`📦 Architecture : Routes → Controllers → Services → Prisma → PostgreSQL\n`);
});
