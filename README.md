# Freya — Plateforme de santé connectée (PFE)

Application web full-stack de prise de rendez-vous médicaux en Algérie, développée dans le cadre d'un Projet de Fin d'Études.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Tailwind CSS, React Router v6, Axios, Zustand, React Hot Toast |
| Backend | Node.js, Express.js |
| ORM | Prisma ORM |
| Base de données | PostgreSQL 18 |
| Auth | JWT (`jsonwebtoken`) — token dans `localStorage` sous clé `freya_token` |
| Emails | Resend API v6 — domaine `freya-pfe.dz` |
| Uploads | Cloudinary (via `cloudinary` SDK + `multer` memoryStorage) |

---

## Architecture du projet

```
FREYA-PFE/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Config Cloudinary + upload stream helper
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── otherControllers.js    # admin, review, record, notification controllers
│   ├── middleware/
│   │   └── auth.js                # JWT middleware: auth, requireRole
│   ├── prisma/
│   │   ├── client.js
│   │   ├── schema.prisma
│   │   ├── seed.js                # 100 médecins algériens
│   │   ├── seed_demo.js           # comptes admin/patient/doctor
│   │   ├── seed_labos.js          # 52 labos + 15 cliniques
│   │   ├── seed_lab_accounts.js   # comptes utilisateurs labo
│   │   └── seed_availabilities.js # créneaux pour tous les médecins
│   ├── routes/
│   │   ├── auth.js                # /api/auth — login, register, me, profile, delete account
│   │   ├── index.js               # routing central — admin, appointments, messages, etc.
│   │   ├── doctors.js             # /api/doctors
│   │   ├── labo.js                # /api/labo — espace laboratoire
│   │   └── laboratory.js
│   ├── services/
│   │   ├── adminService.js        # getStats, CRUD médecins/patients/labs/RDV
│   │   ├── appointmentService.js
│   │   ├── emailService.js        # Resend — welcome emails patient/doctor/lab
│   │   ├── notificationService.js
│   │   ├── recordService.js
│   │   └── reviewService.js
│   ├── .env                       # variables d'environnement (ne pas committer)
│   ├── server.js
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── AdminNavbar.js     # navbar admin (6 sections)
        │   ├── DoctorNavbar.js
        │   ├── LabNavbar.js
        │   └── PatientNavbar.js
        ├── pages/
        │   ├── admin/
        │   │   ├── AdminDashboard.js      # stats globales
        │   │   ├── AdminDoctors.js        # gestion médecins (approbation)
        │   │   ├── AdminPatients.js       # liste patients + toggle
        │   │   ├── AdminLabs.js           # gestion laboratoires
        │   │   ├── AdminAppointments.js   # tous les RDV (paginé + filtres)
        │   │   └── AdminClinics.js        # gestion cliniques
        │   ├── doctor/
        │   │   ├── DoctorDashboard.js
        │   │   ├── DoctorAppointments.js  # statuts: confirmer/compléter/annuler
        │   │   ├── DoctorAvailability.js
        │   │   ├── DoctorMessages.js      # messagerie (mobile toggle)
        │   │   ├── DoctorPatients.js
        │   │   ├── DoctorPatientDossier.js # dossier complet d'un patient
        │   │   ├── DoctorProfile.js       # profil + horaires + suppression compte
        │   │   ├── DoctorSearchPage.js    # recherche + carte Leaflet
        │   │   └── DoctorNotifications.js
        │   ├── patient/
        │   │   ├── PatientDashboard.js
        │   │   ├── PatientAppointments.js
        │   │   ├── PatientDossier.js      # 5 onglets (Info/Santé/Consultations/Ordo/Analyses)
        │   │   ├── PatientMessages.js     # messagerie (mobile toggle)
        │   │   ├── PatientProfile.js      # profil + sécurité + suppression compte
        │   │   ├── PatientFavoris.js
        │   │   ├── PatientNotifications.js
        │   │   ├── BookingPage.js         # réservation médecin
        │   │   └── LabBookingPage.js      # réservation laboratoire
        │   ├── labo/
        │   │   ├── LabDashboard.js
        │   │   ├── LabAppointments.js     # RDV + envoi résultats d'analyses
        │   │   ├── LabAnalyses.js
        │   │   ├── LabProfile.js          # profil + disponibilités + suppression compte
        │   │   └── LabNotifications.js
        │   ├── DoctorPublicPage.js        # page publique médecin
        │   ├── LabPublicPage.js           # page publique laboratoire
        │   ├── HomePage.js
        │   ├── LoginPage.js
        │   └── RegisterPage.js
        ├── services/
        │   └── api.js             # axios instance + authAPI, doctorsAPI, adminAPI, laboAPI...
        ├── store/
        │   └── authStore.js       # Zustand — user, token, isAuthenticated, logout
        └── App.js                 # routes React Router v6
```

---

## Rôles utilisateurs

| Rôle | Description | Route après login |
|------|-------------|-------------------|
| `patient` | Prend des RDV médecins/labos, dossier médical | `/patient` |
| `doctor` | Gère agenda, patients, messagerie | `/doctor` |
| `laboratory` | Confirme RDV, envoie résultats d'analyses | `/labo` |
| `admin` | Accès complet à toute la plateforme | `/admin` |

---

## Authentification JWT

