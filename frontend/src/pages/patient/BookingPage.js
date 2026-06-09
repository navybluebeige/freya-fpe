import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function BookingPage() {
    const { id: doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    
    const [bookingData, setBookingData] = useState({
        patientName: 'Moi (Améla)', // À adapter selon le user connecté
        category: '',
        date: '',
        time: '',
        motif: ''
    });

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const res = await api.get(`/doctors/${doctorId}`);
                setDoctor(res.data);
                setLoading(false);
            } catch (err) {
                toast.error("Erreur de chargement");
                setLoading(false);
            }
        };
        fetchDoc();
    }, [doctorId]);

    if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Chargement...</div>;

    const renderHeader = () => (
        <div style={s.header}>
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={s.backBtn}>‹</button>
            <div style={s.headerInfo}>
                <p style={s.headerSubtitle}>Prendre rendez-vous</p>
                <h1 style={s.headerTitle}>Dr {doctor?.user?.firstName} {doctor?.user?.lastName}</h1>
            </div>
            <img src="https://via.placeholder.com/40" style={s.headerAvatar} alt="doc" />
        </div>
    );

    return (
        <div style={s.page}>
            {renderHeader()}
            
            <div style={s.content}>
                {/* ETAPE 1 : POUR QUI */}
                {step === 1 && (
                    <>
                        <h2 style={s.mainTitle}>Pour qui prenez-vous ce rendez-vous ?</h2>
                        <div style={s.listContainer}>
                            <div style={s.listItem} onClick={() => setStep(2)}>
                                <div style={s.initials}>EZ</div>
                                <span style={s.itemText}>Elias ZEKRI (moi)</span>
                            </div>
                            <div style={s.listItem} onClick={() => setStep(2)}>
                                <div style={s.plusIcon}>+</div>
                                <span style={s.blueText}>Ajouter un proche</span>
                            </div>
                        </div>
                    </>
                )}

                {/* ETAPE 2 : CATEGORIE (Comme ta capture 4) */}
                {step === 2 && (
                    <>
                        <h2 style={s.mainTitle}>Sélectionnez la catégorie</h2>
                        <div style={s.listContainer}>
                            {['Toutes catégories', 'Prothèse fixée', 'Soins', 'Parodontologie', 'Autre'].map(cat => (
                                <div key={cat} style={s.listItemSimple} onClick={() => { setBookingData({...bookingData, category: cat}); setStep(3); }}>
                                    {cat}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ETAPE 3 : DATE ET HEURE (Comme ta capture 2) */}
                {step === 3 && (
                    <>
                        <h2 style={s.mainTitle}>Choisissez la date de consultation</h2>
                        <div style={s.dateCard}>
                            <div style={s.dateHeader}>Jeudi 16 avril 2026 <span>⌃</span></div>
                            <div style={s.timeGrid}>
                                {['13:30', '16:00', '16:50'].map(t => (
                                    <button key={t} style={s.timeSlot} onClick={() => { setBookingData({...bookingData, time: t, date: '2026-04-16'}); setStep(4); }}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {['Vendredi 17 avril', 'Mardi 21 avril'].map(d => (
                            <div key={d} style={s.dateCardSmall}>{d} <span>⌄</span></div>
                        ))}
                    </>
                )}

                {/* ETAPE 4 : CONFIRMATION (Comme ta capture 3) */}
                {step === 4 && (
                    <>
                        <h2 style={s.mainTitle}>Confirmez le rendez-vous</h2>
                        <div style={s.recapCard}>
                            <div style={s.recapHeader}>
                                <img src="https://via.placeholder.com/50" style={s.recapAvatar} alt="doc" />
                                <div>
                                    <h3 style={s.recapDocName}>Dr {doctor?.user?.firstName} {doctor?.user?.lastName}</h3>
                                    <p style={s.recapDocSpec}>{doctor?.specialite}</p>
                                </div>
                            </div>
                            <div style={s.recapDetails}>
                                <p>👤 Pour {bookingData.patientName}</p>
                                <p>📅 Jeudi 16 avril • {bookingData.time}</p>
                                <p>📍 Cabinet Médical - 75018 Paris</p>
                                <p>🩺 {bookingData.category}</p>
                            </div>
                        </div>
                        <button style={s.confirmBtn} onClick={() => toast.success("RDV Confirmé !")}>
                            CONFIRMER LE RENDEZ-VOUS
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

const s = {
    page: { backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' },
    header: { backgroundColor: '#0070BA', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' },
    backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer' },
    headerInfo: { flex: 1 },
    headerSubtitle: { margin: 0, fontSize: '12px', opacity: 0.8 },
    headerTitle: { margin: 0, fontSize: '18px', fontWeight: 'bold' },
    headerAvatar: { borderRadius: '50%', width: '40px', height: '40px', border: '2px solid white' },
    content: { padding: '25px 20px' },
    mainTitle: { color: '#003366', fontSize: '22px', fontWeight: 'bold', marginBottom: '25px', lineHeight: '1.2' },
    listContainer: { border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' },
    listItem: { padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #E5E7EB', cursor: 'pointer' },
    listItemSimple: { padding: '20px 15px', borderBottom: '1px solid #E5E7EB', color: '#003366', fontSize: '16px', cursor: 'pointer' },
    initials: { backgroundColor: '#008577', color: 'white', padding: '8px', borderRadius: '50%', fontWeight: 'bold', minWidth: '35px', textAlign: 'center' },
    plusIcon: { color: '#0070BA', fontSize: '24px', minWidth: '35px', textAlign: 'center' },
    itemText: { fontSize: '16px', color: '#333', fontWeight: 'bold' },
    blueText: { color: '#0070BA', fontWeight: 'bold' },
    dateCard: { border: '2px solid #0070BA', borderRadius: '12px', padding: '15px', marginBottom: '10px' },
    dateHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#003366', marginBottom: '15px' },
    timeGrid: { display: 'flex', gap: '10px' },
    timeSlot: { backgroundColor: '#EBF6FF', color: '#003366', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    dateCardSmall: { border: '1px solid #E5E7EB', borderRadius: '12px', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', color: '#333', fontWeight: 'bold' },
    recapCard: { border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', marginBottom: '30px' },
    recapHeader: { display: 'flex', gap: '15px', borderBottom: '1px solid #F3F4F6', paddingBottom: '15px', marginBottom: '15px' },
    recapAvatar: { width: '50px', height: '50px', borderRadius: '8px' },
    recapDocName: { margin: 0, fontSize: '16px', color: '#003366' },
    recapDocSpec: { margin: 0, fontSize: '14px', color: '#666' },
    recapDetails: { display: 'flex', flexDirection: 'column', gap: '12px', color: '#003366', fontSize: '15px' },
    confirmBtn: { width: '100%', backgroundColor: '#0070BA', color: 'white', border: 'none', padding: '18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }
};