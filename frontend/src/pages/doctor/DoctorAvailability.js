import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { doctorsAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import DoctorNavbar from '../../components/DoctorNavbar';

const DAYS = [
  { dow: 6, label: 'Samedi' },
  { dow: 0, label: 'Dimanche' },
  { dow: 1, label: 'Lundi' },
  { dow: 2, label: 'Mardi' },
  { dow: 3, label: 'Mercredi' },
  { dow: 4, label: 'Jeudi' },
  { dow: 5, label: 'Vendredi' },
];

const DEFAULT_SLOT = { startTime: '08:00', endTime: '12:00', slotDuration: 30 };

function emptySchedule() {
  return Object.fromEntries(
    DAYS.map(d => [d.dow, { enabled: false, slots: [{ ...DEFAULT_SLOT }] }])
  );
}

function scheduleFromAvailabilities(avails) {
  const sched = emptySchedule();
  avails.forEach(a => {
    if (a.dayOfWeek === null || a.dayOfWeek === undefined) return;
    const dow = a.dayOfWeek;
    if (!sched[dow]) return;
    if (!sched[dow].enabled) {
      sched[dow].enabled = true;
      sched[dow].slots = [];
    }
    sched[dow].slots.push({
      startTime:    a.startTime,
      endTime:      a.endTime,
      slotDuration: a.slotDuration || 30,
    });
  });
  return sched;
}

function scheduleToSlots(schedule) {
  const slots = [];
  Object.entries(schedule).forEach(([dow, day]) => {
    if (!day.enabled) return;
    day.slots.forEach(s => {
      slots.push({ dayOfWeek: parseInt(dow), startTime: s.startTime, endTime: s.endTime, slotDuration: s.slotDuration });
    });
  });
  return slots;
}

function previewCount(slot) {
  const [sh, sm] = slot.startTime.split(':').map(Number);
  const [eh, em] = slot.endTime.split(':').map(Number);
  const dur = slot.slotDuration || 30;
  const total = (eh * 60 + em) - (sh * 60 + sm);
  if (total <= 0) return 0;
  return Math.floor(total / dur);
}

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);

