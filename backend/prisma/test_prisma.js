require('dotenv').config();
const prisma = require('../prisma/client');

async function main() {
  console.log('\n=== TEST PRISMA ===\n');

  // 1. Connexion
  const total = await prisma.user.count();
  console.log('Connexion DB  : OK');
  console.log('Total users   :', total);

  // 2. Comptes demo
  const accounts = await prisma.user.findMany({
    where: { email: { in: ['admin@freya.dz', 'patient@freya.dz', 'dr.benali@freya.dz'] } },
    select: { email: true, role: true, isActive: true },
  });
  console.log('\nComptes demo  :');
  accounts.forEach(u => console.log(' -', u.email, '|', u.role, '| actif:', u.isActive));

  // 3. Autres tables
  const doctors = await prisma.doctor.count();
  const clinics = await prisma.clinic.count();
  const appointments = await prisma.appointment.count();
  console.log('\nDoctors       :', doctors);
  console.log('Clinics       :', clinics);
  console.log('Appointments  :', appointments);

  console.log('\n=== TOUT OK ===\n');
}

main()
  .catch(e => { console.error('\nERREUR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
