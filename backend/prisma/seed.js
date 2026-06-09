require('dotenv').config();
const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

// ─── Données algériennes ───────────────────────────────────────────────────────

const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif',
  'Béjaïa', 'Tlemcen', 'Tizi Ouzou', 'Mostaganem', 'Skikda', 'Guelma',
  'Jijel', 'Boumerdès', 'Tipaza', 'Médéa', 'Bouira', 'Béchar', 'Biskra',
];

const CITIES = {
  'Alger':       ['Hydra', 'Ben Aknoun', 'El Biar', 'Bab Ezzouar', 'Bir Mourad Raïs', 'Kouba', 'Hussein Dey'],
  'Oran':        ['Es Sénia', 'Bir El Djir', 'Arzew', 'Ain Turk'],
  'Constantine': ['El Khroub', 'Hamma Bouziane', 'Ain Smara'],
  'Annaba':      ['El Bouni', 'El Hadjar', 'Sidi Amar'],
  'Blida':       ['Bougara', 'Chréa', 'Meftah'],
  'Batna':       ['Tazoult', 'Ain Touta', 'Barika'],
  'Sétif':       ['El Eulma', 'Ain Oulmene', 'Bougaa'],
  'Béjaïa':     ['Akbou', 'Amizour', 'Tazmalt'],
  'Tlemcen':    ['Chetouane', 'Mansourah', 'Remchi'],
  'Tizi Ouzou': ['Azazga', 'Larbaa Nath Irathen', 'Boghni'],
  'Mostaganem': ['Ain Tedeles', 'Mesra'],
  'Skikda':     ['Azzaba', 'Collo'],
  'Guelma':     ['Bouchegouf', 'Ain Makhlouf'],
  'Jijel':      ['Taher', 'El Milia'],
  'Boumerdès':  ['Khemis El Khechna', 'Bordj Menaiel'],
  'Tipaza':     ['Koléa', 'Cherchell'],
  'Médéa':      ['Berrouaghia', 'Ksar El Boukhari'],
  'Bouira':     ['Sour El Ghozlane', 'Lakhdaria'],
  'Béchar':     ['Kenadsa', 'Abadla'],
  'Biskra':     ['Tolga', 'Ouled Djellal'],
};

const SPECIALITES = [
  'Médecin généraliste', 'Cardiologue', 'Pédiatre', 'Dermatologue',
  'Gynécologue', 'Ophtalmologue', 'ORL', 'Neurologue', 'Psychiatre',
  'Gastro-entérologue', 'Pneumologue', 'Endocrinologue', 'Rhumatologue',
  'Urologue', 'Chirurgien général', 'Chirurgien orthopédiste',
  'Radiologue', 'Néphrologue', 'Kinésithérapeute', 'Dentiste',
  'Orthodontiste', 'Allergologue', 'Hématologue', 'Infectiologue',
  'Anesthésiste-réanimateur', 'Gériatre', 'Nutritionniste',
];

const PRENOMS_H = [
  'Mohamed', 'Ahmed', 'Karim', 'Youcef', 'Abdelkader', 'Sofiane',
  'Rachid', 'Nabil', 'Hocine', 'Farid', 'Samir', 'Walid',
  'Tarek', 'Bilal', 'Hamid', 'Djamel', 'Rédha', 'Amine',
  'Khaled', 'Lotfi', 'Salim', 'Fares', 'Anis', 'Sami',
  'Omar', 'Ali', 'Idir', 'Yazid', 'Adel', 'Nassim',
];

const PRENOMS_F = [
  'Amira', 'Fatima', 'Yasmine', 'Samira', 'Nadia', 'Leïla',
  'Karima', 'Sonia', 'Houria', 'Meriem', 'Asma', 'Djamila',
  'Sabrina', 'Hanane', 'Rania', 'Imane', 'Sara', 'Nawel',
  'Lynda', 'Chahra', 'Feriel', 'Ghania', 'Amel', 'Wafa',
];

const NOMS = [
  'Benali', 'Boudiaf', 'Hamdi', 'Khelif', 'Merad', 'Ziani',
  'Bensalem', 'Hadj', 'Touati', 'Mansouri', 'Belkacem', 'Cherif',
  'Mahdi', 'Laib', 'Boukhari', 'Ferhat', 'Djaballah', 'Rahmani',
  'Bouzid', 'Saadi', 'Chebli', 'Messaoud', 'Ouali', 'Aissaoui',
  'Bennacer', 'Haddad', 'Berkane', 'Saidani', 'Terki', 'Gherbi',
  'Mebarki', 'Bellouk', 'Amrani', 'Nacer', 'Bouras', 'Khemici',
];

const RUES = [
  "Larbi Ben M'hidi", 'Didouche Mourad', 'Abane Ramdane',
  'Krim Belkacem', 'Ben Boulaïd', 'Colonel Amirouche',
  'Hassiba Ben Bouali', 'Ali Boumendjel', 'Frantz Fanon',
];

const LANGUES_OPTIONS = [
  'Arabe,Français',
  'Arabe,Français,Anglais',
  'Arabe,Français,Tamazight',
  'Arabe,Français,Tamazight,Anglais',
  'Arabe,Anglais',
];

