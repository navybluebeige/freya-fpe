import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { appointmentsAPI, notificationsAPI } from '../../services/api';
import PatientNavbar from '../../components/PatientNavbar';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const CalendarIcon = ({ color = '#64748B', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = ({ color = '#64748B', size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UserIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const FolderIcon = ({ size = 16, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const STATUS_MAP = {
  pending:   { label: 'En attente', classes: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmé',   classes: 'bg-green-100 text-green-800' },
  completed: { label: 'Terminé',    classes: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Annulé',     classes: 'bg-red-100 text-red-800' },
};

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);

  const firstName = user?.firstName || user?.first_name || 'Patient';
  const lastName  = user?.lastName  || user?.last_name  || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, notifRes] = await Promise.allSettled([
          appointmentsAPI.getMyAppointments({ limit: 5 }),
          notificationsAPI.getAll(),
        ]);
        if (apptRes.status === 'fulfilled') setAppointments(Array.isArray(apptRes.value.data) ? apptRes.value.data : (apptRes.value.data?.appointments || []));
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data?.notifications || notifRes.value.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const nextAppt = upcoming[0];

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  const quickActions = [
    { label: 'Rechercher', sub: 'Spécialité ou nom',      path: '/doctors',               icon: <SearchIcon /> },
    { label: 'Mes RDV',    sub: 'Gérer mon agenda',       path: '/patient/appointments',  icon: <CalendarIcon color="#2563EB" size={16} /> },
    { label: 'Documents',  sub: 'Analyses & Ordonnances', path: '/patient/dossier',       icon: <FolderIcon /> },
    { label: 'Mon profil', sub: 'Gérer mes informations', path: '/patient/profile',       icon: <UserIcon size={16} color="#2563EB" /> },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen" onClick={() => setShowNotifs(false)}>
      <PatientNavbar active="accueil" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-6">

        {/* Search bar */}
        <div
          className="flex items-center gap-3 bg-white border border-slate-200 shadow-card rounded-xl px-4 py-3 mb-5 cursor-pointer hover:border-primary-300 transition-colors"
          onClick={() => navigate('/doctors')}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="Nom du médecin, spécialité, ville..."
            className="flex-1 border-none outline-none text-sm text-slate-900 bg-transparent font-sans cursor-pointer placeholder-slate-400"
            readOnly
          />
          <button
            className="bg-primary-600 text-white border-0 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer font-sans hover:bg-primary-700 transition-colors"
            onClick={e => { e.stopPropagation(); navigate('/doctors'); }}
          >
            Rechercher
          </button>
        </div>

        {/* Notification dropdown (floating) */}
        {showNotifs && (
          <div
            className="fixed top-20 right-6 w-80 bg-white border border-slate-200 rounded-2xl shadow-dropdown z-50 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadNotifs > 0 && (
                <button
                  className="text-[11px] text-primary-600 font-semibold bg-transparent border-0 cursor-pointer font-sans"
                  onClick={async () => {
                    await notificationsAPI.markAllRead();
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                  }}
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-sm">Aucune notification</div>
              ) : notifications.slice(0, 5).map((n, i) => (
                <div key={i} className={`px-4 py-3 border-b border-slate-50 flex gap-3 items-start ${n.isRead ? '' : 'bg-primary-50'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-primary-600'}`} />
                  <div className="flex-1">
                    <div className={`text-sm mb-0.5 ${n.isRead ? 'font-normal text-slate-900' : 'font-semibold text-slate-900'}`}>{n.title}</div>
                    {n.body && <div className="text-xs text-slate-500">{n.body}</div>}
                    <div className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="px-4 py-2.5 text-center text-sm text-primary-600 font-semibold cursor-pointer hover:bg-slate-50 transition-colors border-t border-slate-100"
              onClick={() => { setShowNotifs(false); navigate('/patient/notifications'); }}
            >
              Voir toutes les notifications
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="rounded-2xl p-6 md:p-8 mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-white" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #2563EB 100%)' }}>
          <div>
            <div className="text-xl md:text-2xl font-extrabold tracking-tight mb-1">
              Bonjour, <span className="text-blue-300">{firstName} {lastName}</span>
            </div>
            <div className="text-sm text-blue-200 mb-3 capitalize">{today}</div>
            <div className="text-[15px] text-white/85">
              {upcoming.length > 0
                ? <><span className="text-blue-300 font-bold">{upcoming.length}</span> rendez-vous à venir</>
                : 'Aucun rendez-vous prévu pour le moment'}
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-4 rounded-xl w-full md:min-w-64 md:w-auto shrink-0">
            {nextAppt ? (
              <>
                <div className="text-[10px] uppercase text-white/55 tracking-widest mb-2">Prochain rendez-vous</div>
                <div className="text-base font-bold mb-2">Dr. {nextAppt.doctor?.user?.firstName} {nextAppt.doctor?.user?.lastName}</div>
                <div className="flex items-center gap-2 text-xs text-white/75 flex-wrap">
                  <CalendarIcon color="rgba(255,255,255,0.7)" size={12} />
                  {formatDate(nextAppt.appointmentDate)}
                  <ClockIcon color="rgba(255,255,255,0.7)" size={12} />
                  {nextAppt.appointmentTime}
                </div>
                <span className={`inline-block mt-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_MAP[nextAppt.status]?.classes || 'bg-slate-100 text-slate-600'}`}>
                  {STATUS_MAP[nextAppt.status]?.label}
                </span>
              </>
            ) : (
              <>
                <div className="text-[10px] uppercase text-white/55 tracking-widest mb-2">Pas de rendez-vous</div>
                <div className="text-sm text-white/70 mb-3">Trouvez un médecin et prenez RDV en quelques clics</div>
                <button
                  onClick={() => navigate('/doctors')}
                  className="bg-white text-primary-700 border-0 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer font-sans hover:bg-primary-50 transition-colors"
                >
                  Trouver un médecin
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">

          {/* Left: Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-900">Prochains rendez-vous</div>
              <Link to="/patient/appointments" className="text-xs text-primary-600 font-semibold no-underline">Tout voir</Link>
            </div>
            {loading ? (
              <div className="h-28 bg-slate-100 rounded-xl animate-pulse" />
            ) : upcoming.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">Aucun rendez-vous à venir.</div>
            ) : (
              upcoming.map(appt => (
                <div key={appt.id} className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50 mb-2.5 cursor-pointer hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-primary-600">Dr</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900 mb-0.5">Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}</div>
                    <div className="text-xs text-slate-500 mb-1.5">{appt.doctor?.specialite}</div>
                    <div className="flex gap-1.5 items-center">
                      <span className="inline-flex items-center text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        <CalendarIcon size={10} />&nbsp;{formatDate(appt.appointmentDate)}
                      </span>
                      <span className="inline-flex items-center text-[11px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        <ClockIcon size={10} />&nbsp;{appt.appointmentTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_MAP[appt.status]?.classes || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_MAP[appt.status]?.label}
                    </span>
                    <button
                      className="bg-primary-50 border border-primary-200 text-primary-700 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer font-sans hover:bg-primary-100 transition-colors"
                      onClick={() => navigate('/patient/appointments')}
                    >
                      Gérer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
              <div className="text-sm font-bold text-slate-900 mb-3">Accès rapide</div>
              <div className="flex flex-col gap-2">
                {quickActions.map(({ label, sub, path, icon }, i) => (
                  <Link
                    key={i}
                    to={path}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 no-underline text-slate-900 hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">{icon}</div>
                    <div>
                      <div className="text-[13px] font-semibold">{label}</div>
                      <div className="text-[11px] text-slate-500">{sub}</div>
                    </div>
                    <ChevronRight />
                  </Link>
                ))}
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <ShieldIcon />
              <div>
                <div className="text-xs font-bold text-green-800 mb-1">Données Sécurisées</div>
                <div className="text-[11px] text-slate-600 leading-relaxed">Vos informations médicales sont protégées selon les normes de santé.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
