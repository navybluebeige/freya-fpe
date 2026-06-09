import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { notificationsAPI } from '../../services/api';

const typeConfig = {
  registration:       { bg: '#E8F4FD', label: 'Inscription' },
  new_appointment:    { bg: '#DBEAFE', label: 'Rendez-vous' },
  appointment_update: { bg: '#FEF3C7', label: 'Mise à jour RDV' },
  new_message:        { bg: '#F3E8FF', label: 'Message' },
  new_record:         { bg: '#ECFDF5', label: 'Document' },
  reminder:           { bg: '#FEF3C7', label: 'Rappel' },
  admin_decision:     { bg: '#F1F5F9', label: 'Administratif' },
};

export default function PatientNotifications() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pendingSound, setPendingSound] = useState(false);

  const firstName = user?.firstName || user?.first_name || 'Patient';
  const lastName = user?.lastName || user?.last_name || '';
  const initials = `${firstName[0] || 'P'}${lastName[0] || ''}`.toUpperCase();

  const navLinks = [
    { id: 'accueil',  label: 'Accueil',            path: '/patient' },
    { id: 'rdv',      label: 'Mes rendez-vous',    path: '/patient/appointments' },
    { id: 'medecins', label: 'Trouver un médecin', path: '/doctors' },
    { id: 'messages', label: 'Messages',            path: '/patient/messages' },
    { id: 'dossier',  label: 'Dossier médical',    path: '/patient/dossier' },
  ];

  const playNotify = (muted = isMuted) => {
    if (muted) return;
    const audio = new Audio('/assets/sounds/notificationtest.mp3');
    audio.play()
      .then(() => {
        console.log("Son joué !");
        setPendingSound(false);
      })
      .catch(err => {
        console.warn("Autoplay bloqué, son mis en attente :", err);
        setPendingSound(true);
      });
  };

  // Joue le son dès que l'utilisateur interagit avec la page (si son en attente)
  useEffect(() => {
    if (!pendingSound || isMuted) return;
    const handleFirstInteraction = () => {
      const audio = new Audio('/assets/sounds/notificationtest.mp3');
      audio.play()
        .then(() => {
          console.log("Son joué après interaction !");
          setPendingSound(false);
        })
        .catch(err => console.warn("Toujours bloqué :", err));
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [pendingSound, isMuted]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll();
        const data = res.data?.notifications || res.data || [];
        setNotifications(data);
        const hasUnread = data.some(n => !n.isRead);
        if (hasUnread) {
          playNotify();
        }
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors du chargement des notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Déconnecté avec succès');
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={s.root} onClick={() => setShowUserMenu(false)}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-lnk:hover { background-color: #F9FBFC !important; }
        .notif-item:hover { background-color: #F9FBFC !important; cursor: pointer; }
        .filter-btn:hover { background-color: #F1F5F9 !important; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeSlide 0.3s ease both; }
        .skeleton { animation: pulse 1.5s ease infinite; background: #E2E8F0; border-radius: 8px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.navInner}>
          <Link to="/" style={s.logo}>Frey<span style={s.logoAccent}>a</span></Link>
          <div style={s.navLinks}>
            {navLinks.map(link => (
              <Link key={link.id} to={link.path} className="nav-lnk" style={s.navLink(false)}>
                {link.label}
              </Link>
            ))}
          </div>
          <div style={s.navRight}>
            <button style={s.ctaBtn} onClick={() => navigate('/doctors')}>Prendre RDV</button>
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button style={s.userBtn} onClick={() => setShowUserMenu(v => !v)}>
                <div style={s.userAvatar}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>{firstName}</div>
                  <div style={{ fontSize: '10px', color: '#8A9BAA' }}>Patient</div>
                </div>
              </button>
              {showUserMenu && (
                <div style={s.userDropdown}>
                  <div style={s.dropdownTop}>
                    <div style={s.userAvatar}>{initials}</div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700' }}>{firstName} {lastName}</div>
                      <div style={{ fontSize: '11px', color: '#8A9BAA' }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={s.dropdownItem} onClick={() => navigate('/patient/profile')}>👤 Mon profil</div>
                    <div style={s.dropdownItem} onClick={handleLogout}>🚪 Déconnexion</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>

        {/* HEADER PAGE */}
        <div className="fade-in flex flex-wrap gap-3 justify-between items-start mb-7">
          <div>
            <h1 style={s.pageTitle}>Notifications</h1>
            <p style={s.pageSubtitle}>
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              style={{ ...s.markAllBtn, borderColor: isMuted ? '#94A3B8' : '#0061A8', color: isMuted ? '#94A3B8' : '#0061A8' }}
              onClick={(e) => {
                e.stopPropagation();
                const newMuteState = !isMuted;
                setIsMuted(newMuteState);
                if (!newMuteState) {
                  playNotify(false);
                }
              }}
            >
              {isMuted ? 'Muet' : 'Son activé'}
            </button>

            {unreadCount > 0 && (
              <button style={s.markAllBtn} onClick={handleMarkAllRead}>
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">

          {/* COLONNE GAUCHE — FILTRES */}
          <div className="fade-in lg:sticky lg:top-[85px]">
            <div style={s.sideCard}>
              <div style={s.sideTitle}>Filtrer par</div>
              {[
                { id: 'all',                label: 'Toutes' },
                { id: 'unread',             label: 'Non lues' },
                { id: 'new_appointment',    label: 'Rendez-vous' },
                { id: 'new_message',        label: 'Messages' },
                { id: 'registration',       label: 'Inscription' },
                { id: 'reminder',           label: 'Rappels' },
                { id: 'new_record',         label: 'Documents' },
              ].map(f => (
                <button
                  key={f.id}
                  className="filter-btn"
                  style={s.filterBtn(filter === f.id)}
                  onClick={() => setFilter(f.id)}
                >
                  <span>{f.label}</span>
                  {f.id === 'unread' && unreadCount > 0 && (
                    <span style={s.filterBadge}>{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE — LISTE */}
          <div style={s.content}>
            {loading ? (
              <div style={s.notifCard}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '12px' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '8px' }} />
                      <div className="skeleton" style={{ height: '12px', width: '90%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={s.emptyState} className="fade-in">
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B4A', marginBottom: '8px' }}>
                  Aucune notification
                </div>
                <div style={{ fontSize: '13px', color: '#8A9BAA' }}>
                  {filter === 'unread' ? 'Vous avez tout lu !' : 'Aucune notification dans cette catégorie.'}
                </div>
              </div>
            ) : (
              <div style={s.notifCard} className="fade-in">
                {filtered.map((n, i) => {
                  const cfg = typeConfig[n.type] || { bg: '#F1F5F9', label: 'Notification' };
                  return (
                    <div
                      key={n.id || i}
                      className="notif-item"
                      style={s.notifItem(n.isRead)}
                      onClick={() => !n.isRead && handleMarkRead(n.id)}
                    >
                      <div style={{ ...s.notifIcon, background: cfg.bg }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontSize: '13px', fontWeight: n.isRead ? '500' : '700', color: '#1A2B4A' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8A9BAA', flexShrink: 0, marginLeft: '12px' }}>
                            {formatDate(n.createdAt)}
                          </div>
                        </div>
                        {n.body && (
                          <div style={{ fontSize: '12px', color: '#5A6B7A', lineHeight: '1.5' }}>{n.body}</div>
                        )}
                        <div style={{ marginTop: '6px' }}>
                          <span style={{ ...s.typeBadge, background: cfg.bg }}>{cfg.label}</span>
                        </div>
                      </div>
                      {!n.isRead && <div style={s.unreadDot} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

const s = {
  root: { fontFamily: "'Sora', sans-serif", backgroundColor: '#F9FBFC', minHeight: '100vh' },
  navbar: { backgroundColor: '#fff', borderBottom: '1px solid #D9E4ED', position: 'sticky', top: 0, zIndex: 100 },
  navInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', height: '65px', display: 'flex', alignItems: 'center', gap: '20px' },
  logo: { fontSize: '22px', fontWeight: '800', color: '#1A2B4A', textDecoration: 'none' },
  logoAccent: { color: '#0061A8' },
  navLinks: { display: 'flex', gap: '5px', flex: 1 },
  navLink: (active) => ({ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: active ? '#0061A8' : '#64748B', textDecoration: 'none', backgroundColor: active ? '#F0FDFA' : 'transparent', fontWeight: active ? '600' : '400' }),
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  ctaBtn: { backgroundColor: '#0061A8', color: '#fff', padding: '9px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none' },
  userBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px', borderRadius: '10px', border: '1px solid #D9E4ED', backgroundColor: '#fff', cursor: 'pointer' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#0061A8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' },
  userDropdown: { position: 'absolute', top: '50px', right: 0, width: '220px', backgroundColor: '#fff', border: '1px solid #D9E4ED', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', zIndex: 200 },
  dropdownTop: { padding: '15px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '10px', alignItems: 'center' },
  dropdownItem: { padding: '10px 15px', fontSize: '13px', cursor: 'pointer', borderRadius: '8px' },

  main: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  pageTitle: { fontSize: '26px', fontWeight: '800', color: '#1A2B4A', marginBottom: '4px' },
  pageSubtitle: { fontSize: '14px', color: '#5A6B7A' },
  markAllBtn: { backgroundColor: '#fff', border: '1.5px solid #0061A8', color: '#0061A8', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },

  layout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start' },

  sidebar: { position: 'sticky', top: '85px' },
  sideCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #D9E4ED', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  sideTitle: { fontSize: '11px', fontWeight: '700', color: '#8A9BAA', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', padding: '0 8px' },
  filterBtn: (active) => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px',
    border: 'none', backgroundColor: active ? '#F0FDFA' : 'transparent',
    color: active ? '#0061A8' : '#64748B', fontSize: '13px', fontWeight: active ? '700' : '500',
    cursor: 'pointer', textAlign: 'left', width: '100%',
  }),
  filterBadge: { marginLeft: 'auto', backgroundColor: '#0061A8', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '20px' },

  content: {},
  notifCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #D9E4ED', overflow: 'hidden' },
  notifItem: (read) => ({
    padding: '16px 20px', borderBottom: '1px solid #F1F5F9',
    display: 'flex', gap: '14px', alignItems: 'flex-start',
    backgroundColor: read ? '#fff' : '#F0FDFA',
    transition: 'background-color 0.15s',
  }),
  notifIcon: { width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  typeBadge: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', color: '#475569' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#0061A8', flexShrink: 0, marginTop: '6px' },

  emptyState: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #D9E4ED', padding: '60px 20px', textAlign: 'center' },
};