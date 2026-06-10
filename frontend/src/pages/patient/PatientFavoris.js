import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useFavoris } from '../../store/useFavoris';
import PatientNavbar from '../../components/PatientNavbar';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const HeartFilledIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const EmptyHeartIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default function PatientFavoris() {
  const navigate = useNavigate();
  const { favoris, removeFavori } = useFavoris();
  const [search, setSearch] = useState('');

  const handleRemove = (doc) => {
    removeFavori(doc.id);
    toast.success(`${doc.nom} retiré des favoris`);
  };

  const filtered = favoris.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    f.specialty.toLowerCase().includes(search.toLowerCase()) ||
    f.wilaya.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColor = (color) => color || '#2563EB';

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <PatientNavbar active="favoris" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Mes médecins favoris</h1>
            <p className="text-sm text-slate-500 mt-1">
              {favoris.length} médecin{favoris.length !== 1 ? 's' : ''} sauvegardé{favoris.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="flex items-center gap-2 border border-primary-600 text-primary-600 bg-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-50 transition-colors cursor-pointer"
          >
            Trouver un médecin
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 mb-4 shadow-card">
          <SearchIcon />
          <input
            className="flex-1 border-none outline-none text-sm bg-transparent text-slate-900 placeholder-slate-400 font-sans"
            placeholder="Rechercher parmi vos favoris..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Mes soignants</span>
            <span className="text-[11px] font-bold bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-full">Favoris</span>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-center px-6">
              <EmptyHeartIcon />
              <h3 className="text-[15px] font-bold text-slate-900">
                {search ? 'Aucun résultat' : 'Aucun favori pour le moment'}
              </h3>
              <p className="text-sm text-slate-400">
                {search
                  ? 'Essayez un autre terme de recherche'
                  : 'Ajoutez des médecins en cliquant sur le coeur lors de vos recherches'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/doctors')}
                  className="mt-2 bg-primary-600 text-white rounded-xl px-5 py-2 text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0"
                >
                  Trouver un médecin
                </button>
              )}
            </div>
          ) : (
            filtered.map((doc, i) => (
              <div
                key={doc.id}
                className={`px-4 py-4 flex flex-wrap items-center gap-3 hover:bg-slate-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ backgroundColor: (avatarColor(doc.color)) + '18', color: avatarColor(doc.color) }}
                  >
                    {doc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-primary-600 truncate">{doc.nom}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{doc.specialty}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                      <MapPinIcon /> {doc.wilaya}
                    </div>
                  </div>
                </div>

                {/* Availability + Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {doc.disponible
                    ? <span className="text-[11px] font-semibold text-green-600">Disponible</span>
                    : <span className="text-[11px] font-semibold text-slate-400">Indisponible</span>
                  }
                  <button
                    onClick={() => navigate('/doctors')}
                    className="flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer border-0"
                  >
                    <CalendarIcon /> RDV
                  </button>
                  <button
                    onClick={() => navigate('/patient/messages')}
                    className="bg-slate-100 text-slate-700 text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer border-0"
                  >
                    Message
                  </button>
                  <button
                    onClick={() => handleRemove(doc)}
                    className="flex items-center justify-center bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100 transition-colors cursor-pointer border-0"
                    title="Retirer des favoris"
                  >
                    <HeartFilledIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
