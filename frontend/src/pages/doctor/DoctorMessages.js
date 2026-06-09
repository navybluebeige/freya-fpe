import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { messagesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import DoctorNavbar from '../../components/DoctorNavbar';

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const MsgIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function fmtConvTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function DoctorMessages() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [newMsg,        setNewMsg]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [sending,       setSending]       = useState(false);
  const [search,        setSearch]        = useState('');
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const totalUnread = conversations.reduce((sum, c) => sum + (c._count?.messages || 0), 0);

  /* ─── Charger les conversations ─── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  /* ─── Auto-sélectionner conversation depuis navigation ─── */
  useEffect(() => {
    const convId = location.state?.convId;
    if (!convId || conversations.length === 0) return;
    const found = conversations.find(c => c.id === convId);
    if (found) setActiveConv(found);
  }, [conversations, location.state]);

  /* ─── Charger les messages ─── */
  useEffect(() => {
    if (!activeConv) return;
    messagesAPI.getMessages(activeConv.id).then(res => {
      setMessages(Array.isArray(res.data) ? res.data : []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, _count: { messages: 0 } } : c
      ));
    }).catch(() => setMessages([]));
  }, [activeConv]);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [messages]);

  /* ─── Envoyer un message ─── */
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    const text = newMsg.trim();
    setSending(true);
    setNewMsg('');
    try {
      const res = await messagesAPI.sendMessage(activeConv.id, text);
      setMessages(prev => [...prev, res.data]);
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, messages: [{ content: text, createdAt: new Date().toISOString() }] }
          : c
      ));
    } catch {
      toast.error("Erreur lors de l'envoi");
      setNewMsg(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ─── Helpers ─── */
  const patInitials = (conv) => {
    const f = conv.patient?.firstName || '';
    const l = conv.patient?.lastName  || '';
    return `${f[0] || ''}${l[0] || ''}`.toUpperCase() || 'Pa';
  };
  const patName = (conv) =>
    `${conv.patient?.firstName || ''} ${conv.patient?.lastName || ''}`.trim() || 'Patient';

  const filtered = conversations.filter(c => {
    const name = patName(c).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const avatarColor = (name) => {
    const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0284C7'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const [showMobileChat, setShowMobileChat] = useState(false);

  const openConv = (conv) => {
    setActiveConv(conv);
    setShowMobileChat(true);
  };

  return (
    <div className="font-sans bg-slate-50 h-screen flex flex-col overflow-hidden">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      `}</style>

      <DoctorNavbar active="messages" />

      <div className="flex-1 max-w-7xl w-full mx-auto px-2 md:px-6 py-2 md:py-4 flex gap-4 overflow-hidden">

        {/* Sidebar */}
        <aside className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 bg-white rounded-2xl border border-slate-200 shadow-card flex-col shrink-0 overflow-hidden`}>
          <div className="px-4 py-4 border-b border-slate-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Messagerie</h2>
              {totalUnread > 0 && (
                <span className="text-[11px] font-bold bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <SearchIcon />
              <input
                className="flex-1 border-none outline-none text-[13px] bg-transparent text-slate-900 placeholder-slate-400"
                placeholder="Rechercher un patient..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="flex justify-center p-8">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="text-center px-4 py-10 text-slate-400 text-sm">
                {conversations.length === 0 ? 'Aucune conversation pour le moment.' : 'Aucun résultat'}
              </div>
            )}
            {filtered.map(conv => {
              const color    = avatarColor(conv.patient?.firstName);
              const isActive = activeConv?.id === conv.id;
              const unread   = conv._count?.messages || 0;
              const lastMsg  = conv.messages?.[0];
              return (
                <div
                  key={conv.id}
                  onClick={() => openConv(conv)}
                  className={`px-3.5 py-3 cursor-pointer flex items-center gap-2.5 border-l-[3px] transition-colors hover:bg-slate-50 ${
                    isActive ? 'bg-primary-50 border-l-primary-600' : 'bg-transparent border-l-transparent'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ backgroundColor: color + '18', color }}
                  >
                    {patInitials(conv)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[13px] font-semibold text-slate-900 truncate">{patName(conv)}</span>
                      {unread > 0 && (
                        <span className="bg-primary-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ml-1 shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-xs text-slate-500 truncate">{lastMsg.content}</p>
                    )}
                  </div>
                  {lastMsg && (
                    <span className="text-[11px] text-slate-400 shrink-0">{fmtConvTime(lastMsg.createdAt)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Chat area */}
        {activeConv ? (
          <section className={`${showMobileChat ? 'flex' : 'hidden lg:flex'} flex-1 bg-white rounded-2xl border border-slate-200 shadow-card flex-col overflow-hidden`}>
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 shrink-0">
              <button
                onClick={() => setShowMobileChat(false)}
                className="lg:hidden w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl cursor-pointer shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: avatarColor(activeConv.patient?.firstName) + '18', color: avatarColor(activeConv.patient?.firstName) }}
              >
                {patInitials(activeConv)}
              </div>
              <div>
                <div className="text-[15px] font-bold text-slate-900">{patName(activeConv)}</div>
                <div className="text-xs text-slate-400">Patient</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-6 py-5 overflow-y-auto flex flex-col bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center text-[12px] text-slate-400 my-auto">Aucun message.</div>
              )}
              {messages.map((msg, i) => {
                const mine = msg.senderId === user?.id;
                return (
                  <div key={msg.id || i} className="mb-3">
                    <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                      {!mine && (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mb-0.5"
                          style={{ backgroundColor: avatarColor(msg.sender?.firstName) + '18', color: avatarColor(msg.sender?.firstName) }}
                        >
                          {msg.sender?.firstName?.[0]}
                        </div>
                      )}
                      <div className={`max-w-[65%] px-4 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm'
                          : 'bg-white text-slate-900 rounded-2xl rounded-bl-sm border border-slate-200'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                    <div className={`text-[10px] text-slate-400 mt-1 ${mine ? 'text-right' : 'text-left pl-8'}`}>
                      {fmtTime(msg.createdAt)}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-slate-100 flex gap-2.5 items-center shrink-0">
              <input
                ref={inputRef}
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder={`Écrire à ${patName(activeConv)}...`}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none font-sans placeholder-slate-400 focus:border-primary-300 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !newMsg.trim()}
                className={`flex items-center gap-1.5 bg-primary-600 text-white border-0 rounded-full px-5 py-2.5 text-[13px] font-semibold cursor-pointer shrink-0 font-sans hover:bg-primary-700 transition-colors ${(!newMsg.trim() || sending) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <SendIcon /> {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </section>
        ) : (
          <section className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-card flex-col items-center justify-center gap-3">
            <MsgIcon />
            <p className="text-slate-600 font-semibold text-[15px]">Sélectionnez une conversation</p>
            <p className="text-slate-400 text-sm">Choisissez un patient dans la liste pour commencer</p>
          </section>
        )}
      </div>
    </div>
  );
}
