import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { recordsAPI } from '../../services/api';
import PatientNavbar from '../../components/PatientNavbar';

const EditIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const SaveIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const FolderIcon= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const ImgIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

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

const EMPTY = {
  phone: '', birthDate: '', bloodGroup: '', gender: '', height: '', weight: '',
  allergies: '', chronicDiseases: '', currentMedications: '', familyAntecedents: '',
  emergencyContactName: '', emergencyContactPhone: '',
  nin: '', profession: '', insuranceType: 'CNAS', smokingStatus: '',
};

export default function PatientDossier() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [records,   setRecords]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY);

  const firstName = user?.firstName || 'Patient';
  const lastName  = user?.lastName  || '';
  const initials  = `${firstName[0] || 'P'}${lastName[0] || ''}`.toUpperCase();

  const load = useCallback(async () => {
    try {
      const res  = await recordsAPI.getRecords();
      const data = res.data;
      setRecords(Array.isArray(data.records) ? data.records : []);
      if (data.profile) {
        const p = data.profile;
        setForm({
          phone:                user?.phone || '',
          birthDate:            p.dateOfBirth        ? p.dateOfBirth.split('T')[0] : '',
          bloodGroup:           p.bloodType          || '',
          gender:               p.gender             || '',
          height:               p.height             ? String(p.height) : '',
          weight:               p.weight             ? String(p.weight) : '',
          allergies:            p.allergies          || '',
          chronicDiseases:      p.chronicDiseases    || '',
          currentMedications:   p.currentMedications || '',
          familyAntecedents:    p.familyAntecedents  || '',
          emergencyContactName: p.emergencyContactName  || '',
          emergencyContactPhone:p.emergencyContactPhone || '',
          nin:                  p.nin                || '',
          profession:           p.profession         || '',
          insuranceType:        p.insuranceType      || 'CNAS',
          smokingStatus:        p.smokingStatus      || '',
        });
      }
    } catch {
      toast.error('Erreur de chargement du dossier');
    } finally {
      setLoading(false);
    }
  }, [user?.phone]);

  useEffect(() => { load(); }, [load]);

  const consultations = records.filter(r => r.recordType === 'consultation');
  const ordonnances   = records.filter(r => r.recordType === 'ordonnance');
  const analyses      = records.filter(r => r.recordType === 'analyse' || r.recordType === 'radio');

  const handleSave = async () => {
    setSaving(true);
    try {
      await recordsAPI.updateProfile({ ...form, bloodGroup: form.bloodGroup });
      updateUser({ ...user, phone: form.phone });
      setIsEditing(false);
      toast.success('Dossier mis à jour');
      load();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const inp = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors";
  const val = "px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium text-slate-900";

  const F = ({ label, field, type = 'text', opts, placeholder = '' }) => (
    <div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">{label}</div>
      {isEditing ? (
        opts ? (
          <select className={inp} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}>
            <option value="">— Non renseigné —</option>
            {opts.map(o => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}
          </select>
        ) : (
          <input type={type} placeholder={placeholder} className={inp} value={form[field]}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
        )
      ) : (
        <div className={val}>{form[field] || <span className="text-slate-400 italic text-xs">Non renseigné</span>}</div>
      )}
    </div>
  );

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
      <p className="text-slate-400 text-sm">Chargement du dossier...</p>
    </div>
  );

  const displayAge = form.birthDate ? new Date().getFullYear() - new Date(form.birthDate).getFullYear() : null;

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <PatientNavbar active="dossier" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="flex items-center gap-2.5 text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
              <FolderIcon /> Dossier Médical
            </h1>
            <p className="text-sm text-slate-500">Consultez et gérez vos informations de santé</p>
          </div>
          {(activeTab === 'info' || activeTab === 'medical') && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer bg-white hover:bg-slate-50 font-sans">
                    Annuler
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-primary-600 text-white border-0 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-primary-700 font-sans disabled:opacity-50">
                    <SaveIcon /> {saving ? 'Enregistrement...' : 'Sauvegarder'}
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-primary-600 border border-primary-200 rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer bg-white hover:bg-primary-50 font-sans">
                  <EditIcon /> Modifier
                </button>
              )}
            </div>
          )}
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
              {form.bloodGroup && <span>· Gr. {form.bloodGroup}</span>}
              {form.insuranceType && <span>· {form.insuranceType}</span>}
              {form.profession && <span>· {form.profession}</span>}
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
            {/* Infos personnelles */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-3">
                <F label="Prénom"            field="phone"     type="tel"    placeholder="0555 000 000" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Email</div>
                  <div className={val}>{user?.email || '—'}</div>
                </div>
                <F label="Téléphone"         field="phone"     type="tel" />
                <F label="Date de naissance" field="birthDate" type="date" />
                <F label="Genre"             field="gender"    opts={[{v:'male',l:'Homme'},{v:'female',l:'Femme'}]} />
                <F label="NIN"               field="nin"       placeholder="Numéro d'identité nationale" />
                <F label="Profession"        field="profession" placeholder="Ex: Enseignant, Ingénieur..." />
                <F label="Mutuelle / Assurance" field="insuranceType" opts={['CNAS','CASNOS','Privée','Aucune']} />
              </div>
            </div>

            {/* Contact d'urgence + données vitales */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Données vitales</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { val: form.bloodGroup || '—', label: 'Groupe',  cls: 'bg-red-50 text-red-800'      },
                    { val: form.weight ? `${form.weight} kg` : '—', label: 'Poids',  cls: 'bg-primary-50 text-primary-800' },
                    { val: form.height ? `${form.height} cm` : '—', label: 'Taille', cls: 'bg-green-50 text-green-800'     },
                  ].map((v, i) => (
                    <div key={i} className={`${v.cls} rounded-xl p-3 text-center`}>
                      <div className="text-lg font-extrabold tracking-tight">{v.val}</div>
                      <div className="text-[10px] mt-0.5">{v.label}</div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <F label="Groupe sanguin" field="bloodGroup" opts={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
                    <F label="Poids (kg)"     field="weight"     type="number" />
                    <F label="Taille (cm)"    field="height"     type="number" />
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Contact d'urgence</h3>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Nom du contact" field="emergencyContactName"  placeholder="Nom et prénom" />
                  <F label="Téléphone"      field="emergencyContactPhone" type="tel" placeholder="0555 000 000" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Onglet SANTÉ ─── */}
        {activeTab === 'medical' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Antécédents et traitements</h3>
              <F label="Allergies connues"         field="allergies"          placeholder="Ex: Pénicilline, Aspirine..." />
              <F label="Maladies chroniques"       field="chronicDiseases"    placeholder="Ex: Diabète type 2, HTA..." />
              <F label="Traitements en cours"      field="currentMedications" placeholder="Ex: Metformine 500mg, Amlodipine..." />
              <F label="Antécédents familiaux"     field="familyAntecedents"  placeholder="Ex: Diabète (père), Cancer (grand-mère)..." />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Mode de vie</h3>
              <F label="Tabagisme" field="smokingStatus" opts={[
                {v:'non_fumeur', l:'Non-fumeur'},
                {v:'fumeur',     l:'Fumeur'},
                {v:'ex_fumeur',  l:'Ex-fumeur'},
              ]} />
              <div className="grid grid-cols-2 gap-3">
                <F label="Groupe sanguin" field="bloodGroup" opts={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
                <F label="Mutuelle"       field="insuranceType" opts={['CNAS','CASNOS','Privée','Aucune']} />
                <F label="Poids (kg)"     field="weight"     type="number" />
                <F label="Taille (cm)"    field="height"     type="number" />
              </div>
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
