import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const TYPE_ICONS = {
  new_appointment:    '📅',
  appointment_update: '🔄',
  new_message:        '💬',
  new_record:         '📄',
  reminder:           '⏰',
  registration:       '🎉',
};

const NOTIF_PATHS = {
  patient:    '/patient/notifications',
  doctor:     '/doctor/notifications',
  laboratory: '/labo/notifications',
};

export default function NotificationBell() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const prevUnreadRef = useRef(null);
  const dropdownRef = useRef(null);

  const playSound = useCallback(() => {
    try {
      const audio = new Audio('/assets/sounds/notificationtest.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsAPI.getAll();
      const list = res.data?.notifications || [];
      const count = res.data?.unread ?? list.filter(n => !n.isRead).length;
      if (prevUnreadRef.current !== null && count > prevUnreadRef.current) {
        playSound();
      }
      prevUnreadRef.current = count;
      setNotifications(list.slice(0, 8));
      setUnread(count);
    } catch {}
  }, [user, playSound]);

  useEffect(() => {
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifs]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnread(prev => {
        const next = Math.max(0, prev - 1);
        prevUnreadRef.current = next;
        return next;
      });
    } catch {}
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
      prevUnreadRef.current = 0;
    } catch {}
  };

  const formatDate = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div ref={dropdownRef} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
        title="Notifications"
      >
        <svg
          width="17" height="17" viewBox="0 0 24 24"
          fill={unread > 0 ? '#2563EB' : 'none'}
          stroke={unread > 0 ? '#2563EB' : '#64748B'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-80 bg-white rounded-2xl border border-slate-200 shadow-dropdown z-[200] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Notifications
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                  {unread} non lue{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-primary-600 font-semibold hover:text-primary-800 cursor-pointer border-0 bg-transparent font-sans"
                >
                  Tout lire
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                  navigate(NOTIF_PATHS[user?.role] || '/patient/notifications');
                }}
                className="text-[11px] text-slate-400 font-medium hover:text-slate-600 cursor-pointer border-0 bg-transparent font-sans"
              >
                Voir tout →
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <div className="text-2xl mb-2">🔕</div>
                Aucune notification
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                >
                  <span className="text-base shrink-0 mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] leading-snug ${!n.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{n.body}</div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1">{formatDate(n.createdAt)}</div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
