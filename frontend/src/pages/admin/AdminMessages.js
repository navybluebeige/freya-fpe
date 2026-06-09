import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([adminAPI.getPendingDoctors(), adminAPI.getAllDoctors({ approved: 1 })]).then(([p, a]) => {
      setPending(p.data.doctors || []);
      setAll(a.data.doctors || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const approve = async (id, approved) => {
    try {
      await adminAPI.approveDoctor(id, approved);
      toast.success(approved ? '✅ Médecin approuvé !' : '❌ Médecin refusé');
      load();
    } catch { toast.error('Erreur'); }
  };

  const DoctorRow = ({ d, showActions }) => (
    <tr>
      <td>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div className="avatar avatar-sm">{d.first_name?.[0]}{d.last_name?.[0]}</div>
          <div><div style={{ fontWeight: 600 }}>Dr. {d.first_name} {d.last_name}</div><div style={{ fontSize:'0.78rem', color:'var(--muted)' }}>{d.email}</div></div>
        </div>
      </td>
      <td><span className="badge badge-teal">{d.specialite}</span></td>
      <td>{d.wilaya}</td>
      <td><code style={{ background:'var(--cream)', padding:'2px 8px', borderRadius:'6px', fontSize:'0.8rem' }}>{d.ordre_number}</code></td>
      <td>{new Date(d.registered_at || d.created_at).toLocaleDateString('fr-FR')}</td>
      {showActions && (
        <td style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => approve(d.id, true)} className="btn btn-primary btn-sm">✓ Approuver</button>
          <button onClick={() => approve(d.id, false)} className="btn btn-danger btn-sm">✗ Refuser</button>
        </td>
      )}
    </tr>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">Gestion des médecins</span>
        </div>
        <div className="page-content">
          <div className="page-header">
            <h1>Médecins</h1>
            <p>Validez les nouvelles inscriptions et gérez les médecins actifs</p>
          </div>

          <div className="tabs" style={{ display:'flex', gap:0, borderBottom:'2px solid var(--sand)', marginBottom:'1.5rem' }}>
            {[['pending', `⏳ En attente (${pending.length})`], ['all', `✅ Approuvés (${all.length})`]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding:'12px 24px', background:'none', border:'none', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:'0.9rem', cursor:'pointer', color: tab===key ? 'var(--teal)' : 'var(--muted)', borderBottom: tab===key ? '2.5px solid var(--teal)' : '2.5px solid transparent', marginBottom:'-2px' }}>
                {label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? <div className="loading-page"><div className="spinner"/></div> : (
              <div className="table-wrap">
                {tab === 'pending' && (
                  pending.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">✅</div><h3>Aucune demande en attente</h3><p>Toutes les inscriptions ont été traitées</p></div>
                  ) : (
                    <table>
                      <thead><tr><th>Médecin</th><th>Spécialité</th><th>Wilaya</th><th>N° Ordre</th><th>Date</th><th>Actions</th></tr></thead>
                      <tbody>{pending.map(d => <DoctorRow key={d.id} d={d} showActions />)}</tbody>
                    </table>
                  )
                )}
                {tab === 'all' && (
                  all.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">👨‍⚕️</div><h3>Aucun médecin approuvé</h3></div>
                  ) : (
                    <table>
                      <thead><tr><th>Médecin</th><th>Spécialité</th><th>Wilaya</th><th>N° Ordre</th><th>Depuis</th></tr></thead>
                      <tbody>{all.map(d => <DoctorRow key={d.id} d={d} showActions={false} />)}</tbody>
                    </table>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
