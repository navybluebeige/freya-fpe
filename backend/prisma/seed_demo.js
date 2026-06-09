// Crée les comptes démo : admin, patient, docteur
require('dotenv').config();
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('\n🌱 Création des comptes démo...\n');

  const adminPass   = await bcrypt.hash('admin123', 10);
  const patientPass = await bcrypt.hash('password123', 10);
  const doctorPass  = await bcrypt.hash('password123', 10);

  // ─── Admin ───────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@freya.dz' },
    update: { password: adminPass },
    create: {
      email: 'admin@freya.dz',
      password: adminPass,
      firstName: 'Admin',
      lastName: 'Freya',
      role: 'admin',
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Admin créé :', admin.email);

  // ─── Patient démo ─────────────────────────────────────────────────────────
  const patient = await prisma.user.upsert({
    where: { email: 'patient@freya.dz' },
    update: { password: patientPass },
    create: {
      email: 'patient@freya.dz',
      password: patientPass,
      firstName: 'Sara',
      lastName: 'Benali',
      role: 'patient',
      isActive: true,
      isVerified: true,
      patientProfile: { create: {} },
    },
  });
  console.log('✅ Patient créé :', patient.email);

  // ─── Docteur démo ────────────────────────────────────────────────────────
  const doctor = await prisma.user.upsert({
    where: { email: 'dr.benali@freya.dz' },
    update: { password: doctorPass },
    create: {
      email: 'dr.benali@freya.dz',
      password: doctorPass,
      firstName: 'Karim',
      lastName: 'Benali',
      role: 'doctor',
      isActive: true,
      isVerified: true,
      wilaya: 'Alger',
      doctor: {
        create: {
          specialite: 'Cardiologue',
          ordreNumber: 'DEMO-001',
          ordreVerified: true,
          adminApproved: true,
          cabinetAddress: '15 Rue Didouche Mourad, Alger-Centre',
          wilaya: 'Alger',
          city: 'Alger-Centre',
          bio: 'Cardiologue avec 15 ans d\'expérience, spécialisé en cardiologie interventionnelle.',
          consultationPrice: 4000,
          languages: 'Arabe,Français',
          experienceYears: 15,
          education: 'Doctorat en Médecine – Université d\'Alger · Spécialisation CHU Mustapha',
          ratingAvg: 4.8,
          ratingCount: 127,
        },
      },
    },
  });
  console.log('✅ Docteur créé :', doctor.email);

  console.log('\n🎉 Comptes démo prêts !\n');
  console.log('   admin@freya.dz     / admin123');
  console.log('   patient@freya.dz   / password123');
  console.log('   dr.benali@freya.dz / password123\n');
}

main()
  .catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
