import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

const STATUS_STYLES = {
  pending:   { classes: 'bg-amber-100 text-amber-700',  label: 'En attente' },
  confirmed: { classes: 'bg-blue-100 text-blue-700',    label: 'Confirmé'   },
  completed: { classes: 'bg-green-100 text-green-700',  label: 'Terminé'    },
  cancelled: { classes: 'bg-red-100 text-red-600',      label: 'Annulé'     },
  no_show:   { classes: 'bg-slate-100 text-slate-500',  label: 'Absent'     },
};

const FILTERS = [
  ['', 'Tous'],
  ['pending',   'En attente'],
  ['confirmed', 'Confirmés'],
  ['completed', 'Terminés'],
  ['cancelled', 'Annulés'],
];

export default function AdminAppointments() {
  const [data, setData]       = useState({ appointments: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const LIMIT = 25;

  const load = useCallback((p = 1, s = '', q = '') => {
    setLoading(true);
    adminAPI.getAppointments({ status: s, search: q, page: p, limit: LIMIT })
      .then(r => setData(r.data || { appointments: [], total: 0 }))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1, '', ''); }, [load]);

  const applyFilter = (s) => { setFilter(s); setPage(1); load(1, s, search); };
  const handleSearch = (e) => { e.preventDefault(); setPage(1); load(1, filter, search); };
  const goToPage = (p) => { setPage(p); load(p, filter, search); };

  const totalPages = Math.ceil(data.total / LIMIT);

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="appointments" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Rendez-vous</h1>
            <p className="text-sm text-slate-500 mt-0.5">{data.total} rendez-vous au total</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom du patient..."
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white w-48 font-sans"
            />
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 font-sans">
              OK
            </button>
          </form>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map(([val, label]) => (
            <button
              key={val}
              onClick={() => applyFilter(val)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border cursor-pointer transition-colors font-sans ${
                filter === val
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16 gap-3">
              <div className="w-7 h-7 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
              <span className="text-sm text-slate-400">Chargement...</span>
            </div>
          ) : data.appointments.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">Aucun rendez-vous trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Médecin</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">Clinique</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.map(appt => {
                    const style = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
                    return (
                      <tr key={appt.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-semibold text-slate-900">
                            {appt.patient?.firstName} {appt.patient?.lastName}
                          </div>
                          <div className="text-xs text-slate-400">{appt.patient?.email}</div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <div className="text-sm text-slate-700">
                            Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName}
                          </div>
                          <div className="text-xs text-slate-400">{appt.doctor?.specialite}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 hidden lg:table-cell">
                          {appt.clinic?.name || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                          {new Date(appt.appointmentDate).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${style.classes}`}>
                            {style.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-5">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-300 disabled:opacity-40 cursor-pointer bg-white font-sans"
            >
              ← Précédent
            </button>
            <span className="text-sm text-slate-500 font-medium">Page {page} / {totalPages}</span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-primary-300 disabled:opacity-40 cursor-pointer bg-white font-sans"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