- À la connexion, le serveur signe `jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })`
- Le token est stocké dans `localStorage` sous la clé `freya_token`
- Chaque requête API envoie `Authorization: Bearer <token>`
- Le middleware `auth.js` vérifie le token avec `jwt.verify()` et injecte `req.user = { id, role }`
- `requireRole('admin')` bloque les requêtes si le rôle ne correspond pas

---

## Routes backend principales

### Auth (`/api/auth`)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Inscription (patient/doctor/laboratory) + email de bienvenue |
| POST | `/login` | Connexion — retourne `{ token, user }` |
| GET | `/me` | Profil de l'utilisateur connecté |
| PUT | `/profile` | Mise à jour profil |
| PUT | `/password` | Changement de mot de passe |
| DELETE | `/account` | Suppression du compte (vérifie le mot de passe) |

### Admin (`/api/admin` — protégé `requireRole('admin')`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/stats` | Compteurs globaux (patients, médecins, labos, RDV...) |
| GET | `/doctors` | Tous les médecins (avec filtres) |
| GET | `/doctors/pending` | Médecins en attente d'approbation |
| PATCH | `/doctors/:id/approve` | Approuver/refuser un médecin |
| GET | `/patients` | Tous les patients |
| GET | `/labs` | Tous les laboratoires |
| PATCH | `/labs/:id/toggle` | Activer/suspendre un laboratoire |
| GET | `/appointments` | Tous les RDV (paginé) |
| PATCH | `/users/:id/toggle` | Activer/désactiver un utilisateur |
| DELETE | `/users/:id` | Supprimer un utilisateur |
| GET | `/clinics` | Toutes les cliniques |
| POST | `/clinics` | Créer une clinique |

### Labo (`/api/labo` — protégé `requireRole('laboratory')`)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/PUT | `/profile` | Profil du laboratoire |
| GET | `/stats` | Statistiques du labo |
| GET/PATCH | `/appointments` | Rendez-vous + envoi résultats |
| POST | `/upload` | Upload image vers Cloudinary |
| GET/PUT | `/availability` | Créneaux de disponibilité |

---

## Variables d'environnement (backend/.env)

```env
DATABASE_URL=postgresql://freya_user:FreyaSecure2026!@localhost:5432/database_db
JWT_SECRET=freya_super_secret_key
JWT_EXPIRATION_IN=7d
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=djna5q3rc
CLOUDINARY_API_KEY=387974231866137
CLOUDINARY_API_SECRET=gxQrxPGCotNaObVD_jL7h8hB930
RESEND_API_KEY=re_Su2A9ofK_Lisz2AR8dxUPbM4FK8UxNKbq
```

---

## Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@freya.dz` | `admin123` | admin |
| `patient@freya.dz` | `password123` | patient (Sara Benali) |
| `dr.benali@freya.dz` | `password123` | doctor (Cardiologue, Alger) |
| `labo.pasteur@freya.dz` | `labo123` | laboratory |

---

## Lancer le projet en local

### Prérequis
- Node.js 18+
- PostgreSQL 18 (service `postgresql-x64-18`)
- Compte Cloudinary et Resend

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed_demo.js
node prisma/seed.js
node prisma/seed_labos.js
node prisma/seed_lab_accounts.js
npm run dev
# Écoute sur http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start
# Écoute sur http://localhost:3000
```

---

## Fonctionnalités clés

### Patient
- Recherche de médecins par spécialité, wilaya, disponibilité (carte Leaflet)
- Réservation de créneaux en temps réel (disponibilités réelles depuis la DB)
- Réservation de créneaux de laboratoire
- Dossier médical complet (5 onglets : Infos, Santé, Consultations, Ordonnances, Analyses)
- Messagerie avec les médecins
- Historique des rendez-vous
- Notifications système

### Médecin
- Tableau de bord avec statistiques (RDV du jour, patients, revenus)
- Gestion des rendez-vous (confirmer, compléter, annuler)
- Dossier patient complet (consultations, ordonnances, antécédents)
- Messagerie avec patients
- Configuration des disponibilités (créneaux par jour, durée)
- Page publique visible des patients

### Laboratoire
- Confirmation des rendez-vous d'analyse
- Envoi de résultats d'analyses avec images (Cloudinary)
- Page publique avec tarifs et localisation
- Configuration des créneaux disponibles

### Admin
- Tableau de bord avec compteurs globaux (patients, médecins, labos, RDV)
- Approbation/refus des inscriptions de médecins
- Gestion des patients (liste, activation/désactivation)
- Gestion des laboratoires (activation/suspension)
- Vue globale de tous les rendez-vous (filtres par statut)
- Gestion des cliniques (liste + ajout)

---

## Design & Responsive

- Design système cohérent : couleur primaire `#2563EB`, police `Inter/DM Sans`
- 100% responsive : mobile → `grid-cols-1`, tablette → `md:`, desktop → `lg:`/`xl:`
- Navbar hamburger mobile sur tous les espaces
- Pages messagerie : affichage liste OU chat en mobile (toggle)
- Toasts pour toutes les actions utilisateur (react-hot-toast)

---

## Emails transactionnels (Resend)

- Expéditeur : `noreply@freya-pfe.dz`
- Templates HTML responsive intégrés dans `emailService.js`
- Envoyés à l'inscription :
  - Patient → `sendWelcomePatient`
  - Médecin → `sendWelcomeDoctor`
  - Laboratoire → `sendWelcomeLab`
