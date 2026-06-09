import React from 'react';
import { Link } from 'react-router-dom';

const ClockIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function StubPage({ title, back, backLabel }) {
  return (
    <div style={{ fontFamily: "'Inter','DM Sans',sans-serif", backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <ClockIcon />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.3px' }}>{title}</h2>
        <p style={{ fontSize: '14px', color: '#64748B' }}>Cette section est en cours de développement.</p>
      </div>
      {back && (
        <Link to={back} style={{ backgroundColor: '#2563EB', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
          {backLabel || 'Retour'}
        </Link>
      )}
    </div>
  );
}

export function AdminClinics()   { return <StubPage title="Gestion des cliniques" back="/admin"  backLabel="Retour au tableau de bord" />; }
