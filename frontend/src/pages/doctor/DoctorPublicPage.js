import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MOIS  = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap');

.dp { font-family:'Nunito Sans',-apple-system,sans-serif; background:#f7f9fc; min-height:100vh; color:#0f172a; -webkit-font-smoothing:antialiased; }
.dp * { box-sizing:border-box; margin:0; padding:0; }

/* NAV */
.dp-nav { background:#fff; border-bottom:1px solid #e2e8f0; padding:0 5%; height:60px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; }
.dp-logo { font-size:20px; font-weight:800; color:#0f172a; cursor:pointer; }
.dp-logo em { font-style:normal; color:#062699; }
.dp-back { font-size:13px; color:#64748b; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:5px; }
.dp-back:hover { color:#0f172a; }

/* BODY */
.dp-body { max-width:1080px; margin:0 auto; padding:28px 20px; display:grid; grid-template-columns:1fr 360px; gap:20px; align-items:start; }

/* CARDS */
.dp-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; padding:24px; margin-bottom:14px; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
.dp-card:last-child { margin-bottom:0; }

/* HEADER MÉDECIN */
.dp-header { display:flex; gap:18px; align-items:flex-start; }
.dp-av { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#062699,#1e40af); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; color:#fff; flex-shrink:0; letter-spacing:-1px; }
.dp-name { font-size:20px; font-weight:800; color:#0f172a; margin-bottom:3px; letter-spacing:-0.3px; }
.dp-spec { font-size:14px; color:#062699; font-weight:700; margin-bottom:6px; }
.dp-meta { font-size:13px; color:#64748b; margin-bottom:8px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.dp-verified { display:inline-flex; align-items:center; gap:3px; font-size:11px; color:#059669; font-weight:700; background:#ecfdf5; padding:2px 7px; border-radius:20px; border:1px solid #6ee7b7; }
.dp-tags { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px; }
.dp-tag { font-size:11px; padding:3px 9px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:20px; color:#1d4ed8; font-weight:700; }
.dp-stars { display:flex; align-items:center; gap:5px; }
.dp-stars-ic { color:#f59e0b; font-size:13px; letter-spacing:1px; }
.dp-stars-val { font-size:13px; font-weight:700; color:#0f172a; }
.dp-stars-ct  { font-size:12px; color:#94a3b8; }

/* SECTION TITLE */
.dp-stitle { font-size:15px; font-weight:800; color:#0f172a; margin-bottom:12px; }
.dp-bio { font-size:13px; color:#475569; line-height:1.7; }

/* INFO GRID */
.dp-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.dp-info-item { background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:12px 14px; }
.dp-info-lbl { font-size:11px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:3px; }
.dp-info-val { font-size:13px; font-weight:700; color:#0f172a; }

/* REVIEWS */
.dp-review { padding:12px 0; border-bottom:1px solid #f1f5f9; }
.dp-review:last-child { border-bottom:none; }
.dp-review-author { font-size:13px; font-weight:700; color:#0f172a; margin-bottom:3px; }
.dp-review-text   { font-size:13px; color:#64748b; line-height:1.55; }
.dp-review-date   { font-size:11px; color:#cbd5e1; margin-top:4px; }

/* ══════════════════════════════════════════════
   RDV SIDEBAR — DESIGN REPENSÉ
═══════════════════════════════════════════════ */
.rdv-box { position:sticky; top:80px; }

.rdv-card { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06); }

/* Header prix */
.rdv-head { padding:18px 20px 14px; border-bottom:1px solid #f1f5f9; }
.rdv-label { font-size:12px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
.rdv-price { font-size:26px; font-weight:800; color:#0f172a; letter-spacing:-0.5px; }
.rdv-price span { font-size:14px; font-weight:400; color:#94a3b8; margin-left:4px; }

/* Navigation semaine */
.rdv-week { padding:14px 20px 10px; display:flex; align-items:center; justify-content:space-between; }
.rdv-week-btn { width:30px; height:30px; border-radius:8px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#062699; font-size:14px; font-weight:700; transition:all 0.12s; }
.rdv-week-btn:hover:not(:disabled) { background:#062699; color:#fff; border-color:#062699; }
.rdv-week-btn:disabled { opacity:0.35; cursor:not-allowed; }
.rdv-week-range { font-size:13px; font-weight:700; color:#0f172a; }

/* Sélecteur de JOURS — barre horizontale */
.rdv-days { display:flex; gap:6px; padding:0 20px 14px; overflow-x:auto; scrollbar-width:none; }
.rdv-days::-webkit-scrollbar { display:none; }

.rdv-day-btn {
  display:flex; flex-direction:column; align-items:center; gap:2px;
  min-width:46px; padding:8px 6px; border-radius:10px;
  border:1.5px solid #e2e8f0; background:#fff; cursor:pointer;
  transition:all 0.12s; flex-shrink:0;
}
.rdv-day-btn:hover:not(.empty):not(.active) { border-color:#062699; background:#eff6ff; }
.rdv-day-btn.active { border-color:#062699; background:#062699; }
.rdv-day-btn.empty { opacity:0.38; cursor:default; }
.rdv-day-name { font-size:10px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; }
.rdv-day-num  { font-size:16px; font-weight:800; color:#0f172a; line-height:1; }
.rdv-day-dot  { width:5px; height:5px; border-radius:50%; background:#22c55e; margin-top:2px; }
.rdv-day-btn.active .rdv-day-name { color:rgba(255,255,255,0.7); }
.rdv-day-btn.active .rdv-day-num  { color:#fff; }
.rdv-day-btn.active .rdv-day-dot  { background:#fff; }
.rdv-day-btn.empty .rdv-day-dot   { background:#e2e8f0; }

/* Créneaux du jour sélectionné */
.rdv-slots-wrap { padding:0 20px 16px; }
.rdv-slots-date { font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; }
.rdv-slots-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }

.rdv-slot {
  padding:9px 4px; border-radius:8px; border:1.5px solid #bfdbfe;
  background:#eff6ff; color:#1d4ed8; font-size:13px; font-weight:700;
  cursor:pointer; text-align:center; transition:all 0.12s;
  font-family:inherit;
}
.rdv-slot:hover   { background:#062699; color:#fff; border-color:#062699; }
.rdv-slot.sel     { background:#062699; color:#fff; border-color:#062699; box-shadow:0 2px 8px rgba(6,38,153,0.25); }

.rdv-no-slots { text-align:center; padding:20px 0; color:#94a3b8; font-size:13px; }
.rdv-no-slots-icon { font-size:24px; margin-bottom:6px; opacity:0.4; }

/* Bouton confirmer */
.rdv-cta-wrap { padding:0 20px 20px; }
.rdv-cta {
  width:100%; padding:13px; background:#062699; color:#fff; border:none;
  border-radius:10px; font-size:14px; font-weight:800; cursor:pointer;
  font-family:inherit; transition:background 0.15s;
}
.rdv-cta:hover:not(:disabled) { background:#041d7a; }
.rdv-cta:disabled { background:#cbd5e1; color:#94a3b8; cursor:not-allowed; }
.rdv-cta-hint { text-align:center; font-size:11px; color:#94a3b8; margin-top:8px; }

/* SUCCESS */
.rdv-success { padding:16px 20px; background:#ecfdf5; border-top:1px solid #6ee7b7; display:flex; align-items:center; gap:10px; }
.rdv-success-ic { font-size:20px; }
.rdv-success-txt { font-size:13px; font-weight:700; color:#059669; }

/* MODAL */
.mo-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); display:flex; align-items:center; justify-content:center; z-index:300; padding:16px; backdrop-filter:blur(4px); }
.mo { background:#fff; border-radius:16px; padding:28px; max-width:440px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
.mo-title { font-size:17px; font-weight:800; color:#0f172a; margin-bottom:20px; }
.mo-summary { background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:14px 16px; margin-bottom:18px; }
.mo-summary-doc { font-size:14px; font-weight:800; color:#1d4ed8; margin-bottom:2px; }
.mo-summary-slot { font-size:13px; color:#475569; }
.mo-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; display:block; }
.mo-input { width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; font-family:inherit; color:#0f172a; outline:none; transition:border-color 0.12s; margin-bottom:12px; }
.mo-input:focus { border-color:#062699; }
.mo-check { display:flex; align-items:center; gap:8px; margin-bottom:18px; cursor:pointer; font-size:13px; color:#475569; font-weight:600; }
.mo-check input { accent-color:#062699; width:15px; height:15px; }
.mo-actions { display:flex; gap:8px; }
.mo-cancel { flex:1; padding:11px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
.mo-submit { flex:2; padding:11px; background:#062699; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; transition:background 0.12s; }
.mo-submit:hover:not(:disabled) { background:#041d7a; }
.mo-submit:disabled { opacity:0.6; cursor:not-allowed; }

/* LOADING */
.dp-spin { width:28px; height:28px; border:2.5px solid #e2e8f0; border-top-color:#062699; border-radius:50%; animation:spin 0.65s linear infinite; margin:48px auto; }
@keyframes spin { to{transform:rotate(360deg)} }

@media(max-width:900px) {
  .dp-body { grid-template-columns:1fr; }
  .rdv-box { position:static; }
}
`;

export const DoctorPublicPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [doctor,      setDoctor]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);   // Date object
  const [selectedSlot,setSelectedSlot]= useState(null);   // { time, date }
  const [showModal,   setShowModal]   = useState(false);
  const [motif,       setMotif]       = useState('');
  const [firstVisit,  setFirstVisit]  = useState(false);
  const [booking,     setBooking]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  useEffect(() => {
    api.get(`/doctors/${id}`)
      .then(r => setDoctor(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Calcul des 7 jours de la semaine ── */
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + weekOffset * 7 + i);
      days.push(d);
    }
    return days;
  };

  /* ── Créneaux pour un jour donné ── */
  const getSlotsForDay = (date) => {
    if (!doctor?.availabilities) return [];
    const dow = date.getDay();
    const avail = doctor.availabilities.filter(a => a.dayOfWeek === dow && a.isAvailable);
    const slots = [];
    avail.forEach(a => {
      const [sh, sm] = a.startTime.split(':').map(Number);
      const [eh, em] = a.endTime.split(':').map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      const dur = a.slotDuration || 30;
      while (cur + dur <= end) {
        const hh = String(Math.floor(cur / 60)).padStart(2,'0');
        const mm = String(cur % 60).padStart(2,'0');
        slots.push(`${hh}:${mm}`);
        cur += dur;
      }
    });
    return slots;
  };

  /* ── Semaine avec disponibilité ── */
  const weekDays = getWeekDays();

  /* ── Sélection auto du premier jour dispo ── */
  useEffect(() => {
    if (!doctor) return;
    const first = weekDays.find(d => getSlotsForDay(d).length > 0);
    setSelectedDay(first || null);
    setSelectedSlot(null);
  }, [doctor, weekOffset]);

  /* ── Slots du jour sélectionné ── */
  const currentSlots = selectedDay ? getSlotsForDay(selectedDay) : [];

  /* ── Confirmation RDV ── */
  const confirmRdv = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setBooking(true);
    try {
      const dateStr = selectedSlot.date.toISOString().split('T')[0];
      await api.post('/appointments', {
        doctorId: doctor.id,
        appointmentDate: dateStr,
        appointmentTime: selectedSlot.time,
        motif, isFirstVisit: firstVisit,
      });
      setSuccess(true);
      setShowModal(false);
      setSelectedSlot(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de la réservation');
    } finally { setBooking(false); }
  };

  const initials = () =>
    `${doctor?.user?.firstName?.[0] || ''}${doctor?.user?.lastName?.[0] || ''}`.toUpperCase();

  const starsStr = (n) =>
    '★'.repeat(Math.round(Math.min(n || 0, 5))) + '☆'.repeat(5 - Math.round(Math.min(n || 0, 5)));

  const fmtDate = (d) =>
    `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;

  const fmtShort = (d) =>
    `${d.getDate()} ${MOIS[d.getMonth()]}`;

  if (loading) return (
    <div className="dp">
      <style>{css}</style>
      <nav className="dp-nav"><div className="dp-logo">Freya<em>.</em></div></nav>
      <div className="dp-spin" />
    </div>
  );

  if (!doctor) return (
    <div className="dp">
      <style>{css}</style>
      <nav className="dp-nav"><div className="dp-logo">Freya<em>.</em></div></nav>
      <div style={{ textAlign:'center', padding:'60px', color:'#64748b' }}>Médecin introuvable</div>
    </div>
  );

  const weekStart = weekDays[0];
  const weekEnd   = weekDays[6];

  return (
    <div className="dp">
      <style>{css}</style>

      <nav className="dp-nav">
        <div className="dp-logo" onClick={() => navigate('/')}>Freya<em>.</em></div>
        <div className="dp-back" onClick={() => navigate(-1)}>← Retour aux résultats</div>
      </nav>

      <div className="dp-body">
        {/* ── COLONNE GAUCHE ── */}
        <div>
          {/* Header médecin */}
          <div className="dp-card">
            <div className="dp-header">
              <div className="dp-av">{initials()}</div>
              <div style={{ flex: 1 }}>
                <div className="dp-name">Dr. {doctor.user?.firstName} {doctor.user?.lastName}</div>
                <div className="dp-spec">{doctor.specialite}</div>
                <div className="dp-meta">
                  📍 {doctor.city ? `${doctor.city}, ` : ''}{doctor.wilaya}
                  · {doctor.experienceYears || 0} ans d'expérience
                  {doctor.ordreVerified && <span className="dp-verified">✓ Vérifié</span>}
                </div>
                <div className="dp-tags">
                  {doctor.languages?.split(',').map(l => (
                    <span key={l} className="dp-tag">{l.trim()}</span>
                  ))}
                </div>
                {doctor.ratingCount > 0 && (
                  <div className="dp-stars">
                    <span className="dp-stars-ic">{starsStr(doctor.ratingAvg)}</span>
                    <span className="dp-stars-val">{Number(doctor.ratingAvg).toFixed(1)}</span>
                    <span className="dp-stars-ct">({doctor.ratingCount} avis)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* À propos */}
          {doctor.bio && (
            <div className="dp-card">
              <div className="dp-stitle">À propos</div>
              <p className="dp-bio">{doctor.bio}</p>
            </div>
          )}

          {/* Formation */}
          {doctor.education && (
            <div className="dp-card">
              <div className="dp-stitle">Formation & Diplômes</div>
              <p className="dp-bio">{doctor.education}</p>
            </div>
          )}

          {/* Infos pratiques */}
          <div className="dp-card">
            <div className="dp-stitle">Informations pratiques</div>
            <div className="dp-info-grid">
              {[
                ['📍 Adresse', doctor.cabinetAddress || doctor.wilaya],
                ['💰 Tarif', `${doctor.consultationPrice?.toLocaleString('fr-DZ') || '—'} DA`],
                ['🗣️ Langues', doctor.languages || '—'],
                ['🗺️ Wilaya', doctor.wilaya],
              ].map(([lbl, val]) => (
                <div key={lbl} className="dp-info-item">
                  <div className="dp-info-lbl">{lbl}</div>
                  <div className="dp-info-val">{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Avis */}
          {doctor.reviews?.length > 0 && (
            <div className="dp-card">
              <div className="dp-stitle">Avis patients ({doctor.reviews.length})</div>
              {doctor.reviews.slice(0, 5).map(r => (
                <div key={r.id} className="dp-review">
                  <div className="dp-review-author">
                    {r.isAnonymous ? 'Patient anonyme' : `${r.patient?.firstName || 'Patient'}`}
                    <span className="dp-stars-ic" style={{ marginLeft: 8, fontSize: 11 }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && <div className="dp-review-text">{r.comment}</div>}
                  <div className="dp-review-date">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── COLONNE DROITE — PRISE DE RDV ── */}
        <div className="rdv-box">
          <div className="rdv-card">

            {/* Prix */}
            <div className="rdv-head">
              <div className="rdv-label">Prendre rendez-vous</div>
              <div className="rdv-price">
                {doctor.consultationPrice?.toLocaleString('fr-DZ') || '—'} DA
                <span>/ consultation</span>
              </div>
            </div>

            {/* Navigation semaine */}
            <div className="rdv-week">
              <button className="rdv-week-btn" disabled={weekOffset === 0} onClick={() => setWeekOffset(w => w - 1)}>‹</button>
              <span className="rdv-week-range">
                {fmtShort(weekStart)} – {fmtShort(weekEnd)}
              </span>
              <button className="rdv-week-btn" onClick={() => setWeekOffset(w => w + 1)}>›</button>
            </div>

            {/* Sélecteur de jours */}
            <div className="rdv-days">
              {weekDays.map((day, i) => {
                const slots   = getSlotsForDay(day);
                const hasDispo = slots.length > 0;
                const isActive = selectedDay && day.toDateString() === selectedDay.toDateString();
                return (
                  <button
                    key={i}
                    className={`rdv-day-btn${isActive ? ' active' : ''}${!hasDispo ? ' empty' : ''}`}
                    onClick={() => { if (!hasDispo) return; setSelectedDay(day); setSelectedSlot(null); }}
                  >
                    <span className="rdv-day-name">{JOURS[day.getDay()]}</span>
                    <span className="rdv-day-num">{day.getDate()}</span>
                    <span className="rdv-day-dot" />
                  </button>
                );
              })}
            </div>

            {/* Créneaux du jour sélectionné UNIQUEMENT */}
            <div className="rdv-slots-wrap">
              {!selectedDay ? (
                <div className="rdv-no-slots">
                  <div className="rdv-no-slots-icon">📅</div>
                  Aucune disponibilité cette semaine
                </div>
              ) : (
                <>
                  <div className="rdv-slots-date">{fmtDate(selectedDay)}</div>
                  {currentSlots.length === 0 ? (
                    <div className="rdv-no-slots">Pas de créneau ce jour</div>
                  ) : (
                    <div className="rdv-slots-grid">
                      {currentSlots.map((time) => (
                        <button
                          key={time}
                          className={`rdv-slot${selectedSlot?.time === time && selectedSlot?.date?.toDateString() === selectedDay.toDateString() ? ' sel' : ''}`}
                          onClick={() => setSelectedSlot({ time, date: selectedDay })}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CTA */}
            <div className="rdv-cta-wrap">
              <button
                className="rdv-cta"
                disabled={!selectedSlot}
                onClick={() => {
                  if (!isAuthenticated) navigate('/login');
                  else setShowModal(true);
                }}
              >
                {selectedSlot
                  ? `Confirmer – ${fmtDate(selectedSlot.date)} à ${selectedSlot.time}`
                  : 'Sélectionnez un créneau'}
              </button>
              {!isAuthenticated && (
                <div className="rdv-cta-hint">Connexion requise pour réserver</div>
              )}
            </div>

            {/* Succès */}
            {success && (
              <div className="rdv-success">
                <span className="rdv-success-ic">✅</span>
                <div>
                  <div className="rdv-success-txt">Rendez-vous confirmé !</div>
                  <div style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>Vous recevrez une confirmation.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL CONFIRMATION ── */}
      {showModal && (
        <div className="mo-overlay" onClick={() => setShowModal(false)}>
          <div className="mo" onClick={e => e.stopPropagation()}>
            <div className="mo-title">Confirmer le rendez-vous</div>

            <div className="mo-summary">
              <div className="mo-summary-doc">
                Dr. {doctor.user?.firstName} {doctor.user?.lastName} — {doctor.specialite}
              </div>
              <div className="mo-summary-slot">
                📅 {fmtDate(selectedSlot?.date)} à {selectedSlot?.time}
                &nbsp;·&nbsp; 💰 {doctor.consultationPrice?.toLocaleString('fr-DZ')} DA
              </div>
            </div>

            <div>
              <label className="mo-label">Motif de consultation</label>
              <input className="mo-input" placeholder="Ex: Douleur abdominale, bilan annuel..."
                value={motif} onChange={e => setMotif(e.target.value)} />
            </div>

            <label className="mo-check">
              <input type="checkbox" checked={firstVisit} onChange={e => setFirstVisit(e.target.checked)} />
              Première consultation avec ce médecin
            </label>

            <div className="mo-actions">
              <button className="mo-cancel" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="mo-submit" onClick={confirmRdv} disabled={booking}>
                {booking ? 'Réservation...' : 'Confirmer le RDV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPublicPage;