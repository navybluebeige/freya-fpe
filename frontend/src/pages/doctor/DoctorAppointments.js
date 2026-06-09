import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI, recordsAPI } from '../../services/api';
import DoctorNavbar from '../../components/DoctorNavbar';

const STATUS_MAP = {
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-400'  },
  confirmed: { label: 'Confirmé',   cls: 'bg-green-100 text-green-800',  dot: 'bg-green-400'  },
  completed: { label: 'Terminé',    cls: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400'   },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',      dot: 'bg-red-400'    },
  no_show:   { label: 'Absent',     cls: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400'  },
};

const CalendarIcon = ({ size = 16, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = ({ size = 16, color = '#F59E0B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const InboxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

const TABS = [
  { id: 'all',       label: 'Tous' },
  { id: 'pending',   label: 'En attente' },
  { id: 'confirmed', label: 'Confirmés' },
  { id: 'completed', label: 'Terminés' },
  { id: 'cancelled', label: 'Annulés' },
];

const ACTION_BTNS = {
  pending:   [
    { label: 'Confirmer', status: 'confirmed', cls: 'bg-green-500 hover:bg-green-600 text-white border-0' },
    { label: 'Annuler',   status: 'cancelled', cls: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' },
  ],
  confirmed: [
    { label: 'Terminer', status: 'completed', cls: 'bg-blue-500 hover:bg-blue-600 text-white border-0' },
    { label: 'Annuler',  status: 'cancelled', cls: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' },
  ],
};

const EMPTY_ORDONNANCE = { title: '', diagnosis: '', description: '', prescription: '', recordType: 'ordonnance' };

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('all');
  const [updating,     setUpdating]     = useState(null);
  const [ordModal,     setOrdModal]     = useState(null); // appointment object
  const [ordForm,      setOrdForm]      = useState(EMPTY_ORDONNANCE);
  const [ordSaving,    setOrdSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getMyAppointments({ limit: 200 });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openOrdModal = (appt) => {
    setOrdModal(appt);
    setOrdForm({ ...EMPTY_ORDONNANCE, title: `Consultation du ${new Date(appt.appointmentDate).toLocaleDateString('fr-FR')}` });
  };

  const saveOrdonnance = async () => {
    if (!ordForm.title.trim()) { toast.error('Titre requis'); return; }
    setOrdSaving(true);
    try {
      await recordsAPI.addRecord({
        patientId:     ordModal.patientId,
        appointmentId: ordModal.id,
        recordType:    ordForm.recordType,
        title:         ordForm.title,
        description:   ordForm.description,
        diagnosis:     ordForm.diagnosis,
        prescription:  ordForm.prescription,
      });
      toast.success('Document ajouté au dossier du patient');
      setOrdModal(null);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setOrdSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await appointmentsAPI.updateStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Rendez-vous ${STATUS_MAP[status]?.label.toLowerCase()}`);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const stats = [
    { val: counts.all,       label: 'Total',      cls: 'border-t-slate-400  text-slate-700'   },
    { val: counts.pending,   label: 'En attente', cls: 'border-t-amber-500  text-amber-700'   },
    { val: counts.confirmed, label: 'Confirmés',  cls: 'border-t-green-500  text-green-700'   },
    { val: counts.completed, label: 'Terminés',   cls: 'border-t-primary-500 text-primary-700' },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <DoctorNavbar active="appointments" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Rendez-vous</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez tous les rendez-vous de votre agenda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3.5 mb-6">
          {stats.map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-3xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1.5 mb-5 w-fit overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border-0 font-sans ${
                tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-primary-600'
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>{counts[t.id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col items-center py-16 gap-3">
            <InboxIcon />
            <p className="text-slate-600 font-semibold">Aucun rendez-vous</p>
            <p className="text-sm text-slate-400">Les rendez-vous apparaîtront ici</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['Patient', 'Date', 'Heure', 'Motif', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const st = STATUS_MAP[a.status] || STATUS_MAP.pending;
                    const actions = ACTION_BTNS[a.status] || [];
                    return (
                      <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-[11px] font-bold text-primary-600 shrink-0">
                              {a.patient?.firstName?.[0]}{a.patient?.lastName?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{a.patient?.firstName} {a.patient?.lastName}</div>
                              {a.patient?.phone && <div className="text-[11px] text-slate-400">{a.patient.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">{fmtDate(a.appointmentDate)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">{a.appointmentTime}</td>
                        <td className="px-4 py-4 text-sm text-slate-500 max-w-[160px] truncate">{a.motif || '—'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {actions.map(btn => (
                              <button
                                key={btn.status}
                                onClick={() => handleStatus(a.id, btn.status)}
                                disabled={updating === a.id}
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer font-sans transition-colors disabled:opacity-50 ${btn.cls}`}
                              >
                                {updating === a.id ? '...' : btn.label}
                              </button>
                            ))}
                            {(a.status === 'confirmed' || a.status === 'completed') && (
                              <button
                                onClick={() => openOrdModal(a)}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer font-sans bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition-colors whitespace-nowrap"
                              >
                                Ordonnance
                              </button>
                            )}
                            {a.isFirstVisit && (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 whitespace-nowrap">
                                1re visite
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Ordonnance / Consultation ── */}
      {ordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setOrdModal(null)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Ajouter au dossier patient</h2>
            <p className="text-sm text-slate-500 mb-5">
              Patient : <strong>{ordModal.patient?.firstName} {ordModal.patient?.lastName}</strong>
            </p>

            {/* Type de document */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Type de document</label>
              <div className="flex gap-2">
                {[
                  { id: 'ordonnance',   label: 'Ordonnance'    },
                  { id: 'consultation', label: 'Consultation'  },
                  { id: 'autre',        label: 'Autre'         },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setOrdForm(f => ({ ...f, recordType: t.id }))}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border font-sans transition-colors ${
                      ordForm.recordType === t.id
                        ? 'bg-primary-600 text-white border-0'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Titre *',         field: 'title',        type: 'input',    placeholder: 'Ex: Consultation du 04/06/2026' },
              { label: 'Diagnostic',      field: 'diagnosis',    type: 'textarea', placeholder: 'Ex: Hypertension artérielle légère...' },
              { label: 'Description',     field: 'description',  type: 'textarea', placeholder: 'Notes cliniques, observations...' },
              { label: 'Ordonnance / Traitement', field: 'prescription', type: 'textarea', placeholder: 'Ex: Amlodipine 5mg — 1 cp/j pendant 30j\nBisoprolol 2.5mg...' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} className="mb-3.5">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                {type === 'input' ? (
                  <input
                    type="text"
                    value={ordForm[field]}
                    onChange={e => setOrdForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors bg-slate-50"
                  />
                ) : (
                  <textarea
                    rows={3}
                    value={ordForm[field]}
                    onChange={e => setOrdForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors bg-slate-50 resize-none"
                  />
                )}
              </div>
            ))}

            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setOrdModal(null)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                Annuler
              </button>
              <button onClick={saveOrdonnance} disabled={ordSaving} className="bg-primary-600 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer font-sans hover:bg-primary-700 transition-colors disabled:opacity-50">
                {ordSaving ? 'Enregistrement...' : 'Enregistrer dans le dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
