import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const STATUS = {
  approved: { classes: 'bg-green-100 text-green-800', label: 'Approuvé'   },
  pending:  { classes: 'bg-amber-100 text-amber-800', label: 'En attente' },
  rejected: { classes: 'bg-red-100 text-red-800',     label: 'Refusé'     },
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    adminAPI.getAllDoctors()
      .then(r => { setDoctors(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveDoctor(id, true);
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, adminApproved: true } : d));
      toast.success('Médecin approuvé');
    } catch { toast.error('Erreur'); }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.approveDoctor(id, false, 'Demande refusée par l\'administrateur');
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, adminApproved: false } : d));
      toast.success('Médecin refusé');
    } catch { toast.error('Erreur'); }
  };

  const filtered = filter === 'all' ? doctors
    : filter === 'pending'  ? doctors.filter(d => !d.adminApproved)
    : doctors.filter(d => d.adminApproved);

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="doctors" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des médecins</h1>
            <p className="text-sm text-slate-500 mt-1">Approuvez ou refusez les demandes d'inscription des médecins</p>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5">
            {[['all','Tous'], ['pending','En attente'], ['approved','Approuvés']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 font-sans ${
                  filter === val
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-500 hover:text-primary-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-16 text-center">
            <p className="text-slate-400 text-sm">Aucun médecin dans cette catégorie.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Médecin', 'Spécialité', 'Email', 'Téléphone', 'Statut', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(doc => {
                    const name = `${doc.user?.firstName || doc.firstName || ''} ${doc.user?.lastName || doc.lastName || ''}`.trim();
                    const initDoc = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                    const status = doc.adminApproved ? 'approved' : 'pending';
                    const st = STATUS[status];
                    return (
                      <tr key={doc.id} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-4 py-3.5 text-sm text-slate-900 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-[11px] font-bold text-primary-600 shrink-0">
                              {initDoc || 'Dr'}
                            </div>
                            <span className="font-semibold">Dr. {name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600 border-b border-slate-100">{doc.specialite || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-500 border-b border-slate-100">{doc.user?.email || doc.email || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-500 border-b border-slate-100">{doc.user?.phone || doc.phone || '—'}</td>
                        <td className="px-4 py-3.5 border-b border-slate-100">
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.classes}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3.5 border-b border-slate-100">
                          {!doc.adminApproved ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleApprove(doc.id)}
                                className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors cursor-pointer border-0 font-sans"
                              >
                                <CheckIcon /> Approuver
                              </button>
                              <button
                                onClick={() => handleReject(doc.id)}
                                className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors cursor-pointer border-0 font-sans"
                              >
                                <XIcon /> Refuser
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Traité</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
