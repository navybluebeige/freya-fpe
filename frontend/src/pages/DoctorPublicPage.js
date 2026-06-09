import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

const JOURS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const MOIS  = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

/* ─── CSS identique à la HomePage ─────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

.dp { font-family:'DM Sans',-apple-system,sans-serif; background:#F8FAFC; min-height:100vh; color:#0F172A; -webkit-font-smoothing:antialiased; }
.dp * { box-sizing:border-box; margin:0; padding:0; }

/* ── NAV (même que HomePage) ── */
.dp-nav {
  background:rgba(255,255,255,0.97); border-bottom:1px solid #E2E8F0;
  position:sticky; top:0; z-index:100; backdrop-filter:blur(12px); padding:0 40px;
}
.dp-nav-in { max-width:1200px; margin:0 auto; height:64px; display:flex; align-items:center; justify-content:space-between; }
.dp-logo { font-size:24px; font-weight:800; color:#0F172A; text-decoration:none; letter-spacing:-0.5px; }
.dp-logo span { color:#2563EB; }
.dp-back { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:13px; font-weight:600; color:#64748B; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.dp-back:hover { color:#2563EB; border-color:#2563EB; background:#EFF6FF; }

/* ── HERO (même gradient que HomePage) ── */
.dp-hero {
  background:linear-gradient(160deg, #1D4ED8 0%, #2563EB 45%, #60A5FA 100%);
  padding:48px 40px; position:relative; overflow:hidden;
}
.dp-hero::before { content:''; position:absolute; top:-80px; right:-80px; width:350px; height:350px; border-radius:50%; background:rgba(255,255,255,0.07); }
.dp-hero::after  { content:''; position:absolute; bottom:-60px; left:20%; width:300px; height:200px; border-radius:50%; background:rgba(255,255,255,0.04); }
.dp-hero-in { max-width:1200px; margin:0 auto; position:relative; z-index:1; display:flex; align-items:center; gap:24px; }
.dp-hero-av {
  width:90px; height:90px; border-radius:50%; flex-shrink:0;
  background:rgba(255,255,255,0.2); border:3px solid rgba(255,255,255,0.35);
  display:flex; align-items:center; justify-content:center;
  font-size:28px; font-weight:800; color:#fff; letter-spacing:-1px;
}
.dp-hero-name { font-size:28px; font-weight:800; color:#fff; margin-bottom:6px; letter-spacing:-0.5px; }
.dp-hero-spec { font-size:16px; color:rgba(255,255,255,0.9); font-weight:600; margin-bottom:10px; }
.dp-hero-meta { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.dp-hero-info { display:flex; align-items:center; gap:5px; font-size:13px; color:rgba(255,255,255,0.85); font-weight:500; }
.dp-hero-sep { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,0.4); }
.dp-hero-verified { background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3); color:#fff; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; }
.dp-hero-tag { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:#fff; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:600; }

/* ── BODY ── */
.dp-body { max-width:1200px; margin:0 auto; padding:32px 40px; display:grid; grid-template-columns:1fr 360px; gap:24px; align-items:start; }

/* ── CARDS (même style que HomePage featureCard) ── */
.dp-card { background:#fff; border:1px solid #E2E8F0; border-radius:16px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); }
.dp-card:last-child { margin-bottom:0; }
.dp-card-head { padding:16px 22px; border-bottom:1px solid #F1F5F9; display:flex; align-items:center; gap:12px; }
.dp-card-head-ic { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:17px; }
.dp-card-title { font-size:15px; font-weight:700; color:#0F172A; }
.dp-card-body { padding:22px; }

/* ── PROFIL INFO ── */
.dp-bio { font-size:14px; color:#475569; line-height:1.7; }
.dp-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.dp-info-box { background:#F8FAFC; border:1px solid #F1F5F9; border-radius:10px; padding:14px 16px; }
.dp-info-lbl { font-size:10px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:5px; }
.dp-info-val { font-size:14px; font-weight:600; color:#0F172A; }

/* ── STARS ── */
.dp-stars { display:flex; align-items:center; gap:6px; margin-top:12px; }
.dp-stars-ic { color:#F59E0B; font-size:14px; letter-spacing:1px; }
.dp-stars-val { font-size:13px; font-weight:700; color:#0F172A; }
.dp-stars-ct { font-size:12px; color:#94A3B8; }

/* ── REVIEWS ── */
.dp-review { padding:14px 0; border-bottom:1px solid #F8FAFC; }
.dp-review:last-child { border-bottom:none; }
.dp-review-author { font-size:13px; font-weight:700; color:#0F172A; margin-bottom:4px; }
.dp-review-text { font-size:13px; color:#64748B; line-height:1.55; }
.dp-review-date { font-size:11px; color:#CBD5E1; margin-top:4px; }

/* ══════════════════════════════════════
   RDV SIDEBAR — Design propre
══════════════════════════════════════ */
.dp-rdv-box { position:sticky; top:84px; }
.dp-rdv-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:16px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06); }

/* Prix header */
.dp-rdv-head { padding:18px 20px 14px; border-bottom:1px solid #F1F5F9; }
.dp-rdv-head-lbl { font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:5px; }
.dp-rdv-price { font-size:26px; font-weight:800; color:#0F172A; letter-spacing:-0.5px; }
.dp-rdv-price span { font-size:13px; font-weight:400; color:#94A3B8; margin-left:4px; }

/* Navigation semaine */
.dp-week-nav { padding:14px 20px 10px; display:flex; align-items:center; justify-content:space-between; }
.dp-week-btn { width:30px; height:30px; border-radius:8px; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#2563EB; font-size:14px; font-weight:700; transition:all 0.12s; }
.dp-week-btn:hover:not(:disabled) { background:#2563EB; color:#fff; border-color:#2563EB; }
.dp-week-btn:disabled { opacity:0.35; cursor:not-allowed; }
.dp-week-range { font-size:13px; font-weight:700; color:#0F172A; }

/* Jours */
.dp-days { display:flex; gap:5px; padding:0 20px 14px; overflow-x:auto; scrollbar-width:none; }
.dp-days::-webkit-scrollbar { display:none; }
.dp-day-btn { display:flex; flex-direction:column; align-items:center; gap:3px; min-width:44px; padding:8px 4px; border-radius:10px; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; transition:all 0.12s; flex-shrink:0; }
.dp-day-btn:hover:not(.empty):not(.active) { border-color:#2563EB; background:#EFF6FF; }
.dp-day-btn.active { border-color:#2563EB; background:#2563EB; }
.dp-day-btn.empty { opacity:0.38; cursor:default; }
.dp-day-btn-name { font-size:9px; font-weight:800; color:#64748B; text-transform:uppercase; letter-spacing:0.5px; }
.dp-day-btn-num  { font-size:17px; font-weight:800; color:#0F172A; line-height:1; }
.dp-day-btn-dot  { width:5px; height:5px; border-radius:50%; background:#3B82F6; }
.dp-day-btn.active .dp-day-btn-name { color:rgba(255,255,255,0.75); }
.dp-day-btn.active .dp-day-btn-num  { color:#fff; }
.dp-day-btn.active .dp-day-btn-dot  { background:rgba(255,255,255,0.9); }
.dp-day-btn.empty  .dp-day-btn-dot  { background:#E2E8F0; }

/* Créneaux */
.dp-slots-wrap { padding:0 20px 16px; }
.dp-slots-date { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; }
.dp-slots-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
.dp-slot {
  padding:9px 4px; border-radius:8px; border:1.5px solid #BFDBFE;
  background:#EFF6FF; color:#1E40AF; font-size:13px; font-weight:700;
  cursor:pointer; text-align:center; transition:all 0.12s; font-family:inherit;
}
.dp-slot:hover { background:#2563EB; color:#fff; border-color:#2563EB; }
.dp-slot.sel  { background:#2563EB; color:#fff; border-color:#2563EB; box-shadow:0 2px 8px rgba(37,99,235,0.25); }
.dp-no-slots { text-align:center; padding:20px 0; color:#94A3B8; font-size:13px; }

/* CTA */
.dp-cta-wrap { padding:0 20px 20px; }
.dp-cta {
  width:100%; padding:13px; background:#2563EB; color:#fff; border:none;
  border-radius:10px; font-size:14px; font-weight:800; cursor:pointer;
  font-family:inherit; transition:background 0.15s;
}
.dp-cta:hover:not(:disabled) { background:#1D4ED8; }
.dp-cta:disabled { background:#E2E8F0; color:#94A3B8; cursor:not-allowed; }
.dp-cta-hint { text-align:center; font-size:11px; color:#94A3B8; margin-top:8px; }

/* Succès */
.dp-success { padding:16px 20px; background:#EFF6FF; border-top:1px solid #93C5FD; display:flex; align-items:center; gap:10px; }
.dp-success-txt { font-size:13px; font-weight:700; color:#1D4ED8; }

/* ── MODAL ── */
.dp-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); display:flex; align-items:center; justify-content:center; z-index:300; padding:16px; backdrop-filter:blur(4px); }
.dp-modal { background:#fff; border-radius:16px; padding:28px; max-width:440px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
.dp-modal-title { font-size:17px; font-weight:800; color:#0F172A; margin-bottom:20px; }
.dp-modal-sum { background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:14px 16px; margin-bottom:18px; }
.dp-modal-sum-doc { font-size:14px; font-weight:800; color:#1E40AF; margin-bottom:3px; }
.dp-modal-sum-slot { font-size:13px; color:#475569; }
.dp-modal-lbl { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; display:block; }
.dp-modal-input { width:100%; padding:10px 12px; border:1.5px solid #E2E8F0; border-radius:8px; font-size:14px; font-family:inherit; color:#0F172A; outline:none; transition:border 0.15s; margin-bottom:12px; }
.dp-modal-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,0.1); }
.dp-modal-check { display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; font-weight:600; cursor:pointer; margin-bottom:18px; }
.dp-modal-check input { accent-color:#2563EB; width:15px; height:15px; }
.dp-modal-actions { display:flex; gap:8px; }
.dp-modal-cancel { flex:1; padding:11px; background:#F8FAFC; border:1.5px solid #E2E8F0; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; }
.dp-modal-submit { flex:2; padding:11px; background:#2563EB; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; transition:background 0.15s; }
.dp-modal-submit:hover:not(:disabled) { background:#1D4ED8; }
.dp-modal-submit:disabled { opacity:0.6; cursor:not-allowed; }

/* Spinner */
.dp-spin { width:32px; height:32px; border:3px solid #E2E8F0; border-top-color:#2563EB; border-radius:50%; animation:dp-r 0.7s linear infinite; margin:80px auto; }
@keyframes dp-r { to { transform:rotate(360deg); } }

@media(max-width:900px) { .dp-body { grid-template-columns:1fr; padding:16px 20px; } .dp-rdv-box { position:static; } .dp-hero { padding:32px 20px; } .dp-nav { padding:0 20px; } .dp-hero-name { font-size:22px; } }
`;

export function DoctorPublicPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [doctor,      setDoctor]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot,setSelectedSlot]= useState(null);
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

  const getWeekDays = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    return Array.from({length:7},(_,i)=>{
      const d = new Date(today);
      d.setDate(today.getDate() + weekOffset*7 + i);
      return d;
    });
  };

  const getSlotsForDay = (date) => {
    if(!doctor?.availabilities) return [];
    const dow = date.getDay();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    // Pour aujourd'hui : n'autoriser que les créneaux >= heure actuelle + 60 min
    const minMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 60 : 0;

    const slots = [];
    doctor.availabilities.filter(a=>a.dayOfWeek===dow&&a.isAvailable).forEach(a=>{
      const [sh,sm] = a.startTime.split(':').map(Number);
      const [eh,em] = a.endTime.split(':').map(Number);
      let cur = sh*60+sm; const end = eh*60+em; const dur = a.slotDuration||30;
      while(cur+dur<=end){
        if(cur >= minMinutes){
          slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`);
        }
        cur+=dur;
      }
    });
    return slots;
  };

  const weekDays = getWeekDays();

  useEffect(() => {
    if(!doctor) return;
    const first = weekDays.find(d=>getSlotsForDay(d).length>0);
    setSelectedDay(first||null); setSelectedSlot(null);
  }, [doctor, weekOffset]);

  const currentSlots = selectedDay ? getSlotsForDay(selectedDay) : [];

  const confirmRdv = async () => {
    if(!isAuthenticated){navigate('/login');return;}
    setBooking(true);
    try {
      await api.post('/appointments',{doctorId:doctor.id,appointmentDate:selectedSlot.date.toISOString().split('T')[0],appointmentTime:selectedSlot.time,motif,isFirstVisit:firstVisit});
      setSuccess(true); setShowModal(false); setSelectedSlot(null);
    } catch(e) { alert(e.response?.data?.message||'Erreur lors de la réservation'); }
    finally { setBooking(false); }
  };

  const init = () => `${doctor?.user?.firstName?.[0]||''}${doctor?.user?.lastName?.[0]||''}`.toUpperCase();
  const stars = n => '★'.repeat(Math.round(Math.min(n||0,5)))+'☆'.repeat(5-Math.round(Math.min(n||0,5)));
  const fmtDate  = d => `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
  const fmtShort = d => `${d.getDate()} ${MOIS[d.getMonth()]}`;

  if(loading) return <div className="dp"><style>{css}</style><div className="dp-spin"/></div>;
  if(!doctor) return (
    <div className="dp"><style>{css}</style>
    <div style={{textAlign:'center',padding:'80px 20px',color:'#64748B'}}>
      <div style={{fontSize:48,marginBottom:16}}>🔍</div>
      <h2>Médecin introuvable</h2>
    </div></div>
  );

  return (
    <div className="dp">
      <style>{css}</style>

      {/* NAV */}
      <nav className="dp-nav">
        <div className="dp-nav-in">
          <Link to="/" className="dp-logo">Freya<span>.</span></Link>
          <button className="dp-back" onClick={()=>navigate(-1)}>← Retour aux résultats</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="dp-hero">
        <div className="dp-hero-in">
          <div className="dp-hero-av">{init()}</div>
          <div>
            <div className="dp-hero-name">Dr. {doctor.user?.firstName} {doctor.user?.lastName}</div>
            <div className="dp-hero-spec">{doctor.specialite}</div>
            <div className="dp-hero-meta">
              <div className="dp-hero-info">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {doctor.city?`${doctor.city}, `:''}{doctor.wilaya}
              </div>
              <div className="dp-hero-sep"/>
              <div className="dp-hero-info">{doctor.experienceYears||0} ans d'expérience</div>
              {doctor.ordreVerified && <div className="dp-hero-verified">✓ Vérifié</div>}
              {doctor.languages?.split(',').map(l=><span key={l} className="dp-hero-tag">{l.trim()}</span>)}
            </div>
            {doctor.ratingCount>0 && (
              <div className="dp-stars" style={{marginTop:12}}>
                <span className="dp-stars-ic">{stars(doctor.ratingAvg)}</span>
                <span className="dp-stars-val">{Number(doctor.ratingAvg).toFixed(1)}</span>
                <span className="dp-stars-ct">({doctor.ratingCount} avis)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="dp-body">
        {/* ── GAUCHE ── */}
        <div>
          {doctor.bio && (
            <div className="dp-card">
              <div className="dp-card-head"><div className="dp-card-head-ic" style={{background:'#EFF6FF'}}>👨‍⚕️</div><span className="dp-card-title">À propos</span></div>
              <div className="dp-card-body"><p className="dp-bio">{doctor.bio}</p></div>
            </div>
          )}

          {doctor.education && (
            <div className="dp-card">
              <div className="dp-card-head"><div className="dp-card-head-ic" style={{background:'#EFF6FF'}}>🎓</div><span className="dp-card-title">Formation & Diplômes</span></div>
              <div className="dp-card-body"><p className="dp-bio">{doctor.education}</p></div>
            </div>
          )}

          <div className="dp-card">
            <div className="dp-card-head"><div className="dp-card-head-ic" style={{background:'#FFFBEB'}}>📋</div><span className="dp-card-title">Informations pratiques</span></div>
            <div className="dp-card-body">
              <div className="dp-info-grid">
                {[
                  ['📍 Adresse', doctor.cabinetAddress||doctor.wilaya],
                  ['💰 Tarif', `${doctor.consultationPrice?.toLocaleString('fr-DZ')||'—'} DA / consultation`],
                  ['🗣️ Langues', doctor.languages||'—'],
                  ['🗺️ Wilaya', doctor.wilaya],
                ].map(([lbl,val])=>(
                  <div key={lbl} className="dp-info-box">
                    <div className="dp-info-lbl">{lbl}</div>
                    <div className="dp-info-val">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {doctor.reviews?.length>0 && (
            <div className="dp-card">
              <div className="dp-card-head"><div className="dp-card-head-ic" style={{background:'#FEF3C7'}}>⭐</div><span className="dp-card-title">Avis patients ({doctor.reviews.length})</span></div>
              <div className="dp-card-body">
                {doctor.reviews.slice(0,5).map(r=>(
                  <div key={r.id} className="dp-review">
                    <div className="dp-review-author">
                      {r.isAnonymous?'Patient anonyme':`${r.patient?.firstName||'Patient'}`}
                      <span className="dp-stars-ic" style={{marginLeft:8,fontSize:11}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                    </div>
                    {r.comment&&<div className="dp-review-text">{r.comment}</div>}
                    <div className="dp-review-date">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── DROITE : RDV ── */}
        <div className="dp-rdv-box">
          <div className="dp-rdv-card">

            {/* Prix */}
            <div className="dp-rdv-head">
              <div className="dp-rdv-head-lbl">Prendre rendez-vous</div>
              <div className="dp-rdv-price">
                {doctor.consultationPrice?.toLocaleString('fr-DZ')||'—'} DA
                <span>/ consultation</span>
              </div>
            </div>

            {/* Semaine */}
            <div className="dp-week-nav">
              <button className="dp-week-btn" disabled={weekOffset===0} onClick={()=>setWeekOffset(w=>w-1)}>‹</button>
              <span className="dp-week-range">{fmtShort(weekDays[0])} – {fmtShort(weekDays[6])}</span>
              <button className="dp-week-btn" onClick={()=>setWeekOffset(w=>w+1)}>›</button>
            </div>

            {/* Jours */}
            <div className="dp-days">
              {weekDays.map((day,i)=>{
                const s = getSlotsForDay(day);
                const isActive = selectedDay&&day.toDateString()===selectedDay.toDateString();
                return (
                  <button key={i} className={`dp-day-btn${isActive?' active':''}${!s.length?' empty':''}`}
                    onClick={()=>{if(!s.length)return;setSelectedDay(day);setSelectedSlot(null);}}>
                    <span className="dp-day-btn-name">{JOURS[day.getDay()]}</span>
                    <span className="dp-day-btn-num">{day.getDate()}</span>
                    <span className="dp-day-btn-dot"/>
                  </button>
                );
              })}
            </div>

            {/* Créneaux */}
            <div className="dp-slots-wrap">
              {!selectedDay ? (
                <div className="dp-no-slots">📅 Aucune disponibilité cette semaine</div>
              ) : <>
                <div className="dp-slots-date">{fmtDate(selectedDay)}</div>
                {currentSlots.length===0 ? (
                  <div className="dp-no-slots">Pas de créneau ce jour</div>
                ) : (
                  <div className="dp-slots-grid">
                    {currentSlots.map(time=>(
                      <button key={time}
                        className={`dp-slot${selectedSlot?.time===time&&selectedSlot?.date?.toDateString()===selectedDay.toDateString()?' sel':''}`}
                        onClick={()=>setSelectedSlot({time,date:selectedDay})}>
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </>}
            </div>

            {/* CTA */}
            <div className="dp-cta-wrap">
              <button className="dp-cta" disabled={!selectedSlot}
                onClick={()=>{if(!isAuthenticated)navigate('/login');else setShowModal(true);}}>
                {selectedSlot
                  ? `Confirmer — ${fmtDate(selectedSlot.date)} à ${selectedSlot.time}`
                  : 'Sélectionnez un créneau'}
              </button>
              {!isAuthenticated&&<div className="dp-cta-hint">Connexion requise pour réserver</div>}
            </div>

            {success&&(
              <div className="dp-success">
                <span style={{fontSize:20}}>✅</span>
                <div>
                  <div className="dp-success-txt">Rendez-vous confirmé !</div>
                  <div style={{fontSize:12,color:'#1D4ED8',marginTop:2}}>Vous recevrez une confirmation.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal&&(
        <div className="dp-overlay" onClick={()=>setShowModal(false)}>
          <div className="dp-modal" onClick={e=>e.stopPropagation()}>
            <div className="dp-modal-title">Confirmer le rendez-vous</div>
            <div className="dp-modal-sum">
              <div className="dp-modal-sum-doc">Dr. {doctor.user?.firstName} {doctor.user?.lastName} — {doctor.specialite}</div>
              <div className="dp-modal-sum-slot">📅 {fmtDate(selectedSlot?.date)} à {selectedSlot?.time} · 💰 {doctor.consultationPrice?.toLocaleString('fr-DZ')} DA</div>
            </div>
            <label className="dp-modal-lbl">Motif de consultation</label>
            <input className="dp-modal-input" placeholder="Ex : Douleur abdominale, bilan annuel..." value={motif} onChange={e=>setMotif(e.target.value)}/>
            <label className="dp-modal-check">
              <input type="checkbox" checked={firstVisit} onChange={e=>setFirstVisit(e.target.checked)}/>
              Première consultation avec ce médecin
            </label>
            <div className="dp-modal-actions">
              <button className="dp-modal-cancel" onClick={()=>setShowModal(false)}>Annuler</button>
              <button className="dp-modal-submit" onClick={confirmRdv} disabled={booking}>
                {booking?'Réservation...':'✓ Confirmer le RDV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPublicPage;