const BIOS = [
  "Médecin avec une solide expérience clinique, engagé dans la qualité des soins et le suivi personnalisé de chaque patient.",
  "Praticien passionné par sa spécialité, je mets un point d'honneur à offrir une écoute attentive et un diagnostic rigoureux.",
  "Fort d'une longue expérience hospitalière et libérale, j'accompagne mes patients avec bienveillance et professionnalisme.",
  "Diplômé des meilleures facultés de médecine d'Algérie, je propose des consultations de qualité dans un cadre chaleureux.",
  "Mon approche combine médecine moderne et accompagnement humain pour garantir le meilleur suivi à mes patients.",
  "Spécialiste reconnu dans ma discipline, je participe régulièrement à des congrès médicaux pour rester à la pointe.",
  "Avec plus d'une décennie de pratique, j'ai développé une expertise solide au service de la santé de mes patients.",
  "Je crois en une médecine de proximité, accessible et de haute qualité pour tous les patients de ma région.",
];

const EDUCATIONS = [
  "Doctorat en Médecine – Université d'Alger, Faculté de Médecine",
  "Doctorat en Médecine – Université Oran 1 Ahmed Ben Bella",
  "Doctorat en Médecine – Université Constantine 3",
  "Doctorat en Médecine – Université Annaba",
  "Doctorat en Médecine – Université Sétif 1 Ferhat Abbas",
  "Doctorat en Médecine – Université Tlemcen",
  "Doctorat en Médecine – Université Béjaïa",
  "Doctorat en Médecine – Université Tizi Ouzou Mouloud Mammeri",
];

const PRIX_SPEC = {
  'Cardiologue': 4000,
  'Neurologue': 4500,
  'Chirurgien général': 5000,
  'Chirurgien orthopédiste': 5500,
  'Anesthésiste-réanimateur': 5000,
  'Radiologue': 3500,
  'Ophtalmologue': 3000,
  'ORL': 3000,
  'Médecin généraliste': 1500,
  'Kinésithérapeute': 2000,
  'Dentiste': 2500,
  'Orthodontiste': 3500,
  'Gynécologue': 3500,
  'Pédiatre': 2500,
  'Dermatologue': 3000,
  'Psychiatre': 4000,
  'Pneumologue': 3500,
  'Gastro-entérologue': 3500,
  'Endocrinologue': 3500,
  'Rhumatologue': 3500,
  'Urologue': 4000,
  'Néphrologue': 4000,
  'Hématologue': 4000,
  'Infectiologue': 3500,
  'Allergologue': 3000,
  'Gériatre': 3000,
  'Nutritionniste': 2500,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

// ─── Seed principal ────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Démarrage du seed — 100 médecins algériens...\n');

  const hashedPassword = await bcrypt.hash('Doctor123!', 10);
  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= 100; i++) {
    const isFemale    = Math.random() < 0.35;
    const firstName   = isFemale ? pick(PRENOMS_F) : pick(PRENOMS_H);
    const lastName    = pick(NOMS);
    const wilaya      = pick(WILAYAS);
    const cities      = CITIES[wilaya] || [wilaya];
    const city        = pick(cities);
    const specialite  = pick(SPECIALITES);
    const email       = `dr.${slugify(firstName)}.${slugify(lastName)}.${i}@freya.dz`;

    const basePrice  = PRIX_SPEC[specialite] || randInt(2000, 4000);
    const finalPrice = basePrice + randInt(-200, 500);

    const experienceYears = randInt(2, 28);
    const ratingCount     = randInt(5, 312);
    const ratingAvg       = randFloat(3.5, 5.0);
    const ordreVerified   = Math.random() < 0.75;

    try {
      await prisma.user.create({
        data: {
          email,
          password:   hashedPassword,
          role:       'doctor',
          firstName,
          lastName,
          phone:      `0${pick(['5', '6', '7'])}${randInt(10000000, 99999999)}`,
          wilaya,
          isActive:   true,
          isVerified: true,
          doctor: {
            create: {
              specialite,
              ordreNumber:       `ALG${String(i).padStart(5, '0')}`,
              ordreVerified,
              adminApproved:     true,
              cabinetAddress:    `${randInt(1, 99)} Rue ${pick(RUES)}, ${city}`,
              wilaya,
              city,
              bio:               pick(BIOS),
              consultationPrice: finalPrice,
              languages:         pick(LANGUES_OPTIONS),
              experienceYears,
              education:         pick(EDUCATIONS) + (experienceYears > 10 ? ` · Spécialisation – CHU ${wilaya}` : ''),
              ratingAvg,
              ratingCount,
            },
          },
        },
      });

      created++;
      if (created % 10 === 0) {
        console.log(`  ✅ ${created}/100 médecins insérés...`);
      }
    } catch (err) {
      if (err.code === 'P2002') {
        skipped++;
        console.warn(`  ⚠️  Doublon ignoré : ${email}`);
      } else {
        throw err;
      }
    }
  }

  console.log(`\n✨ Seed terminé — ${created} médecins créés, ${skipped} doublons ignorés.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());