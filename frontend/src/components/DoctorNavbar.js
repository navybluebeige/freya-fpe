import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { id: 'dashboard',    label: 'Tableau de bord', path: '/doctor' },
  { id: 'appointments', label: 'Rendez-vous',     path: '/doctor/appointments' },
  { id: 'patients',     label: 'Mes patients',    path: '/doctor/patients' },
  { id: 'messages',     label: 'Messages',        path: '/doctor/messages' },
  { id: 'availability', label: 'Disponibilités',  path: '/doctor/availability' },
  { id: 'profile',      label: 'Mon profil',      path: '/doctor/profile' },
];

const MenuIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LogoutIcon= () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

export default function DoctorNavbar({ active }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  const firstName = user?.firstName || user?.first_name || 'Médecin';
  const lastName  = user?.lastName  || user?.last_name  || '';
  const initials  = `${firstName[0] || 'M'}${lastName[0] || ''}`.toUpperCase();

  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Déconnecté !'); };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-3">
          <Link to="/doctor" className="text-2xl font-extrabold text-primary-600 tracking-tight shrink-0 no-underline">Freya</Link>

          <div className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto">
            {NAV_LINKS.map(link => (
              <Link key={link.id} to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap no-underline transition-colors ${
                  active === link.id ? 'font-semibold text-primary-600 bg-primary-50' : 'font-medium text-slate-500 hover:text-primary-600 hover:bg-primary-50'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <NotificationBell />

            {/* User menu (desktop) */}
            <div className="hidden lg:block relative" ref={userRef}>
              <button onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{firstName}</div>
                  <div className="text-[10px] text-slate-400">Médecin</div>
                </div>
              </button>
              {userOpen && (
                <div className="absolute top-12 right-0 w-56 bg-white rounded-2xl border border-slate-200 shadow-dropdown z-50 overflow-hidden" onClick={() => setUserOpen(false)}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{initials}</div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{firstName} {lastName}</div>
                      <div className="text-xs text-slate-400">{user?.email}</div>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link to="/doctor/profile" className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 no-underline">Mon profil</Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer border-0 bg-transparent font-sans">
                      <LogoutIcon /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">{initials}</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Dr. {firstName} {lastName}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>
            <div className="py-2">
              {NAV_LINKS.map(link => (
                <Link key={link.id} to={link.path} onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-5 py-3.5 text-sm font-semibold no-underline transition-colors border-l-4 ${
                    active === link.id ? 'text-primary-600 bg-primary-50 border-primary-600' : 'text-slate-700 border-transparent hover:bg-slate-50'
                  }`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-slate-100">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-200 bg-red-50 rounded-xl py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-red-100 transition-colors">
                <LogoutIcon /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
