import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

const UserIcon   = ({ color = '#2563EB', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const DoctorIcon = ({ color = '#059669', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ClockIcon  = ({ color = '#F59E0B', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const CalendarIcon = ({ color = '#2563EB', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const HospitalIcon = ({ color = '#7C3AED', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const BarChartIcon = ({ color = '#0284C7', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const statItems = stats ? [
    { Icon: UserIcon,    iconColor: '#2563EB', bg: 'bg-primary-50',  val: stats.totalPatients,     label: 'Patients inscrits',     highlight: false },
    { Icon: DoctorIcon,  iconColor: '#059669', bg: 'bg-green-50',    val: stats.approvedDoctors,   label: 'Médecins actifs',       highlight: false },
    { Icon: ClockIcon,   iconColor: '#F59E0B', bg: 'bg-amber-50',    val: stats.pendingDoctors,    label: 'En attente validation', highlight: (stats.pendingDoctors ?? 0) > 0 },
    { Icon: CalendarIcon,iconColor: '#2563EB', bg: 'bg-primary-50',  val: stats.totalAppointments, label: 'RDV total',             highlight: false },
    { Icon: HospitalIcon,iconColor: '#7C3AED', bg: 'bg-violet-50',   val: stats.totalLabs,         label: 'Laboratoires',          highlight: false },
    { Icon: BarChartIcon,iconColor: '#0284C7', bg: 'bg-sky-50',      val: stats.appointmentsToday, label: "RDV aujourd'hui",       highlight: false },
  ] : [];

  const quickActions = [
    { label: 'Valider les médecins', path: '/admin/doctors',      primary: true,  pending: stats?.pendingDoctors },
    { label: 'Gérer les cliniques',  path: '/admin/clinics',      primary: false },
    { label: 'Gérer les patients',   path: '/admin/patients',     primary: false },
    { label: 'Tous les rendez-vous', path: '/admin/appointments', primary: false },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="dashboard" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Vue globale de la plateforme Freya
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {statItems.map(({ Icon, iconColor, bg, val, label, highlight }, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-5 flex flex-col gap-2.5 shadow-card border transition-transform hover:-translate-y-0.5 ${highlight ? 'border-primary-200' : 'border-slate-200'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                  <Icon color={iconColor} size={18} />
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${highlight ? 'text-primary-600' : 'text-slate-900'}`}>
                  {val ?? '—'}
                </div>
                <div className="text-xs text-slate-500 font-medium leading-snug">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Actions rapides</h3>
          <div className="flex gap-2.5 flex-wrap">
            {quickActions.map(({ label, path, primary, pending }, i) => (
              <button
                key={i}
                onClick={() => navigate(path)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-0 font-sans transition-all hover:-translate-y-0.5 ${
                  primary
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {primary && <CheckIcon />}
                {label}
                {primary && pending > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
