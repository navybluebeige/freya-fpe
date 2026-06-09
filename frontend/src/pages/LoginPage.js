import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const DEMO_ACCOUNTS = [
  { role: 'Patient',    email: 'scenario.patient@freya.dz', pass: 'FreyaDemo2026!', icon: '👤', color: '#2563EB', bg: '#EFF6FF' },
  { role: 'Médecin',   email: 'scenario.medecin@freya.dz', pass: 'FreyaDemo2026!', icon: '🩺', color: '#7C3AED', bg: '#F5F3FF' },
  { role: 'Labo',      email: 'scenario.labo@freya.dz',    pass: 'FreyaDemo2026!', icon: '🔬', color: '#059669', bg: '#ECFDF5' },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Remplissez tous les champs'); return; }
    setLoading(true);
    try {
      const res = await authAPI.loginUser({ email: email.trim(), password });
      login(res.data.token, res.data.user);
      toast.success(`Bienvenue, ${res.data.user.firstName} !`);
      const role = res.data.user.role;
      if (role === 'doctor')     navigate('/doctor');
      else if (role === 'admin') navigate('/admin');
      else if (role === 'laboratory') navigate('/labo');
      else navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .frm-input { width:100%; padding:12px 16px; border:1.5px solid #E2E8F0; border-radius:12px; font-size:15px; font-family:inherit; color:#0F172A; outline:none; transition:border-color .15s, box-shadow .15s; background:#fff; }
        .frm-input:focus { border-color:#2563EB; box-shadow:0 0 0 3px rgba(37,99,235,.1); }
        .demo-card { transition:all .15s; cursor:pointer; }
        .demo-card:hover { transform:translateY(-2px); box-shadow:0 4px 20px rgba(0,0,0,.1); }
        .btn-primary { width:100%; padding:13px; background:#2563EB; color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; transition:background .15s; }
        .btn-primary:hover:not(:disabled) { background:#1D4ED8; }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .pw-toggle { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94A3B8; padding:2px; display:flex; align-items:center; }
      `}</style>

      {/* ── Panneau gauche — branding ─────────────────────────────────── */}
      <div style={{
        width: '45%', background: 'linear-gradient(160deg, #0F172A 0%, #1E3A8A 60%, #2563EB 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'360px', height:'360px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        <div style={{ position:'absolute', bottom:'-60px', left:'-40px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

        <div style={{ position:'relative', animation:'fadeIn .6s ease' }}>
          <div style={{ fontSize:'42px', fontWeight:'800', color:'#fff', letterSpacing:'-1.5px', marginBottom:'8px' }}>
            Freya<span style={{ color:'#60A5FA' }}>.</span>
          </div>
          <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.45)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'48px' }}>
            Plateforme médicale · Algérie
          </div>

          <h1 style={{ fontSize:'32px', fontWeight:'800', color:'#fff', letterSpacing:'-1px', lineHeight:'1.2', marginBottom:'16px' }}>
            Votre santé,<br/>notre priorité
          </h1>
          <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.6)', lineHeight:'1.7', maxWidth:'340px', marginBottom:'48px' }}>
            Prenez rendez-vous chez un médecin ou un laboratoire, consultez vos ordonnances et résultats d'analyses en toute sécurité.
          </p>

          {/* Stats */}
          <div style={{ display:'flex', gap:'32px' }}>
            {[['100+','Médecins'], ['50+','Laboratoires'], ['48','Wilayas']].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontSize:'28px', fontWeight:'800', color:'#60A5FA' }}>{n}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', fontWeight:'500' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panneau droit — formulaire ────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 64px', background:'#F8FAFC', overflowY:'auto' }}>
        <div style={{ maxWidth:'400px', width:'100%', margin:'0 auto', animation:'fadeIn .5s ease .1s both' }}>

          <h2 style={{ fontSize:'28px', fontWeight:'800', color:'#0F172A', letterSpacing:'-0.7px', marginBottom:'6px' }}>
            Connexion
          </h2>
          <p style={{ fontSize:'14px', color:'#64748B', marginBottom:'32px' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color:'#2563EB', fontWeight:'600', textDecoration:'none' }}>Créer un compte</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>
                Email ou téléphone
              </label>
              <input
                type="text"
                className="frm-input"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom:'24px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  Mot de passe
                </label>
                <a href="#" style={{ fontSize:'13px', color:'#2563EB', textDecoration:'none', fontWeight:'500' }}>
                  Mot de passe oublié ?
                </a>
              </div>
              <div style={{ position:'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="frm-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight:'44px' }}
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'28px 0' }}>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }} />
            <span style={{ fontSize:'12px', color:'#94A3B8', fontWeight:'600' }}>Accès démo</span>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }} />
          </div>

          {/* Comptes démo */}
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                className="demo-card"
                onClick={() => fillDemo(acc)}
                style={{
                  display:'flex', alignItems:'center', gap:'12px',
                  padding:'12px 14px', borderRadius:'12px',
                  border:`1.5px solid ${acc.bg === '#EFF6FF' ? '#BFDBFE' : acc.bg === '#F5F3FF' ? '#DDD6FE' : '#A7F3D0'}`,
                  background: acc.bg, cursor:'pointer', textAlign:'left', width:'100%',
                }}
              >
                <span style={{ fontSize:'22px', lineHeight:1 }}>{acc.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A' }}>{acc.role}</div>
                  <div style={{ fontSize:'11px', color:'#64748B', marginTop:'1px' }}>{acc.email}</div>
                </div>
                <span style={{ fontSize:'11px', fontWeight:'700', color: acc.color, background:'rgba(255,255,255,0.7)', padding:'3px 8px', borderRadius:'20px', border:`1px solid ${acc.color}22` }}>
                  Remplir →
                </span>
              </button>
            ))}
            <p style={{ fontSize:'11px', color:'#94A3B8', textAlign:'center', marginTop:'4px' }}>
              Mot de passe démo : <strong>FreyaDemo2026!</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
