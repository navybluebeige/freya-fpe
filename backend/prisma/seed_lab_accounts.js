// seed_lab_accounts.js — Crée des comptes utilisateur pour les laboratoires
require('dotenv').config();
const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('\n🔬 Création des comptes laboratoire...\n');

  const pass = await bcrypt.hash('labo123', 10);

  // Récupérer quelques labos existants
  const labs = await prisma.clinic.findMany({
    where: { adminApproved: true, OR: [{ specialites: { contains: 'Laboratoire' } }] },
    take: 5,
    orderBy: { name: 'asc' },
  });

  if (labs.length === 0) {
    console.log('❌ Aucun laboratoire trouvé. Lancez d\'abord seed_labos.js');
    return;
  }

  console.log(`   → ${labs.length} laboratoires trouvés\n`);

  // Compte démo principal (Laboratoire Pasteur Alger)
  const mainLab = labs[0];

  const labUser = await prisma.user.upsert({
    where: { email: 'labo.pasteur@freya.dz' },
    update: { password: pass, clinicId: mainLab.id },
    create: {
      email:     'labo.pasteur@freya.dz',
      password:  pass,
      firstName: mainLab.name,
      lastName:  '',
      role:      'laboratory',
      isActive:  true,
      isVerified:true,
      wilaya:    mainLab.wilaya,
      clinicId:  mainLab.id,
    },
  });
  console.log(`✅ Compte labo créé : labo.pasteur@freya.dz / labo123`);
  console.log(`   → Lié à : ${mainLab.name} (${mainLab.wilaya})\n`);

  // Créer quelques comptes supplémentaires pour les autres labos
  for (let i = 1; i < Math.min(labs.length, 4); i++) {
    const lab  = labs[i];
    const slug = lab.name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').substring(0, 20);
    const email = `${slug}@freya.dz`;
    await prisma.user.upsert({
      where: { email },
      update: { password: pass, clinicId: lab.id },
      create: {
        email, password: pass,
        firstName: lab.name, lastName: '',
        role: 'laboratory', isActive: true, isVerified: true,
        wilaya: lab.wilaya, clinicId: lab.id,
      },
    });
    console.log(`✅ ${email} → ${lab.name}`);
  }

  console.log('\n🎉 Comptes laboratoire créés !\n');
  console.log('   Compte démo principal : labo.pasteur@freya.dz / labo123\n');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
