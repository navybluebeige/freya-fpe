import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { reviewsAPI, appointmentsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const s = {
  root:        { fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh' },
  loader:      { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#2563EB' },
  navbar:      { height: '64px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', padding: '0 20px', position: 'sticky', top: 0, zIndex: 10 },
  navInner:    { width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo:        { fontSize: '24px', fontWeight: '800', color: '#0F172A', textDecoration: 'none' },
  backBtn:     { padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: '600', backgroundColor: '#fff', fontSize: '13px' },
  hero:        { background: 'linear-gradient(160deg, #1D4ED8 0%, #2563EB 45%, #60A5FA 100%)', padding: '40px 20px', position: 'relative', overflow: 'hidden', color: '#fff' },
  heroShape:   { position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' },
  heroContent: { maxWidth: '1200px', margin: '0 auto', position: 'relative' },
  heroBadge:   { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' },
  heroTitle:   { fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: '800', marginBottom: '12px', letterSpacing: '-1px' },
  heroRow:     { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' },
  heroInfo:    { fontSize: '14px', fontWeight: '500', opacity: 0.9 },
  heroDivider: { width: '1px', height: '14px', backgroundColor: 'rgba(255,255,255,0.3)' },
  heroStars:   { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' },
  container:   { maxWidth: '1100px', margin: '30px auto', padding: '0 16px' },
  card:        { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardHeader:  { padding: '18px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle:   { fontSize: '16px', fontWeight: '700', color: '#0F172A' },
  tabs:        { display: 'flex', gap: '8px', padding: '14px 20px', backgroundColor: '#F8FAFC' },
  tab:         { padding: '7px 14px', borderRadius: '20px', border: '1px solid #E2E8F0', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#475569' },
  tabActive:   { padding: '7px 14px', borderRadius: '20px', border: '1px solid #2563EB', backgroundColor: '#2563EB', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: '#64748B', textTransform: 'uppercase', backgroundColor: '#F8FAFC', fontWeight: '700' },
  td:          { padding: '14px 20px', borderBottom: '1px solid #F1F5F9', fontSize: '14px' },
  badge:       { backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#1D4ED8' },
  horRow:      { display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #F8FAFC', fontSize: '14px' },
  dayLabel:    { fontWeight: '600', color: '#475569' },
  hours:       { color: '#2563EB', fontWeight: '700' },
  closed:      { color: '#EF4444', fontWeight: '700' },
  // Sidebar RDV
  rdvCard:     { backgroundColor: '#fff', borderRadius: '16px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' },
  rdvHead:     { padding: '18px 20px', borderBottom: '1px solid #F1F5F9' },
  rdvLabel:    { fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
  rdvTitle:    { fontSize: '18px', fontWeight: '800', color: '#0F172A' },
  rdvBody:     { padding: '20px' },
  rdvInput:    { width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
  rdvBtn:      { width: '100%', padding: '13px', backgroundColor: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' },
  // Avis
  reviewCard:  { padding: '14px 0', borderBottom: '1px solid #F1F5F9' },
  stars:       { color: '#F59E0B', letterSpacing: '2px' },
};

const ANALYSES = [
  { cat: 'Hématologie', ic: 'H', items: [{ nom: 'Numération Formule Sanguine (NFS)', prix: 350, delai: '2h' }, { nom: 'Groupe Sanguin + Rhésus', prix: 300, delai: '1h' }] },
  { cat: 'Biochimie',   ic: 'B', items: [{ nom: 'Glycémie à jeun', prix: 250, delai: '1h' }, { nom: 'Bilan lipidique complet', prix: 800, delai: '3h' }] },
  { cat: 'Sérologie',   ic: 'S', items: [{ nom: 'VIH 1+2 (Ag/Ac)', prix: 800, delai: '24h' }, { nom: 'H. pylori (sérologie)', prix: 750, delai: '24h' }] },
];

const HORAIRES = [
  { jour: 'Samedi',    h: '07:30 – 19:00' },
  { jour: 'Dimanche',  h: '07:30 – 19:00' },
  { jour: 'Lundi',     h: '07:30 – 19:00' },
  { jour: 'Mardi',     h: '07:30 – 19:00' },
  { jour: 'Mercredi',  h: '07:30 – 19:00' },
  { jour: 'Jeudi',     h: '07:30 – 19:00' },
  { jour: 'Vendredi',  h: 'Fermé', closed: true },
];

function starsStr(n) {
  const r = Math.round(Math.min(n || 0, 5));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

// Créneaux disponibles 07h30 – 19h00 par tranches de 30 min (vendredi exclu)
const ALL_SLOTS = [];
for (let h = 7, m = 30; h * 60 + m + 30 <= 19 * 60; ) {
  ALL_SLOTS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  m += 30;
  if (m >= 60) { h++; m -= 60; }
}

function getAvailableSlots(dateStr) {
  if (!dateStr) return ALL_SLOTS;
  const d = new Date(dateStr);
  // Vendredi = 5 → fermé
  if (d.getDay() === 5) return [];
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (!isToday) return ALL_SLOTS;
  // Pour aujourd'hui : n'autoriser que les créneaux >= heure actuelle + 60 min
  const minMins = today.getHours() * 60 + today.getMinutes() + 60;
  return ALL_SLOTS.filter(t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m >= minMins;
  });
}

export default function LabPublicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [lab,      setLab]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tabCat,   setTabCat]   = useState(0);
  const [reviews,  setReviews]  = useState([]);
  const [booking,  setBooking]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  // Formulaire RDV
  const [rdvDate,  setRdvDate]  = useState('');
  const [rdvTime,  setRdvTime]  = useState('');
  const [rdvMotif, setRdvMotif] = useState('');

  const availableSlots = getAvailableSlots(rdvDate);

  // Notation
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState('');
  const [anon,    setAnon]    = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);

  useEffect(() => {
    api.get(`/laboratory/${id}`)
      .then(r => setLab(r.data))
      .catch(() => setLab(null))
      .finally(() => setLoading(false));
    reviewsAPI.getClinicReviews(id)
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => setReviews([]));
  }, [id]);

  const confirmRdv = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!rdvDate) { toast.error('Choisissez une date'); return; }
    const dayOfWeek = new Date(rdvDate).getDay();
    if (dayOfWeek === 5) { toast.error('Le laboratoire est fermé le vendredi'); return; }
    const slots = getAvailableSlots(rdvDate);
    if (slots.length === 0) { toast.error('Aucun créneau disponible pour cette date'); return; }
    const time = rdvTime || slots[0];
    if (!slots.includes(time)) { toast.error('Créneau non disponible'); return; }
    setBooking(true);
    try {
      const time = rdvTime || getAvailableSlots(rdvDate)[0];
      await appointmentsAPI.book({
        clinicId: id,
        appointmentDate: rdvDate,
        appointmentTime: time,
        motif: rdvMotif || 'Analyses médicales',
        appointmentType: 'lab',
      });
      setSuccess(true);
      toast.success('Rendez-vous confirmé !');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setBooking(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) { toast.error('Choisissez une note'); return; }
    if (!isAuthenticated) { navigate('/login'); return; }
    setReviewSaving(true);
    try {
      await reviewsAPI.addReview({ clinicId: id, rating, comment, isAnonymous: anon });
      toast.success('Avis publié. Merci !');
      setShowReviewForm(false);
      setRating(0); setComment(''); setAnon(false);
      const r = await reviewsAPI.getClinicReviews(id);
      setReviews(r.data.reviews || []);
      // Rafraîchir la note
      const lab2 = await api.get(`/laboratory/${id}`);
      setLab(lab2.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur');
    } finally {
      setReviewSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const ratingAvg  = lab?.ratingAvg  || 0;
  const ratingCount = lab?.ratingCount || 0;

  if (loading) return <div style={s.loader}>Chargement...</div>;
  if (!lab)    return <div style={s.loader}>Laboratoire introuvable</div>;

  return (
    <div style={s.root}>
      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <Link to="/" style={s.logo}>Freya<span style={{ color: '#2563EB' }}>.</span></Link>
          <button style={s.backBtn} onClick={() => navigate(-1)}>← Retour</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroShape} />
        <div style={s.heroContent}>
          <div style={s.heroBadge}>Laboratoire partenaire</div>
          <h1 style={s.heroTitle}>{lab?.name || "Laboratoire d'analyses"}</h1>
          <div style={s.heroRow}>
            <span style={s.heroInfo}>{lab?.address || '—'}, {lab?.wilaya || ''}</span>
            {lab?.phone && <><span style={s.heroDivider}/><span style={s.heroInfo}>{lab.phone}</span></>}
            {lab?.email && <><span style={s.heroDivider}/><span style={s.heroInfo}>{lab.email}</span></>}
          </div>
          {ratingCount > 0 && (
            <div style={s.heroStars}>
              <span style={{ color: '#FDE68A', letterSpacing: '2px' }}>{starsStr(ratingAvg)}</span>
              <span style={{ fontWeight: '800', fontSize: '15px' }}>{Number(ratingAvg).toFixed(1)}</span>
              <span style={{ opacity: 0.7, fontSize: '13px' }}>({ratingCount} avis)</span>
            </div>
          )}
        </div>
      </section>

      <div style={s.container} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
        {/* Colonne gauche */}
        <div>
          {/* Tarifs */}
          <div style={{ ...s.card, marginBottom: '20px' }}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Tarifs des analyses</span>
            </div>
            <div style={s.tabs}>
              {ANALYSES.map((c, i) => (
                <button key={i} style={tabCat === i ? s.tabActive : s.tab} onClick={() => setTabCat(i)}>
                  {c.cat}
                </button>
              ))}
            </div>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Examen</th>
                  <th style={s.th}>Délai</th>
                  <th style={s.th}>Prix</th>
                </tr>
              </thead>
              <tbody>
                {ANALYSES[tabCat].items.map((item, i) => (
                  <tr key={i}>
                    <td style={s.td}>{item.nom}</td>
                    <td style={s.td}><span style={s.badge}>{item.delai}</span></td>
                    <td style={{ ...s.td, fontWeight: '800', color: '#2563EB' }}>{item.prix} DA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Horaires */}
          <div style={{ ...s.card, marginBottom: '20px' }}>
            <div style={s.cardHeader}><span style={s.cardTitle}>Horaires d'ouverture</span></div>
            {HORAIRES.map((h, i) => (
              <div key={i} style={s.horRow}>
                <span style={s.dayLabel}>{h.jour}</span>
                <span style={h.closed ? s.closed : s.hours}>{h.h}</span>
              </div>
            ))}
          </div>

          {/* Avis */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>Avis patients ({reviews.length})</span>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(v => !v)}
                  style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #2563EB', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#2563EB', backgroundColor: '#EFF6FF' }}
                >
                  {showReviewForm ? 'Annuler' : 'Donner mon avis'}
                </button>
              )}
            </div>

            {showReviewForm && (
              <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Note *</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star} onClick={() => setRating(star)} style={{ fontSize: '28px', cursor: 'pointer', background: 'none', border: 'none', color: star <= rating ? '#F59E0B' : '#E2E8F0', padding: 0, lineHeight: 1 }}>★</button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Votre commentaire..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer', marginBottom: '14px' }}>
                  <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} style={{ accentColor: '#2563EB' }} />
                  Publier de façon anonyme
                </label>
                <button
                  onClick={submitReview}
                  disabled={reviewSaving || rating === 0}
                  style={{ padding: '10px 20px', backgroundColor: '#F59E0B', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', opacity: reviewSaving || rating === 0 ? 0.5 : 1 }}
                >
                  {reviewSaving ? 'Publication...' : 'Publier mon avis'}
                </button>
              </div>
            )}

            <div style={{ padding: '0 20px' }}>
              {reviews.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                  Aucun avis pour le moment. Soyez le premier !
                </div>
              ) : reviews.slice(0, 5).map(r => (
                <div key={r.id} style={s.reviewCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
                      {r.patient?.firstName} {r.patient?.lastName}
                    </span>
                    <span style={{ ...s.stars, fontSize: '13px' }}>{starsStr(r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '13px', color: '#475569', marginBottom: '4px', lineHeight: '1.5' }}>{r.comment}</p>}
                  <div style={{ fontSize: '11px', color: '#CBD5E1' }}>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar : Prendre RDV */}
        <div>
          <div style={s.rdvCard}>
            <div style={s.rdvHead}>
              <div style={s.rdvLabel}>Prendre rendez-vous</div>
              <div style={s.rdvTitle}>{lab?.name || 'Analyses médicales'}</div>
            </div>
            <div style={s.rdvBody}>
              {lab?.address && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '12px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{lab.address}, {lab.wilaya}</span>
                </div>
              )}
              {lab?.phone && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '16px' }}>📞</span>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>{lab.phone}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  navigate(`/patient/labo/${id}/book`);
                }}
                style={s.rdvBtn}
              >
                {isAuthenticated ? 'Choisir un créneau' : 'Se connecter pour réserver'}
              </button>
              {!isAuthenticated && (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', marginTop: '8px' }}>
                  Vous devez être connecté en tant que patient pour réserver
                </p>
              )}
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1D4ED8', marginBottom: '4px' }}>Réservation en ligne</div>
                <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>Choisissez parmi les créneaux disponibles du laboratoire.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
