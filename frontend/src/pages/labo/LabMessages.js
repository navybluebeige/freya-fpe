import React from 'react';
import LabNavbar from '../../components/LabNavbar';

const MsgIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function LabMessages() {
  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <LabNavbar active="messages" />
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Messagerie</h1>
          <p className="text-sm text-slate-500 mt-1">Communiquez avec vos patients</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card h-96 flex flex-col items-center justify-center gap-4">
          <MsgIcon />
          <div className="text-center">
            <p className="text-slate-700 font-semibold">Messagerie laboratoire</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">
              La messagerie directe avec les patients sera disponible dans la prochaine version. Les patients peuvent vous contacter par téléphone pour l'instant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
