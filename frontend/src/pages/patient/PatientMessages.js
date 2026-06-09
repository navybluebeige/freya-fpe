import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { messagesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import PatientNavbar from '../../components/PatientNavbar';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const MsgIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SpinnerIcon = () => (
  <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
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

export default function PatientMessages() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [message,       setMessage]       = useState('');
  const [search,        setSearch]        = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [sending,       setSending]       = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  /* ─── Charger les conversations ─── */
  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Auto-sélectionner la conversation après le chargement si convId passé en state
  useEffect(() => {
    const convId = location.state?.convId;
    if (!convId || conversations.length === 0) return;
    const target = conversations.find(c => c.id === convId);
    if (target) setActiveConv(target);
  }, [conversations, location.state]);

  /* ─── Charger les messages d'une conversation ─── */
  const loadMessages = useCallback(async (convId) => {
    try {
      const res = await messagesAPI.getMessages(convId);
      setMessages(Array.isArray(res.data) ? res.data : []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
      // Marquer comme lu dans l'UI
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, _count: { messages: 0 } } : c
      ));
    }
  }, [activeConv, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ─── Envoyer un message ─── */
  const handleSend = async () => {
    if (!message.trim() || !activeConv) return;
    const text = message.trim();
    setSending(true);
    setMessage('');
    try {
      const res = await messagesAPI.sendMessage(activeConv.id, text);
      setMessages(prev => [...prev, res.data]);
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, messages: [{ content: text, createdAt: new Date().toISOString() }] }
          : c
      ));
    } catch {
      toast.error("Erreur d'envoi");
      setMessage(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  /* ─── Filtrage conversations ─── */
  const filtered = conversations.filter(c => {
    const name = `${c.doctor?.user?.firstName || ''} ${c.doctor?.user?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((acc, c) => acc + (c._count?.messages || 0), 0);

  /* ─── Helper: initiales médecin ─── */
  const docInitials = (conv) => {
    const f = conv.doctor?.user?.firstName || '';
    const l = conv.doctor?.user?.lastName  || '';
    return `${f[0] || ''}${l[0] || ''}`.toUpperCase() || 'Dr';
  };
  const docName = (conv) =>
    `Dr. ${conv.doctor?.user?.firstName || ''} ${conv.doctor?.user?.lastName || ''}`.trim();

  /* ─── Helper: sender du message ─── */
  const isMine = (msg) => msg.senderId === user?.id;

  const [showMobileChat, setShowMobileChat] = useState(false);

  const openConv = (c) => {
    setActiveConv(c);
    setShowMobileChat(true);
  };

  return (
    <div className="font-sans bg-slate-50 h-screen flex flex-col overflow-hidden">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes msgIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .msg-in { animation: msgIn 0.18s ease; }
      `}</style>

      <PatientNavbar active="messages" />

      <div className="flex-1 max-w-7xl w-full mx-auto px-2 md:px-6 py-2 md:py-4 flex gap-4 overflow-hidden">

        {/* Sidebar conversations */}
        <aside className={`${showMobileChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 bg-white rounded-2xl border border-slate-200 shadow-card flex-col shrink-0 overflow-hidden`}>
          <div className="px-4 py-4 border-b border-slate-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Messages</h2>
              {totalUnread > 0 && (
                <span className="text-[11px] font-bold bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full">
                  {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <SearchIcon />
              <input
                className="flex-1 border-none outline-none text-[13px] bg-transparent text-slate-900 placeholder-slate-400"
                placeholder="Rechercher un médecin..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loadingConvs ? (
              <div className="flex justify-center p-8"><SpinnerIcon /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center px-4 py-8 text-slate-400 text-[13px]">
                {conversations.length === 0
                  ? 'Aucune conversation. Prenez un RDV pour commencer à échanger.'
                  : 'Aucun résultat'}
              </div>
            ) : filtered.map(c => {
              const unread   = c._count?.messages || 0;
              const isActive = activeConv?.id === c.id;
              const lastMsg  = c.messages?.[0];
              return (
                <div
                  key={c.id}
                  onClick={() => openConv(c)}
                  className={`px-3.5 py-3 cursor-pointer flex items-center gap-2.5 border-l-[3px] transition-colors hover:bg-slate-50 ${
                    isActive ? 'bg-primary-50 border-l-primary-600' : 'bg-transparent border-l-transparent'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {docInitials(c)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-slate-900 leading-none mb-0.5">{docName(c)}</div>
                    <div className="text-[11px] text-slate-400 mb-1">{c.doctor?.specialite}</div>
                    {lastMsg && (
                      <div className="text-[12px] text-slate-500 truncate">{lastMsg.content}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {lastMsg && <span className="text-[11px] text-slate-400">{fmtConvTime(lastMsg.createdAt)}</span>}
                    {unread > 0 && (
                      <div className="bg-primary-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {unread}
                      </div>
                    )}
                  </div>
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
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                {docInitials(activeConv)}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-slate-900">{docName(activeConv)}</div>
                <div className="text-[12px] text-slate-500">{activeConv.doctor?.specialite}</div>
              </div>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Mes rendez-vous
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 px-6 py-5 overflow-y-auto flex flex-col bg-slate-50/50">
              {messages.length === 0 && (
                <div className="text-center text-[12px] text-slate-400 my-auto">
                  Aucun message. Commencez la conversation.
                </div>
              )}
              {messages.map((msg, i) => {
                const mine = isMine(msg);
                return (
                  <div key={msg.id || i} className="mb-3 msg-in">
                    <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                      {!mine && (
                        <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[9px] font-bold shrink-0 mb-0.5">
                          {msg.sender?.firstName?.[0] || 'D'}
                        </div>
                      )}
                      <div className={`max-w-[58%] px-4 py-2.5 text-sm leading-relaxed ${
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
            <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
              <input
                ref={inputRef}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none font-sans placeholder-slate-400 focus:border-primary-300 transition-colors"
                placeholder={`Écrire à ${docName(activeConv)}...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className={`flex items-center gap-1.5 bg-primary-600 text-white border-0 rounded-xl px-4 py-2.5 text-[13px] font-semibold cursor-pointer shrink-0 font-sans hover:bg-primary-700 transition-colors ${(!message.trim() || sending) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <SendIcon /> {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </section>
        ) : (
          <section className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-card flex-col items-center justify-center gap-3">
            <MsgIcon />
            <p className="text-slate-600 font-semibold text-[15px]">Sélectionnez une conversation</p>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              Choisissez un médecin dans la liste pour commencer à échanger.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
