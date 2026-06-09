import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doctorsAPI, authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import DoctorNavbar from '../../components/DoctorNavbar';

const SPECIALITES = [
  'Médecin généraliste','Cardiologue','Pneumologue','Gastro-entérologue','Néphrologue',
  'Endocrinologue','Rhumatologue','Neurologue','Hématologue','Infectiologue','Oncologue',
  'Allergologue','Chirurgien général','Chirurgien orthopédiste','Neurochirurgien',
  'Chirurgien plasticien','Gynécologue','Gynécologue-obstétricien','Pédiatre',
  'Ophtalmologue','ORL','Dermatologue','Psychiatre','Psychologue clinicien',
  'Radiologue','Biologiste médical','Kinésithérapeute','Dentiste','Orthodontiste',
  'Anesthésiste-réanimateur','Gériatre','Urologue','Nutritionniste',
];
const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida',
  'Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel',
  'Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa',
  'Mostaganem',"M'Sila",'Mascara','Ouargla','Oran','El Bayadh','Illizi',
  'Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane',
];
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 7;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const defaultSlot = (dayOfWeek) => ({ dayOfWeek, startTime: '08:00', endTime: '18:00', slotDuration: 30, isAvailable: true });

export default function DoctorProfile() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [info, setInfo] = useState({
    firstName: '', lastName: '', phone: '',
    specialite: '', wilaya: 'Alger', city: '', cabinetAddress: '',
    bio: '', consultationPrice: '', languages: '', experienceYears: '',
  });
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    Promise.all([
      authAPI.getMe(),
      doctorsAPI.getMyProfile(),
      doctorsAPI.getMyAvailability(),
    ]).then(([meRes, profRes, avRes]) => {
      const me = meRes.data?.user || meRes.data || {};
      const d  = profRes.data || {};
      setInfo({
        firstName:         me.firstName        || d.user?.firstName        || '',
        lastName:          me.lastName         || d.user?.lastName         || '',
        phone:             me.phone            || d.user?.phone            || '',
        specialite:        d.specialite        || '',
        wilaya:            d.wilaya            || 'Alger',
        city:              d.city              || '',
        cabinetAddress:    d.cabinetAddress    || '',
        bio:               d.bio               || '',
        consultationPrice: d.consultationPrice || '',
        languages:         d.languages         || 'Arabe,Français',
        experienceYears:   d.experienceYears   || '',
      });
      const fetchedSlots = avRes.data?.slots || [];
      setSlots(fetchedSlots.length > 0 ? fetchedSlots : [0, 1, 2, 3, 4, 6].map(defaultSlot));
    }).catch(() => toast.error('Erreur de chargement du profil'))
    .finally(() => setLoading(false));
  }, []);

  const saveInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        authAPI.updateProfile({ firstName: info.firstName, lastName: info.lastName, phone: info.phone || undefined }),
        doctorsAPI.updateProfile({
          specialite:        info.specialite        || undefined,
          wilaya:            info.wilaya            || undefined,
          city:              info.city              || undefined,
          cabinetAddress:    info.cabinetAddress    || undefined,
          bio:               info.bio               || undefined,
          consultationPrice: info.consultationPrice ? Number(info.consultationPrice) : undefined,
          languages:         info.languages         || undefined,
          experienceYears:   info.experienceYears   ? Number(info.experienceYears)   : undefined,
        }),
      ]);
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
      await doctorsAPI.setAvailability(slots);
      toast.success('Horaires mis à jour');
    } catch {
      toast.error("Erreur lors de l'enregistrement des horaires");
    } finally {
      setSavingSlots(false);
    }
  };

  const toggleDay = (dayOfWeek) => {
    setSlots(prev => {
      const exists = prev.find(s => s.dayOfWeek === dayOfWeek);
      if (exists) return prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, isAvailable: !s.isAvailable } : s);
      return [...prev, defaultSlot(dayOfWeek)].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    });
  };

  const updateSlot = (dayOfWeek, field, value) => {
    setSlots(prev => prev.map(s => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s));
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm text-slate-900 bg-slate-50 font-sans transition-all outline-none focus:border-primary-400 focus:bg-white';

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } select:focus, input:focus, textarea:focus { outline: none; }`}</style>
      <DoctorNavbar active="profile" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Mon profil</h1>
          <p className="text-sm text-slate-500 mt-1">Informations visibles par vos patients et gestion de vos horaires</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          {[
            { id: 'info',     label: 'Informations professionnelles' },
            { id: 'horaires', label: 'Horaires et créneaux' },
          ].map(t => (
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
          <form onSubmit={saveInfo} className="bg-white rounded-2xl border border-slate-200 shadow-card p-7 space-y-5">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Informations personnelles</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Prénom</label>
                  <input value={info.firstName} onChange={e => setInfo(f => ({ ...f, firstName: e.target.value }))} className={inputCls} placeholder="Yacine" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nom</label>
                  <input value={info.lastName} onChange={e => setInfo(f => ({ ...f, lastName: e.target.value }))} className={inputCls} placeholder="Bouras" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Téléphone</label>
                  <input value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="05XXXXXXXX" />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Informations professionnelles</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Spécialité</label>
                  <select value={info.specialite} onChange={e => setInfo(f => ({ ...f, specialite: e.target.value }))} className={inputCls}>
                    <option value="">Sélectionnez votre spécialité</option>
                    {SPECIALITES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Wilaya</label>
                  <select value={info.wilaya} onChange={e => setInfo(f => ({ ...f, wilaya: e.target.value }))} className={inputCls}>
                    {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ville / Commune</label>
                  <input value={info.city} onChange={e => setInfo(f => ({ ...f, city: e.target.value }))} className={inputCls} placeholder="Alger-Centre" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Adresse du cabinet</label>
                  <input value={info.cabinetAddress} onChange={e => setInfo(f => ({ ...f, cabinetAddress: e.target.value }))} className={inputCls} placeholder="12 rue Didouche Mourad, Alger" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Tarif consultation (DA)</label>
                  <input type="number" value={info.consultationPrice} onChange={e => setInfo(f => ({ ...f, consultationPrice: e.target.value }))} className={inputCls} placeholder="2000" min="0" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Années d'expérience</label>
                  <input type="number" value={info.experienceYears} onChange={e => setInfo(f => ({ ...f, experienceYears: e.target.value }))} className={inputCls} placeholder="5" min="0" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Langues parlées</label>
                  <input value={info.languages} onChange={e => setInfo(f => ({ ...f, languages: e.target.value }))} className={inputCls} placeholder="Arabe,Français,Tamazight" />
                  <div className="text-[10px] text-slate-400 mt-1">Séparez les langues par des virgules</div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Biographie / Présentation</label>
                  <textarea rows={4} value={info.bio} onChange={e => setInfo(f => ({ ...f, bio: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Décrivez votre parcours, vos spécialisations et votre approche..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white border-0 rounded-xl px-7 py-2.5 text-sm font-bold cursor-pointer font-sans transition-colors disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        )}

        {/* ── Onglet Horaires ── */}
        {tab === 'horaires' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-7">
            <p className="text-sm text-slate-500 mb-5">Définissez vos jours de consultation et vos horaires. Les patients pourront réserver des créneaux selon ces disponibilités.</p>

            <div className="space-y-3">
              {DAYS.map((dayName, dayIndex) => {
                const slot = slots.find(s => s.dayOfWeek === dayIndex);
                const active = slot?.isAvailable === true;
                return (
                  <div key={dayIndex} className={`rounded-xl border p-4 transition-colors ${active ? 'border-primary-200 bg-primary-50/40' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-center gap-3 flex-wrap">
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <select value={slot.startTime} onChange={e => updateSlot(dayIndex, 'startTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer">
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <span className="text-slate-400 text-sm">–</span>
                          <select value={slot.endTime} onChange={e => updateSlot(dayIndex, 'endTime', e.target.value)} className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer">
                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <div className="flex items-center gap-1.5">
                            <label className="text-[11px] text-slate-500">Durée :</label>
                            <select value={slot.slotDuration || 30} onChange={e => updateSlot(dayIndex, 'slotDuration', Number(e.target.value))} className="border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 bg-white font-sans cursor-pointer">
                              <option value={15}>15 min</option>
                              <option value={20}>20 min</option>
                              <option value={30}>30 min</option>
                              <option value={45}>45 min</option>
                              <option value={60}>1 h</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {!active && <span className="text-[12px] text-slate-400">Pas de consultation</span>}
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
                {savingSlots ? 'Enregistrement...' : 'Enregistrer les horaires'}
              </button>
            </div>
          </div>
        )}

        {/* Zone de danger — toujours visible */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-card p-5 mt-5">
          <h3 className="text-sm font-bold text-red-500 mb-2">Zone de danger</h3>
          <p className="text-sm text-slate-500 mb-4">La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.</p>
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
