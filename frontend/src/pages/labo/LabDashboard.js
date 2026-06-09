import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { laboAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import LabNavbar from '../../components/LabNavbar';

const FlaskIcon = ({ size = 20, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6v8l3.5 6A2 2 0 0 1 16.76 20H7.24a2 2 0 0 1-1.74-2.99L9 11V3z"/>
    <line x1="6" y1="3" x2="18" y2="3"/>
  </svg>
);
const MapIcon = ({ size = 20, color = '#059669' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const PhoneIcon = ({ size = 20, color = '#7C3AED' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ANALYSES_TARIFS = [
  { cat: 'Hématologie',   items: [{ nom: 'NFS (Numération Formule Sanguine)', prix: 350, delai: '2h' }, { nom: 'Groupe Sanguin + Rhésus', prix: 300, delai: '1h' }, { nom: 'VS (Vitesse de Sédimentation)', prix: 200, delai: '2h' }] },
  { cat: 'Biochimie',     items: [{ nom: 'Glycémie à jeun', prix: 250, delai: '1h' }, { nom: 'Bilan lipidique complet', prix: 800, delai: '3h' }, { nom: 'Créatinine + Urée', prix: 500, delai: '2h' }, { nom: 'Transaminases (ASAT/ALAT)', prix: 600, delai: '3h' }] },
  { cat: 'Sérologie',     items: [{ nom: 'VIH 1+2 (Ag/Ac)', prix: 800, delai: '24h' }, { nom: 'Hépatite B (AgHBs)', prix: 700, delai: '24h' }, { nom: 'H. pylori (sérologie)', prix: 750, delai: '24h' }] },
  { cat: 'Hormonologie',  items: [{ nom: 'TSH ultra-sensible', prix: 900, delai: '24h' }, { nom: 'T3 + T4 libres', prix: 1200, delai: '24h' }, { nom: 'FSH / LH', prix: 1000, delai: '24h' }] },
  { cat: 'Microbiologie', items: [{ nom: 'ECBU (Examen Cytobactériologique)', prix: 600, delai: '48h' }, { nom: 'Coproculture', prix: 700, delai: '48h' }] },
];

export default function LabDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [clinic,  setClinic]  = useState(null);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([laboAPI.getProfile(), laboAPI.getStats()])
      .then(([cRes, sRes]) => {
        if (cRes.status === 'fulfilled') setClinic(cRes.value.data);
        if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAnalyses = ANALYSES_TARIFS.reduce((a, c) => a + c.items.length, 0);

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center flex-col gap-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-9 h-9 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
      <p className="text-slate-500 text-sm">Chargement...</p>
    </div>
  );

  const statCards = [
    { Icon: FlaskIcon, iconColor: '#2563EB', bg: 'bg-primary-50', val: stats.pending      ?? 0, label: 'En attente', highlight: (stats.pending ?? 0) > 0 },
    { Icon: MapIcon,   iconColor: '#059669', bg: 'bg-green-50',   val: stats.appointments ?? 0, label: 'Total RDV' },
    { Icon: PhoneIcon, iconColor: '#7C3AED', bg: 'bg-violet-50',  val: stats.ratingAvg    ? `${Number(stats.ratingAvg).toFixed(1)}/5` : '—', label: 'Note' },
  ];

  const quickLinks = [
    { label: 'Rendez-vous',          sub: 'Confirmer & envoyer résultats', path: '/labo/appointments', highlight: true },
    { label: 'Gérer les analyses',   sub: 'Tarifs et descriptions',         path: '/labo/analyses' },
    { label: 'Mon profil',           sub: 'Informations du laboratoire',    path: '/labo/profile' },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <LabNavbar active="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Hero */}
        <div className="rounded-2xl p-8 mb-6 flex justify-between items-center gap-5 text-white" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)' }}>
          <div>
            <div className="text-xl md:text-2xl font-extrabold tracking-tight mb-1">
              Bienvenue, <span className="text-blue-200">{clinic?.name || user?.firstName}</span>
            </div>
            <div className="text-sm text-blue-200 mb-3">
              {clinic?.address ? `${clinic.address}, ${clinic.wilaya}` : clinic?.wilaya || 'Algérie'}
            </div>
            <div className="text-[15px] text-white/85">
              Gérez votre laboratoire depuis votre espace professionnel
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-6 py-5 rounded-xl min-w-[220px] shrink-0">
            <div className="text-[10px] uppercase text-white/55 tracking-widest mb-3">Informations</div>
            {clinic?.phone && <div className="text-sm text-white/80 mb-1">{clinic.phone}</div>}
            {clinic?.email && <div className="text-sm text-white/80 mb-3">{clinic.email}</div>}
            <button
              onClick={() => navigate('/labo/profile')}
              className="w-full bg-white text-primary-700 border-0 px-4 py-1.5 rounded-lg text-sm font-bold cursor-pointer font-sans hover:bg-primary-50 transition-colors"
            >
              Modifier le profil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-3.5 mb-6">
          {statCards.map(({ Icon, iconColor, bg, val, label, highlight }, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 flex flex-col gap-2.5 shadow-card border transition-all hover:-translate-y-0.5 ${highlight ? 'border-primary-300 ring-1 ring-primary-100' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon color={iconColor} size={18} />
              </div>
              <div className={`text-2xl font-extrabold tracking-tight truncate ${highlight ? 'text-primary-600' : 'text-slate-900'}`}>{val}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Alerte RDV en attente */}
        {(stats.pending ?? 0) > 0 && (
          <div
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 cursor-pointer hover:bg-amber-100 transition-colors"
            onClick={() => navigate('/labo/appointments')}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <FlaskIcon size={16} color="#D97706" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-800">
                {stats.pending} demande{stats.pending > 1 ? 's' : ''} d'analyse en attente de confirmation
              </div>
              <div className="text-xs text-amber-600">Cliquez pour gérer les rendez-vous</div>
            </div>
            <div className="text-amber-600 text-sm font-semibold">Voir →</div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* Tableau d'analyses */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="text-sm font-bold text-slate-900">Nos analyses — Tarifs</div>
              <Link to="/labo/analyses" className="text-xs text-primary-600 font-semibold no-underline">Gérer</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Examen</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Délai</th>
                    <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {ANALYSES_TARIFS.slice(0, 3).flatMap(cat =>
                    cat.items.slice(0, 2).map((item, j) => (
                      <tr key={`${cat.cat}-${j}`} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-800">{item.nom}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{item.delai}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{item.prix} DA</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accès rapides */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <div className="text-sm font-bold text-slate-900 mb-3">Accès rapide</div>
              <div className="flex flex-col gap-2">
                {quickLinks.map(({ label, sub, path, highlight }, i) => (
                  <Link
                    key={i}
                    to={path}
                    className={`flex items-center gap-3 p-3 rounded-xl border no-underline transition-all ${
                      highlight
                        ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
                        : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-primary-300 hover:bg-primary-50/50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`text-[13px] font-semibold ${highlight ? 'text-white' : 'text-slate-900'}`}>{label}</div>
                      <div className={`text-[11px] ${highlight ? 'text-primary-200' : 'text-slate-500'}`}>{sub}</div>
                    </div>
                    <ChevronRight />
                  </Link>
                ))}
              </div>
            </div>

            {/* Horaires */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <div className="text-sm font-bold text-slate-900 mb-3">Horaires d'ouverture</div>
              <div className="space-y-1.5">
                {[
                  { j: 'Sam – Jeu', h: '07h30 – 19h00' },
                  { j: 'Vendredi', h: 'Fermé', closed: true },
                ].map(({ j, h, closed }, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-medium text-slate-600">{j}</span>
                    <span className={closed ? 'text-red-500 font-semibold' : 'text-primary-600 font-semibold'}>{h}</span>
                  </div>
                ))}
                {clinic?.description && (
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{clinic.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
