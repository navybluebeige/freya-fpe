import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tlemcen', 'Sétif', 'Batna', 'Béjaïa', 'Tizi Ouzou'];

const specialties = [
  'Cardiologue', 'Neurologue', 'Pédiatre', 'Ophtalmologue',
  'Dentiste', 'Généraliste', 'Orthopédiste', 'Dermatologue', 'Gynécologue', 'ORL',
];

const howItWorksDoctor = [
  {
    step: '01',
    title: 'Recherchez un médecin',
    desc: 'Filtrez par spécialité, wilaya, disponibilité et tarif pour trouver le praticien qui vous convient.',
    color: '#2563EB',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Choisissez un créneau',
    desc: 'Consultez le calendrier en temps réel et sélectionnez le jour et l\'heure qui vous arrangent.',
    color: '#2563EB',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Confirmez votre RDV',
    desc: 'Recevez une confirmation instantanée et un rappel automatique avant votre consultation.',
    color: '#2563EB',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
];

const howItWorksLab = [
  {
    step: '01',
    title: 'Le laboratoire envoie vos résultats',
    desc: 'Après votre analyse, le laboratoire dépose vos résultats directement sur votre dossier sécurisé.',
    color: '#1A6B8A',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Consultez depuis n\'importe où',
    desc: 'Accédez à vos résultats d\'analyses — biologie, imagerie, bactériologie — en toute sécurité.',
    color: '#1A6B8A',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Partagez avec votre médecin',
    desc: 'Transmettez vos résultats directement à votre praticien pour un suivi médical optimal.',
    color: '#1A6B8A',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
];

const stats = [
  { number: '500+', label: 'Médecins partenaires' },
  { number: '120+', label: 'Laboratoires connectés' },
  { number: '48', label: 'Wilayas couvertes' },
  { number: '24/7', label: 'Accès à vos résultats' },
];

const partners = [
  'Biologie', 'Hématologie', 'Biochimie', 'Microbiologie',
  'Sérologie', 'Imagerie', 'Anatomopathologie', 'Hormonologie',
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [activeTab, setActiveTab] = useState('rdv');
  const navigate = useNavigate();

  const handleSearch = () => navigate('/doctors');

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .nav-lnk:hover { color: #2563EB !important; }
        .spec-pill:hover { background-color: #2563EB !important; color: #fff !important; border-color: #2563EB !important; }
        .search-btn-hp:hover { background-color: #1D4ED8 !important; }
        .tab-btn:hover { background-color: #EFF6FF !important; }
        .step-card:hover { box-shadow: 0 8px 28px rgba(37,99,235,0.12) !important; transform: translateY(-2px); }
        .cta-p:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4) !important; }
        .cta-s:hover { background-color: rgba(255,255,255,0.22) !important; }
        .login-btn-hp:hover { background-color: #EFF6FF !important; }
        .reg-btn-hp:hover { background-color: #1D4ED8 !important; }
        .footer-lnk:hover { color: rgba(255,255,255,0.9) !important; }
        .lab-pill:hover { border-color: #2563EB !important; color: #2563EB !important; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media(max-width:768px) {
          .hp-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hp-steps-grid { grid-template-columns: 1fr !important; gap:16px !important; }
          .hp-steps-grid2 { grid-template-columns: 1fr !important; gap:16px !important; }
          .hp-nav-links { display:none !important; }
          .hp-hero { padding:32px 16px 40px !important; }
          .hp-search { flex-direction:column; height:auto !important; border-radius:14px !important; }
          .hp-search-field { border-right:none !important; border-bottom:1px solid #E8EDF2; height:48px; }
          .hp-search-divider { display:none !important; }
          .hp-search-btn { width:100%; height:50px; border-radius:0 0 12px 12px !important; }
          .hp-stats-section { padding:30px 16px !important; }
          .hp-how-section { padding:40px 16px !important; }
          .hp-cta-section { padding:50px 16px !important; }
          .hp-footer { padding:32px 16px 20px !important; }
          .hp-footer-inner { flex-direction:column !important; gap:24px !important; }
          .hp-footer-grid { flex-direction:column !important; gap:24px !important; justify-content:flex-start !important; }
          .hp-spec-section { padding:40px 16px !important; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <div style={s.logo}>Frey<span style={{ color: '#f5f8fa' }}>a</span></div>
          <div style={s.navLinks} className="hp-nav-links">
            <a href="#rdv" className="nav-lnk" style={s.navLink}>Rendez-vous</a>
            <a href="#lab" className="nav-lnk" style={s.navLink}>Résultats d'analyses</a>
            <a href="#how" className="nav-lnk" style={s.navLink}>Comment ça marche</a>
            <a href="#specialties" className="nav-lnk" style={s.navLink}>Spécialités</a>
          </div>
          <div style={s.navActions}>
            <Link to="/login" className="login-btn-hp" style={s.loginBtn}>Connexion</Link>
            <Link to="/register" className="reg-btn-hp" style={s.registerBtn}>Créer un compte</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={s.hero} className="hp-hero">
        <div style={s.heroCircle1} />
        <div style={s.heroCircle2} />
        <div style={s.heroInner}>

          {/* Left — texte + search */}
          <div style={s.heroLeft}>
            <h1 style={s.heroTitle}>
              Votre santé mérite,<br />
              <span style={s.heroAccent}>le meilleur suivi</span>
            </h1>
            <p style={s.heroSub}>
              Prenez rendez-vous chez un médecin en quelques clics et consultez vos résultats d'analyses directement depuis votre espace sécurisé.
            </p>

            {/* Tabs RDV / Analyses */}
            <div style={s.tabRow}>
              <button
                className="tab-btn"
                style={{ ...s.tabBtn, ...(activeTab === 'rdv' ? s.tabBtnActive : {}) }}
                onClick={() => setActiveTab('rdv')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Prendre RDV
              </button>
              <button
                className="tab-btn"
                style={{ ...s.tabBtn, ...(activeTab === 'lab' ? { ...s.tabBtnActive, backgroundColor: '#E0F2F7', color: '#1A6B8A', borderColor: '#1A6B8A' } : {}) }}
                onClick={() => setActiveTab('lab')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                Résultats d'analyses
              </button>
            </div>

            {/* Search bar RDV */}
            {activeTab === 'rdv' && (
              <div style={s.searchBar}>
                <div style={s.searchField}>
                  <svg style={{ flexShrink: 0, marginRight: '10px' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A9BAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input style={s.searchInput} placeholder="Spécialité, nom du médecin..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={s.searchDivider} />
                <div style={s.searchField}>
                  <svg style={{ flexShrink: 0, marginRight: '10px' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A9BAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <select style={s.searchSelect} value={wilaya} onChange={e => setWilaya(e.target.value)}>
                    <option value="">Wilaya</option>
                    {wilayas.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <button className="search-btn-hp" style={s.searchBtn} onClick={handleSearch}>Rechercher</button>
              </div>
            )}

            {/* Search bar Labo */}
            {activeTab === 'lab' && (
              <div style={{ ...s.searchBar, borderColor: '#B0D8E8' }}>
                <div style={s.searchField}>
                  <svg style={{ flexShrink: 0, marginRight: '10px' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A9BAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                  <input style={s.searchInput} placeholder="Nom du laboratoire, type d'analyse..." />
                </div>
                <div style={s.searchDivider} />
                <div style={s.searchField}>
                  <svg style={{ flexShrink: 0, marginRight: '10px' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A9BAA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <select style={s.searchSelect}>
                    <option value="">Wilaya</option>
                    {wilayas.map(w => <option key={w}>{w}</option>)}
                  </select>
                </div>
                <button className="search-btn-hp" style={{ ...s.searchBtn, backgroundColor: '#1A6B8A' }} onClick={handleSearch}>Rechercher</button>
              </div>
            )}

            {/* Quick tags */}
            
          </div>

          {/* Right — visual cards */}
          
      
                                      </div>
                                       </section>
      {/* ══ STATS ══ */}
      <section style={s.statsSection} className="hp-stats-section">
        <div style={s.statsGrid} className="hp-stats-grid">
          {stats.map((st, i) => (
            <div key={i} style={{ ...s.statItem, borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={s.statNum}>{st.number}</div>
              <div style={s.statLbl}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={s.section}>
        <div style={s.sectionInner}>

          {/* RDV bloc */}
          <div id="rdv" style={{ marginBottom: '72px' }}>
            <div style={s.sectionHeader}>
              <div style={s.eyebrow}>Réservation médicale</div>
              <h2 style={s.sectionTitle}>Prenez rendez-vous en 3 étapes</h2>
              <p style={s.sectionSub}>Trouvez le bon médecin, choisissez votre créneau et confirmez votre consultation — sans téléphone, sans attente.</p>
            </div>
            <div style={s.stepsGrid} className="hp-steps-grid">
              {howItWorksDoctor.map((step, i) => (
                <div key={i} className="step-card" style={s.stepCard}>
                  <div style={{ ...s.stepNum, color: step.color }}>Étape {step.step}</div>
                  <div style={{ ...s.stepIconWrap, backgroundColor: '#E8F4FD', color: '#2563EB' }}>
                    {step.icon}
                  </div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                  {i < howItWorksDoctor.length - 1 && <div style={s.stepArrow}>→</div>}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link to="/doctors" style={s.primaryLink}>Trouver un médecin</Link>
            </div>
          </div>

          {/* Labo bloc */}
          <div id="lab" style={{ backgroundColor: '#F0F7FA', borderRadius: '16px', padding: '56px 48px' }}>
            <div style={s.sectionHeader}>
              <div style={{ ...s.eyebrow, color: '#1A6B8A' }}>Laboratoires d'analyses</div>
              <h2 style={s.sectionTitle}>Vos résultats d'analyses en ligne</h2>
              <p style={s.sectionSub}>Les laboratoires partenaires déposent directement vos résultats sur Freya — accessibles à tout moment, en toute sécurité.</p>
            </div>
            <div style={s.stepsGrid} className="hp-steps-grid2">
              {howItWorksLab.map((step, i) => (
                <div key={i} className="step-card" style={{ ...s.stepCard, borderTop: '3px solid #1A6B8A' }}>
                  <div style={{ ...s.stepNum, color: '#1A6B8A' }}>Étape {step.step}</div>
                  <div style={{ ...s.stepIconWrap, backgroundColor: '#E0F2F7', color: '#1A6B8A' }}>
                    {step.icon}
                  </div>
                  <h3 style={s.stepTitle}>{step.title}</h3>
                  <p style={s.stepDesc}>{step.desc}</p>
                  {i < howItWorksLab.length - 1 && <div style={{ ...s.stepArrow, color: '#1A6B8A' }}>→</div>}
                </div>
              ))}
            </div>

            {/* Types d'analyses */}
            <div style={{ marginTop: '36px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#5A6B7A', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Types d'analyses pris en charge
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {partners.map((p, i) => (
                  <span key={i} className="lab-pill" style={s.labPill}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SPECIALTIES ══ */}
      <section id="specialties" style={{ ...s.section, backgroundColor: '#F4F7FA', paddingTop: '64px', paddingBottom: '64px' }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHeader}>
            <div style={s.eyebrow}>Spécialités médicales</div>
            <h2 style={s.sectionTitle}>Consultez par spécialité</h2>
            <p style={s.sectionSub}>Trouvez rapidement un praticien qualifié parmi les spécialités disponibles</p>
          </div>
          <div style={s.specGrid}>
            {specialties.map((sp, i) => (
              <button key={i} className="spec-pill" style={s.specCard} onClick={handleSearch}>{sp}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={s.ctaSection}>
        <div style={s.ctaDeco1} /><div style={s.ctaDeco2} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ ...s.eyebrow, color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>Rejoignez Freya</div>
          <h2 style={s.ctaTitle}>Gérez votre santé depuis un seul endroit</h2>
          <p style={s.ctaSub}>Rendez-vous chez le médecin, résultats de laboratoire, dossier médical — tout est réuni sur Freya.</p>
          <div style={s.ctaButtons}>
            <Link to="/register" className="cta-p" style={s.ctaBtnP}>Créer un compte gratuit</Link>
            <Link to="/login" className="cta-s" style={s.ctaBtnS}>Se connecter</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={s.footer} className="hp-footer">
        <div style={s.footerInner} className="hp-footer-inner">
          <div style={{ flexShrink: 0 }}>
            <div style={s.footerLogo}>Frey<span style={{ color: '#60B8FF' }}>a</span></div>
            <p style={s.footerTagline}>Plateforme médicale — Algérie</p>
          </div>
          <div style={s.footerCols} className="hp-footer-grid">
            {[
              { title: 'Services', links: [['Rendez-vous médecin', '/doctors'], ['Résultats d\'analyses', '/login'], ['Connexion', '/login'], ['Inscription', '/register']] },
              { title: 'Professionnels', links: [['Rejoindre Freya', '#'], ['Espace médecin', '/login'], ['Espace laboratoire', '/login']] },
              { title: 'Assistance', links: [['Centre d\'aide', '#'], ['Nous contacter', '#'], ['Confidentialité', '#']] },
            ].map((col, i) => (
              <div key={i} style={s.footerCol}>
                <div style={s.footerColTitle}>{col.title}</div>
                {col.links.map(([label, href], j) => (
                  <Link key={j} to={href} className="footer-lnk" style={s.footerLink}>{label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={s.footerBottom}>© 2026 Freya — Plateforme médicale Algérie. Tous droits réservés.</div>
      </footer>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Source Sans 3','Segoe UI',sans-serif", backgroundColor: '#fff', overflowX: 'hidden' },

  // NAVBAR
 navbar: {
  position: 'absolute', // important
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 100,

  backgroundColor: 'transparent',
  borderBottom: 'none',
  padding: '0 40px',
},

  navInner: { maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '64px', gap: '32px' },

  logo: { fontSize: '50px', fontWeight: '700', color: '#fbfcff', letterSpacing: '1px', flexShrink: 0, fontFamily: "'Outfit',sans-serif" },
  navLinks: { display: 'flex', gap: '28px', flex: 1 },
  navLink: { fontSize: '16px', color: '#e8eff5', textDecoration: 'none', fontWeight: '500', transition: 'color 0.15s' },
  navActions: { display: 'flex', gap: '10px', flexShrink: 0 },
  loginBtn: { padding: '8px 18px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', color: '#2563EB', textDecoration: 'none', border: '1.5px solid #2563EB', backgroundColor: '#EFF6FF', transition: 'background 0.15s' },
  registerBtn: { padding: '9px 19px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', color: '#fff', textDecoration: 'none', backgroundColor: '#2563EB', transition: 'background 0.15s' },

  // HERO
  hero: { background: "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/images/medical-healthcare-blue-color_1017-26807.avif')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  padding: '200px 100px 200px',
  position: 'relative',
  overflow: 'hidden', },

  heroCircle1: { position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' },
  heroCircle2: { position: 'absolute', bottom: '-120px', left: '30%', width: '600px', height: '350px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)' },
  heroInner: { maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr ', gap: '56px', alignItems: 'center', position: 'relative', zIndex: 1 },
  heroLeft: {},
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.15)' },
  heroBadgeDot: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#7DCBFF', flexShrink: 0 },
  heroTitle: { fontSize: '35px', fontWeight: '600', color: '#fff', letterSpacing: '-1.5px', lineHeight: '1.1', marginBottom: '18px', fontFamily: "'Outfit',sans-serif" },
  heroAccent: { color: '#7DCBFF' },
  heroSub: { fontSize: '18px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.7', marginBottom: '28px', maxWidth: '520px' },

  // TABS
  tabRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  tabBtn: { display: 'flex', alignItems: 'center', padding: '9px 18px', borderRadius: '8px', border: '1.5px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  tabBtnActive: { backgroundColor: '#fff', color: '#2563EB', borderColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },

  // SEARCH
  searchBar: { backgroundColor: '#fff', borderRadius: '25px', display: 'flex', alignItems: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', border: '1.5px solid #D9E4ED', maxWidth: '800px' },
  searchField: { display: 'flex', alignItems: 'center', flex: 1, padding: '0 14px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', color: '#1C2B3A', width: '100%', padding: '16px 0', backgroundColor: 'transparent', fontFamily: 'inherit' },
  searchSelect: { border: 'none', outline: 'none', fontSize: '14px', color: '#1C2B3A', width: '100%', padding: '16px 0', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' },
  searchDivider: { width: '1px', height: '32px', backgroundColor: '#D9E4ED', flexShrink: 0 },
  searchBtn: { backgroundColor: '#2563EB', color: '#fff', border: 'none', padding: '16px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'background 0.15s', fontFamily: 'inherit' },
  quickRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' },
  quickLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.6)' },
  quickPill: { backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit', transition: 'all 0.15s' },

  // HERO RIGHT
  heroRight: {},
  heroCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 8px 28px rgba(0,0,0,0.15)', borderLeft: '4px solid #2563EB' },
  heroCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  heroCardIcon: { width: '38px', height: '38px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroCardTitle: { fontSize: '13px', fontWeight: '700', color: '#1A2B4A' },
  heroCardSub: { fontSize: '12px', color: '#5A6B7A', marginTop: '2px' },
  heroCardRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  heroCardChip: { fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F4F7FA', color: '#5A6B7A', border: '1px solid #D9E4ED' },

  // STATS
  statsSection: { backgroundColor: '#1E3A8A', padding: '14px 48px' },
  statsGrid: { maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0' },
  statItem: { textAlign: 'center', padding: '20px 16px' },
  statNum: { fontSize: '35px', fontWeight: '800', color: '#e3e9ee', letterSpacing: '-0.5px', fontFamily: "'Outfit',sans-serif" },
  statLbl: { fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' },

  // SECTIONS
  section: { padding: '80px 48px',
               backgroundColor: '#ffffff' 
   },
  sectionInner: { maxWidth: '1240px', margin: '0 auto' },
  sectionHeader: { textAlign: 'center', marginBottom: '48px' },
  eyebrow: { fontSize: '11px', fontWeight: '700', color: '#2563EB', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' },
  sectionTitle: { fontSize: '32px', fontWeight: '800', color: '#1A2B4A', letterSpacing: '-0.7px', marginBottom: '12px', fontFamily: "'Outfit',sans-serif" },
  sectionSub: { fontSize: '15px', color: '#5A6B7A', maxWidth: '540px', margin: '0 auto', lineHeight: '1.65' },

  // STEPS
  stepsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', position: 'relative' },
  stepCard: { backgroundColor: '#edf2f7', borderRadius: '12px', padding: '28px 24px', border: '1px solid #D9E4ED', boxShadow: '0 1px 4px rgba(0,60,110,0.06)', position: 'relative', transition: 'all 0.2s' },
  stepNum: { fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' },
  stepIconWrap: { width: '52px', height: '52px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  stepTitle: { fontSize: '16px', fontWeight: '700', color: '#1A2B4A', marginBottom: '10px', fontFamily: "'Outfit',sans-serif" },
  stepDesc: { fontSize: '14px', color: '#5A6B7A', lineHeight: '1.65' },
  stepArrow: { position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)', fontSize: '22px', color: '#C8D8E8', zIndex: 1, fontWeight: '300' },
  primaryLink: { display: 'inline-block', padding: '12px 28px', backgroundColor: '#2563EB', color: '#fff', borderRadius: '8px', fontSize: '14px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,97,168,0.3)' },

  // LAB PILLS
  labPill: { padding: '6px 16px', borderRadius: '20px', border: '1.5px solid #D9E4ED', fontSize: '13px', color: '#5A6B7A', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '500', transition: 'all 0.15s' },

  // SPECIALTY GRID
  specGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
  specCard: { padding: '10px 22px', borderRadius: '8px', border: '1.5px solid #D9E4ED', fontSize: '14px', fontWeight: '600', color: '#1A2B4A', backgroundColor: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },

  // CTA
  ctaSection: { background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)', padding: '80px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' },
  ctaDeco1: { position: 'absolute', top: '-100px', right: '-100px', width: '380px', height: '380px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' },
  ctaDeco2: { position: 'absolute', bottom: '-80px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' },
  ctaTitle: { fontSize: '32px', fontWeight: '800', color: '#fff', letterSpacing: '-0.7px', marginBottom: '14px', fontFamily: "'Outfit',sans-serif" },
  ctaSub: { fontSize: '16px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', lineHeight: '1.65' },
  ctaButtons: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnP: { backgroundColor: '#fff', color: '#2563EB', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', transition: 'all 0.2s' },
  ctaBtnS: { backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', padding: '13px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.3)', transition: 'background 0.15s' },

  // FOOTER
  footer: { backgroundColor: '#0D1E32', padding: '56px 48px 0' },
  footerInner: { maxWidth: '1240px', margin: '0 auto', display: 'flex', gap: '60px', paddingBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  footerLogo: { fontSize: '24px', fontWeight: '700', color: '#fff', fontFamily: "'Outfit',sans-serif" },
  footerTagline: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '6px' },
  footerCols: { display: 'flex', gap: '56px', flex: 1, justifyContent: 'flex-end' },
  footerCol: { display: 'flex', flexDirection: 'column', gap: '10px' },
  footerColTitle: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '4px' },
  footerLink: { fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.15s' },
  footerBottom: { maxWidth: '1240px', margin: '0 auto', padding: '18px 0', fontSize: '12px', color: 'rgba(255,255,255,0.25)' },
};