// seed_scenario.js — 3 comptes démo prêts pour le scénario complet
require('dotenv').config();
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

const PASS = 'FreyaDemo2026!';

async function main() {
  console.log('\n🌱 Création des 3 comptes de scénario...\n');
  const hash = await bcrypt.hash(PASS, 10);

  /* ── 1. PATIENT ─────────────────────────────────────────────────────────── */
  const patient = await prisma.user.upsert({
    where: { email: 'scenario.patient@freya.dz' },
    update: { password: hash },
    create: {
      email: 'scenario.patient@freya.dz',
      password: hash,
      firstName: 'Sara',
      lastName: 'Amrani',
      role: 'patient',
      phone: '0550112233',
      wilaya: 'Alger',
      isActive: true,
      isVerified: true,
      patientProfile: {
        create: {
          bloodType: 'A+',
          dateOfBirth: new Date('1995-06-15'),
          gender: 'female',
          height: 165,
          weight: 58,
          allergies: 'Aucune allergie connue',
          chronicDiseases: 'Aucune maladie chronique',
        }
      }
    },
  });
  console.log('✅ Patient :', patient.email);

  /* ── 2. MEDECIN ──────────────────────────────────────────────────────────── */
  const docUser = await prisma.user.upsert({
    where: { email: 'scenario.medecin@freya.dz' },
    update: { password: hash },
    create: {
      email: 'scenario.medecin@freya.dz',
      password: hash,
      firstName: 'Yacine',
      lastName: 'Bouras',
      role: 'doctor',
      phone: '0661223344',
      wilaya: 'Alger',
      isActive: true,
      isVerified: true,
    },
  });

  let doctor = await prisma.doctor.findUnique({ where: { userId: docUser.id } });
  if (!doctor) {
    doctor = await prisma.doctor.create({
      data: {
        userId: docUser.id,
        specialite: 'Cardiologue',
        ordreNumber: 'SCENARIO-DOC-001',
        ordreVerified: true,
        adminApproved: true,
        cabinetAddress: '23 Rue Didouche Mourad, Alger-Centre',
        wilaya: 'Alger',
        city: 'Alger-Centre',
        bio: 'Cardiologue avec 12 ans d\'expérience au CHU Mustapha d\'Alger. Spécialisé en cardiologie interventionnelle et préventive.',
        consultationPrice: 3500,
        languages: 'Arabe,Français',
        experienceYears: 12,
        education: 'Doctorat en Médecine – Université d\'Alger · Spécialisation Cardiologie – CHU Mustapha',
        ratingAvg: 4.7,
        ratingCount: 89,
      }
    });
  } else {
    await prisma.doctor.update({
      where: { userId: docUser.id },
      data: { adminApproved: true, ordreVerified: true }
    });
  }

  // Disponibilités du médecin : Samedi-Jeudi, matin + après-midi
  await prisma.availability.deleteMany({ where: { doctorId: doctor.id } });
  const WORK_DAYS = [6, 0, 1, 2, 3, 4]; // Sam, Dim, Lun, Mar, Mer, Jeu
  const SCHEDULE = [
    { start: '08:30', end: '12:00', duration: 30 },
    { start: '14:00', end: '17:30', duration: 30 },
  ];
  const availData = [];
  for (const day of WORK_DAYS) {
    for (const s of SCHEDULE) {
      availData.push({ doctorId: doctor.id, dayOfWeek: day, startTime: s.start, endTime: s.end, slotDuration: s.duration, isAvailable: true });
    }
  }
  await prisma.availability.createMany({ data: availData });
  console.log(`✅ Médecin : ${docUser.email} | ${availData.length} créneaux créés`);

  /* ── 3. LABORATOIRE ──────────────────────────────────────────────────────── */
  // Créer ou réutiliser la clinique
  let clinic = await prisma.clinic.findFirst({ where: { email: 'scenario.labo@freya.dz' } });
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: 'Laboratoire BioSanté Alger',
        address: '14 Boulevard Zighout Youcef, Alger-Centre',
        wilaya: 'Alger',
        city: 'Alger-Centre',
        phone: '021 63 44 55',
        email: 'scenario.labo@freya.dz',
        specialites: 'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Hormonologie',
        description: 'Sam-Jeu: 07h30-19h00 | Ven: Fermé',
        adminApproved: true,
        ratingAvg: 4.5,
        ratingCount: 43,
      }
    });
  }

  const labUser = await prisma.user.upsert({
    where: { email: 'scenario.labo@freya.dz' },
    update: { password: hash, clinicId: clinic.id },
    create: {
      email: 'scenario.labo@freya.dz',
      password: hash,
      firstName: 'BioSanté Alger',
      lastName: '',
      role: 'laboratory',
      phone: '021634455',
      wilaya: 'Alger',
      isActive: true,
      isVerified: true,
      clinicId: clinic.id,
    },
  });
  console.log('✅ Laboratoire :', labUser.email, '| Clinique:', clinic.name);

  console.log('\n─────────────────────────────────────────────');
  console.log('  COMPTES DE SCÉNARIO PRÊTS');
  console.log('─────────────────────────────────────────────');
  console.log(`  Patient    → scenario.patient@freya.dz   / ${PASS}`);
  console.log(`  Médecin    → scenario.medecin@freya.dz   / ${PASS}`);
  console.log(`  Labo       → scenario.labo@freya.dz      / ${PASS}`);
  console.log('─────────────────────────────────────────────\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