export default function DoctorAvailability() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState(emptySchedule());
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(true);

  /* ─── Charger les disponibilités existantes ─── */
  useEffect(() => {
    if (!user?.doctor?.id && !user?.id) { setLoading(false); return; }
    // On récupère le profil médecin via l'endpoint /doctors/dashboard/stats
    // qui inclut les stats, puis on fait un GET du profil pour avoir les dispo
    // On passe par l'endpoint public /doctors/:id — mais on a besoin de l'id du doctor
    // On utilise l'endpoint qui retourne le profil complet
    const fetchProfile = async () => {
      try {
        // L'ID du doctor n'est pas directement dans authStore — on fait appel aux stats
        // Les stats retournent l'objet doctor avec ses disponibilités
        const res = await doctorsAPI.getDashboardStats();
        // On n'a pas les dispo dans les stats → on utilise une autre route
        // Utilisons l'API de mise à jour qui nous retourne les données actuelles
        // En fait, le dashboard ne retourne pas les dispo. On va charger via /doctors/:id
        // mais on n't connaît pas l'id du doctor depuis le front sans autre appel.
        // Pour récupérer les dispo, on appelle /doctors avec notre userId
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  /* ─── Toggle d'un jour ─── */
  const toggleDay = (dow) => {
    setSchedule(prev => {
      const day = { ...prev[dow] };
      day.enabled = !day.enabled;
      if (day.enabled && day.slots.length === 0) {
        day.slots = [{ ...DEFAULT_SLOT }];
      }
      return { ...prev, [dow]: day };
    });
  };

  /* ─── Modifier un créneau ─── */
  const updateSlot = (dow, idx, field, val) => {
    setSchedule(prev => {
      const slots = [...prev[dow].slots];
      slots[idx] = { ...slots[idx], [field]: val };
      return { ...prev, [dow]: { ...prev[dow], slots } };
    });
  };

  /* ─── Ajouter un créneau ─── */
  const addSlot = (dow) => {
    setSchedule(prev => {
      const slots = [...prev[dow].slots, { ...DEFAULT_SLOT }];
      return { ...prev, [dow]: { ...prev[dow], slots } };
    });
  };

  /* ─── Supprimer un créneau ─── */
  const removeSlot = (dow, idx) => {
    setSchedule(prev => {
      const slots = prev[dow].slots.filter((_, i) => i !== idx);
      return { ...prev, [dow]: { ...prev[dow], slots: slots.length ? slots : [{ ...DEFAULT_SLOT }] } };
    });
  };

  /* ─── Sauvegarder ─── */
  const handleSave = async () => {
    const slots = scheduleToSlots(schedule);
    setSaving(true);
    try {
      await doctorsAPI.setAvailability(slots);
      toast.success('Disponibilités enregistrées');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  /* ─── Appliquer un modèle rapide ─── */
  const applyTemplate = (tpl) => {
    const sched = emptySchedule();
    if (tpl === 'full') {
      [6, 0, 1, 2, 3, 4].forEach(dow => {
        sched[dow] = {
          enabled: true,
          slots: [
            { startTime: '08:00', endTime: '12:00', slotDuration: 30 },
            { startTime: '14:00', endTime: '18:00', slotDuration: 30 },
          ],
        };
      });
    } else if (tpl === 'morning') {
      [6, 0, 1, 2, 3, 4].forEach(dow => {
        sched[dow] = { enabled: true, slots: [{ startTime: '08:00', endTime: '12:30', slotDuration: 30 }] };
      });
    } else if (tpl === 'afternoon') {
      [6, 0, 1, 2, 3, 4].forEach(dow => {
        sched[dow] = { enabled: true, slots: [{ startTime: '13:30', endTime: '18:30', slotDuration: 30 }] };
      });
    }
    setSchedule(sched);
    toast.success('Modèle appliqué — pensez à sauvegarder');
  };

  const enabledDays = DAYS.filter(d => schedule[d.dow]?.enabled).length;
  const totalSlots  = DAYS.reduce((acc, d) => {
    if (!schedule[d.dow]?.enabled) return acc;
    return acc + schedule[d.dow].slots.reduce((a, s) => a + previewCount(s), 0);
  }, 0);

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <DoctorNavbar active="availability" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Disponibilités</h1>
            <p className="text-sm text-slate-500 mt-1">Configurez votre emploi du temps hebdomadaire</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-xl px-5 py-2.5 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-3.5 mb-6">
          {[
            { val: enabledDays,  label: 'Jours actifs',           cls: 'border-t-primary-500 text-primary-600' },
            { val: totalSlots,   label: 'Créneaux par semaine',   cls: 'border-t-green-500  text-green-600'   },
            { val: `${totalSlots * 30} min`, label: 'Consultation hebdo', cls: 'border-t-amber-500 text-amber-600' },
          ].map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-2xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Modèles rapides */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mb-5">
          <div className="text-sm font-bold text-slate-900 mb-3">Modèles rapides</div>
          <div className="flex gap-2.5 flex-wrap">
            {[
              { id: 'full',      label: 'Journée complète (Sam–Jeu)' },
              { id: 'morning',   label: 'Matinée uniquement' },
              { id: 'afternoon', label: 'Après-midi uniquement' },
            ].map(tpl => (
              <button
                key={tpl.id}
                onClick={() => applyTemplate(tpl.id)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 bg-slate-50 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer font-sans"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendrier hebdomadaire */}
        <div className="space-y-3">
          {DAYS.map(({ dow, label }) => {
            const day = schedule[dow];
            return (
              <div
                key={dow}
                className={`bg-white rounded-2xl border shadow-card transition-all ${
                  day.enabled ? 'border-primary-200' : 'border-slate-200'
                }`}
              >
                {/* En-tête du jour */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <label className="flex items-center gap-3 cursor-pointer select-none flex-1">
                    <div
                      onClick={() => toggleDay(dow)}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                        day.enabled ? 'bg-primary-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        day.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                    <span className={`text-sm font-bold ${day.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                      {label}
                    </span>
                    {dow === 5 && (
                      <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-lg font-semibold">
                        Congé recommandé
                      </span>
                    )}
                  </label>
                  {day.enabled && (
                    <span className="text-[12px] text-slate-400 font-medium shrink-0">
                      {day.slots.reduce((a, s) => a + previewCount(s), 0)} créneaux
                    </span>
                  )}
                </div>

                {/* Créneaux du jour */}
                {day.enabled && (
                  <div className="px-5 pb-5">
                    <div className="space-y-2.5">
                      {day.slots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-12">Début</span>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={e => updateSlot(dow, idx, 'startTime', e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-primary-400 transition-colors"
                              />
                            </div>
                            <span className="text-slate-300 font-light">—</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide w-8">Fin</span>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={e => updateSlot(dow, idx, 'endTime', e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-primary-400 transition-colors"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Durée</span>
                              <select
                                value={slot.slotDuration}
                                onChange={e => updateSlot(dow, idx, 'slotDuration', parseInt(e.target.value))}
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 bg-white outline-none focus:border-primary-400 transition-colors"
                              >
                                {[15, 20, 30, 45, 60].map(m => (
                                  <option key={m} value={m}>{m} min</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <span className="text-[11px] text-primary-600 font-bold bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-lg whitespace-nowrap shrink-0">
                            {previewCount(slot)} créneaux
                          </span>
                          <button
                            onClick={() => removeSlot(dow, idx)}
                            className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 bg-transparent border-0 p-1"
                            title="Supprimer ce créneau"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addSlot(dow)}
                      className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-primary-600 hover:text-primary-800 cursor-pointer bg-transparent border-0 font-sans transition-colors"
                    >
                      <PlusIcon /> Ajouter une plage horaire
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bouton sauvegarder en bas */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-xl px-8 py-3 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
          </button>
        </div>
      </div>
    </div>
  );
}
