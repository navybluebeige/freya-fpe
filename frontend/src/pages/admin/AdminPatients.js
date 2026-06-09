import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback((q = '') => {
    setLoading(true);
    adminAPI.getPatients({ search: q })
      .then(r => setPatients(r.data || []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (id, isActive) => {
    try {
      await adminAPI.toggleUser(id);
      setPatients(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
      toast.success(isActive ? 'Compte désactivé' : 'Compte activé');
    } catch { toast.error('Erreur'); }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="patients" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Patients</h1>
            <p className="text-sm text-slate-500 mt-0.5">{patients.length} patients inscrits</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); load(search); }} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom, email..."
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white w-52 font-sans"
            />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 font-sans">
              Chercher
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-7 h-7 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
              <span className="text-sm text-slate-400">Chargement...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">Aucun patient trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Email / Tél</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Wilaya</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Inscrit le</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                            {(p.firstName?.[0] || '?').toUpperCase()}{(p.lastName?.[0] || '').toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{p.firstName} {p.lastName}</div>
                            <div className="text-xs text-slate-400 md:hidden">{p.email || p.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">
                        <div>{p.email || '—'}</div>
                        {p.phone && <div className="text-xs text-slate-400">{p.phone}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">{p.wilaya || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                        {new Date(p.createdAt).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.isActive ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleToggle(p.id, p.isActive)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors bg-transparent font-sans ${
                            p.isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {p.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
