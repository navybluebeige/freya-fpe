import { useState, useEffect } from 'react';

// Clé de stockage
const STORAGE_KEY = 'freya_favoris';

// Données initiales demo
const DEMO_FAVORIS = [
  { id: 1, nom: 'Dr. Amira Benali', specialty: 'Cardiologue', wilaya: 'Alger', avatar: 'AB', color: '#0D9488', disponible: true },
  { id: 2, nom: 'Dr. Karim Meziane', specialty: 'Médecin généraliste', wilaya: 'Alger', avatar: 'KM', color: '#2563EB', disponible: true },
  { id: 3, nom: 'Dr. Sonia Hadj', specialty: 'Dermatologue', wilaya: 'Oran', avatar: 'SH', color: '#7C3AED', disponible: false },
];

// Store global simple (partagé entre composants)
let globalFavoris = null;
let listeners = [];

const getInitialFavoris = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEMO_FAVORIS;
  } catch {
    return DEMO_FAVORIS;
  }
};

const saveFavoris = (favoris) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris)); } catch {}
  globalFavoris = favoris;
  listeners.forEach(fn => fn(favoris));
};

export const useFavoris = () => {
  if (!globalFavoris) globalFavoris = getInitialFavoris();
  const [favoris, setFavoris] = useState(globalFavoris);

  useEffect(() => {
    const handler = (newFavoris) => setFavoris([...newFavoris]);
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, []);

  const isFavori = (id) => favoris.some(f => f.id === id);

  const toggleFavori = (doctor) => {
    const exists = favoris.some(f => f.id === doctor.id);
    const updated = exists
      ? favoris.filter(f => f.id !== doctor.id)
      : [...favoris, doctor];
    saveFavoris(updated);
    return !exists; // retourne true si ajouté
  };

  const removeFavori = (id) => {
    saveFavoris(favoris.filter(f => f.id !== id));
  };

  return { favoris, isFavori, toggleFavori, removeFavori };
};

export default useFavoris;