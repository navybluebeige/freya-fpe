import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { recordsAPI } from '../../services/api';
import DoctorNavbar from '../../components/DoctorNavbar';

const BackIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const FolderIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const ImgIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const TYPE_INFO = {
  consultation: { label: 'Consultation', cls: 'bg-primary-100 text-primary-800', dot: 'bg-primary-500' },
  ordonnance:   { label: 'Ordonnance',   cls: 'bg-violet-100 text-violet-800',   dot: 'bg-violet-500'  },
  analyse:      { label: 'Analyse',      cls: 'bg-green-100  text-green-800',    dot: 'bg-green-500'   },
  radio:        { label: 'Imagerie',     cls: 'bg-amber-100  text-amber-800',    dot: 'bg-amber-500'   },
  autre:        { label: 'Autre',        cls: 'bg-slate-100  text-slate-600',    dot: 'bg-slate-400'   },
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const TABS = [
  { id: 'info',          label: 'Informations'  },
  { id: 'medical',       label: 'Santé'          },
  { id: 'consultations', label: 'Consultations'  },
  { id: 'ordonnances',   label: 'Ordonnances'    },
  { id: 'analyses',      label: 'Analyses'       },
];

const Row = ({ label, value }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">{label}</div>
    <div className="text-sm font-semibold text-slate-900">{value || <span className="text-slate-400 italic font-normal text-xs">Non renseigné</span>}</div>
  </div>
);

export default function DoctorPatientDossier() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [records,   setRecords]   = useState([]);
  const [profile,   setProfile]   = useState(null);
  const [patient,   setPatient]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const res  = await recordsAPI.getRecords(patientId);
      const data = res.data;
      setRecords(Array.isArray(data.records) ? data.records : []);
      setProfile(data.profile || null);
      setPatient(data.patient || null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erreur de chargement';
      toast.error(msg);
      if (err.response?.status === 403) navigate('/doctor/patients');
    } finally {
      setLoading(false);
    }
  }, [patientId, navigate]);

  useEffect(() => { load(); }, [load]);

  const consultations = records.filter(r => r.recordType === 'consultation');
  const ordonnances   = records.filter(r => r.recordType === 'ordonnance');
  const analyses      = records.filter(r => r.recordType === 'analyse' || r.recordType === 'radio');

  const firstName = patient?.firstName || '—';
  const lastName  = patient?.lastName  || '';
  const initials  = `${firstName[0] || 'P'}${lastName[0] || ''}`.toUpperCase();
  const displayAge = profile?.dateOfBirth
    ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()
    : null;

  const RecordCard = ({ rec }) => {
    const ti     = TYPE_INFO[rec.recordType] || TYPE_INFO.autre;
    const source = rec.doctor ? `Dr. ${rec.doctor.user?.firstName} ${rec.doctor.user?.lastName}` : rec.clinic?.name || '—';
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card hover:border-primary-200 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${ti.dot}`} />
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${ti.cls}`}>{ti.label}</span>
          </div>
          <span className="text-[11px] text-slate-400">{fmtDate(rec.createdAt)}</span>
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">{rec.title}</h3>
        <p className="text-[12px] text-primary-600 font-semibold mb-2">{source}</p>
        {rec.description && <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50 rounded-lg px-3 py-2 mb-2">{rec.description}</p>}
        {rec.diagnosis && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-2">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wide mb-0.5">Diagnostic</div>
            <p className="text-[13px] text-blue-800">{rec.diagnosis}</p>
          </div>
        )}
        {rec.prescription && (
          <div className="bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mb-2">
            <div className="text-[10px] font-bold text-violet-500 uppercase tracking-wide mb-0.5">Ordonnance</div>
            <p className="text-[13px] text-violet-800 whitespace-pre-line">{rec.prescription}</p>
          </div>
        )}
        {rec.filePath && (
          <a href={rec.filePath} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-primary-600 hover:underline">
            <ImgIcon /> Voir le document
          </a>
        )}
      </div>
    );
  };

  const EmptyTab = ({ msg }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col items-center py-16 gap-3">
      <FolderIcon />
      <p className="text-slate-500 font-semibold text-sm">{msg}</p>
      <p className="text-slate-400 text-xs">Les documents apparaîtront ici automatiquement</p>
    </div>
  );

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center flex-col gap-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <DoctorNavbar active="patients" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/doctor/patients')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer font-sans transition-colors">
            <BackIcon /> Retour
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 tracking-tight">
              <FolderIcon /> Dossier médical
            </h1>
          </div>
        </div>

        {/* Bannière patient */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center text-xl font-extrabold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-extrabold text-slate-900">{firstName} {lastName}</div>
            <div className="text-sm text-slate-500 mt-0.5 flex flex-wrap gap-1.5">
              {displayAge && <span>{displayAge} ans</span>}
              {profile?.bloodType && <span>· Gr. {profile.bloodType}</span>}
              {profile?.insuranceType && <span>· {profile.insuranceType}</span>}
              {patient?.phone && <span>· {patient.phone}</span>}
            </div>
          </div>
          <div className="flex gap-5 shrink-0 text-center">
            {[
              { val: consultations.length, label: 'Consultations' },
              { val: ordonnances.length,   label: 'Ordonnances'   },
              { val: analyses.length,      label: 'Analyses'      },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-xl md:text-2xl font-extrabold text-primary-600">{s.val}</div>
                <div className="text-[11px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {TABS.map(tab => {
            const count = tab.id === 'consultations' ? consultations.length
              : tab.id === 'ordonnances' ? ordonnances.length
              : tab.id === 'analyses' ? analyses.length : null;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 md:px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-0 font-sans ${
                  activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300'
                }`}>
                {tab.label}
                {count !== null && count > 0 && (
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-primary-100 text-primary-600'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Onglet INFO ─── */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <Row label="Prénom"       value={firstName} />
                <Row label="Nom"          value={lastName} />
                <Row label="Téléphone"    value={patient?.phone} />
                <Row label="Date de naissance" value={profile?.dateOfBirth ? fmtDate(profile.dateOfBirth) : null} />
                <Row label="Genre"        value={profile?.gender === 'male' ? 'Homme' : profile?.gender === 'female' ? 'Femme' : null} />
                <Row label="Wilaya"       value={patient?.wilaya} />
                <Row label="Profession"   value={profile?.profession} />
                <Row label="NIN"          value={profile?.nin} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Données vitales</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { val: profile?.bloodType || '—', label: 'Groupe',  cls: 'bg-red-50 text-red-800'      },
                    { val: profile?.weight ? `${profile.weight} kg` : '—', label: 'Poids',  cls: 'bg-primary-50 text-primary-800' },
                    { val: profile?.height ? `${profile.height} cm` : '—', label: 'Taille', cls: 'bg-green-50 text-green-800'     },
                  ].map((v, i) => (
                    <div key={i} className={`${v.cls} rounded-xl p-3 text-center`}>
                      <div className="text-lg font-extrabold tracking-tight">{v.val}</div>
                      <div className="text-[10px] mt-0.5">{v.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Row label="Tabagisme"  value={
                    profile?.smokingStatus === 'fumeur' ? 'Fumeur'
                    : profile?.smokingStatus === 'non_fumeur' ? 'Non-fumeur'
                    : profile?.smokingStatus === 'ex_fumeur' ? 'Ex-fumeur'
                    : null
                  } />
                  <Row label="Assurance"  value={profile?.insuranceType} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Contact d'urgence</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <Row label="Nom"       value={profile?.emergencyContactName} />
                  <Row label="Téléphone" value={profile?.emergencyContactPhone} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Onglet SANTÉ ─── */}
        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Antécédents et traitements</h3>
              <Row label="Allergies connues"     value={profile?.allergies} />
              <Row label="Maladies chroniques"   value={profile?.chronicDiseases} />
              <Row label="Traitements en cours"  value={profile?.currentMedications} />
              <Row label="Antécédents familiaux" value={profile?.familyAntecedents} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Informations complémentaires</h3>
              <Row label="Groupe sanguin" value={profile?.bloodType} />
              <Row label="Poids"          value={profile?.weight ? `${profile.weight} kg` : null} />
              <Row label="Taille"         value={profile?.height ? `${profile.height} cm` : null} />
              <Row label="Tabagisme"      value={
                profile?.smokingStatus === 'fumeur' ? 'Fumeur'
                : profile?.smokingStatus === 'non_fumeur' ? 'Non-fumeur'
                : profile?.smokingStatus === 'ex_fumeur' ? 'Ex-fumeur'
                : null
              } />
            </div>
          </div>
        )}

        {/* ─── Onglet CONSULTATIONS ─── */}
        {activeTab === 'consultations' && (
          consultations.length === 0 ? <EmptyTab msg="Aucune consultation enregistrée" />
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{consultations.map(r => <RecordCard key={r.id} rec={r} />)}</div>
        )}

        {/* ─── Onglet ORDONNANCES ─── */}
        {activeTab === 'ordonnances' && (
          ordonnances.length === 0 ? <EmptyTab msg="Aucune ordonnance disponible" />
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ordonnances.map(r => <RecordCard key={r.id} rec={r} />)}</div>
        )}

        {/* ─── Onglet ANALYSES ─── */}
        {activeTab === 'analyses' && (
          analyses.length === 0 ? <EmptyTab msg="Aucun résultat d'analyse disponible" />
            : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{analyses.map(r => <RecordCard key={r.id} rec={r} />)}</div>
        )}
      </div>
    </div>
  );
}
