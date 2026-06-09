import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, recordsAPI, messagesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import DoctorNavbar from '../../components/DoctorNavbar';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const UsersIcon = ({ size = 40, color = '#CBD5E1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_CLS = {
  confirmed: 'bg-green-100 text-green-800',
  pending:   'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-700',
};
const STATUS_LBL = { confirmed: 'Confirmé', pending: 'En attente', completed: 'Terminé', cancelled: 'Annulé' };

const RECORD_TYPE_LBL = {
  consultation: 'Consultation',
  ordonnance:   'Ordonnance',
  analyse:      'Analyse',
  radio:        'Radiologie',
  autre:        'Autre',
};
const RECORD_TYPE_CLR = {
  consultation: 'bg-blue-100 text-blue-800',
  ordonnance:   'bg-green-100 text-green-800',
  analyse:      'bg-purple-100 text-purple-800',
  radio:        'bg-orange-100 text-orange-800',
  autre:        'bg-slate-100 text-slate-600',
};

export default function DoctorPatients() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedPat,  setSelectedPat]  = useState(null);
  const [activeTab,    setActiveTab]    = useState('rdvs'); // 'rdvs' | 'dossier'
  const [records,      setRecords]      = useState([]);
  const [recLoading,   setRecLoading]   = useState(false);
  const [msgLoading,   setMsgLoading]   = useState(false);

  useEffect(() => {
    appointmentsAPI.getMyAppointments({ limit: 500 })
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  /* ─── Regrouper par patient ─── */
  const patients = useMemo(() => {
    const map = {};
    appointments.forEach(a => {
      const pid = a.patientId;
      if (!map[pid]) {
        map[pid] = {
          id:        pid,
          firstName: a.patient?.firstName || '—',
          lastName:  a.patient?.lastName  || '',
          phone:     a.patient?.phone     || null,
          rdvs:      [],
        };
      }
      map[pid].rdvs.push(a);
    });
    return Object.values(map).sort((a, b) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
    );
  }, [appointments]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || (p.phone && p.phone.includes(q));
  });

  const patDetails = selectedPat ? patients.find(p => p.id === selectedPat) : null;

  const loadRecords = useCallback(async (patientId) => {
    setRecLoading(true);
    try {
      const res = await recordsAPI.getRecords(patientId);
      setRecords(Array.isArray(res.data) ? res.data : (res.data?.records || []));
    } catch {
      toast.error('Erreur chargement dossier médical');
    } finally {
      setRecLoading(false);
    }
  }, []);

  const handleSelectPatient = (pid) => {
    if (pid === selectedPat) { setSelectedPat(null); return; }
    setSelectedPat(pid);
    setActiveTab('rdvs');
    setRecords([]);
  };

  const handleTabDossier = () => {
    if (selectedPat) navigate(`/doctor/patients/${selectedPat}/dossier`);
  };

  const handleSendMessage = async () => {
    if (!patDetails) return;
    setMsgLoading(true);
    try {
      const res = await messagesAPI.createConversationWithPatient(patDetails.id);
      const convId = res.data?.id;
      navigate('/doctor/messages', { state: { convId } });
    } catch (err) {
      toast.error('Impossible de démarrer la conversation');
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <DoctorNavbar active="patients" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Mes patients</h1>
            <p className="text-sm text-slate-500 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} au total</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-3.5 mb-6">
          {[
            { val: patients.length, label: 'Patients total', cls: 'border-t-primary-500 text-primary-600' },
            { val: appointments.filter(a => a.status === 'confirmed').length, label: 'RDV confirmés', cls: 'border-t-green-500 text-green-600' },
            { val: appointments.filter(a => ['pending','confirmed'].includes(a.status)).length, label: 'A venir', cls: 'border-t-amber-500 text-amber-600' },
          ].map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-3xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4 items-start">
          {/* Liste patients */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <SearchIcon />
                <input
                  className="flex-1 border-none outline-none text-[13px] bg-transparent text-slate-900 placeholder-slate-400"
                  placeholder="Rechercher par nom ou téléphone..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <UsersIcon />
                <p className="text-slate-600 font-semibold">Aucun patient trouvé</p>
                <p className="text-sm text-slate-400">Vos patients apparaîtront ici après leur premier rendez-vous</p>
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                {filtered.map(p => {
                  const isActive  = selectedPat === p.id;
                  const lastRdv   = p.rdvs.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];
                  const totalRdvs = p.rdvs.length;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      className={`flex items-center gap-3.5 px-4 py-3.5 border-b border-slate-100 cursor-pointer transition-colors ${
                        isActive ? 'bg-primary-50 border-l-[3px] border-l-primary-600' : 'hover:bg-slate-50 border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900">{p.firstName} {p.lastName}</div>
                        {p.phone && <div className="text-[11px] text-slate-400">{p.phone}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] font-semibold text-slate-500">{totalRdvs} RDV</span>
                        {lastRdv && (
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLS[lastRdv.status] || 'bg-slate-100 text-slate-600'}`}>
                            {STATUS_LBL[lastRdv.status] || lastRdv.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panneau détail */}
          <div className="sticky top-24">
            {patDetails ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
                {/* Header */}
                <div className="px-5 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {patDetails.firstName[0]}{patDetails.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-slate-900">{patDetails.firstName} {patDetails.lastName}</div>
                      {patDetails.phone && <div className="text-[12px] text-slate-500 mt-0.5">{patDetails.phone}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleSendMessage}
                      disabled={msgLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 text-white rounded-xl py-2 text-[12px] font-semibold cursor-pointer hover:bg-primary-700 transition-colors border-0 disabled:opacity-60"
                    >
                      {msgLoading ? 'Chargement...' : 'Envoyer un message'}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                  {[
                    { id: 'rdvs',    label: `RDV (${patDetails.rdvs.length})` },
                    { id: 'dossier', label: 'Dossier médical' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => t.id === 'dossier' ? handleTabDossier() : setActiveTab(t.id)}
                      className={`flex-1 py-3 text-[12px] font-bold border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${
                        activeTab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Contenu */}
                <div className="overflow-y-auto" style={{ maxHeight: '460px' }}>

                  {/* Tab RDV */}
                  {activeTab === 'rdvs' && (
                    <div className="px-5 py-4 space-y-2">
                      {patDetails.rdvs
                        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                        .map(rdv => (
                          <div key={rdv.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-900">{fmtDate(rdv.appointmentDate)}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{rdv.appointmentTime} · {rdv.motif || 'Sans motif'}</div>
                              {rdv.notes && <div className="text-[11px] text-slate-400 mt-0.5 italic">{rdv.notes}</div>}
                            </div>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${STATUS_CLS[rdv.status] || 'bg-slate-100 text-slate-600'}`}>
                              {STATUS_LBL[rdv.status] || rdv.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Tab Dossier médical */}
                  {activeTab === 'dossier' && (
                    <div className="px-5 py-4">
                      {recLoading ? (
                        <div className="flex justify-center py-10">
                          <div className="w-6 h-6 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                        </div>
                      ) : records.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="text-slate-400 text-sm font-medium">Aucun document dans le dossier</div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {records.map(r => (
                            <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-slate-900 truncate">{r.title}</div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">{fmtDate(r.createdAt)}</div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${RECORD_TYPE_CLR[r.recordType] || 'bg-slate-100 text-slate-600'}`}>
                                  {RECORD_TYPE_LBL[r.recordType] || r.recordType}
                                </span>
                              </div>
                              {r.description && <div className="text-[12px] text-slate-600 mb-1">{r.description}</div>}
                              {r.diagnosis && (
                                <div className="text-[11px] text-slate-500">
                                  <span className="font-semibold">Diagnostic :</span> {r.diagnosis}
                                </div>
                              )}
                              {r.prescription && (
                                <div className="text-[11px] text-slate-500 mt-1">
                                  <span className="font-semibold">Prescription :</span> {r.prescription}
                                </div>
                              )}
                              {r.filePath && (
                                <a
                                  href={r.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary-600 hover:underline"
                                >
                                  Voir le document
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col items-center justify-center py-16 gap-3">
                <UsersIcon size={36} />
                <p className="text-slate-500 font-semibold text-sm">Sélectionnez un patient</p>
                <p className="text-slate-400 text-[12px]">pour voir son dossier et historique</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
