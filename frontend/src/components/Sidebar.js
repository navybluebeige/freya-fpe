import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const patientLinks = [
  { to: '/patient',              icon: '🏠', label: 'Accueil',           exact: true },
  { to: '/patient/appointments', icon: '📅', label: 'Mes rendez-vous' },
  { to: '/patient/messages',     icon: '💬', label: 'Messagerie' },
  { to: '/patient/dossier',      icon: '📁', label: 'Dossier médical' },
  { to: '/patient/favoris',      icon: '❤️', label: 'Favoris' },
  { to: '/patient/profile',      icon: '👤', label: 'Mon profil' },
];

const doctorLinks = [
  { to: '/doctor',              icon: '🏠', label: 'Tableau de bord', exact: true },
  { to: '/doctor/appointments', icon: '📅', label: 'Rendez-vous' },
  { to: '/doctor/messages',     icon: '💬', label: 'Messagerie' },
  { to: '/doctor/patients',     icon: '👥', label: 'Mes patients' },
  { to: '/doctor/availability', icon: '🕐', label: 'Disponibilités' },
  { to: '/doctor/profile',      icon: '👨‍⚕️', label: 'Mon profil' },
];

const adminLinks = [
  { to: '/admin',         icon: '📊', label: 'Tableau de bord', exact: true },
  { to: '/admin/doctors', icon: '👨‍⚕️', label: 'Médecins' },
  { to: '/admin/clinics', icon: '🏥', label: 'Cliniques & Labos' },
];

const css = `
  .sb { width: 240px; background: #0F172A; position: fixed; top: 0; left: 0; bottom: 0; display: flex; flex-direction: column; z-index: 50; overflow-y: auto; border-right: 1px solid rgba(255,255,255,0.06); }
  .sb::-webkit-scrollbar { width: 3px; }
  .sb::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

  .sb-logo { padding: 20px 20px 16px; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 2px; }
  .sb-logo-dot { color: #0D9488; }

  .sb-user { margin: 10px 10px 6px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,0.07); }
  .sb-user-av { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #065A50, #0D9488); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .sb-user-name { color: #fff; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sb-user-role { color: rgba(255,255,255,0.35); font-size: 10px; text-transform: capitalize; margin-top: 1px; }

  .sb-section { padding: 14px 20px 5px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.2); }

  .sb-nav { flex: 1; padding: 4px 8px; }

  .sb-link { display: flex; align-items: center; gap: 9px; padding: 9px 11px; margin: 1px 0; border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; background: none; width: 100%; text-align: left; text-decoration: none; font-family: inherit; }
  .sb-link:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .sb-link.active { background: rgba(13,148,136,0.18); color: #2DD4BF; border-color: rgba(13,148,136,0.25); }
  .sb-link-icon { width: 16px; text-align: center; flex-shrink: 0; font-size: 14px; }
  .sb-badge { margin-left: auto; background: #EF4444; color: #fff; font-size: 10px; font-weight: 700; min-width: 17px; height: 17px; border-radius: 9px; padding: 0 4px; display: flex; align-items: center; justify-content: center; }

  .sb-bottom { padding: 8px; border-top: 1px solid rgba(255,255,255,0.07); }

  .sb-public { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 8px; color: rgba(255,255,255,0.35); font-size: 12px; text-decoration: none; transition: color 0.15s; }
  .sb-public:hover { color: rgba(255,255,255,0.7); }

  .sb-logout { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 8px; color: rgba(255,255,255,0.35); font-size: 12px; background: none; border: none; cursor: pointer; width: 100%; text-align: left; transition: all 0.15s; font-family: inherit; }
  .sb-logout:hover { background: rgba(239,68,68,0.1); color: #FCA5A5; }
`;

export default function Sidebar({ unreadMessages = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const links = user?.role === 'doctor' ? doctorLinks
              : user?.role === 'admin'  ? adminLinks
              : patientLinks;

  const initials = `${user?.firstName?.[0] || user?.first_name?.[0] || '?'}${user?.lastName?.[0] || user?.last_name?.[0] || ''}`.toUpperCase();
  const fullName = `${user?.firstName || user?.first_name || ''} ${user?.lastName || user?.last_name || ''}`.trim();
  const role     = user?.role || 'patient';

  const handleLogout = () => {
    logout();
    toast.success('Déconnecté avec succès');
    navigate('/');
  };

  return (
    <aside className="sb">
      <style>{css}</style>

      {/* Logo */}
      <div 
        className="sb-logo" 
        onClick={() => navigate(links[0].to)} 
        style={{ cursor: 'pointer' }}
      >
        Freya<span className="sb-logo-dot">.</span>
      </div>

      {/* User */}
      <div className="sb-user">
        <div className="sb-user-av">{initials}</div>
        <div style={{ overflow: 'hidden' }}>
          <div className="sb-user-name">{fullName}</div>
          <div className="sb-user-role">{role}</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sb-section">Navigation</div>
      <nav className="sb-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.exact}
            className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
          >
            <span className="sb-link-icon">{link.icon}</span>
            {link.label}
            {link.label === 'Messagerie' && unreadMessages > 0 && (
              <span className="sb-badge">{unreadMessages}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sb-bottom">
        <a href="/" className="sb-public">
          <span>🌐</span> Site public
        </a>
        <button onClick={handleLogout} className="sb-logout">
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}
