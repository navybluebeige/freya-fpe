import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import PatientNavbar from '../../components/PatientNavbar';
import { authAPI } from '../../services/api';

const UserIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const ShieldIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const LockIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);
const PillIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
    <circle cx="18" cy="18" r="3"/><path d="M16.5 16.5 19.5 19.5"/>
  </svg>
);
const AlertTriangle = ({ color = '#D97706', size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function PatientProfile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('infos');
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Entrez votre mot de passe');
    setDeleting(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      toast.success('Compte supprimé');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const [profile, setProfile] = useState({
    prenom: user?.firstName || user?.first_name || 'Sara',
    nom:    user?.lastName  || user?.last_name  || 'Amine',
    email:  user?.email || 'patient@freya.dz',
    phone:  user?.phone || '0555 123 456',
    dob: '15/06/1995', gender: 'Femme', wilaya: 'Alger',
    address: '12 Rue Didouche Mourad, Alger Centre',
    bloodType: 'A+', weight: '62', height: '165',
    allergies: 'Pénicilline', antecedents: 'Hypertension légère', mutuelle: 'CNAS',
  });

  const initials = `${profile.prenom?.[0] || 'P'}${profile.nom?.[0] || ''}`.toUpperCase();
  const handleSave = () => { setEditing(false); toast.success('Profil mis à jour !'); };

  const tabs = [
    { id: 'infos',    label: 'Informations', Icon: UserIcon   },
    { id: 'medical',  label: 'Medical',      Icon: ShieldIcon },
    { id: 'securite', label: 'Securite',     Icon: LockIcon   },
  ];

  const inputCls = "w-full px-3 py-2 rounded-lg bg-primary-50 border border-primary-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors";
  const valueCls = "text-sm font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg";

  const Field = ({ label, field, type = 'text', options }) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
      {editing ? (
        options ? (
          <select className={inputCls} value={profile[field]} onChange={e => setProfile({ ...profile, [field]: e.target.value })}>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input type={type} className={inputCls} value={profile[field]} onChange={e => setProfile({ ...profile, [field]: e.target.value })} />
        )
      ) : (
        <div className={valueCls}>{profile[field] || '—'}</div>
      )}
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <PatientNavbar active="accueil" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Mon Profil</h1>
            <p className="text-sm text-slate-500">Gérez vos informations personnelles et médicales</p>
          </div>
          <button
            onClick={editing ? handleSave : () => setEditing(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer border font-sans transition-colors ${
              editing
                ? 'bg-primary-600 text-white border-0 hover:bg-primary-700'
                : 'bg-white text-primary-600 border-primary-600 hover:bg-primary-50'
            }`}
          >
            {editing ? <><CheckIcon /> Sauvegarder</> : <><EditIcon /> Modifier</>}
          </button>
        </div>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card mb-5 overflow-hidden">
          <div className="h-16" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)' }} />
          <div className="flex items-end gap-5 px-6 pb-5" style={{ marginTop: '-36px' }}>
            <div className="w-18 h-18 rounded-full bg-primary-600 border-4 border-white shadow-lg flex items-center justify-center text-xl font-extrabold text-white shrink-0" style={{ width: 72, height: 72 }}>
              {initials}
            </div>
            <div className="pb-1">
              <div className="text-lg font-extrabold text-slate-900">{profile.prenom} {profile.nom}</div>
              <div className="text-sm text-slate-500 mt-0.5">{profile.email} · {profile.phone}</div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {[
                  { label: profile.bloodType, classes: 'bg-red-100 text-red-800' },
                  { label: profile.wilaya,    classes: 'bg-primary-100 text-primary-800' },
                  { label: profile.gender,    classes: 'bg-violet-100 text-violet-800' },
                  { label: profile.mutuelle,  classes: 'bg-green-100 text-green-800' },
                ].map((b, i) => (
                  <span key={i} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${b.classes}`}>{b.label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 mb-5 w-fit">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 font-sans ${
                activeTab === id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-primary-600'
              }`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* TAB: Informations */}
        {activeTab === 'infos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                <Field label="Prénom" field="prenom" />
                <Field label="Nom" field="nom" />
                <Field label="Date de naissance" field="dob" />
                <Field label="Genre" field="gender" options={['Homme', 'Femme']} />
                <Field label="Téléphone" field="phone" type="tel" />
                <Field label="Wilaya" field="wilaya" options={['Alger','Oran','Constantine','Annaba','Blida','Tizi Ouzou','Sétif','Batna']} />
              </div>
              <Field label="Adresse complète" field="address" />
            </div>

            <div className="flex flex-col gap-4">
              {/* Vitals */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Données vitales</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { val: profile.bloodType, label: 'Groupe sanguin', classes: 'bg-red-50 text-red-800',        unit: '' },
                    { val: profile.weight,    label: 'Poids',          classes: 'bg-primary-50 text-primary-800', unit: 'kg' },
                    { val: profile.height,    label: 'Taille',         classes: 'bg-green-50 text-green-800',     unit: 'cm' },
                  ].map((v, i) => (
                    <div key={i} className={`${v.classes} rounded-xl p-3.5 text-center`}>
                      <div className="text-xl md:text-2xl font-extrabold tracking-tight">{v.val}<span className="text-xs">{v.unit}</span></div>
                      <div className="text-[11px] text-slate-500 mt-1">{v.label}</div>
                    </div>
                  ))}
                </div>
                {editing && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Poids (kg)" field="weight" type="number" />
                    <Field label="Taille (cm)" field="height" type="number" />
                  </div>
                )}
              </div>

              {/* Alertes */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Alertes médicales</h3>
                <div className="bg-red-50 rounded-xl px-3.5 py-3 mb-2.5 flex items-center gap-3">
                  <PillIcon />
                  <div>
                    <div className="text-sm font-bold text-red-600">Allergie médicamenteuse</div>
                    <div className="text-xs text-slate-500 mt-0.5">{profile.allergies}</div>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-xl px-3.5 py-3 flex items-center gap-3">
                  <AlertTriangle color="#D97706" />
                  <div>
                    <div className="text-sm font-bold text-amber-600">Antécédents</div>
                    <div className="text-xs text-slate-500 mt-0.5">{profile.antecedents}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Médical */}
        {activeTab === 'medical' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Informations médicales</h3>
            <div className="grid grid-cols-2 gap-3.5 mb-4">
              <Field label="Groupe sanguin" field="bloodType" options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
              <Field label="Mutuelle / Assurance" field="mutuelle" options={['CNAS','CASNOS','Privée','Aucune']} />
              <Field label="Poids (kg)" field="weight" type="number" />
              <Field label="Taille (cm)" field="height" type="number" />
            </div>
            <div className="flex flex-col gap-3.5">
              <Field label="Allergies connues" field="allergies" />
              <Field label="Antécédents médicaux" field="antecedents" />
            </div>
            {!editing && (
              <div className="mt-5 p-3.5 bg-primary-50 border border-primary-200 rounded-xl">
                <p className="text-sm text-primary-700 font-semibold">
                  Pour mettre à jour vos informations médicales, cliquez sur <strong>Modifier</strong> en haut à droite.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: Sécurité */}
        {activeTab === 'securite' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informations de connexion</h3>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Adresse email</span>
                  <div className={valueCls}>{profile.email}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mot de passe</span>
                  <div className={valueCls}>••••••••••</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Changer le mot de passe</h3>
              <div className="flex flex-col gap-3.5 max-w-md">
                {['Mot de passe actuel', 'Nouveau mot de passe', 'Confirmer le nouveau mot de passe'].map((label, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                    <input type="password" placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors" />
                  </div>
                ))}
                <button
                  onClick={() => toast.success('Mot de passe modifié !')}
                  className="self-start inline-flex items-center gap-2 bg-primary-600 text-white border-0 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors mt-1"
                >
                  <LockIcon size={13} /> Mettre à jour le mot de passe
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-red-200 shadow-card p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-500 mb-3">
                <AlertTriangle color="#EF4444" /> Zone de danger
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
              </p>
              {!showDeleteModal ? (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-red-100 transition-colors"
                >
                  <TrashIcon /> Supprimer mon compte
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-sm">
                  <p className="text-sm font-semibold text-red-700 mb-3">Confirmez avec votre mot de passe :</p>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Mot de passe actuel"
                    className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-900 outline-none font-sans mb-3 focus:border-red-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer border-0 font-sans hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      {deleting ? 'Suppression...' : 'Confirmer la suppression'}
                    </button>
                    <button
                      onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                      className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg cursor-pointer bg-white font-sans hover:bg-slate-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
