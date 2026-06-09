import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { laboAPI, authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import LabNavbar from '../../components/LabNavbar';

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const defaultSlot = (dayOfWeek) => ({ dayOfWeek, startTime: '08:00', endTime: '17:00', isAvailable: true, slotDuration: 30 });

export default function LabProfile() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({ name: '', address: '', wilaya: '', city: '', phone: '', email: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState([]);
  const [savingSlots, setSavingSlots] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Entrez votre mot de passe');
    setDeleting(true);
    try {
      await authAPI.deleteAccount(deletePassword);
      toast.success('Compte supprimé');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    Promise.all([
      laboAPI.getProfile(),
      laboAPI.getAvailability(),
    ]).then(([profileRes, availRes]) => {
      const d = profileRes.data;
      setForm({ name: d.name || '', address: d.address || '', wilaya: d.wilaya || '', city: d.city || '', phone: d.phone || '', email: d.email || '', description: d.description || '' });
      const fetchedSlots = availRes.data?.slots || [];
      if (fetchedSlots.length === 0) {
        setSlots([0,1,2,3,4,6].map(defaultSlot));
      } else {
        setSlots(fetchedSlots);
      }
    }).catch(() => toast.error('Erreur de chargement'))
    .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await laboAPI.updateProfile(form);
      toast.success('Profil mis à jour');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const saveSlots = async () => {
    setSavingSlots(true);
    try {
      const openingHours = slots
        .filter(s => s.isAvailable)
        .map(s => `${DAYS[s.dayOfWeek]}: ${s.startTime} – ${s.endTime}`)
        .join(', ');
      await laboAPI.updateAvailability({ slots, openingHours });
      toast.success('Disponibilités mises à jour');
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSavingSlots(false);
    }
  };

  const toggleDay = (dayOfWeek) => {
    setSlots(prev => {
      const exists = prev.find(s => s.dayOfWeek === dayOfWeek);
      if (exists) {
        return prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, isAvailable: !s.isAvailable } : s);
      }
      return [...prev, defaultSlot(dayOfWeek)].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    });
  };

  const updateSlot = (dayOfWeek, field, value) => {
    setSlots(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm text-slate-900 bg-slate-50 font-sans transition-all outline-none focus:border-primary-400 focus:bg-white';
  const F = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea rows={3} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className={`${inputCls} resize-none`} />
      ) : (
        <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className={inputCls} />
      )}
    </div>
  );

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } select:focus, input:focus, textarea:focus { outline: none; }`}</style>
      <LabNavbar active="profile" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Profil du laboratoire</h1>
          <p className="text-sm text-slate-500 mt-1">Informations et disponibilités visibles par les patients</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {[{ id: 'info', label: 'Informations' }, { id: 'dispo', label: 'Disponibilités' }].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer bg-transparent border-0 ${
                tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Onglet Informations ── */}
        {tab === 'info' && (
          <form onSubmit={saveProfile} className="bg-white rounded-2xl border border-slate-200 shadow-card p-7 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="col-span-2">
                <F label="Nom du laboratoire" field="name" placeholder="Laboratoire Pasteur Alger" />
              </div>
              <F label="Adresse"    field="address"  placeholder="14 Rue Pasteur, Alger-Centre" />
              <F label="Wilaya"     field="wilaya"   placeholder="Alger" />
              <F label="Ville"      field="city"     placeholder="Alger-Centre" />
              <F label="Telephone"  field="phone"    placeholder="021 63 12 45" />
              <div className="col-span-2">
                <F label="Email"    field="email"    type="email" placeholder="contact@labo.dz" />
              </div>
              <div className="col-span-2">
                <F label="Description" field="description" type="textarea" placeholder="Présentation du laboratoire..." />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-xl px-7 py-2.5 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* ── Onglet Disponibilités ── */}
        {tab === 'dispo' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-7">
            <p className="text-sm text-slate-500 mb-5">Définissez les jours et horaires où les patients peuvent prendre rendez-vous au laboratoire.</p>

            <div className="space-y-3">
              {DAYS.map((dayName, dayIndex) => {
                const slot = slots.find(s => s.dayOfWeek === dayIndex);
                const active = slot?.isAvailable === true;
                return (
                  <div key={dayIndex} className={`rounded-xl border p-4 transition-colors ${active ? 'border-primary-200 bg-primary-50/40' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleDay(dayIndex)}
                        className={`relative w-10 h-5 rounded-full border-0 transition-colors cursor-pointer flex-shrink-0 ${active ? 'bg-primary-600' : 'bg-slate-300'}`}
                        style={{ padding: 0 }}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <span className={`text-sm font-bold min-w-[90px] ${active ? 'text-slate-900' : 'text-slate-400'}`}>{dayName}</span>

                      {active && slot && (
                        <div className="flex items-center gap-2 flex-1 flex-wrap">
                          <select
                            value={slot.startTime}
                            onChange={e => updateSlot(dayIndex, 'startTime', e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer"
                          >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <span className="text-slate-400 text-sm">–</span>
                          <select
                            value={slot.endTime}
                            onChange={e => updateSlot(dayIndex, 'endTime', e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer"
                          >
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <div className="flex items-center gap-1.5 ml-2">
                            <label className="text-[11px] text-slate-500">Créneau :</label>
                            <select
                              value={slot.slotDuration || 30}
                              onChange={e => updateSlot(dayIndex, 'slotDuration', Number(e.target.value))}
                              className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer"
                            >
                              <option value={15}>15 min</option>
                              <option value={30}>30 min</option>
                              <option value={45}>45 min</option>
                              <option value={60}>1 h</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {!active && <span className="text-[12px] text-slate-400">Fermé</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={saveSlots}
                disabled={savingSlots}
                className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-xl px-7 py-2.5 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50"
              >
                {savingSlots ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
              </button>
            </div>
          </div>
        )}

        {/* Zone de danger */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-card p-5 mt-5">
          <h3 className="text-sm font-bold text-red-500 mb-2">Zone de danger</h3>
          <p className="text-sm text-slate-500 mb-4">La suppression de votre compte et du laboratoire associé est irréversible.</p>
          {!showDeleteModal ? (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 bg-red-50 text-red-500 border border-red-200 rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer font-sans hover:bg-red-100 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-sm">
              <p className="text-sm font-semibold text-red-700 mb-3">Confirmez avec votre mot de passe :</p>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Mot de passe actuel"
                className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-900 outline-none font-sans mb-3 focus:border-red-400"
              />
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer border-0 font-sans hover:bg-red-700 transition-colors disabled:opacity-60">
                  {deleting ? 'Suppression...' : 'Confirmer'}
                </button>
                <button onClick={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg cursor-pointer bg-white font-sans hover:bg-slate-50">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
