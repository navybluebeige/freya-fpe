import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import DoctorNavbar from '../../components/DoctorNavbar';

const CalendarIcon = ({ color = '#2563EB', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = ({ color = '#F59E0B', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const UsersIcon = ({ color = '#2563EB', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const MessageIcon = ({ color = '#7C3AED', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const StarIcon = ({ color = '#F59E0B', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const BarChartIcon = ({ color = '#059669', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const STATUS_CLASSES = {
  pending:   'bg-amber-50 text-amber-800',
  confirmed: 'bg-green-50 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-50 text-red-800',
};
const STATUS_LABELS = { pending: 'En attente', confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé' };

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const firstName = user?.firstName || user?.first_name || 'Médecin';
  const lastName  = user?.lastName  || user?.last_name  || '';

  const loadStats = () => {
    doctorsAPI.getDashboardStats()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
    // Auto-refresh toutes les 30 secondes pour voir les nouveaux RDV
    const timer = setInterval(loadStats, 30000);
    return () => clearInterval(timer);
  }, []);

  const stats    = data?.stats    || {};
  const upcoming = data?.upcoming || [];

  const statCards = [
    { Icon: CalendarIcon, iconColor: '#2563EB', bg: 'bg-primary-50',  val: stats.todayAppointments ?? stats.today_appointments ?? 0, label: "RDV aujourd'hui", highlight: false },
    { Icon: ClockIcon,    iconColor: '#F59E0B', bg: 'bg-amber-50',    val: stats.pendingAppointments ?? stats.pending_appointments ?? 0, label: 'En attente', highlight: (stats.pendingAppointments || stats.pending_appointments) > 0 },
    { Icon: UsersIcon,    iconColor: '#2563EB', bg: 'bg-primary-50',  val: stats.totalPatients ?? stats.total_patients ?? 0, label: 'Patients total', highlight: false },
    { Icon: MessageIcon,  iconColor: '#7C3AED', bg: 'bg-violet-50',   val: stats.unreadMessages ?? stats.unread_messages ?? 0, label: 'Messages non lus', highlight: (stats.unreadMessages || stats.unread_messages) > 0 },
    { Icon: StarIcon,     iconColor: '#F59E0B', bg: 'bg-amber-50',    val: stats.ratingAvg ? `${parseFloat(stats.ratingAvg).toFixed(1)}/5` : '—', label: 'Note moyenne', highlight: false },
    { Icon: BarChartIcon, iconColor: '#059669', bg: 'bg-green-50',    val: stats.totalAppointments ?? stats.total_appointments ?? 0, label: 'RDV total', highlight: false },
  ];

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center flex-col gap-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-9 h-9 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
      <p className="text-slate-500 text-sm">Chargement...</p>
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <DoctorNavbar active="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Bonjour, Dr. {lastName}</h1>
            <p className="text-sm text-slate-500 mt-1 capitalize">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · Mise à jour automatique toutes les 30s
            </p>
          </div>
          <button
            onClick={loadStats}
            className="text-sm text-primary-600 border border-primary-200 bg-white rounded-xl px-4 py-2 font-semibold cursor-pointer hover:bg-primary-50 transition-colors"
          >
            Actualiser
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map(({ Icon, iconColor, bg, val, label, highlight }, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-5 flex flex-col gap-2.5 shadow-card border transition-transform hover:-translate-y-0.5 ${highlight ? 'border-primary-200' : 'border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon color={iconColor} size={18} />
              </div>
              <div className={`text-3xl font-extrabold tracking-tight ${highlight ? 'text-primary-600' : 'text-slate-900'}`}>{val}</div>
              <div className="text-xs text-slate-500 font-medium leading-snug">{label}</div>
            </div>
          ))}
        </div>

        {/* Alerte RDV en attente */}
        {(stats.pendingAppointments ?? 0) > 0 && (
          <div
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 cursor-pointer hover:bg-amber-100 transition-colors"
            onClick={() => navigate('/doctor/appointments')}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <ClockIcon color="#D97706" size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-amber-800">
                {stats.pendingAppointments} rendez-vous en attente de confirmation
              </div>
              <div className="text-xs text-amber-600">Cliquez pour confirmer ou refuser</div>
            </div>
            <div className="text-amber-600 text-sm font-semibold">Gérer →</div>
          </div>
        )}

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-slate-900">Prochains rendez-vous</h3>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="text-sm font-semibold text-primary-600 bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 hover:bg-primary-50 transition-colors cursor-pointer font-sans"
            >
              Voir tout
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <CalendarIcon color="#CBD5E1" size={36} />
              <p className="text-slate-600 font-semibold text-sm">Aucun rendez-vous à venir</p>
              <p className="text-xs text-slate-400">Vos prochains créneaux apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Patient', 'Date', 'Heure', 'Motif', 'Statut'].map(h => (
                      <th key={h} className="text-left px-3.5 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(a => (
                    <tr key={a.id} className="group hover:bg-primary-50/40 transition-colors">
                      <td className="px-3.5 py-3.5 text-sm text-slate-900 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-[11px] font-bold text-primary-600 shrink-0">
                            {a.patient?.firstName?.[0]}{a.patient?.lastName?.[0]}
                          </div>
                          <span className="font-medium">{a.patient?.firstName} {a.patient?.lastName}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3.5 text-sm text-slate-700 border-b border-slate-100">
                        {new Date(a.appointmentDate || a.appointment_date).toLocaleDateString('fr-FR', { day:'numeric', month:'short' })}
                      </td>
                      <td className="px-3.5 py-3.5 text-sm font-bold text-slate-900 border-b border-slate-100">{a.appointmentTime || a.appointment_time}</td>
                      <td className="px-3.5 py-3.5 text-sm text-slate-500 border-b border-slate-100">{a.motif || '—'}</td>
                      <td className="px-3.5 py-3.5 border-b border-slate-100">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLASSES[a.status] || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[a.status] || a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
