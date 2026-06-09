-- ============================================================
--  FREYA — Schéma SQL complet
--  Base de données : PostgreSQL
--  Fichier : database/schema.sql
--  Commande : psql -U freya_user -d freya_db -f schema.sql
-- ============================================================

-- Extensions PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  NETTOYAGE (si re-exécution)
-- ─────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS notifications    CASCADE;
DROP TABLE IF EXISTS subscriptions    CASCADE;
DROP TABLE IF EXISTS reviews          CASCADE;
DROP TABLE IF EXISTS medical_records  CASCADE;
DROP TABLE IF EXISTS messages         CASCADE;
DROP TABLE IF EXISTS conversations    CASCADE;
DROP TABLE IF EXISTS appointments     CASCADE;
DROP TABLE IF EXISTS availability     CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
DROP TABLE IF EXISTS doctors          CASCADE;
DROP TABLE IF EXISTS clinics          CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

DROP TYPE IF EXISTS role_enum;
DROP TYPE IF EXISTS appointment_status_enum;
DROP TYPE IF EXISTS record_type_enum;
DROP TYPE IF EXISTS gender_enum;
DROP TYPE IF EXISTS subscription_status_enum;
DROP TYPE IF EXISTS notification_type_enum;

-- ─────────────────────────────────────────────────────────────
--  ENUMS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE role_enum AS ENUM (
  'patient',
  'doctor',
  'admin'
);

CREATE TYPE appointment_status_enum AS ENUM (
  'pending',     -- En attente de confirmation
  'confirmed',   -- Confirmé par le médecin
  'cancelled',   -- Annulé
  'completed',   -- Terminé
  'no_show'      -- Patient absent
);

CREATE TYPE record_type_enum AS ENUM (
  'consultation',
  'ordonnance',
  'analyse',
  'radio',
  'autre'
);

CREATE TYPE gender_enum AS ENUM (
  'male',
  'female'
);

CREATE TYPE subscription_status_enum AS ENUM (
  'trial',      -- Essai gratuit 30 jours
  'active',     -- Abonnement actif
  'expired',    -- Expiré
  'cancelled'   -- Annulé
);

CREATE TYPE notification_type_enum AS ENUM (
  'new_appointment',
  'appointment_update',
  'new_message',
  'new_record',
  'admin_decision',
  'registration',
  'reminder'
);

-- ─────────────────────────────────────────────────────────────
--  TABLE : users
--  Tous les utilisateurs : patients, médecins, admin
-- ─────────────────────────────────────────────────────────────

