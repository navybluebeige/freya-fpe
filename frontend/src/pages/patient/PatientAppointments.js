import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentsAPI, reviewsAPI, messagesAPI } from '../../services/api';
import PatientNavbar from '../../components/PatientNavbar';

const STATUS_MAP = {
  confirmed: { label: 'Confirmé',   cls: 'bg-green-100 text-green-800'  },
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-800'  },
  completed: { label: 'Terminé',    cls: 'bg-slate-100 text-slate-600'  },
  cancelled: { label: 'Annulé',     cls: 'bg-red-100 text-red-800'      },
  no_show:   { label: 'Absent',     cls: 'bg-red-100 text-red-700'      },
};

const CalendarIcon = ({ size = 13, color = '#64748B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = ({ size = 13, color = '#64748B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const MapIcon = ({ size = 13, color = '#64748B' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const InboxIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);
const SpinnerIcon = () => (
  <div className="w-7 h-7 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
);

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateShort(d) {
  if (!d) return { day: '—', month: '—' };
  const dt = new Date(d);
  return {
    day:   dt.getDate(),
    month: dt.toLocaleDateString('fr-FR', { month: 'short' }),
  };
}

const EMPTY_REVIEW = { rating: 0, comment: '', isAnonymous: false };

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]       = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cancelling, setCancelling]     = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [reviewModal,     setReviewModal]     = useState(null); // appointment
  const [reviewForm,      setReviewForm]      = useState(EMPTY_REVIEW);
  const [reviewSaving,    setReviewSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentsAPI.getMyAppointments({ limit: 100 });
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Erreur de chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past     = appointments.filter(a => ['completed', 'cancelled', 'no_show'].includes(a.status));
  const list     = activeTab === 'upcoming' ? upcoming : past;

  const handleContactDoctor = async (doctorId) => {
    try {
      const res = await messagesAPI.createConversation(doctorId);
      const convId = res.data?.id;
      navigate('/patient/messages', { state: { convId } });
    } catch {
      navigate('/patient/messages');
    }
    setShowDetailModal(null);
  };

  const submitReview = async () => {
    if (reviewForm.rating === 0) { toast.error('Choisissez une note'); return; }
    setReviewSaving(true);
    try {
      const appt = reviewModal;
      await reviewsAPI.addReview({
        doctorId:     appt.appointmentType === 'lab' ? null : appt.doctorId,
        clinicId:     appt.appointmentType === 'lab' ? appt.clinicId : null,
        appointmentId: appt.id,
        rating:       reviewForm.rating,
        comment:      reviewForm.comment,
        isAnonymous:  reviewForm.isAnonymous,
      });
      toast.success('Avis publié. Merci !');
      setReviewModal(null);
      setReviewForm(EMPTY_REVIEW);
      // Marquer localement comme noté
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, _reviewed: true } : a));
    } catch (e) {
      toast.error(e.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setReviewSaving(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await appointmentsAPI.updateStatus(id, 'cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setShowCancelModal(null);
      toast.success('Rendez-vous annulé');
    } catch {
      toast.error("Erreur lors de l'annulation");
    } finally {
      setCancelling(null);
    }
  };

  const stats = [
    { val: upcoming.length,                                          label: 'À venir',    cls: 'border-t-primary-600 text-primary-600' },
    { val: upcoming.filter(a => a.status === 'confirmed').length,    label: 'Confirmés',  cls: 'border-t-green-500  text-green-600'  },
    { val: upcoming.filter(a => a.status === 'pending').length,      label: 'En attente', cls: 'border-t-amber-500  text-amber-600'  },
    { val: past.length,                                              label: 'Passés',     cls: 'border-t-slate-400  text-slate-600'  },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <PatientNavbar active="rdv" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Mes Rendez-vous</h1>
            <p className="text-sm text-slate-500">Gérez tous vos rendez-vous médicaux</p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="bg-primary-600 text-white border-0 rounded-xl px-3 md:px-4 py-2 md:py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors"
          >
            + Nouveau RDV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-3.5 mb-5">
          {stats.map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-3xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 mb-4 w-fit">
          {[
            { id: 'upcoming', label: `À venir (${upcoming.length})` },
            { id: 'past',     label: `Passés (${past.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 font-sans ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-primary-600'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><SpinnerIcon /></div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <InboxIcon />
            <p className="text-slate-600 font-semibold">Aucun rendez-vous</p>
            <p className="text-sm text-slate-400">
              {activeTab === 'upcoming' ? 'Prenez un rendez-vous avec un médecin' : 'Vos rendez-vous passés apparaîtront ici'}
            </p>
            {activeTab === 'upcoming' && (
              <button onClick={() => navigate('/doctors')} className="bg-primary-600 text-white border-0 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors mt-1">
                Trouver un médecin
              </button>
            )}
          </div>
        ) : (
          <div>
            {list.map(appt => {
              const { day, month } = fmtDateShort(appt.appointmentDate);
              const st = STATUS_MAP[appt.status] || STATUS_MAP.pending;
              const isLab = appt.appointmentType === 'lab' || (!appt.doctor && appt.clinic);

              // Nom affiché
              const displayName = isLab
                ? (appt.clinic?.name || 'Laboratoire')
                : (`Dr. ${appt.doctor?.user?.firstName || ''} ${appt.doctor?.user?.lastName || ''}`.trim() || 'Médecin');

              // Sous-titre (spécialité ou type)
              const displaySub = isLab
                ? `Analyses médicales · ${appt.clinic?.wilaya || ''}`
                : (appt.doctor?.specialite || '');

              // Adresse
              const address = isLab
                ? (appt.clinic?.address || appt.clinic?.wilaya || '—')
                : (appt.doctor?.cabinetAddress || appt.doctor?.wilaya || '—');

              // Initiales
              const initials = isLab
                ? (appt.clinic?.name?.slice(0, 2)?.toUpperCase() || 'LA')
                : `${appt.doctor?.user?.firstName?.[0] || 'D'}${appt.doctor?.user?.lastName?.[0] || 'r'}`;

              // Couleur de l'avatar
              const avatarCls = isLab
                ? 'bg-green-50 text-green-600'
                : 'bg-primary-50 text-primary-600';

              return (
                <div
                  key={appt.id}
                  className={`flex items-center gap-3.5 rounded-2xl p-5 mb-2.5 border transition-all hover:shadow-card ${
                    appt.status === 'cancelled' ? 'bg-red-50/30 border-red-200' : 'bg-white border-slate-200'
                  }`}
                >
                  {/* Date */}
                  <div className="bg-primary-50 rounded-xl px-3.5 py-2.5 text-center min-w-[60px] shrink-0">
                    <div className="text-xl font-extrabold text-primary-600 tracking-tighter">{day}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">{month}</div>
                  </div>
                  <div className="w-px h-12 bg-slate-200 shrink-0" />
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}>
                    {isLab ? '🔬' : initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[15px] font-bold text-slate-900">{displayName}</div>
                      {isLab && <span className="text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Labo</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 mb-2">{displaySub}</div>
                    <div className="flex gap-2 flex-wrap items-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        <ClockIcon />{appt.appointmentTime}
                      </span>
                      {address && address !== '—' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                          <MapIcon />{address}
                        </span>
                      )}
                      {appt.motif && (
                        <span className="text-[11px] bg-primary-50 text-primary-700 border border-primary-200 px-2 py-0.5 rounded-md">{appt.motif}</span>
                      )}
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    {appt.status === 'completed' && (
                      <div className="flex gap-2">
                        {!appt._reviewed && (
                          <button
                            onClick={() => { setReviewModal(appt); setReviewForm(EMPTY_REVIEW); }}
                            className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-amber-100 transition-colors"
                          >
                            Donner mon avis
                          </button>
                        )}
                        <button onClick={() => navigate('/doctors')} className="bg-primary-600 text-white border-0 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors">
                          Reprendre RDV
                        </button>
                      </div>
                    )}
                    {(appt.status === 'confirmed' || appt.status === 'pending') && (
                      <>
                        <button onClick={() => setShowDetailModal(appt)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                          Détails
                        </button>
                        <button onClick={() => setShowCancelModal(appt.id)} className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-red-100 transition-colors">
                          Annuler
                        </button>
                      </>
                    )}
                    {appt.status === 'cancelled' && (
                      <button onClick={() => navigate('/doctors')} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                        Reprendre
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Confirmer annulation */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-4"><AlertIcon /></div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Annuler ce rendez-vous ?</h2>
            <p className="text-sm text-slate-500 mb-6">Cette action est irréversible. Le médecin sera notifié de l'annulation.</p>
            <div className="flex gap-2.5 justify-center">
              <button onClick={() => setShowCancelModal(null)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                Non, garder
              </button>
              <button
                onClick={() => handleCancel(showCancelModal)}
                disabled={!!cancelling}
                className="bg-red-500 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Annulation...' : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Détails */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(null)}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-5">Détails du rendez-vous</h2>
            {/* Header médecin ou labo */}
            {showDetailModal.appointmentType === 'lab' ? (
              <div className="flex items-center gap-3.5 mb-5 bg-green-50 rounded-xl p-3.5">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl shrink-0">🔬</div>
                <div>
                  <div className="text-[15px] font-bold text-slate-900">{showDetailModal.clinic?.name || 'Laboratoire'}</div>
                  <div className="text-xs text-green-600 font-semibold">Analyses médicales</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 mb-5 bg-slate-50 rounded-xl p-3.5">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {showDetailModal.doctor?.user?.firstName?.[0]}{showDetailModal.doctor?.user?.lastName?.[0]}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-slate-900">
                    Dr. {showDetailModal.doctor?.user?.firstName} {showDetailModal.doctor?.user?.lastName}
                  </div>
                  <div className="text-xs text-slate-500">{showDetailModal.doctor?.specialite}</div>
                </div>
              </div>
            )}
            {[
              { label: 'Date',    val: fmtDate(showDetailModal.appointmentDate) },
              { label: 'Heure',   val: showDetailModal.appointmentTime },
              { label: 'Adresse', val: showDetailModal.appointmentType === 'lab'
                ? (showDetailModal.clinic?.address || showDetailModal.clinic?.wilaya || '—')
                : (showDetailModal.doctor?.cabinetAddress || showDetailModal.doctor?.wilaya || '—') },
              { label: 'Motif',   val: showDetailModal.motif || '—' },
              { label: 'Statut',  val: STATUS_MAP[showDetailModal.status]?.label },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2.5 border-b border-slate-100 text-sm">
                <span className="text-slate-400 font-semibold">{row.label}</span>
                <span className="text-slate-900 font-medium">{row.val}</span>
              </div>
            ))}
            <div className="flex gap-2.5 justify-end mt-5">
              <button onClick={() => setShowDetailModal(null)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                Fermer
              </button>
              {showDetailModal.appointmentType !== 'lab' && showDetailModal.doctor?.id && (
                <button
                  onClick={() => handleContactDoctor(showDetailModal.doctor.id)}
                  className="bg-primary-600 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors"
                >
                  Contacter le médecin
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Donner un avis */}
      {reviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Donner mon avis</h2>
            <p className="text-sm text-slate-500 mb-5">
              {reviewModal.appointmentType === 'lab'
                ? reviewModal.clinic?.name
                : `Dr. ${reviewModal.doctor?.user?.firstName} ${reviewModal.doctor?.user?.lastName} — ${reviewModal.doctor?.specialite}`}
            </p>

            {/* Étoiles */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Note *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                    className={`text-3xl transition-all cursor-pointer bg-transparent border-0 p-0 leading-none ${
                      star <= reviewForm.rating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                    style={{ filter: star <= reviewForm.rating ? 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' : 'none' }}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-400 self-center">
                  {['', 'Très insatisfait', 'Insatisfait', 'Correct', 'Bien', 'Excellent'][reviewForm.rating]}
                </span>
              </div>
            </div>

            {/* Commentaire */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Commentaire (optionnel)</label>
              <textarea
                rows={3}
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Partagez votre expérience..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none font-sans focus:border-primary-400 transition-colors bg-slate-50 resize-none"
              />
            </div>

            {/* Anonyme */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 mb-5">
              <input
                type="checkbox"
                checked={reviewForm.isAnonymous}
                onChange={e => setReviewForm(f => ({ ...f, isAnonymous: e.target.checked }))}
                className="accent-primary-600 w-4 h-4"
              />
              Publier de façon anonyme
            </label>

            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setReviewModal(null)} className="bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-slate-100 transition-colors">
                Annuler
              </button>
              <button onClick={submitReview} disabled={reviewSaving || reviewForm.rating === 0} className="bg-amber-500 hover:bg-amber-600 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50">
                {reviewSaving ? 'Publication...' : 'Publier mon avis'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
