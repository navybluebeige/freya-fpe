import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { laboAPI } from '../../services/api';
import LabNavbar from '../../components/LabNavbar';

const STATUS_MAP = {
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-800',  dot: 'bg-amber-400'  },
  confirmed: { label: 'Confirmé',   cls: 'bg-green-100 text-green-800',  dot: 'bg-green-400'  },
  completed: { label: 'Terminé',    cls: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400'   },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-700',      dot: 'bg-red-400'    },
};

const ANALYSES_TYPES = [
  'Numération Formule Sanguine (NFS)',
  'Glycémie à jeun',
  'Bilan lipidique complet',
  'Créatinine + Urée',
  'Transaminases (ASAT/ALAT)',
  'TSH ultra-sensible',
  'VIH 1+2 (Ag/Ac)',
  'Hépatite B (AgHBs)',
  'H. pylori (sérologie)',
  'ECBU',
  'Coproculture',
  'Groupe sanguin + Rhésus',
];

const EMPTY_RESULT = { title: '', description: '', diagnosis: '', imageFile: null, imageUrl: '' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LabAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(null);
  const [resultModal,  setResultModal]  = useState(null);
  const [resultForm,   setResultForm]   = useState(EMPTY_RESULT);
  const [resultSaving, setResultSaving] = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const fileInputRef = useRef(null);
  const [tab,          setTab]          = useState('all');

  const load = useCallback(async () => {
    try {
      const res = await laboAPI.getAppointments();
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      await laboAPI.updateApptStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Rendez-vous ${STATUS_MAP[status]?.label.toLowerCase()}`);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(null);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await laboAPI.uploadFile(file);
      setResultForm(f => ({ ...f, imageUrl: res.data.url, imageFile: file }));
      toast.success('Image chargée');
    } catch {
      toast.error("Erreur upload — vérifiez vos identifiants Cloudinary");
    } finally {
      setUploading(false);
    }
  };

  const sendResults = async () => {
    if (!resultForm.title.trim()) { toast.error('Titre requis'); return; }
    if (!resultModal) return;
    setResultSaving(true);
    try {
      await laboAPI.sendResults({
        patientId:     resultModal.patientId,
        appointmentId: resultModal.id,
        title:         resultForm.title,
        description:   resultForm.description,
        diagnosis:     resultForm.diagnosis,
        filePath:      resultForm.imageUrl || undefined,
      });
      toast.success('Résultats envoyés au patient');
      setResultModal(null);
      setResultForm(EMPTY_RESULT);
      await handleStatus(resultModal.id, 'completed');
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setResultSaving(false);
    }
  };

  const filtered = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  const counts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <LabNavbar active="appointments" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Rendez-vous</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez les demandes d'analyses de vos patients</p>
          </div>
          <button onClick={load} className="text-sm text-primary-600 border border-primary-200 bg-white rounded-xl px-3 md:px-4 py-2 font-semibold cursor-pointer hover:bg-primary-50 transition-colors">
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3.5 mb-6">
          {[
            { val: counts.all,       label: 'Total',      cls: 'border-t-slate-400   text-slate-700'    },
            { val: counts.pending,   label: 'En attente', cls: 'border-t-amber-500   text-amber-700'    },
            { val: counts.confirmed, label: 'Confirmés',  cls: 'border-t-green-500   text-green-700'    },
            { val: counts.completed, label: 'Terminés',   cls: 'border-t-primary-500 text-primary-700'  },
          ].map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-3xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1.5 mb-5 w-fit">
          {[
            { id: 'all',       label: 'Tous'      },
            { id: 'pending',   label: 'En attente' },
            { id: 'confirmed', label: 'Confirmés'  },
            { id: 'completed', label: 'Terminés'   },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 font-sans ${
                tab === t.id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-primary-600'
              }`}
            >
              {t.label}
              {counts[t.id] > 0 && (
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts[t.id]}
                </span>
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
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
            <p className="text-slate-600 font-semibold">Aucun rendez-vous</p>
            <p className="text-sm text-slate-400">Les demandes d'analyses apparaîtront ici</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Patient', 'Date', 'Heure', 'Motif', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const st = STATUS_MAP[a.status] || STATUS_MAP.pending;
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
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">{a.appointmentTime}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 max-w-[160px] truncate">{a.motif || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {a.status === 'pending' && (
                            <button onClick={() => handleStatus(a.id, 'confirmed')} disabled={updating === a.id} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer bg-green-500 hover:bg-green-600 text-white border-0 transition-colors disabled:opacity-50">
                              {updating === a.id ? '...' : 'Confirmer'}
                            </button>
                          )}
                          {(a.status === 'confirmed' || a.status === 'pending') && (
                            <>
                              <button
                                onClick={() => { setResultModal(a); setResultForm(EMPTY_RESULT); }}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer bg-primary-600 hover:bg-primary-700 text-white border-0 transition-colors whitespace-nowrap"
                              >
                                Envoyer résultats
                              </button>
                              <button onClick={() => handleStatus(a.id, 'cancelled')} disabled={updating === a.id} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors">
                                Annuler
                              </button>
                            </>
                          )}
                          {a.status === 'completed' && (
                            <span className="text-[11px] text-slate-400 font-semibold">Résultats envoyés</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Envoyer résultats */}
      {resultModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setResultModal(null)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Envoyer les résultats d'analyses</h2>
            <p className="text-sm text-slate-500 mb-5">
              Patient : <strong>{resultModal.patient?.firstName} {resultModal.patient?.lastName}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Type d'analyse *</label>
              <select
                value={resultForm.title}
                onChange={e => setResultForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 bg-slate-50"
              >
                <option value="">Sélectionner...</option>
                {ANALYSES_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                <option value="Bilan complet">Bilan complet</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Résultats / Valeurs</label>
              <textarea
                rows={4}
                value={resultForm.description}
                onChange={e => setResultForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Glycémie: 0,95 g/L (N)\nHémoglobine: 14,2 g/dL (N)\nCholestérol total: 1,85 g/L (N)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 bg-slate-50 resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Interprétation / Conclusion</label>
              <textarea
                rows={2}
                value={resultForm.diagnosis}
                onChange={e => setResultForm(f => ({ ...f, diagnosis: e.target.value }))}
                placeholder="Ex: Bilan biologique normal. Pas d'anomalie détectée..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 bg-slate-50 resize-none"
              />
            </div>

            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Document / Image (optionnel)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf" className="hidden" />
              {resultForm.imageUrl ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  {resultForm.imageFile?.type?.startsWith('image/') ? (
                    <img src={resultForm.imageUrl} alt="Résultat" className="w-16 h-16 rounded-lg object-cover border border-green-200" />
                  ) : (
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-xs">PDF</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-green-800 truncate">{resultForm.imageFile?.name || 'Fichier chargé'}</div>
                    <div className="text-[11px] text-green-600">Prêt à être envoyé</div>
                  </div>
                  <button onClick={() => setResultForm(f => ({ ...f, imageUrl: '', imageFile: null }))} className="text-red-400 hover:text-red-600 text-lg font-bold bg-transparent border-0 cursor-pointer">×</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-slate-300 rounded-xl py-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors bg-transparent"
                >
                  <div className="text-sm font-semibold text-slate-500">
                    {uploading ? 'Chargement en cours...' : 'Cliquez pour ajouter une image ou un PDF'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">JPG, PNG, PDF · max 10 Mo</div>
                </button>
              )}
            </div>

            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setResultModal(null)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100">
                Annuler
              </button>
              <button onClick={sendResults} disabled={resultSaving || !resultForm.title} className="bg-primary-600 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer font-sans hover:bg-primary-700 transition-colors disabled:opacity-50">
                {resultSaving ? 'Envoi...' : 'Envoyer au patient'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
