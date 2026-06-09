import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useFavoris from '../store/useFavoris';


/**
 * FavorisWidget — section compacte à intégrer dans :
 *  - PatientDashboard  → <FavorisWidget />
 *  - DoctorSearchPage  → <FavorisWidget compact />
 */
export default function FavorisWidget({ compact = false }) {
  const navigate = useNavigate();
  const { favoris, removeFavori } = useFavoris();

  if (favoris.length === 0) return null;

  const displayed = compact ? favoris.slice(0, 4) : favoris.slice(0, 5);

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerTitle}>❤️ Mes médecins favoris</span>
          <span style={s.badge}>{favoris.length}</span>
        </div>
        <button style={s.voirTout} onClick={() => navigate('/patient/favoris')}>
          Voir tout →
        </button>
      </div>

      {/* List */}
      <div style={s.list}>
        {displayed.map((doc, i) => (
          <div
            key={doc.id}
            style={{ ...s.row, borderBottom: i < displayed.length - 1 ? '1px solid #F1F5F9' : 'none' }}
          >
            {/* Avatar */}
            <div style={s.avatar(doc.color)}>{doc.avatar}</div>

            {/* Info */}
            <div style={s.info}>
              <div style={s.name}>{doc.nom}</div>
              <div style={s.spec}>{doc.specialty} · {doc.wilaya}</div>
            </div>

            {/* Dispo dot */}
            <div style={doc.disponible ? s.dotOn : s.dotOff} title={doc.disponible ? 'Disponible' : 'Indisponible'} />

            {/* Actions */}
            <div style={s.actions}>
              <button
                style={s.rdvBtn}
                onClick={() => navigate('/doctors')}
              >
                📅 RDV
              </button>
              <button
                style={s.heartBtn}
                onClick={() => { removeFavori(doc.id); toast.success(`${doc.nom} retiré des favoris`); }}
                title="Retirer des favoris"
              >
                ❤️
              </button>
            </div>
          </div>
        ))}
      </div>

      {favoris.length > displayed.length && (
        <div style={s.moreRow} onClick={() => navigate('/patient/favoris')}>
          +{favoris.length - displayed.length} autre{favoris.length - displayed.length > 1 ? 's' : ''} médecin{favoris.length - displayed.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/**
 * HeartButton — bouton ❤️ à mettre sur chaque carte médecin dans DoctorSearchPage
 * Usage : <HeartButton doctor={doctorObject} />
 */
export function HeartButton({ doctor, style = {} }) {
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(doctor.id);

  const handleClick = (e) => {
    e.stopPropagation();
    const added = toggleFavori(doctor);
    toast.success(added ? `${doctor.nom} ajouté aux favoris ❤️` : `${doctor.nom} retiré des favoris`);
  };

  return (
    <button
      onClick={handleClick}
      title={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      style={{
        background: 'none',
        border: favori ? '1.5px solid #FCA5A5' : '1.5px solid #E2E8F0',
        borderRadius: '8px',
        padding: '7px 10px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: favori ? '#FFF1F2' : '#fff',
        transition: 'all 0.15s',
        ...style,
      }}
    >
      {favori ? '❤️' : '🤍'}
    </button>
  );
}

/* ─── STYLES ─── */
const s = {
  wrap: { backgroundColor: '#fff', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  headerTitle: { fontSize: '15px', fontWeight: '800', color: '#0F172A' },
  badge: { fontSize: '11px', fontWeight: '700', backgroundColor: '#FEE2E2', color: '#EF4444', padding: '2px 8px', borderRadius: '20px' },
  voirTout: { fontSize: '13px', fontWeight: '600', color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column' },
  row: { padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: (color) => ({ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: color + '18', color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }),
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: '14px', fontWeight: '700', color: '#0D9488' },
  spec: { fontSize: '12px', color: '#94A3B8', marginTop: '1px' },
  dotOn: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E', flexShrink: 0 },
  dotOff: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CBD5E1', flexShrink: 0 },
  actions: { display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 },
  rdvBtn: { backgroundColor: '#CCFBF1', color: '#0D9488', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  heartBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '2px' },
  moreRow: { padding: '12px 20px', fontSize: '13px', color: '#0D9488', fontWeight: '600', cursor: 'pointer', textAlign: 'center', borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFFFE' },
};