// ================================================================
//  FREYA — SEED CLINIQUES + LABORATOIRES
//  À exécuter APRÈS le seed principal pour ajouter les labos
//  dans la table "clinics" (compatible schéma existant)
// ================================================================
require('dotenv').config();
const prisma = require('../prisma/client');

const LABOS = [
  // ALGER
  { name:'Laboratoire Pasteur Alger Centre', wilaya:'Alger', city:'Alger-Centre', address:'14 Rue Pasteur, Alger-Centre', phone:'021631245', email:'pasteur.alger@labo.dz', specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Hormonologie', description:'Sam-Jeu: 07h00-19h00 | Ven: 07h00-12h00' },
  { name:'Biolab El Biar',                  wilaya:'Alger', city:'El Biar',      address:'45 Avenue du Colonel Lotfi, El Biar',phone:'021922310', email:'biolab.elbiar@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Parasitologie,Immunologie',                description:'Sam-Jeu: 07h30-18h00' },
  { name:'Laboratoire Ben Aknoun',           wilaya:'Alger', city:'Ben Aknoun',   address:'5 Rue Kaddour Rahim, Ben Aknoun', phone:'021913456', email:'labo.benaknoun@labo.dz',  specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie,Sérologie',                  description:'Sam-Jeu: 07h00-19h00' },
  { name:'Centre Analyses Kouba',            wilaya:'Alger', city:'Kouba',        address:'22 Rue des Frères Amokrane, Kouba',phone:'021497890', email:'analyses.kouba@labo.dz',  specialites:'Laboratoire,Analyses médicales,Hématologie,Biochimie,Cytologie,Bactériologie',    description:'Sam-Jeu: 07h00-20h00 | Ven: 07h00-12h00' },
  { name:'Laboratoire Hydra Médical',        wilaya:'Alger', city:'Hydra',        address:'8 Chemin du Paradou, Hydra',      phone:'021697234', email:'hydra.medical@labo.dz',   specialites:'Laboratoire,Analyses,Biochimie,Hormonologie,Sérologie,Immunologie,Génétique',      description:'Dim-Jeu: 07h30-19h00 | Sam: 07h30-14h00' },
  { name:'Bioanalyse Bab Ezzouar',           wilaya:'Alger', city:'Bab Ezzouar',  address:'Cité USTO Bâtiment B, Bab Ezzouar',phone:'021880123',email:'bioanalyse.bab@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Parasitologie,Microbiologie',            description:'Sam-Jeu: 07h00-18h00' },
  { name:'Centre Biologie Cheraga',          wilaya:'Alger', city:'Cheraga',      address:'Lot Oasis 123, Cheraga',          phone:'021361234', email:'biologie.cheraga@labo.dz', specialites:'Laboratoire,Biologie médicale,Biochimie,Hématologie,Sérologie,Hormonologie',       description:'Sam-Jeu: 07h30-19h30' },
  { name:'Laboratoire El Harrach',           wilaya:'Alger', city:'El Harrach',   address:'12 Rue Mokhtar Zerrouki',         phone:'021521467', email:'labo.elharrach@labo.dz',  specialites:'Laboratoire,Analyses médicales,Hématologie,Biochimie,Urologie,Bactériologie',    description:'Sam-Jeu: 07h00-19h00' },
  // ORAN
  { name:'Laboratoire Pasteur Oran',         wilaya:'Oran', city:'Oran',          address:'34 Boulevard du Millénium, Oran', phone:'041397654', email:'pasteur.oran@labo.dz',    specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Parasitologie',description:'Sam-Jeu: 07h00-19h00 | Ven: 07h00-12h00' },
  { name:'Bio-Diagnostic Bir El Djir',       wilaya:'Oran', city:'Bir El Djir',   address:'17 Cité USTO, Bir El Djir',       phone:'041452310', email:'biodiag.beldj@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Immunologie,Microbiologie',             description:'Sam-Jeu: 07h30-18h30' },
  { name:'Centre Biologie Es Sénia',         wilaya:'Oran', city:'Es Sénia',      address:'Zone Industrielle, Es Sénia',     phone:'041565234', email:'biologie.essenia@labo.dz', specialites:'Laboratoire,Biologie médicale,Biochimie,Hématologie,Hormonologie,Cytologie',       description:'Sam-Jeu: 07h00-19h00' },
  // CONSTANTINE
  { name:'Laboratoire Ibn Sina Constantine', wilaya:'Constantine', city:'Constantine', address:'56 Rue Belouizdad, Constantine',phone:'031641234', email:'ibnsina.const@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Hormonologie', description:'Sam-Jeu: 07h00-19h00' },
  { name:'Centre Analyses El Khroub',        wilaya:'Constantine', city:'El Khroub',   address:'3 Zone Industrielle, El Khroub',phone:'031875432', email:'analyses.elkhroub@labo.dz', specialites:'Laboratoire,Analyses médicales,Biochimie,Hématologie,Parasitologie',               description:'Sam-Jeu: 07h30-18h00' },
  // ANNABA
  { name:'Laboratoire Annaba Médical',       wilaya:'Annaba', city:'Annaba',       address:'28 Cours de la Révolution, Annaba',phone:'038865432', email:'annaba.medical@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Hormonologie,Immunologie',   description:'Sam-Jeu: 07h00-19h00 | Ven: 07h00-12h00' },
  { name:'Biolab El Bouni',                  wilaya:'Annaba', city:'El Bouni',     address:'15 Rue des Frères Rahmani',       phone:'038927654', email:'biolab.elbouni@labo.dz',  specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Bactériologie',                          description:'Sam-Jeu: 07h30-18h00' },
  // BLIDA
  { name:'Laboratoire Blida Santé',          wilaya:'Blida', city:'Blida',         address:'14 Rue de la Chiffa, Blida',      phone:'025413456', email:'blida.sante@labo.dz',     specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Parasitologie,Coprologie',    description:'Sam-Jeu: 07h00-19h00' },
  { name:'Centre Analyses Boufarik',         wilaya:'Blida', city:'Boufarik',      address:'8 Route Nationale, Boufarik',     phone:'025334321', email:'analyses.boufarik@labo.dz', specialites:'Laboratoire,Analyses médicales,Biochimie,Hématologie,Hormonologie',                 description:'Sam-Jeu: 07h30-18h30' },
  // BATNA
  { name:'Laboratoire Batna Médical',        wilaya:'Batna', city:'Batna',         address:'41 Avenue de l\'ALN, Batna',      phone:'033867890', email:'batna.medical@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Hormonologie',  description:'Sam-Jeu: 07h00-19h00' },
  // SÉTIF
  { name:'Analyses Médicales Sétif',         wilaya:'Sétif', city:'Sétif',         address:'7 Place de l\'Indépendance, Sétif',phone:'036923456', email:'analyses.setif@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Parasitologie,Immunologie',  description:'Sam-Jeu: 07h00-19h30' },
  { name:'Biolab El Eulma',                  wilaya:'Sétif', city:'El Eulma',      address:'3 Boulevard Amirouche, El Eulma', phone:'036875321', email:'biolab.eleulma@labo.dz',  specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie',                           description:'Sam-Jeu: 07h30-18h00' },
  // TIZI OUZOU
  { name:'Laboratoire Tizi Ouzou Plus',      wilaya:'Tizi Ouzou', city:'Tizi Ouzou', address:'19 Rue Abane Ramdane',          phone:'026213456', email:'tizi.plus@labo.dz',       specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Bactériologie,Génétique',     description:'Sam-Jeu: 07h00-19h00' },
  { name:'Bio-Analyses Azazga',              wilaya:'Tizi Ouzou', city:'Azazga',     address:'5 Rue des Martyrs, Azazga',     phone:'026337890', email:'bioanalyses.azazga@labo.dz',specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Parasitologie',                           description:'Sam-Jeu: 07h30-18h00' },
  // BÉJAÏA
  { name:'Laboratoire Béjaïa Médical',       wilaya:'Béjaïa', city:'Béjaïa',       address:'33 Boulevard des Aurès, Béjaïa', phone:'034215432', email:'bejaia.medical@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Immunologie,Microbiologie',  description:'Sam-Jeu: 07h00-19h00' },
  { name:'Centre Biologie Akbou',            wilaya:'Béjaïa', city:'Akbou',        address:'12 Rue du 8 Mai, Akbou',         phone:'034367890', email:'biologie.akbou@labo.dz',  specialites:'Laboratoire,Biologie médicale,Biochimie,Hématologie,Hormonologie',                 description:'Sam-Jeu: 07h30-18h00' },
  // TLEMCEN
  { name:'Laboratoire Tlemcen Santé',        wilaya:'Tlemcen', city:'Tlemcen',      address:'11 Rue du 1er Novembre, Tlemcen',phone:'043225432', email:'tlemcen.sante@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie,Hormonologie,Parasitologie', description:'Sam-Jeu: 07h00-19h00' },
  { name:'Bio-Lab Maghnia',                  wilaya:'Tlemcen', city:'Maghnia',      address:'22 Boulevard de la Paix, Maghnia',phone:'043577654',email:'biolab.maghnia@labo.dz',   specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Bactériologie',                          description:'Sam-Jeu: 07h30-18h30' },
  // AUTRES WILAYAS
  { name:'Laboratoire Médéa Central',        wilaya:'Médéa',          city:'Médéa',          address:'5 Avenue Ben Badis, Médéa',           phone:'025596321', email:'medea.central@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-18h30' },
  { name:'Centre Analyses Boumerdès',        wilaya:'Boumerdès',      city:'Boumerdès',      address:'14 Rue du Colonel, Boumerdès',         phone:'024815432', email:'analyses.bmd@labo.dz',    specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie',  description:'Sam-Jeu: 07h30-19h00' },
  { name:'Laboratoire Tipaza Médical',       wilaya:'Tipaza',         city:'Tipaza',         address:'8 Route de Cherchell, Tipaza',         phone:'024467890', email:'tipaza.medical@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-18h00' },
  { name:'Biolab Biskra',                    wilaya:'Biskra',         city:'Biskra',         address:'20 Rue Khemisti, Biskra',              phone:'033735432', email:'biolab.biskra@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-19h00' },
  { name:'Laboratoire Skikda Santé',         wilaya:'Skikda',         city:'Skikda',         address:'15 Boulevard de la Corniche, Skikda',  phone:'038746321', email:'skikda.sante@labo.dz',    specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Parasitologie', description:'Sam-Jeu: 07h30-18h30' },
  { name:'Centre Analyses Guelma',           wilaya:'Guelma',         city:'Guelma',         address:'3 Rue Ben Badis, Guelma',              phone:'037202345', email:'analyses.guelma@labo.dz', specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Hormonologie',  description:'Sam-Jeu: 07h00-18h00' },
  { name:'Laboratoire Jijel Médical',        wilaya:'Jijel',          city:'Jijel',          address:'18 Rue Zighoud Youcef, Jijel',         phone:'034462345', email:'jijel.medical@labo.dz',  specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Sérologie',     description:'Sam-Jeu: 07h30-18h30' },
  { name:'Biolab Mascara',                   wilaya:'Mascara',        city:'Mascara',        address:'25 Avenue Amirouche, Mascara',         phone:'045884321', email:'biolab.mascara@labo.dz',  specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Parasitologie', description:'Sam-Jeu: 07h00-18h00' },
  { name:"Laboratoire M'Sila Central",       wilaya:"M'Sila",         city:"M'Sila",         address:"6 Rue de l'Indépendance, M'Sila",      phone:'035555432', email:'msila.central@labo.dz',   specialites:"Laboratoire,Biologie médicale,Biochimie,Hématologie",      description:'Sam-Jeu: 07h30-19h00' },
  { name:'Centre Analyses Mostaganem',       wilaya:'Mostaganem',     city:'Mostaganem',     address:'12 Rue de la République, Mostaganem',  phone:'045212345', email:'analyses.most@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-18h30' },
  { name:'Biolab Sidi Bel Abbès',            wilaya:'Sidi Bel Abbès', city:'Sidi Bel Abbès', address:"32 Boulevard de l'ALN, Sidi Bel Abbès",phone:'048543210', email:'biolab.sba@labo.dz',      specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie',  description:'Sam-Jeu: 07h30-19h00' },
  { name:'Laboratoire Ouargla Médical',      wilaya:'Ouargla',        city:'Ouargla',        address:'10 Avenue Émir Abdelkader, Ouargla',   phone:'029715432', email:'ouargla.medical@labo.dz', specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Microbiologie', description:'Dim-Jeu: 07h00-19h00' },
  { name:'Biolab El Oued',                   wilaya:'El Oued',        city:'El Oued',        address:'7 Rue des Martyrs, El Oued',           phone:'032215432', email:'biolab.eloued@labo.dz',   specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Parasitologie', description:'Sam-Jeu: 07h00-18h00' },
  { name:'Centre Analyses Souk Ahras',       wilaya:'Souk Ahras',     city:'Souk Ahras',     address:'9 Rue Benembarak, Souk Ahras',         phone:'037372345', email:'analyses.soukhras@labo.dz',specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',    description:'Sam-Jeu: 07h30-18h00' },
  { name:'Laboratoire Chlef Santé',          wilaya:'Chlef',          city:'Chlef',          address:'16 Rue Sid Ali Boumediène, Chlef',     phone:'027723456', email:'chlef.sante@labo.dz',     specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie',  description:'Sam-Jeu: 07h00-19h00' },
  { name:'Biolab Tiaret',                    wilaya:'Tiaret',         city:'Tiaret',         address:"3 Avenue du 1er Novembre, Tiaret",     phone:'046453210', email:'biolab.tiaret@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Bactériologie', description:'Sam-Jeu: 07h30-18h30' },
  { name:'Centre Analyses Djelfa',           wilaya:'Djelfa',         city:'Djelfa',         address:'22 Boulevard de la Victoire, Djelfa',  phone:'027894321', email:'analyses.djelfa@labo.dz', specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Parasitologie', description:'Sam-Jeu: 07h00-18h00' },
  { name:'Laboratoire Aïn Defla',            wilaya:'Aïn Defla',      city:'Aïn Defla',      address:'8 Rue du 8 Mai 1945, Ain Defla',       phone:'027645432', email:'labo.aindefla@labo.dz',   specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Hormonologie',  description:'Sam-Jeu: 07h30-18h30' },
  { name:'Biolab Ghardaïa',                  wilaya:'Ghardaïa',       city:'Ghardaïa',       address:'5 Place du Souk, Ghardaïa',           phone:'029873210', email:'biolab.ghardaia@labo.dz', specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Parasitologie', description:'Dim-Jeu: 07h00-18h00' },
  { name:'Laboratoire Relizane Central',     wilaya:'Relizane',       city:'Relizane',       address:'14 Rue Khemisti, Relizane',            phone:'046893456', email:'relizane.central@labo.dz',specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-18h30' },
  { name:'Centre Analyses Khenchela',        wilaya:'Khenchela',      city:'Khenchela',      address:"3 Avenue de l'Indépendance, Khenchela",phone:'032454321', email:'analyses.khenchela@labo.dz',specialites:'Laboratoire,Analyses,Biochimie,Hématologie',             description:'Sam-Jeu: 07h30-18h00' },
  { name:'Laboratoire Mila Médical',         wilaya:'Mila',           city:'Mila',           address:'11 Rue des Martyrs, Mila',             phone:'031844321', email:'mila.medical@labo.dz',    specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h00-18h30' },
  { name:'Biolab Tébessa',                   wilaya:'Tébessa',        city:'Tébessa',        address:'20 Boulevard Houari Boumediene',        phone:'037754321', email:'biolab.tebessa@labo.dz',  specialites:'Laboratoire,Analyses,Biochimie,Hématologie,Hormonologie',  description:'Sam-Jeu: 07h00-19h00' },
  { name:'Laboratoire Oum El Bouaghi',       wilaya:'Oum El Bouaghi', city:'Oum El Bouaghi', address:'7 Rue de la Paix, Oum El Bouaghi',     phone:'032312345', email:'oeb.labo@labo.dz',        specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Sérologie',     description:'Sam-Jeu: 07h30-18h00' },
  { name:'Centre Biologie Saïda',            wilaya:'Saïda',          city:'Saïda',          address:'5 Rue des Frères Djilali, Saïda',      phone:'048652345', email:'biologie.saida@labo.dz',  specialites:'Laboratoire,Biologie médicale,Hématologie,Biochimie',      description:'Sam-Jeu: 07h00-18h00' },
  { name:'Biolab Bordj Bou Arréridj',        wilaya:'Bordj Bou Arréridj',city:'Bordj Bou Arréridj', address:'9 Avenue du 1er Novembre', phone:'035642345', email:'biolab.bba@labo.dz',      specialites:'Laboratoire,Analyses,Hématologie,Biochimie,Parasitologie', description:'Sam-Jeu: 07h30-18h30' },
];

const CLINIQUES = [
  { name:'Clinique El Azhar',              wilaya:'Alger',        city:'Alger-Centre', address:'12 Rue Didouche Mourad',           phone:'021123456', email:'contact@clinique-elazhar.dz',        specialites:'Cardiologie,Chirurgie,Gynécologie,Pédiatrie',                      description:'Clinique privée pluridisciplinaire au cœur d\'Alger. Plateau technique moderne.' },
  { name:'Polyclinique El Houda',          wilaya:'Alger',        city:'El Biar',      address:'34 Chemin des Crêtes',             phone:'021928765', email:'elhouda@polyclinique.dz',            specialites:'Médecine générale,Orthopédie,Ophtalmologie,Dermatologie',           description:'Polyclinique multidisciplinaire dans un cadre moderne et accueillant.' },
  { name:'Clinique Sacré Cœur',            wilaya:'Alger',        city:'Hydra',        address:'8 Avenue du Golf',                 phone:'021698765', email:'info@clinique-sacrecoeur.dz',        specialites:'Cardiologie,Neurologie,Gynécologie,Chirurgie vasculaire',           description:'Établissement de référence pour la cardiologie et la chirurgie cardiovasculaire.' },
  { name:'Clinique Ibn Sina Oran',         wilaya:'Oran',         city:'Oran',         address:'45 Boulevard Zighout Youcef',      phone:'041654321', email:'ibnsina.oran@clinique.dz',           specialites:'Médecine interne,Chirurgie,Orthopédie,Pédiatrie',                  description:'Grande clinique privée d\'Oran avec un plateau technique complet.' },
  { name:'Polyclinique El Wiam Oran',      wilaya:'Oran',         city:'Bir El Djir',  address:'22 Cité Fellaoucene',              phone:'041415678', email:'elwiam@polyclinique-oran.dz',        specialites:'Gynécologie,Chirurgie,Urologie,ORL',                               description:'Polyclinique moderne, spécialisée en chirurgie ambulatoire.' },
  { name:'Clinique El Ichfa Constantine',  wilaya:'Constantine',  city:'Constantine',  address:'9 Rue Larbi Ben M\'hidi',          phone:'031234567', email:'elichfa@clinique-constantine.dz',    specialites:'Neurologie,Cardiologie,Chirurgie,Médecine interne',                description:'Référence médicale à Constantine avec des services spécialisés de pointe.' },
  { name:'Clinique Annaba Médical',        wilaya:'Annaba',       city:'Annaba',       address:'17 Cours de la Révolution',        phone:'038765432', email:'annaba.medical@clinique.dz',         specialites:'Oncologie,Cardiologie,Chirurgie,Gynécologie',                      description:'Clinique spécialisée en oncologie et cardiologie interventionnelle.' },
  { name:'Polyclinique El Shifa Blida',    wilaya:'Blida',        city:'Blida',        address:'31 Rue des Frères Bouadou',        phone:'025428765', email:'elshifa.blida@clinique.dz',          specialites:'Chirurgie,Orthopédie,Pédiatrie,Gynécologie',                       description:'Polyclinique de proximité offrant une prise en charge complète.' },
  { name:'Clinique El Amel Batna',         wilaya:'Batna',        city:'Batna',        address:'6 Boulevard de l\'ALN',            phone:'033878765', email:'elamel.batna@clinique.dz',           specialites:'Neurochirurgie,Cardiologie,Chirurgie orthopédique',                description:'Clinique spécialisée en neurochirurgie et chirurgie orthopédique.' },
  { name:'Centre Médical Sétif',           wilaya:'Sétif',        city:'Sétif',        address:'25 Avenue du 8 Mai',               phone:'036936789', email:'centremedical.setif@clinique.dz',     specialites:'Médecine interne,Endocrinologie,Gastro-entérologie',               description:'Centre médical pluridisciplinaire avec laboratoire et imagerie intégrés.' },
  { name:'Clinique Ibn Khaldoun',          wilaya:'Tizi Ouzou',   city:'Tizi Ouzou',   address:'3 Route de Draâ Ben Khedda',       phone:'026248765', email:'ibnkhaldoun@clinique-tizi.dz',        specialites:'Gynécologie,Pédiatrie,Chirurgie,Médecine générale',                description:'Référence médicale de la Kabylie pour la gynécologie et la chirurgie.' },
  { name:'Polyclinique El Badr Béjaïa',   wilaya:'Béjaïa',       city:'Béjaïa',       address:'18 Rue Amirouche',                 phone:'034218765', email:'elbadr.bejaia@clinique.dz',          specialites:'Chirurgie,Orthopédie,Ophtalmologie,ORL',                           description:'Polyclinique moderne proposant des interventions chirurgicales programmées.' },
  { name:'Clinique El Rayane Tlemcen',     wilaya:'Tlemcen',      city:'Tlemcen',      address:'12 Rue Mohammed Khemisti',         phone:'043238765', email:'elrayane.tlemcen@clinique.dz',       specialites:'Cardiologie,Neurologie,Chirurgie vasculaire',                      description:'Établissement de pointe pour les pathologies cardio-vasculaires.' },
  { name:'Clinique El Farabi Boumerdès',   wilaya:'Boumerdès',    city:'Boumerdès',    address:'4 Cité de la Marine',              phone:'024828765', email:'elfarabi.boumerdes@clinique.dz',     specialites:'Chirurgie,Rhumatologie,Médecine interne',                          description:'Clinique moderne à Boumerdès avec un plateau chirurgical bien équipé.' },
  { name:'Centre Santé Médéa',             wilaya:'Médéa',        city:'Médéa',        address:'7 Avenue Colonel Bougara',         phone:'025608765', email:'centresante.medea@clinique.dz',       specialites:'Médecine générale,Gynécologie,Pédiatrie',                          description:'Centre de santé de proximité au service de la population de Médéa.' },
];

async function main() {
  console.log('\n🔬 Ajout des laboratoires et cliniques dans la base...\n');

  // Supprimer les anciens
  await prisma.clinic.deleteMany();
  console.log('✅ Anciens enregistrements supprimés');

  // Insérer les labos
  await prisma.clinic.createMany({
    data: LABOS.map(l => ({
      name:          l.name,
      address:       l.address,
      wilaya:        l.wilaya,
      city:          l.city,
      phone:         l.phone,
      email:         l.email,
      specialites:   l.specialites,
      description:   l.description,
      adminApproved: true,
    }))
  });
  console.log(`✅ ${LABOS.length} laboratoires créés`);

  // Insérer les cliniques
  await prisma.clinic.createMany({
    data: CLINIQUES.map(c => ({
      name:          c.name,
      address:       c.address,
      wilaya:        c.wilaya,
      city:          c.city,
      phone:         c.phone,
      email:         c.email,
      specialites:   c.specialites,
      description:   c.description,
      adminApproved: true,
    }))
  });
  console.log(`✅ ${CLINIQUES.length} cliniques créées`);

  const total = await prisma.clinic.count();
  console.log(`\n🎉 Total : ${total} entrées dans la table clinics\n`);
}

main()
  .catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
