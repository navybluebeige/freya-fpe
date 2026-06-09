import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

const FlaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6v8l3.5 6A2 2 0 0 1 16.76 20H7.24a2 2 0 0 1-1.74-2.99L9 11V3z"/>
    <line x1="6" y1="3" x2="18" y2="3"/>
  </svg>
);

export default function AdminLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback((q = '') => {
    setLoading(true);
    adminAPI.getAllLabs({ search: q })
      .then(r => setLabs(r.data || []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, adminApproved) => {
    try {
      const res = await adminAPI.toggleLab(id);
      setLabs(prev => prev.map(l => l.id === id ? { ...l, adminApproved: !l.adminApproved } : l));
      toast.success(res.data?.message || 'Mis à jour');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="labs" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Laboratoires</h1>
            <p className="text-sm text-slate-500 mt-0.5">{labs.length} laboratoires enregistrés</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); load(search); }} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom du laboratoire..."
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white w-52 font-sans"
            />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 font-sans">
              Chercher
            </button>
          </form>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex justify-center py-16 gap-3">
            <div className="w-7 h-7 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
            <span className="text-sm text-slate-400">Chargement...</span>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Aucun laboratoire trouvé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {labs.map(lab => (
              <div key={lab.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col gap-3">
                {/* Lab header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <FlaskIcon />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${lab.adminApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {lab.adminApproved ? 'Actif' : 'Suspendu'}
                  </span>
                </div>

                {/* Info */}
                <div>
                  <div className="text-sm font-bold text-slate-900 mb-0.5">{lab.name}</div>
                  {lab.wilaya && <div className="text-xs text-slate-500">{lab.address ? `${lab.address}, ${lab.wilaya}` : lab.wilaya}</div>}
                  {lab.phone && <div className="text-xs text-slate-400 mt-0.5">{lab.phone}</div>}
                  {lab.email && <div className="text-xs text-slate-400">{lab.email}</div>}
                </div>

                {/* Account */}
                {lab.users?.length > 0 && (
                  <div className="bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <div className="text-[10px] uppercase text-slate-400 tracking-wider mb-1">Compte utilisateur</div>
                    <div className="text-sm font-semibold text-slate-800">{lab.users[0].firstName} {lab.users[0].lastName}</div>
                    <div className="text-xs text-slate-500">{lab.users[0].email}</div>
                    <div className={`text-[10px] font-semibold mt-1 ${lab.users[0].isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {lab.users[0].isActive ? 'Connecté actif' : 'Compte suspendu'}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleToggle(lab.id, lab.adminApproved)}
                  className={`w-full text-xs font-semibold py-2 rounded-xl border cursor-pointer transition-colors bg-transparent font-sans mt-auto ${
                    lab.adminApproved
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {lab.adminApproved ? 'Suspendre le laboratoire' : 'Activer le laboratoire'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
