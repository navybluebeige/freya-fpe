// seed_availabilities.js — Ajoute des créneaux de disponibilité à tous les médecins
// Semaine algérienne : Samedi (6) à Jeudi (4), Vendredi (5) = repos
require('dotenv').config();
const prisma = require('../prisma/client');

// dayOfWeek : 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven(fermé), 6=Sam
const WORK_DAYS = [6, 0, 1, 2, 3, 4]; // Sam → Jeu

// Variété de plannings (chaque médecin en reçoit un)
const SCHEDULES = [
  // Planning A : journée complète
  [
    { start: '08:00', end: '12:00', duration: 30 },
    { start: '14:00', end: '18:00', duration: 30 },
  ],
  // Planning B : matinée uniquement
  [
    { start: '08:30', end: '13:00', duration: 30 },
  ],
  // Planning C : après-midi uniquement
  [
    { start: '13:30', end: '18:30', duration: 30 },
  ],
  // Planning D : courtes sessions
  [
    { start: '09:00', end: '12:30', duration: 30 },
    { start: '15:00', end: '18:00', duration: 30 },
  ],
  // Planning E : journée longue
  [
    { start: '07:30', end: '12:00', duration: 30 },
    { start: '14:00', end: '19:00', duration: 30 },
  ],
  // Planning F : créneaux de 20 min (spécialistes rapides)
  [
    { start: '08:00', end: '12:00', duration: 20 },
    { start: '14:00', end: '17:20', duration: 20 },
  ],
];

// Certains médecins ne travaillent pas certains jours de la semaine
const DAY_PATTERNS = [
  WORK_DAYS,                          // tous les jours
  WORK_DAYS,                          // tous les jours (poids double)
  [6, 0, 1, 2, 3],                   // Sam-Jeu sans Jeu
  [6, 0, 1, 2, 4],                   // pas le Mer
  [0, 1, 2, 3, 4],                   // Dim-Jeu (pas Sam)
  [6, 0, 2, 3, 4],                   // pas le Lun
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('\n📅 Ajout des disponibilités pour tous les médecins...\n');

  const doctors = await prisma.doctor.findMany({
    where: { adminApproved: true },
    select: { id: true },
  });

  console.log(`   → ${doctors.length} médecins trouvés\n`);

  // Supprime les anciens créneaux
  const deleted = await prisma.availability.deleteMany({});
  console.log(`   ✅ ${deleted.count} anciens créneaux supprimés\n`);

  let totalSlots = 0;

  for (const doctor of doctors) {
    const schedule   = pick(SCHEDULES);
    const dayPattern = pick(DAY_PATTERNS);

    const data = [];
    for (const day of dayPattern) {
      for (const { start, end, duration } of schedule) {
        data.push({
          doctorId:     doctor.id,
          dayOfWeek:    day,
          startTime:    start,
          endTime:      end,
          slotDuration: duration,
          isAvailable:  true,
        });
      }
    }

    await prisma.availability.createMany({ data });
    totalSlots += data.length;
  }

  console.log(`✅ ${totalSlots} créneaux créés pour ${doctors.length} médecins\n`);
  console.log('🎉 Seed des disponibilités terminé !\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
