import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

/* ─── Icons SVG ─────────────────────────────────────────────────────────────── */
const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ─── Wilayas ────────────────────────────────────────────────────────────────── */
const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida',
  'Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel',
  'Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa',
  'Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane'
];

const SPECIALITES = [
  'Médecin généraliste','Cardiologue','Pneumologue','Gastro-entérologue','Néphrologue',
  'Endocrinologue','Rhumatologue','Neurologue','Hématologue','Infectiologue','Oncologue',
  'Allergologue','Chirurgien général','Chirurgien orthopédiste','Neurochirurgien',
  'Chirurgien plasticien','Gynécologue','Gynécologue-obstétricien','Pédiatre',
  'Ophtalmologue','ORL','Dermatologue','Psychiatre','Psychologue clinicien',
  'Radiologue','Biologiste médical','Kinésithérapeute','Dentiste','Orthodontiste',
  'Anesthésiste-réanimateur','Gériatre','Urologue','Nutritionniste',
];

const pwStrength = (p) => {
  if (!p) return { label: '', color: 'transparent', w: '0%' };
  if (p.length < 6) return { label: 'Faible', color: '#EF4444', w: '33%' };
  if (p.length < 10) return { label: 'Moyen', color: '#F59E0B', w: '66%' };
  return { label: 'Fort', color: '#10B981', w: '100%' };
};

/* ─── Composants ────────────────────────────────────────────────────────────── */
const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={s.label}>{label}{required && <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span>}</label>
    {children}
  </div>
);

const Input = ({ type = 'text', ...props }) => (
  <input type={type} style={s.input} {...props} />
);

const Select = ({ children, ...props }) => (
  <select style={s.input} {...props}>{children}</select>
);

const NextBtn = ({ onClick, disabled, loading, label = 'Continuer' }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{ ...s.nextBtn, opacity: (disabled || loading) ? 0.6 : 1 }}
  >
    {loading ? 'Chargement...' : label}
  </button>
);

const BackBtn = ({ onClick }) => (
  <button style={s.backBtn} onClick={onClick}>
    <ChevronLeft /> Étape précédente
  </button>
);