CREATE TABLE users (
  id           UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        VARCHAR(255)        NOT NULL UNIQUE,
  password     VARCHAR(255)        NOT NULL,
  role         role_enum           NOT NULL DEFAULT 'patient',
  first_name   VARCHAR(100)        NOT NULL,
  last_name    VARCHAR(100)        NOT NULL,
  phone        VARCHAR(20),
  wilaya       VARCHAR(100),
  avatar       TEXT,
  is_active    BOOLEAN             NOT NULL DEFAULT TRUE,
  is_verified  BOOLEAN             NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP           NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_role   ON users(role);

-- ─────────────────────────────────────────────────────────────
--  TABLE : doctors
--  Profil médecin (lié à users via user_id)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE doctors (
  id                 UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialite         VARCHAR(100) NOT NULL,
  ordre_number       VARCHAR(50)  UNIQUE,
  ordre_verified     BOOLEAN      NOT NULL DEFAULT FALSE,
  admin_approved     BOOLEAN      NOT NULL DEFAULT FALSE,
  cabinet_address    TEXT,
  wilaya             VARCHAR(100) NOT NULL,
  city               VARCHAR(100),
  bio                TEXT,
  consultation_price INT          NOT NULL DEFAULT 2000,  -- En dinars algériens
  languages          VARCHAR(255) NOT NULL DEFAULT 'Français,Arabe',
  experience_years   INT          NOT NULL DEFAULT 0,
  education          TEXT,
  rating_avg         DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  rating_count       INT          NOT NULL DEFAULT 0,
  created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialite    ON doctors(specialite);
CREATE INDEX idx_doctors_wilaya        ON doctors(wilaya);
CREATE INDEX idx_doctors_approved      ON doctors(admin_approved);

-- ─────────────────────────────────────────────────────────────
--  TABLE : clinics
--  Cliniques privées approuvées sur la plateforme
-- ─────────────────────────────────────────────────────────────

CREATE TABLE clinics (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           VARCHAR(255) NOT NULL,
  address        TEXT         NOT NULL,
  wilaya         VARCHAR(100) NOT NULL,
  city           VARCHAR(100),
  phone          VARCHAR(20),
  email          VARCHAR(255),
  description    TEXT,
  specialites    TEXT,          -- Ex: "Cardiologie,Chirurgie,Gynécologie"
  admin_approved BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinics_wilaya ON clinics(wilaya);

-- ─────────────────────────────────────────────────────────────
--  TABLE : patient_profiles
--  Profil santé détaillé du patient
-- ─────────────────────────────────────────────────────────────

CREATE TABLE patient_profiles (
  id                      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth           DATE,
  gender                  gender_enum,
  blood_type              VARCHAR(5),   -- A+, O-, AB+, etc.
  height                  INT,          -- En cm
  weight                  INT,          -- En kg
  allergies               TEXT,
  chronic_diseases        TEXT,
  current_medications     TEXT,
  emergency_contact_name  VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
--  TABLE : availability
--  Créneaux horaires disponibles par médecin
-- ─────────────────────────────────────────────────────────────

CREATE TABLE availability (
  id            UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     UUID      NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week   INT,                   -- 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
  specific_date DATE,                  -- Pour bloquer/ouvrir une date précise
  start_time    VARCHAR(5) NOT NULL,   -- "09:00"
  end_time      VARCHAR(5) NOT NULL,   -- "17:00"
  slot_duration INT        NOT NULL DEFAULT 30,  -- Durée d'un créneau en minutes
  is_available  BOOLEAN    NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_availability_doctor ON availability(doctor_id);

-- ─────────────────────────────────────────────────────────────
--  TABLE : appointments
--  Rendez-vous médicaux
-- ─────────────────────────────────────────────────────────────

CREATE TABLE appointments (
  id               UUID                     PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id        UUID                     NOT NULL REFERENCES doctors(id),
  patient_id       UUID                     NOT NULL REFERENCES users(id),
  appointment_date DATE                     NOT NULL,
  appointment_time VARCHAR(5)               NOT NULL,  -- "09:30"
  status           appointment_status_enum  NOT NULL DEFAULT 'pending',
  motif            TEXT,
  notes            TEXT,
  is_first_visit   BOOLEAN                  NOT NULL DEFAULT FALSE,
  reminder_sent    BOOLEAN                  NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMP                NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP                NOT NULL DEFAULT NOW(),

  -- Un médecin ne peut pas avoir 2 RDV le même jour à la même heure
  UNIQUE (doctor_id, appointment_date, appointment_time)
);

CREATE INDEX idx_appointments_doctor  ON appointments(doctor_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date    ON appointments(appointment_date);
CREATE INDEX idx_appointments_status  ON appointments(status);

-- ─────────────────────────────────────────────────────────────
--  TABLE : conversations
--  Fil de discussion entre un médecin et un patient
-- ─────────────────────────────────────────────────────────────

CREATE TABLE conversations (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id       UUID      NOT NULL REFERENCES doctors(id),
  patient_id      UUID      NOT NULL REFERENCES users(id),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Un seul fil de discussion par paire médecin/patient
  UNIQUE (doctor_id, patient_id)
);

CREATE INDEX idx_conversations_last_msg ON conversations(last_message_at DESC);

-- ─────────────────────────────────────────────────────────────
--  TABLE : messages
--  Messages échangés dans une conversation
-- ─────────────────────────────────────────────────────────────

CREATE TABLE messages (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID      NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID      NOT NULL REFERENCES users(id),
  content         TEXT      NOT NULL,
  is_read         BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_unread       ON messages(is_read) WHERE is_read = FALSE;

-- ─────────────────────────────────────────────────────────────
--  TABLE : medical_records
--  Dossier patient numérique
-- ─────────────────────────────────────────────────────────────

CREATE TABLE medical_records (
  id             UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id     UUID              NOT NULL REFERENCES users(id),
  doctor_id      UUID              NOT NULL REFERENCES doctors(id),
  appointment_id UUID              REFERENCES appointments(id),
  record_type    record_type_enum  NOT NULL,
  title          VARCHAR(255)      NOT NULL,
  description    TEXT,
  diagnosis      TEXT,
  prescription   TEXT,
  file_path      TEXT,              -- Chemin vers un fichier joint (PDF, image)
  created_at     TIMESTAMP         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_records_patient ON medical_records(patient_id);
CREATE INDEX idx_records_doctor  ON medical_records(doctor_id);

-- ─────────────────────────────────────────────────────────────
--  TABLE : reviews
--  Avis et notes des patients après consultation
-- ─────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id             UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id      UUID      NOT NULL REFERENCES doctors(id),
  patient_id     UUID      NOT NULL REFERENCES users(id),
  appointment_id UUID      NOT NULL UNIQUE REFERENCES appointments(id),  -- 1 avis max par RDV
  rating         INT       NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment        TEXT,
  is_anonymous   BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_doctor ON reviews(doctor_id);

-- ─────────────────────────────────────────────────────────────
--  TABLE : subscriptions
--  Abonnements mensuels des médecins (2 990 DA/mois)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id         UUID                      PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id  UUID                      NOT NULL REFERENCES doctors(id),
  plan       VARCHAR(20)               NOT NULL DEFAULT 'monthly',  -- trial, monthly, annual
  amount     INT                       NOT NULL DEFAULT 2990,        -- En dinars algériens
  status     subscription_status_enum  NOT NULL DEFAULT 'active',
  start_date DATE                      NOT NULL,
  end_date   DATE                      NOT NULL,
  created_at TIMESTAMP                 NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_doctor  ON subscriptions(doctor_id);
CREATE INDEX idx_subscriptions_enddate ON subscriptions(end_date);

-- ─────────────────────────────────────────────────────────────
--  TABLE : notifications
--  Notifications in-app pour tous les utilisateurs
-- ─────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id         UUID                   PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID                   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       notification_type_enum NOT NULL,
  title      VARCHAR(255)           NOT NULL,
  body       TEXT,
  is_read    BOOLEAN                NOT NULL DEFAULT FALSE,
  data       JSONB,                  -- Données supplémentaires (ex: { appointmentId: "..." })
  created_at TIMESTAMP              NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = FALSE;

-- ─────────────────────────────────────────────────────────────
--  TRIGGER : updated_at automatique
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();