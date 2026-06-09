import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/AdminNavbar';

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const HospitalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const EMPTY_FORM = { name: '', address: '', wilaya: '', city: '', phone: '', email: '', specialites: '' };

export default function AdminClinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.getClinics()
      .then(r => setClinics(r.data || []))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.wilaya) return toast.error('Nom et wilaya requis');
    setSaving(true);
    try {
      await adminAPI.addClinic(form);
      toast.success('Clinique ajoutée');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch { toast.error('Erreur lors de l\'ajout'); }
    finally { setSaving(false); }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <AdminNavbar active="clinics" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Cliniques</h1>
            <p className="text-sm text-slate-500 mt-0.5">{clinics.length} cliniques enregistrées</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 font-sans"
          >
            <PlusIcon /> Ajouter une clinique
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mb-5">
            <div className="text-sm font-bold text-slate-900 mb-4">Nouvelle clinique</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nom de la clinique"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Wilaya *</label>
                <input
                  type="text"
                  value={form.wilaya}
                  onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))}
                  placeholder="Ex: Alger"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Rue, quartier"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ville</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Ville"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0XX XX XX XX"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="contact@clinique.dz"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Spécialités (séparées par virgule)</label>
                <input
                  type="text"
                  value={form.specialites}
                  onChange={e => setForm(f => ({ ...f, specialites: e.target.value }))}
                  placeholder="Cardiologie,Pédiatrie,Chirurgie"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-sans"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 font-sans disabled:opacity-60"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer bg-transparent font-sans"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Clinics grid */}
        {loading ? (
          <div className="flex justify-center py-16 gap-3">
            <div className="w-7 h-7 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
            <span className="text-sm text-slate-400">Chargement...</span>
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Aucune clinique enregistrée</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clinics.map(clinic => (
              <div key={clinic.id} className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 flex flex-col gap-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 mb-1">
                  <HospitalIcon />
                </div>
                <div className="text-sm font-bold text-slate-900">{clinic.name}</div>
                <div className="text-xs text-slate-500">{clinic.address ? `${clinic.address}, ${clinic.wilaya}` : clinic.wilaya}</div>
                {clinic.phone && <div className="text-xs text-slate-400">{clinic.phone}</div>}
                {clinic.email && <div className="text-xs text-slate-400">{clinic.email}</div>}
                {clinic.specialites && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {clinic.specialites.split(',').slice(0, 3).map((s, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