/* ─── Indicateur de progression ─────────────────────────────────────────────── */
function StepBar({ step, total, labels }) {
  return (
    <div>
      <div style={s.stepBar}>
        {labels.map((lbl, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <React.Fragment key={n}>
              <div style={s.stepItem}>
                <div style={{
                  ...s.stepCircle,
                  backgroundColor: done ? '#2563EB' : active ? '#EFF6FF' : '#F1F5F9',
                  border: `2px solid ${(done || active) ? '#2563EB' : '#E2E8F0'}`,
                  color: done ? '#fff' : active ? '#2563EB' : '#94A3B8',
                }}>
                  {done ? <CheckIcon /> : n}
                </div>
                <div style={{
                  ...s.stepLabel,
                  color: active ? '#2563EB' : done ? '#374151' : '#94A3B8',
                  fontWeight: active ? '600' : '400',
                }}>{lbl}</div>
              </div>
              {i < labels.length - 1 && (
                <div style={{ ...s.stepLine, backgroundColor: n < step ? '#2563EB' : '#E2E8F0' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* ─── Sélection du rôle ─────────────────────────────────────────────────────── */
function RoleSelector({ onSelect }) {
  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      desc: 'Prenez rendez-vous avec des médecins et gérez votre dossier médical',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
    {
      id: 'doctor',
      title: 'Médecin',
      desc: 'Gérez votre agenda, vos patients et votre profil professionnel',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
    },
    {
      id: 'laboratory',
      title: 'Laboratoire',
      desc: 'Gérez vos rendez-vous d\'analyses et envoyez les résultats aux patients',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3M3 9a9 9 0 0 0 15 6.7"/>
        </svg>
      ),
    },
  ];

  return (
    <div>
      <div style={s.stepTitle}>Créer un compte</div>
      <p style={s.stepSub}>Choisissez votre profil pour commencer</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {roles.map(r => (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            style={s.roleCard}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#fff'; }}
          >
            <div style={s.roleIcon}>{r.icon}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{r.title}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Formulaire Patient ─────────────────────────────────────────────────────── */
const PATIENT_STEPS = ['Identifiant', 'Identité', 'Profil', 'Mot de passe', 'Téléphone'];

function PatientForm({ onBack, navigate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    email: '', nationalId: '', firstName: '', lastName: '',
    birthDate: '', gender: '', password: '', phone: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const str = pwStrength(form.password);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authAPI.registerPatient({
        email: form.email,
        phone: form.phone || undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        birthDate: form.birthDate || undefined,
        gender: form.gender === 'F' ? 'female' : 'male',
        nationalId: form.nationalId,
        role: 'patient',
      });
      toast.success('Inscription réussie ! Connectez-vous maintenant.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button style={s.backBtn} onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}>
          <ChevronLeft /> Retour
        </button>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Patient</span>
      </div>

      <StepBar step={step} total={PATIENT_STEPS.length} labels={PATIENT_STEPS} />

      {/* Step 1: Email */}
      {step === 1 && (
        <div>
          <div style={s.stepTitle}>Votre identifiant</div>
          <p style={s.stepSub}>Entrez votre adresse email pour créer votre compte</p>
          <Field label="Adresse email" required>
            <Input placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <NextBtn onClick={() => setStep(2)} disabled={!form.email.trim() || !form.email.includes('@')} />
        </div>
      )}

      {/* Step 2: Identité */}
      {step === 2 && (
        <div>
          <div style={s.stepTitle}>Votre identité</div>
          <p style={s.stepSub}>Ces informations seront visibles par vos médecins</p>
          <div style={s.row2}>
            <Field label="Prénom" required>
              <Input placeholder="Sara" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </Field>
            <Field label="Nom" required>
              <Input placeholder="Amrani" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </Field>
          </div>
          <Field label="Numéro d'identifiant national (NIN)" required>
            <Input placeholder="Ex: 19XXXXXXXXXXXXXXXXXXX" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
          </Field>
          <NextBtn onClick={() => setStep(3)} disabled={!form.firstName || !form.lastName || !form.nationalId} />
        </div>
      )}

      {/* Step 3: Profil */}
      {step === 3 && (
        <div>
          <div style={s.stepTitle}>Informations de profil</div>
          <p style={s.stepSub}>Pour que vos soignants vous connaissent mieux</p>
          <Field label="Date de naissance">
            <Input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
          </Field>
          <Field label="Sexe">
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ val: 'F', label: 'Féminin' }, { val: 'M', label: 'Masculin' }].map(({ val, label }) => (
                <button key={val} style={{ ...s.genderBtn, borderColor: form.gender === val ? '#2563EB' : '#E2E8F0', backgroundColor: form.gender === val ? '#EFF6FF' : '#fff', color: form.gender === val ? '#2563EB' : '#374151', fontWeight: form.gender === val ? '600' : '400' }} onClick={() => set('gender', val)}>
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <NextBtn onClick={() => setStep(4)} disabled={!form.gender} />
        </div>
      )}

      {/* Step 4: Mot de passe */}
      {step === 4 && (
        <div>
          <div style={s.stepTitle}>Mot de passe</div>
          <p style={s.stepSub}>Minimum 6 caractères</p>
          <Field label="Mot de passe" required>
            <div style={{ position: 'relative' }}>
              <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              <button onClick={() => setShowPwd(v => !v)} style={s.eyeBtn}><EyeIcon open={showPwd} /></button>
            </div>
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={s.strengthTrack}><div style={{ ...s.strengthFill, width: str.w, backgroundColor: str.color }} /></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: str.color, marginTop: 4 }}>Sécurité : {str.label}</div>
              </div>
            )}
          </Field>
          <NextBtn onClick={() => setStep(5)} disabled={form.password.length < 6} />
        </div>
      )}

      {/* Step 5: Téléphone */}
      {step === 5 && (
        <div>
          <div style={s.stepTitle}>Numéro de téléphone</div>
          <p style={s.stepSub}>Optionnel — pour être contacté par votre médecin</p>
          <Field label="Téléphone">
            <Input placeholder="06XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
          <NextBtn onClick={handleSubmit} loading={loading} label="Finaliser l'inscription" />
          <button style={s.skipBtn} onClick={handleSubmit} disabled={loading}>Ignorer cette étape</button>
        </div>
      )}
    </div>
  );
}

/* ─── Formulaire Médecin ─────────────────────────────────────────────────────── */
const DOCTOR_STEPS = ['Identité', 'Profession', 'Documents', 'Preuve 1', 'Preuve 2', 'Preuve 3', 'Sécurité'];

function DoctorForm({ onBack, navigate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    specialite: '', wilaya: 'Alger', city: '', cabinetAddress: '',
    nationalId: '', diplomaNumber: '', ordreNumber: '',
    proof1: '', proof2: '', proof3: '',
    password: '', phone: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const str = pwStrength(form.password);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authAPI.registerDoctor({
        email: form.email,
        phone: form.phone || undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
        specialite: form.specialite,
        wilaya: form.wilaya,
        city: form.city || undefined,
        cabinetAddress: form.cabinetAddress || undefined,
        ordreNumber: form.diplomaNumber || form.ordreNumber || undefined,
        nationalId: form.nationalId,
        role: 'doctor',
      });
      toast.success('Demande enregistrée ! Votre compte sera activé après validation.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button style={s.backBtn} onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}>
          <ChevronLeft /> Retour
        </button>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Médecin</span>
      </div>

      <StepBar step={step} total={DOCTOR_STEPS.length} labels={DOCTOR_STEPS} />

      {/* Step 1: Identité */}
      {step === 1 && (
        <div>
          <div style={s.stepTitle}>Informations personnelles</div>
          <p style={s.stepSub}>Votre identité en tant que médecin</p>
          <Field label="Adresse email professionnelle" required>
            <Input placeholder="dr.nom@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <div style={s.row2}>
            <Field label="Prénom" required>
              <Input placeholder="Yacine" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </Field>
            <Field label="Nom" required>
              <Input placeholder="Bouras" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </Field>
          </div>
          <NextBtn onClick={() => setStep(2)} disabled={!form.email || !form.firstName || !form.lastName} />
        </div>
      )}

      {/* Step 2: Profession */}
      {step === 2 && (
        <div>
          <div style={s.stepTitle}>Informations professionnelles</div>
          <p style={s.stepSub}>Votre spécialité et localisation de cabinet</p>
          <Field label="Spécialité" required>
            <Select value={form.specialite} onChange={e => set('specialite', e.target.value)}>
              <option value="">Sélectionnez votre spécialité</option>
              {SPECIALITES.map(sp => <option key={sp} value={sp}>{sp}</option>)}
            </Select>
          </Field>
          <div style={s.row2}>
            <Field label="Wilaya" required>
              <Select value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </Select>
            </Field>
            <Field label="Ville / Commune">
              <Input placeholder="Ex: Alger Centre" value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
          </div>
          <Field label="Adresse du cabinet">
            <Input placeholder="Ex: 12 rue Didouche Mourad, Alger" value={form.cabinetAddress} onChange={e => set('cabinetAddress', e.target.value)} />
          </Field>
          <NextBtn onClick={() => setStep(3)} disabled={!form.specialite || !form.wilaya} />
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div>
          <div style={s.stepTitle}>Documents d'identification</div>
          <p style={s.stepSub}>Votre numéro d'identification nationale et de diplôme</p>
          <Field label="Numéro d'identifiant national (NIN)" required>
            <Input placeholder="Ex: 19XXXXXXXXXXXXXXXXXXX" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} />
          </Field>
          <Field label="Numéro de diplôme de médecine" required>
            <Input placeholder="Ex: MED-2015-XXXXXX" value={form.diplomaNumber} onChange={e => set('diplomaNumber', e.target.value)} />
          </Field>
          <div style={{ padding: '12px 16px', background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
              Les 3 étapes suivantes concernent les preuves de votre exercice professionnel. Ces informations seront vérifiées par notre équipe avant activation du compte.
            </div>
          </div>
          <NextBtn onClick={() => setStep(4)} disabled={!form.nationalId || !form.diplomaNumber} />
        </div>
      )}

      {/* Step 4: Preuve 1 — Numéro CNOM */}
      {step === 4 && (
        <div>
          <div style={s.stepTitle}>Preuve 1 — Ordre des médecins</div>
          <p style={s.stepSub}>Numéro d'inscription au Conseil National de l'Ordre des Médecins (CNOM)</p>
          <div style={{ padding: '10px 14px', background: '#EFF6FF', borderRadius: 10, border: '1px solid #BFDBFE', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#1E40AF', fontWeight: 600 }}>Obligatoire pour exercer légalement en Algérie</div>
          </div>
          <Field label="Numéro d'ordre CNOM" required>
            <Input placeholder="Ex: CNOM-ALG-2015-XXXXX" value={form.ordreNumber} onChange={e => set('ordreNumber', e.target.value)} />
          </Field>
          <Field label="Wilaya d'inscription à l'ordre">
            <Select value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </Select>
          </Field>
          <NextBtn onClick={() => setStep(5)} disabled={!form.ordreNumber} />
        </div>
      )}

      {/* Step 5: Preuve 2 — Propriété du cabinet */}
      {step === 5 && (
        <div>
          <div style={s.stepTitle}>Preuve 2 — Propriété du cabinet</div>
          <p style={s.stepSub}>Document attestant que vous êtes bien propriétaire ou responsable du cabinet indiqué</p>
          <Field label="Numéro de registre du commerce ou d'autorisation d'exercice" required>
            <Input placeholder="Ex: RC-XXXX-XXXX ou AUTO-XXXXX" value={form.proof2} onChange={e => set('proof2', e.target.value)} />
          </Field>
          <Field label="Description / remarques supplémentaires">
            <textarea
              style={{ ...s.input, minHeight: 80, resize: 'vertical' }}
              placeholder="Ex: Cabinet en association avec Dr. Dupont, autorisation n° ..."
              value={form.proof1}
              onChange={e => set('proof1', e.target.value)}
            />
          </Field>
          <NextBtn onClick={() => setStep(6)} disabled={!form.proof2} />
        </div>
      )}

      {/* Step 6: Preuve 3 — Justificatif d'exercice */}
      {step === 6 && (
        <div>
          <div style={s.stepTitle}>Preuve 3 — Justificatif d'exercice</div>
          <p style={s.stepSub}>Attestation ou document prouvant votre activité médicale actuelle</p>
          <Field label="Numéro de la carte professionnelle médicale" required>
            <Input placeholder="Ex: CPM-XXXXX-2024" value={form.proof3} onChange={e => set('proof3', e.target.value)} />
          </Field>
          <div style={{ padding: '12px 16px', background: '#ECFDF5', borderRadius: 10, border: '1px solid #A7F3D0', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.6 }}>
              Notre équipe vous contactera dans les 48h pour valider votre compte. Vous pouvez vous connecter dès maintenant mais certaines fonctionnalités seront disponibles après validation.
            </div>
          </div>
          <NextBtn onClick={() => setStep(7)} disabled={!form.proof3} />
        </div>
      )}

      {/* Step 7: Sécurité */}
      {step === 7 && (
        <div>
          <div style={s.stepTitle}>Sécurité du compte</div>
          <p style={s.stepSub}>Choisissez un mot de passe sécurisé</p>
          <Field label="Mot de passe" required>
            <div style={{ position: 'relative' }}>
              <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              <button onClick={() => setShowPwd(v => !v)} style={s.eyeBtn}><EyeIcon open={showPwd} /></button>
            </div>
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={s.strengthTrack}><div style={{ ...s.strengthFill, width: str.w, backgroundColor: str.color }} /></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: str.color, marginTop: 4 }}>Sécurité : {str.label}</div>
              </div>
            )}
          </Field>
          <Field label="Téléphone professionnel">
            <Input placeholder="05XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
          <NextBtn onClick={handleSubmit} loading={loading} disabled={form.password.length < 6} label="Soumettre la demande d'inscription" />
        </div>
      )}
    </div>
  );
}

/* ─── Formulaire Laboratoire ─────────────────────────────────────────────────── */
const LAB_STEPS = ['Laboratoire', 'Localisation', 'Documents', 'Preuve 1', 'Preuve 2', 'Preuve 3', 'Sécurité'];

function LabForm({ onBack, navigate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    clinicName: '', email: '',
    address: '', wilaya: 'Alger', city: '',
    ownerNationalId: '', licenseNumber: '',
    proof1_rc: '', proof2_diploma: '', proof3_auth: '',
    password: '', phone: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const str = pwStrength(form.password);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authAPI.registerLab({
        email: form.email,
        phone: form.phone || undefined,
        firstName: form.clinicName,
        lastName: 'Laboratoire',
        password: form.password,
        clinicName: form.clinicName,
        wilaya: form.wilaya,
        city: form.city || undefined,
        address: form.address,
      });
      toast.success('Demande enregistrée ! Votre laboratoire sera activé après validation.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button style={s.backBtn} onClick={() => step === 1 ? onBack() : setStep(s => s - 1)}>
          <ChevronLeft /> Retour
        </button>
        <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Laboratoire</span>
      </div>

      <StepBar step={step} total={LAB_STEPS.length} labels={LAB_STEPS} />

      {/* Step 1: Laboratoire */}
      {step === 1 && (
        <div>
          <div style={s.stepTitle}>Votre laboratoire</div>
          <p style={s.stepSub}>Informations générales du laboratoire d'analyses</p>
          <Field label="Nom du laboratoire" required>
            <Input placeholder="Ex: Laboratoire BioSanté Alger" value={form.clinicName} onChange={e => set('clinicName', e.target.value)} />
          </Field>
          <Field label="Email du laboratoire" required>
            <Input placeholder="contact@laboratoire.dz" value={form.email} onChange={e => set('email', e.target.value)} />
          </Field>
          <NextBtn onClick={() => setStep(2)} disabled={!form.clinicName || !form.email || !form.email.includes('@')} />
        </div>
      )}

      {/* Step 2: Localisation */}
      {step === 2 && (
        <div>
          <div style={s.stepTitle}>Localisation du laboratoire</div>
          <p style={s.stepSub}>Adresse et situation géographique</p>
          <Field label="Adresse complète" required>
            <Input placeholder="Ex: 5 rue Ibn Khaldoun, Alger Centre" value={form.address} onChange={e => set('address', e.target.value)} />
          </Field>
          <div style={s.row2}>
            <Field label="Wilaya" required>
              <Select value={form.wilaya} onChange={e => set('wilaya', e.target.value)}>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </Select>
            </Field>
            <Field label="Ville / Commune">
              <Input placeholder="Ex: Hydra" value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
          </div>
          <NextBtn onClick={() => setStep(3)} disabled={!form.address || !form.wilaya} />
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div>
          <div style={s.stepTitle}>Documents d'identification</div>
          <p style={s.stepSub}>Identité du propriétaire et numéro d'autorisation du laboratoire</p>
          <Field label="Numéro d'identifiant national du propriétaire (NIN)" required>
            <Input placeholder="Ex: 19XXXXXXXXXXXXXXXXXXX" value={form.ownerNationalId} onChange={e => set('ownerNationalId', e.target.value)} />
          </Field>
          <Field label="Numéro d'autorisation d'ouverture du laboratoire" required>
            <Input placeholder="Ex: AUTO-LAB-2020-XXXXX" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
          </Field>
          <div style={{ padding: '12px 16px', background: '#FEF3C7', borderRadius: 10, border: '1px solid #FDE68A', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6 }}>
              Les 3 étapes suivantes concernent les preuves légales d'exploitation. Elles seront vérifiées avant activation du compte.
            </div>
          </div>
          <NextBtn onClick={() => setStep(4)} disabled={!form.ownerNationalId || !form.licenseNumber} />
        </div>
      )}

      {/* Step 4: Preuve 1 — Licence */}
      {step === 4 && (
        <div>
          <div style={s.stepTitle}>Preuve 1 — Licence d'exploitation</div>
          <p style={s.stepSub}>Numéro de la licence délivrée par le Ministère de la Santé</p>
          <Field label="Numéro de licence d'exploitation" required>
            <Input placeholder="Ex: LIC-LAB-16-XXXX-2022" value={form.proof1_rc} onChange={e => set('proof1_rc', e.target.value)} />
          </Field>
          <Field label="Date de délivrance de la licence">
            <Input type="date" value={form.city} onChange={e => set('city', e.target.value)} />
          </Field>
          <NextBtn onClick={() => setStep(5)} disabled={!form.proof1_rc} />
        </div>
      )}

      {/* Step 5: Preuve 2 — Registre de commerce */}
      {step === 5 && (
        <div>
          <div style={s.stepTitle}>Preuve 2 — Registre du commerce</div>
          <p style={s.stepSub}>Numéro d'enregistrement au registre du commerce algérien</p>
          <Field label="Numéro de registre du commerce (RC)" required>
            <Input placeholder="Ex: 16/00-XXXXXXX B XX" value={form.proof2_diploma} onChange={e => set('proof2_diploma', e.target.value)} />
          </Field>
          <Field label="Remarques ou informations complémentaires">
            <textarea
              style={{ ...s.input, minHeight: 70, resize: 'vertical' }}
              placeholder="Informations supplémentaires..."
              value={form.proof3_auth}
              onChange={e => set('proof3_auth', e.target.value)}
            />
          </Field>
          <NextBtn onClick={() => setStep(6)} disabled={!form.proof2_diploma} />
        </div>
      )}

      {/* Step 6: Preuve 3 — Diplôme directeur */}
      {step === 6 && (
        <div>
          <div style={s.stepTitle}>Preuve 3 — Diplôme du directeur technique</div>
          <p style={s.stepSub}>Le directeur technique d'un laboratoire doit être pharmacien biologiste ou médecin spécialiste</p>
          <Field label="Numéro de diplôme du directeur technique" required>
            <Input placeholder="Ex: DIPL-PHARM-2018-XXXXX" value={form.proof3_auth} onChange={e => set('proof3_auth', e.target.value)} />
          </Field>
          <div style={{ padding: '12px 16px', background: '#ECFDF5', borderRadius: 10, border: '1px solid #A7F3D0', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#065F46', lineHeight: 1.6 }}>
              Notre équipe vérifiera vos documents dans les 48h et activera votre compte laboratoire.
            </div>
          </div>
          <NextBtn onClick={() => setStep(7)} disabled={!form.proof3_auth} />
        </div>
      )}

      {/* Step 7: Sécurité */}
      {step === 7 && (
        <div>
          <div style={s.stepTitle}>Sécurité du compte</div>
          <p style={s.stepSub}>Définissez le mot de passe pour accéder au tableau de bord</p>
          <Field label="Mot de passe" required>
            <div style={{ position: 'relative' }}>
              <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              <button onClick={() => setShowPwd(v => !v)} style={s.eyeBtn}><EyeIcon open={showPwd} /></button>
            </div>
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={s.strengthTrack}><div style={{ ...s.strengthFill, width: str.w, backgroundColor: str.color }} /></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: str.color, marginTop: 4 }}>Sécurité : {str.label}</div>
              </div>
            )}
          </Field>
          <Field label="Téléphone du laboratoire">
            <Input placeholder="05XXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
          </Field>
          <NextBtn onClick={handleSubmit} loading={loading} disabled={form.password.length < 6} label="Soumettre la demande d'inscription" />
        </div>
      )}
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  return (
    <div style={s.root}>
      <style>{`*, *::before, *::after { box-sizing: border-box; } input:focus, select:focus, textarea:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; outline: none; background: #fff !important; }`}</style>

      <div style={s.header}>
        <Link to="/" style={s.logo}>Freya</Link>
        <div style={s.headerRight}>
          Déjà inscrit ?{' '}
          <Link to="/login" style={s.headerLink}>Se connecter</Link>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.card}>
          {role === null && <RoleSelector onSelect={setRole} />}
          {role === 'patient' && <PatientForm onBack={() => setRole(null)} navigate={navigate} />}
          {role === 'doctor' && <DoctorForm onBack={() => setRole(null)} navigate={navigate} />}
          {role === 'laboratory' && <LabForm onBack={() => setRole(null)} navigate={navigate} />}
          <div style={s.footerNote}>
            En vous inscrivant, vous acceptez nos{' '}
            <span style={{ color: '#2563EB', cursor: 'pointer' }}>Conditions d'utilisation</span>
            {' '}et notre{' '}
            <span style={{ color: '#2563EB', cursor: 'pointer' }}>Politique de confidentialité</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const s = {
  root: { minHeight: '100vh', backgroundColor: '#F0F5FF', fontFamily: "'Inter','DM Sans','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 40px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  logo: { fontSize: '22px', fontWeight: '800', color: '#2563EB', textDecoration: 'none', letterSpacing: '-0.5px' },
  headerRight: { fontSize: '13px', color: '#64748B' },
  headerLink: { color: '#2563EB', fontWeight: '600', textDecoration: 'none' },
  body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '560px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #E2E8F0' },

  roleCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', border: '1.5px solid #E2E8F0', borderRadius: 12, background: '#fff', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left', fontFamily: 'inherit' },
  roleIcon: { width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  stepBar: { display: 'flex', alignItems: 'center', marginBottom: 8 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 },
  stepCircle: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, transition: 'all 0.2s' },
  stepLabel: { fontSize: 9, whiteSpace: 'nowrap', transition: 'all 0.2s' },
  stepLine: { flex: 1, height: 2, marginBottom: 18, transition: 'background 0.2s', minWidth: 8 },
  progressTrack: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 24, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2, transition: 'width 0.3s ease' },

  backBtn: { display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' },
  stepTitle: { fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.4px' },
  stepSub: { fontSize: 13, color: '#64748B', marginBottom: 22, lineHeight: 1.55 },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '11px 14px', borderRadius: 9, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC', transition: 'all 0.15s', boxSizing: 'border-box', fontFamily: 'inherit' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  genderBtn: { flex: 1, padding: '12px', borderRadius: 9, border: '1.5px solid #E2E8F0', backgroundColor: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' },
  strengthTrack: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: 2, transition: 'all 0.3s' },
  nextBtn: { width: '100%', padding: '13px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', marginTop: 4 },
  skipBtn: { width: '100%', padding: '10px', backgroundColor: 'transparent', color: '#64748B', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 },
  footerNote: { marginTop: 24, fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 1.6 },
};
