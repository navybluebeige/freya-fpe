import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { laboAPI, appointmentsAPI } from '../../services/api';
import PatientNavbar from '../../components/PatientNavbar';

const BackIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ClockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const MapIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const BeakerIcon= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3l-4 7h14l-4-7"/><path d="M3 9l2.5 7.5A2 2 0 0 0 7.4 18h9.2a2 2 0 0 0 1.9-1.5L21 9"/></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const DAYS_FR = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

function generateTimeSlots(startTime, endTime, duration = 30) {
  const slots = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + duration <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0');
    const m = (cur % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += duration;
  }
  return slots;
}

function getAvailableDays(availSlots) {
  return new Set(availSlots.filter(s => s.isAvailable).map(s => s.dayOfWeek));
}

function getSlotsForDate(dateStr, availSlots) {
  const day = new Date(dateStr).getDay();
  const slot = availSlots.find(s => s.isAvailable && s.dayOfWeek === day);
  if (!slot) return [];
  return generateTimeSlots(slot.startTime, slot.endTime, slot.slotDuration || 30);
}

function getNextAvailableDates(availSlots, count = 14) {
  const availDays = getAvailableDays(availSlots);
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 1; dates.length < count && i <= 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (availDays.has(d.getDay())) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
}

function fmtDateFr(dateStr) {
  const d = new Date(dateStr);
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export default function LabBookingPage() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [clinic,       setClinic]       = useState(null);
  const [availSlots,   setAvailSlots]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [availDates,   setAvailDates]   = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots,    setTimeSlots]    = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [motif,        setMotif]        = useState('');
  const [booking,      setBooking]      = useState(false);
  const [booked,       setBooked]       = useState(false);

  const load = useCallback(async () => {
    try {
      const [clinicRes, availRes] = await Promise.all([
        laboAPI.getPublicClinic(clinicId),
        laboAPI.getPublicAvailability(clinicId),
      ]);
      setClinic(clinicRes.data);
      const slots = availRes.data?.slots || [];
      setAvailSlots(slots);
      const dates = getNextAvailableDates(slots);
      setAvailDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
        setTimeSlots(getSlotsForDate(dates[0], slots));
      }
    } catch (err) {
      toast.error('Laboratoire introuvable ou indisponible');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  }, [clinicId, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setTimeSlots(getSlotsForDate(date, availSlots));
  };

  const handleBook = async () => {
    if (!selectedDate) return toast.error('Veuillez sélectionner une date');
    if (!selectedTime) return toast.error('Veuillez sélectionner un horaire');
    setBooking(true);
    try {
      await appointmentsAPI.book({
        clinicId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        motif: motif || 'Analyses médicales',
        isFirstVisit: false,
      });
      setBooked(true);
      toast.success('Rendez-vous confirmé !');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || "Erreur lors de la réservation";
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="font-sans bg-slate-50 min-h-screen flex items-center justify-center flex-col gap-4">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-primary-600 rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
      <p className="text-slate-400 text-sm">Chargement...</p>
    </div>
  );

  /* ─── Confirmation ─── */
  if (booked) return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <PatientNavbar active="rdv" />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckIcon />
        </div>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">Rendez-vous confirmé !</h2>
        <p className="text-slate-500 mb-1">{clinic?.name}</p>
        <p className="text-primary-600 font-bold text-lg mb-1">{selectedDate && fmtDateFr(selectedDate)}</p>
        <p className="text-primary-600 font-semibold mb-6">à {selectedTime}</p>
        {motif && <p className="text-slate-500 text-sm mb-6">Motif : {motif}</p>}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => navigate('/patient/appointments')}
            className="bg-primary-600 text-white border-0 rounded-xl px-6 py-3 text-sm font-bold cursor-pointer hover:bg-primary-700 font-sans transition-colors">
            Voir mes rendez-vous
          </button>
          <button onClick={() => navigate('/doctors')}
            className="bg-white text-slate-700 border border-slate-200 rounded-xl px-6 py-3 text-sm font-bold cursor-pointer hover:bg-slate-50 font-sans transition-colors">
            Retour à la recherche
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <PatientNavbar active="rdv" />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5 md:py-7">
        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer font-sans transition-colors mb-5">
          <BackIcon /> Retour
        </button>

        {/* Lab card */}
        {clinic && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <BeakerIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-extrabold text-slate-900">{clinic.name}</div>
              <div className="flex flex-wrap gap-3 mt-1.5 text-[12px] text-slate-500">
                {clinic.address && (
                  <span className="inline-flex items-center gap-1"><MapIcon />{clinic.address}{clinic.wilaya ? `, ${clinic.wilaya}` : ''}</span>
                )}
                {clinic.specialites && (
                  <span className="inline-flex items-center gap-1"><BeakerIcon />{clinic.specialites.split(',').slice(0, 3).join(', ')}</span>
                )}
              </div>
            </div>
            <span className="shrink-0 bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-1 rounded-full">Laboratoire</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Date + Time selection */}
          <div className="space-y-5">
            {/* Date */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Choisissez une date</h3>
              {availDates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-semibold">Aucune disponibilité configurée</p>
                  <p className="text-slate-400 text-sm mt-1">Ce laboratoire n'a pas encore publié ses horaires</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availDates.map(date => {
                    const d = new Date(date);
                    const isSelected = date === selectedDate;
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`rounded-xl p-3 text-center cursor-pointer border-0 font-sans transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        <div className={`text-[11px] font-semibold uppercase tracking-wide ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                          {DAYS_FR[d.getDay()].slice(0, 3)}
                        </div>
                        <div className={`text-xl font-extrabold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {d.getDate()}
                        </div>
                        <div className={`text-[11px] ${isSelected ? 'text-primary-200' : 'text-slate-400'}`}>
                          {MONTHS_FR[d.getMonth()].slice(0, 3)}.
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Horaires disponibles
                </h3>
                <p className="text-[12px] text-slate-400 mb-4 flex items-center gap-1">
                  <ClockIcon /> {fmtDateFr(selectedDate)}
                </p>
                {timeSlots.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">Aucun créneau pour cette date</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-bold cursor-pointer border-0 font-sans transition-all ${
                          selectedTime === t
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Summary + booking */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 h-fit sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Récapitulatif</h3>

            {/* Patient */}
            <div className="bg-slate-50 rounded-xl p-3.5 mb-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Patient</div>
              <div className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</div>
            </div>

            {/* Selected date + time */}
            {selectedDate && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3.5 mb-4">
                <div className="text-[10px] text-primary-500 font-bold uppercase tracking-wide mb-1">Date et heure</div>
                <div className="text-sm font-bold text-primary-900">{fmtDateFr(selectedDate)}</div>
                {selectedTime && <div className="text-lg font-extrabold text-primary-600 mt-0.5">{selectedTime}</div>}
              </div>
            )}

            {/* Motif */}
            <div className="mb-5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1.5 block">Motif (optionnel)</label>
              <textarea
                rows={2}
                value={motif}
                onChange={e => setMotif(e.target.value)}
                placeholder="Ex: Bilan sanguin, NFS, analyses biochimiques..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 font-sans outline-none focus:border-primary-400 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime || booking}
              className="w-full bg-primary-600 text-white border-0 rounded-xl py-3.5 text-sm font-bold cursor-pointer hover:bg-primary-700 font-sans transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {booking ? 'Confirmation en cours...' : 'Confirmer le rendez-vous'}
            </button>

            {(!selectedDate || !selectedTime) && (
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Sélectionnez une date et un horaire
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
