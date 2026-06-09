import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LabNavbar from '../../components/LabNavbar';
import { notificationsAPI } from '../../services/api';

const TYPE_CONFIG = {
  new_appointment:    { label: 'Rendez-vous' },
  appointment_update: { label: 'Mise à jour RDV' },
  new_message:        { label: 'Message' },
  new_record:         { label: 'Document' },
  reminder:           { label: 'Rappel' },
  registration:       { label: 'Inscription' },
};

export default function LabNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    notificationsAPI.getAll()
      .then(res => {
        setNotifications(res.data?.notifications || []);
      })
      .catch(() => toast.error('Erreur chargement notifications'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Toutes les notifications lues');
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const formatDate = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <LabNavbar active="notifications" />

      <div className="max-w-4xl mx-auto px-4 md:px-4 md:px-6 py-5 md:py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-primary-600 border border-primary-200 bg-white rounded-xl px-4 py-2 hover:bg-primary-50 transition-colors cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { id: 'all',             label: 'Toutes' },
            { id: 'unread',          label: `Non lues${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
            { id: 'new_appointment', label: 'Rendez-vous' },
            { id: 'new_message',     label: 'Messages' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
                filter === f.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-slate-600 font-semibold">Aucune notification</div>
              <div className="text-sm text-slate-400 mt-1">
                {filter === 'unread' ? 'Vous avez tout lu !' : 'Aucune notification dans cette catégorie.'}
              </div>
            </div>
          ) : (
            filtered.map(n => {
              const cfg = TYPE_CONFIG[n.type] || { label: 'Notification' };
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`flex gap-4 px-6 py-4 border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-primary-50/30' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm leading-snug ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.title}
                    </div>
                    {n.body && (
                      <div className="text-xs text-slate-500 mt-1">{n.body}</div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{cfg.label}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
