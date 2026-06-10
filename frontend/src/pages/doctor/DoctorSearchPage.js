import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

/* ─── Coordonnées GPS des wilayas algériennes ─── */
const WILAYA_COORDS = {
  'Adrar':{lat:27.87,lng:0.28},'Chlef':{lat:36.16,lng:1.33},'Laghouat':{lat:33.8,lng:2.86},
  'Oum El Bouaghi':{lat:35.87,lng:7.11},'Batna':{lat:35.56,lng:6.17},'Béjaïa':{lat:36.75,lng:5.06},
  'Biskra':{lat:34.85,lng:5.73},'Béchar':{lat:31.62,lng:-2.22},'Blida':{lat:36.47,lng:2.83},
  'Bouira':{lat:36.37,lng:3.9},'Tamanrasset':{lat:22.78,lng:5.52},'Tébessa':{lat:35.4,lng:8.12},
  'Tlemcen':{lat:34.88,lng:-1.32},'Tiaret':{lat:35.37,lng:1.32},'Tizi Ouzou':{lat:36.72,lng:4.05},
  'Alger':{lat:36.74,lng:3.06},'Djelfa':{lat:34.67,lng:3.26},'Jijel':{lat:36.82,lng:5.77},
  'Sétif':{lat:36.19,lng:5.41},'Saïda':{lat:34.83,lng:0.15},'Skikda':{lat:36.88,lng:6.9},
  'Sidi Bel Abbès':{lat:35.19,lng:-0.63},'Annaba':{lat:36.9,lng:7.77},'Guelma':{lat:36.46,lng:7.43},
  'Constantine':{lat:36.36,lng:6.61},'Médéa':{lat:36.26,lng:2.75},'Mostaganem':{lat:35.93,lng:0.09},
  "M'Sila":{lat:35.7,lng:4.54},'Mascara':{lat:35.4,lng:0.14},'Ouargla':{lat:31.95,lng:5.32},
  'Oran':{lat:35.7,lng:-0.63},'El Bayadh':{lat:33.68,lng:1.01},'Illizi':{lat:26.48,lng:8.48},
  'Bordj Bou Arréridj':{lat:36.07,lng:4.76},'Boumerdès':{lat:36.76,lng:3.47},'El Tarf':{lat:36.77,lng:8.31},
  'Tindouf':{lat:27.67,lng:-8.14},'Tissemsilt':{lat:35.6,lng:1.81},'El Oued':{lat:33.37,lng:6.86},
  'Khenchela':{lat:35.43,lng:7.14},'Souk Ahras':{lat:36.28,lng:7.94},'Tipaza':{lat:36.59,lng:2.45},
  'Mila':{lat:36.45,lng:6.26},'Aïn Defla':{lat:36.26,lng:1.97},'Naâma':{lat:33.27,lng:-0.31},
  'Aïn Témouchent':{lat:35.3,lng:-1.14},'Ghardaïa':{lat:32.49,lng:3.67},'Relizane':{lat:35.74,lng:0.56},
};

const WILAYAS = [
  {code:'01',nom:'Adrar'},{code:'02',nom:'Chlef'},{code:'03',nom:'Laghouat'},
  {code:'04',nom:'Oum El Bouaghi'},{code:'05',nom:'Batna'},{code:'06',nom:'Béjaïa'},
  {code:'07',nom:'Biskra'},{code:'08',nom:'Béchar'},{code:'09',nom:'Blida'},
  {code:'10',nom:'Bouira'},{code:'11',nom:'Tamanrasset'},{code:'12',nom:'Tébessa'},
  {code:'13',nom:'Tlemcen'},{code:'14',nom:'Tiaret'},{code:'15',nom:'Tizi Ouzou'},
  {code:'16',nom:'Alger'},{code:'17',nom:'Djelfa'},{code:'18',nom:'Jijel'},
  {code:'19',nom:'Sétif'},{code:'20',nom:'Saïda'},{code:'21',nom:'Skikda'},
  {code:'22',nom:'Sidi Bel Abbès'},{code:'23',nom:'Annaba'},{code:'24',nom:'Guelma'},
  {code:'25',nom:'Constantine'},{code:'26',nom:'Médéa'},{code:'27',nom:'Mostaganem'},
  {code:'28',nom:"M'Sila"},{code:'29',nom:'Mascara'},{code:'30',nom:'Ouargla'},
  {code:'31',nom:'Oran'},{code:'32',nom:'El Bayadh'},{code:'33',nom:'Illizi'},
  {code:'34',nom:'Bordj Bou Arréridj'},{code:'35',nom:'Boumerdès'},{code:'36',nom:'El Tarf'},
  {code:'37',nom:'Tindouf'},{code:'38',nom:'Tissemsilt'},{code:'39',nom:'El Oued'},
  {code:'40',nom:'Khenchela'},{code:'41',nom:'Souk Ahras'},{code:'42',nom:'Tipaza'},
  {code:'43',nom:'Mila'},{code:'44',nom:'Aïn Defla'},{code:'45',nom:'Naâma'},
  {code:'46',nom:'Aïn Témouchent'},{code:'47',nom:'Ghardaïa'},{code:'48',nom:'Relizane'},
];

const SPECS_GROUPED = {
  'Médecine générale':['Médecin généraliste','Médecine interne',"Médecine d'urgence",'Médecine du travail'],
  'Chirurgie':['Chirurgien général','Chirurgien orthopédiste','Neurochirurgien','Chirurgien plasticien','Chirurgien vasculaire'],
  'Médecine spécialisée':['Cardiologue','Pneumologue','Gastro-entérologue','Néphrologue','Endocrinologue','Rhumatologue','Neurologue','Hématologue','Infectiologue','Oncologue','Allergologue'],
  'Femme & Enfant':['Gynécologue','Gynécologue-obstétricien','Pédiatre','Néonatologiste','Pédopsychiatre'],
  'Spécialités sensorielles':['Ophtalmologue','ORL','Audiologiste'],
  'Dermatologie':['Dermatologue','Vénérologue'],
  'Santé mentale':['Psychiatre','Psychologue clinicien','Neuropsychiatre'],
  'Imagerie & Biologie':['Radiologue','Biologiste médical'],
  'Rééducation':['Kinésithérapeute','Médecin rééducateur','Orthophoniste'],
  'Stomatologie':['Dentiste','Orthodontiste','Chirurgien dentiste'],
  'Autres':['Anesthésiste-réanimateur','Gériatre','Urologue','Nutritionniste','Médecin sportif'],
};
const ALL_SPECS = Object.values(SPECS_GROUPED).flat();

const PRICE_RANGES = [
  {label:'Tous les tarifs', min:0, max:99999},
  {label:'Moins de 1 500 DA', min:0, max:1499},
  {label:'1 500 – 2 500 DA', min:1500, max:2500},
  {label:'2 500 – 4 000 DA', min:2501, max:4000},
  {label:'Plus de 4 000 DA', min:4001, max:99999},
];

const SORT_OPTIONS = [
  {value:'rating',    label:'Meilleure note'},
  {value:'price_asc', label:'Prix croissant'},
  {value:'price_desc',label:'Prix décroissant'},
  {value:'experience',label:'Plus expérimenté'},
  {value:'name',      label:'Alphabétique'},
];

const LANGUAGES = ['Arabe','Français','Tamazight','Anglais','Espagnol'];

/* ─── CSS ─────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.sp { font-family:'DM Sans',-apple-system,sans-serif; background:#f0f4ff; min-height:100vh; color:#0F172A; }

.sp-nav { background:#fff; height:72px; display:flex; align-items:center; border-bottom:1px solid #E2E8F0; padding:0 40px; position:sticky; top:0; z-index:200; }
.sp-nav-in { max-width:1400px; margin:0 auto; height:100%; display:flex; align-items:center; width:100%; }
.sp-logo { font-size:24px; font-weight:800; color:#2563EB; text-decoration:none; margin-right:32px; flex-shrink:0; letter-spacing:-0.5px; }
.sp-nav-links { display:flex; gap:4px; align-items:center; }
.sp-nav-link { text-decoration:none; font-size:13px; font-weight:600; color:#64748B; padding:7px 12px; border-radius:8px; transition:all .15s; }
.sp-nav-link:hover { color:#2563EB; background:#EFF6FF; }
.sp-nav-link.active { color:#2563EB; background:#EFF6FF; }
.sp-nav-right { margin-left:auto; display:flex; align-items:center; gap:12px; }
.sp-nav-btn-rdv { background:#2563EB; color:#fff; padding:9px 18px; border-radius:9px; font-weight:700; text-decoration:none; font-size:13px; }
.sp-user-pill { display:flex; align-items:center; gap:10px; border:1.5px solid #E2E8F0; padding:5px 12px; border-radius:12px; cursor:pointer; transition:all .15s; }
.sp-user-pill:hover { border-color:#2563EB; background:#EFF6FF; }
.sp-user-av { width:32px; height:32px; background:#2563EB; color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; flex-shrink:0; }
/* HERO SEARCH */
.sp-hero { background:linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%); padding:32px 32px 48px; position:relative; overflow:hidden; }
.sp-hero::before { content:''; position:absolute; top:-60px; right:-80px; width:300px; height:300px; border-radius:50%; background:rgba(255,255,255,0.05); }
.sp-hero::after  { content:''; position:absolute; bottom:-40px; left:10%; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.04); }
.sp-hero-in { max-width:1280px; margin:0 auto; position:relative; z-index:1; }
.sp-hero-title { font-size:22px; font-weight:700; color:#fff; margin-bottom:18px; opacity:0.95; }
.sp-hero-title span { color:#BFDBFE; }

.sp-searchbar { display:flex; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.15); height:56px; }
.sp-sb-field { flex:1; display:flex; align-items:center; padding:0 18px; gap:10px; border-right:1px solid #F1F5F9; min-width:0; }
.sp-sb-field svg { color:#94A3B8; flex-shrink:0; }
.sp-sb-field input { border:none; outline:none; font-size:15px; font-family:inherit; color:#0F172A; width:100%; font-weight:500; }
.sp-sb-field input::placeholder { color:#CBD5E1; font-weight:400; }
.sp-sb-loc { display:flex; align-items:center; padding:0 16px; gap:8px; min-width:180px; border-right:1px solid #F1F5F9; cursor:pointer; }
.sp-sb-loc svg { color:#2563EB; flex-shrink:0; }
.sp-sb-loc select { border:none; outline:none; font-size:14px; font-family:inherit; color:#0F172A; background:transparent; cursor:pointer; appearance:none; font-weight:500; max-width:140px; }
.sp-sb-btn { background:#2563EB; color:#fff; border:none; padding:0 28px; font-size:15px; font-weight:700; cursor:pointer; font-family:inherit; transition:background 0.15s; white-space:nowrap; letter-spacing:0.3px; }
.sp-sb-btn:hover { background:#1D4ED8; }

/* FILTER BAR */
.sp-fbar { background:#fff; border-bottom:1px solid #E2E8F0; padding:0 32px; box-shadow:0 1px 3px rgba(0,0,0,0.04); position:sticky; top:68px; z-index:150; }
.sp-fbar-in { max-width:1280px; margin:0 auto; display:flex; align-items:center; gap:8px; height:52px; }
.sp-fbtn { display:inline-flex; align-items:center; gap:7px; padding:7px 14px; border-radius:20px; border:1.5px solid #E2E8F0; background:#fff; color:#475569; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; position:relative; }
.sp-fbtn:hover { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.sp-fbtn.active { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }
.sp-fbtn-badge { background:#2563EB; color:#fff; font-size:10px; font-weight:800; padding:1px 6px; border-radius:20px; min-width:18px; text-align:center; }
.sp-fbtn-soon { font-size:9px; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; padding:1px 5px; border-radius:10px; font-weight:700; }
.sp-fbar-sep { width:1px; height:22px; background:#E2E8F0; margin:0 4px; flex-shrink:0; }
.sp-fbar-right { margin-left:auto; display:flex; align-items:center; gap:8px; }
.sp-view-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:20px; border:1.5px solid #E2E8F0; background:#fff; color:#475569; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.sp-view-btn:hover, .sp-view-btn.active { border-color:#2563EB; color:#2563EB; background:#EFF6FF; }

/* CHIPS actifs */
.sp-chips { background:#F8FAFC; border-bottom:1px solid #E2E8F0; padding:8px 32px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.sp-chips-in { max-width:1280px; margin:0 auto; display:flex; align-items:center; gap:6px; flex-wrap:wrap; width:100%; }
.sp-chip { display:inline-flex; align-items:center; gap:4px; background:#EFF6FF; border:1px solid #BFDBFE; color:#1E40AF; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.1s; }
.sp-chip:hover { background:#DBEAFE; }
.sp-chip-clear { font-size:12px; color:#94A3B8; cursor:pointer; font-weight:700; }
.sp-chip-clear:hover { color:#EF4444; }

/* MODAL FILTRE */
.sp-modal-bg { position:fixed; inset:0; background:rgba(15,23,42,0.4); z-index:500; display:flex; align-items:flex-end; justify-content:center; backdrop-filter:blur(2px); animation:bgIn 0.2s ease; }
@keyframes bgIn { from{opacity:0} to{opacity:1} }
.sp-modal { background:#fff; border-radius:20px 20px 0 0; width:100%; max-width:560px; max-height:85vh; overflow-y:auto; padding:0 0 32px; animation:modalIn 0.25s ease; }
@keyframes modalIn { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
.sp-modal-head { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 16px; border-bottom:1px solid #F1F5F9; position:sticky; top:0; background:#fff; z-index:1; }
.sp-modal-title { font-size:17px; font-weight:800; color:#0F172A; }
.sp-modal-close { width:32px; height:32px; border-radius:50%; border:1.5px solid #E2E8F0; background:#fff; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; color:#64748B; }
.sp-modal-close:hover { background:#F1F5F9; }
.sp-modal-section { padding:20px 24px 0; }
.sp-modal-sec-title { font-size:13px; font-weight:800; color:#0F172A; margin-bottom:12px; }
.sp-modal-opts { display:flex; flex-direction:column; gap:0; border:1.5px solid #E2E8F0; border-radius:12px; overflow:hidden; }
.sp-modal-opt { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; border-bottom:1px solid #F1F5F9; transition:background 0.1s; }
.sp-modal-opt:last-child { border-bottom:none; }
.sp-modal-opt:hover { background:#F8FAFC; }
.sp-modal-opt.sel { background:#EFF6FF; }
.sp-modal-opt input[type=radio], .sp-modal-opt input[type=checkbox] { accent-color:#2563EB; width:16px; height:16px; cursor:pointer; flex-shrink:0; }
.sp-modal-opt-lbl { font-size:14px; color:#475569; font-weight:500; flex:1; }
.sp-modal-opt.sel .sp-modal-opt-lbl { color:#1E40AF; font-weight:700; }
.sp-modal-soon { font-size:10px; background:#FEF3C7; color:#92400E; border:1px solid #FDE68A; padding:2px 7px; border-radius:10px; font-weight:700; }
.sp-modal-footer { padding:16px 24px 0; display:flex; gap:10px; }
.sp-modal-reset { flex:1; padding:12px; border:1.5px solid #E2E8F0; border-radius:10px; background:#fff; color:#64748B; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; }
.sp-modal-reset:hover { border-color:#EF4444; color:#EF4444; }
.sp-modal-apply { flex:2; padding:12px; border:none; border-radius:10px; background:#2563EB; color:#fff; font-size:14px; font-weight:800; cursor:pointer; font-family:inherit; }
.sp-modal-apply:hover { background:#1D4ED8; }

/* BODY */
.sp-body { max-width:1280px; margin:0 auto; padding:24px 32px; }

/* SORT & COUNT */
.sp-results-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; gap:12px; flex-wrap:wrap; }
.sp-count { font-size:14px; color:#64748B; font-weight:500; }
.sp-count strong { color:#0F172A; font-weight:800; font-size:16px; }
.sp-sort-wrap { display:flex; align-items:center; gap:8px; }
.sp-sort-lbl { font-size:12px; color:#94A3B8; font-weight:600; }
.sp-sort-sel { background:#fff; border:1.5px solid #E2E8F0; border-radius:9px; padding:7px 12px; font-size:13px; font-family:inherit; color:#0F172A; outline:none; cursor:pointer; font-weight:600; }
.sp-sort-sel:focus { border-color:#2563EB; }

/* TABS */
.sp-tabs { display:flex; gap:0; margin-bottom:18px; border-bottom:2px solid #E2E8F0; }
.sp-tab { padding:11px 24px; font-size:14px; font-weight:600; color:#94A3B8; cursor:pointer; border:none; background:none; font-family:inherit; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.15s; }
.sp-tab:hover { color:#2563EB; }
.sp-tab.on { color:#2563EB; font-weight:800; border-bottom:2px solid #2563EB; }

/* DOCTOR CARD — style Doctolib */
.sp-doc-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:16px; padding:20px 22px; margin-bottom:10px; display:flex; gap:18px; cursor:pointer; transition:all 0.18s; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
.sp-doc-card:hover { border-color:#2563EB; box-shadow:0 6px 24px rgba(37,99,235,0.13); transform:translateY(-2px); }

.sp-doc-av { width:76px; height:76px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#1D4ED8 0%,#2563EB 100%); display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:900; color:#fff; letter-spacing:-0.5px; border:3px solid #E2E8F0; }
.sp-doc-av img { width:100%; height:100%; border-radius:50%; object-fit:cover; }

.sp-doc-body { flex:1; min-width:0; }
.sp-doc-name { font-size:17px; font-weight:800; color:#0F172A; margin-bottom:2px; }
.sp-doc-name:hover { color:#2563EB; }
.sp-doc-spec { font-size:14px; color:#2563EB; font-weight:700; margin-bottom:8px; }
.sp-doc-row { display:flex; align-items:center; gap:6px; font-size:13px; color:#64748B; margin-bottom:5px; flex-wrap:wrap; }
.sp-doc-row svg { color:#94A3B8; flex-shrink:0; }
.sp-verified { display:inline-flex; align-items:center; gap:3px; font-size:11px; color:#1D4ED8; font-weight:700; background:#EFF6FF; padding:2px 7px; border-radius:20px; border:1px solid #93C5FD; }
.sp-doc-langs { display:flex; gap:5px; flex-wrap:wrap; margin-top:8px; }
.sp-lang-tag { font-size:11px; padding:3px 9px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:20px; color:#475569; font-weight:600; }

.sp-doc-right { display:flex; flex-direction:column; align-items:flex-end; justify-content:space-between; gap:10px; min-width:150px; flex-shrink:0; padding-left:18px; border-left:1px solid #F1F5F9; }
.sp-stars { display:flex; align-items:center; gap:4px; }
.sp-stars-ic { color:#F59E0B; font-size:13px; letter-spacing:-1px; }
.sp-stars-ct { font-size:11px; color:#94A3B8; font-weight:600; }
.sp-price { font-size:20px; font-weight:800; color:#0F172A; text-align:right; letter-spacing:-0.5px; }
.sp-price-lbl { font-size:10px; color:#94A3B8; display:block; margin-top:1px; text-align:right; }
.sp-rdv-btn { background:#2563EB; color:#fff; border:none; border-radius:10px; padding:10px 20px; font-size:13px; font-weight:800; cursor:pointer; font-family:inherit; transition:all 0.15s; white-space:nowrap; width:100%; text-align:center; }
.sp-rdv-btn:hover { background:#1D4ED8; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.3); }

/* LAB CARD */
.sp-lab-card { background:#fff; border:1.5px solid #E2E8F0; border-radius:16px; padding:20px 22px; margin-bottom:10px; display:flex; gap:16px; cursor:pointer; transition:all 0.18s; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
.sp-lab-card:hover { border-color:#2563EB; box-shadow:0 6px 24px rgba(37,99,235,0.13); transform:translateY(-2px); }
.sp-lab-ic { width:60px; height:60px; border-radius:14px; background:linear-gradient(135deg,#1D4ED8,#2563EB); display:flex; align-items:center; justify-content:center; font-size:26px; flex-shrink:0; }

/* MAP */
.sp-map-wrap { border-radius:16px; overflow:hidden; border:1.5px solid #E2E8F0; box-shadow:0 2px 12px rgba(0,0,0,0.08); margin-bottom:16px; }
#freya-map { height:480px; width:100%; }

/* EMPTY */
.sp-empty { text-align:center; padding:64px 20px; background:#fff; border-radius:16px; border:1.5px solid #E2E8F0; }
.sp-empty-ic { font-size:48px; margin-bottom:16px; opacity:0.3; }
.sp-empty h3 { font-size:17px; font-weight:800; color:#0F172A; margin-bottom:8px; }
.sp-empty p { font-size:13px; color:#94A3B8; }

/* SPINNER */
.sp-spin { width:36px; height:36px; border:3px solid #E2E8F0; border-top-color:#2563EB; border-radius:50%; animation:sp-r 0.7s linear infinite; margin:60px auto; }
@keyframes sp-r { to{transform:rotate(360deg);} }

/* PAGINATION */
.sp-pager { display:flex; justify-content:center; gap:5px; margin-top:24px; flex-wrap:wrap; }
.sp-pg-btn { min-width:38px; height:38px; border-radius:10px; border:1.5px solid #E2E8F0; background:#fff; color:#475569; font-size:13px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.12s; display:flex; align-items:center; justify-content:center; padding:0 10px; }
.sp-pg-btn:hover { border-color:#2563EB; color:#2563EB; }
.sp-pg-btn.on { background:#2563EB; color:#fff; border-color:#2563EB; }
.sp-pg-btn:disabled { opacity:0.35; cursor:not-allowed; }

/* USER MENU */
.sp-user-btn { display:flex; align-items:center; gap:8px; padding:6px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.3); background:rgba(255,255,255,0.1); cursor:pointer; transition:all 0.15s; margin-left:auto; flex-shrink:0; }
.sp-user-btn:hover { background:rgba(255,255,255,0.2); }
.sp-user-av { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.25); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; flex-shrink:0; }
.sp-user-name { font-size:13px; font-weight:700; color:#fff; }
.sp-user-role { font-size:10px; color:rgba(255,255,255,0.65); }
.sp-dropdown { position:absolute; top:54px; right:0; width:230px; background:#fff; border:1px solid #E2E8F0; border-radius:14px; box-shadow:0 10px 40px rgba(0,0,0,0.12); z-index:300; overflow:hidden; }
.sp-drop-top { padding:16px; border-bottom:1px solid #F1F5F9; display:flex; gap:10px; align-items:center; }
.sp-drop-av { width:36px; height:36px; border-radius:50%; background:#2563EB; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; }
.sp-drop-item { padding:11px 16px; font-size:13px; cursor:pointer; color:#0F172A; transition:background 0.1s; }
.sp-drop-item:hover { background:#F8FAFC; }
.sp-drop-item.danger { color:#EF4444; }
.sp-drop-item.danger:hover { background:#FEF2F2; }

@media(max-width:768px) {
  .sp-hero { padding:20px 16px 36px; }
  .sp-searchbar { flex-direction:column; height:auto; border-radius:12px; }
  .sp-sb-field, .sp-sb-loc { border-right:none; border-bottom:1px solid #F1F5F9; height:52px; }
  .sp-sb-btn { height:48px; border-radius:0 0 12px 12px; }
  .sp-fbar { padding:0 12px; overflow-x:auto; }
  .sp-fbar-in { gap:6px; min-width:max-content; }
  .sp-body { padding:12px; }
  .sp-doc-card { flex-direction:column; padding:16px; gap:12px; }
  .sp-doc-right { flex-direction:row; border-left:none; border-top:1px solid #F1F5F9; padding-left:0; padding-top:12px; min-width:0; width:100%; align-items:center; }
  .sp-nav { padding:0 16px; }
  .sp-nav-links { display:none; }
  .sp-nav-btn-rdv { display:none; }
  .sp-doc-av { width:52px; height:52px; font-size:18px; }
  .sp-results-head { flex-direction:column; align-items:flex-start; }
  #freya-map { height:300px; }
}
`;

export default function DoctorSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuthStore();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef([]);

  /* ─── State ─── */
  const [query,        setQuery]       = useState(searchParams.get('specialite') || '');
  const [wilaya,       setWilaya]      = useState(searchParams.get('wilaya') || '');
  const [tab,          setTab]         = useState('doctors');
  const [doctors,      setDoctors]     = useState([]);
  const [labs,         setLabs]        = useState([]);
  const [loading,      setLoading]     = useState(false);
  const [total,        setTotal]       = useState(0);
  const [page,         setPage]        = useState(1);
  const [showMap,      setShowMap]     = useState(false);
  const [showUserMenu, setShowUserMenu]= useState(false);

  /* Filtres */
  const [selWilayas,  setSelWilayas]  = useState(searchParams.get('wilaya') ? [searchParams.get('wilaya')] : []);
  const [selSpecs,    setSelSpecs]    = useState(searchParams.get('specialite') ? [searchParams.get('specialite')] : []);
  const [priceRange,  setPriceRange]  = useState(0);
  const [sortBy,      setSortBy]      = useState('rating');

  /* Modals filtres */
  const [openModal,   setOpenModal]   = useState(null); // 'spec' | 'wilaya' | 'price' | 'lang'
  const [specSearch,  setSpecSearch]  = useState('');
  const [wilayaSearch,setWilayaSearch]= useState('');

  const PER_PAGE = 10;

  /* ─── User info ─── */
  const firstName = user?.firstName || user?.first_name || 'Patient';
  const lastName  = user?.lastName  || user?.last_name  || '';
  const initials  = `${firstName[0]||'P'}${lastName[0]||''}`.toUpperCase();
  const handleLogout = () => { logout(); navigate('/login'); toast.success('Déconnecté'); };

  /* ─── Fetch ─── */
  const sort = (list, s) => {
    const c = [...list];
    switch(s) {
      case 'rating':     return c.sort((a,b) => (b.ratingAvg||0)-(a.ratingAvg||0));
      case 'price_asc':  return c.sort((a,b) => (a.consultationPrice||0)-(b.consultationPrice||0));
      case 'price_desc': return c.sort((a,b) => (b.consultationPrice||0)-(a.consultationPrice||0));
      case 'experience': return c.sort((a,b) => (b.experienceYears||0)-(a.experienceYears||0));
      case 'name':       return c.sort((a,b) => `${a.user?.lastName}`.localeCompare(`${b.user?.lastName}`));
      default: return c;
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'doctors') {
        const p = { page, limit: PER_PAGE };
        if (selWilayas.length === 1) p.wilaya     = selWilayas[0];
        if (selSpecs.length > 0)     p.specialite = selSpecs[0];
        else if (query)              p.specialite = query;
        if (priceRange > 0) { p.minPrice = PRICE_RANGES[priceRange].min; p.maxPrice = PRICE_RANGES[priceRange].max; }
        const r = await api.get('/doctors', { params: p });
        let list = r.data.doctors || r.data || [];
        list = sort(list, sortBy);
        setDoctors(list);
        setTotal(r.data.total || list.length);
      } else {
        const p = { page, limit: PER_PAGE };
        if (selWilayas.length === 1) p.wilaya = selWilayas[0];
        if (query) p.name = query;
        const r = await api.get('/laboratory', { params: p });
        setLabs(r.data.labs || r.data || []);
        setTotal(r.data.total || (r.data.labs || r.data || []).length);
      }
    } catch { setDoctors([]); setLabs([]); setTotal(0); }
    finally { setLoading(false); }
  }, [tab, page, selWilayas, selSpecs, query, priceRange, sortBy]);

  useEffect(() => { setPage(1); }, [selWilayas, selSpecs, query, priceRange, sortBy, tab]);
  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Leaflet Map ─── */
  useEffect(() => {
    if (!showMap || tab !== 'doctors') return;

    const initMap = () => {
      if (!mapRef.current || leafletMap.current) return;
      const L = window.L;
      if (!L) return;

      const center = selWilayas.length === 1 && WILAYA_COORDS[selWilayas[0]]
        ? [WILAYA_COORDS[selWilayas[0]].lat, WILAYA_COORDS[selWilayas[0]].lng]
        : [28.0339, 1.6596]; // Centre Algérie

      const map = L.map('freya-map', { zoomControl: true }).setView(center, selWilayas.length === 1 ? 10 : 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);
      leafletMap.current = map;
    };

    // Charger Leaflet si pas encore chargé
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [showMap, tab]);

  // Mettre à jour les markers quand les doctors changent
  useEffect(() => {
    if (!showMap || !leafletMap.current || !window.L) return;
    const L = window.L;
    const map = leafletMap.current;

    // Supprimer anciens markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    doctors.forEach(doc => {
      const coords = WILAYA_COORDS[doc.wilaya];
      if (!coords) return;
      // Légère dispersion pour éviter superposition
      const lat = coords.lat + (Math.random() - 0.5) * 0.08;
      const lng = coords.lng + (Math.random() - 0.5) * 0.08;

      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#2563EB;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;border:2px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.35);cursor:pointer;">${(doc.user?.firstName?.[0]||'')+(doc.user?.lastName?.[0]||'')}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:DM Sans,sans-serif;min-width:180px;">
            <strong style="font-size:14px;color:#0F172A;">Dr. ${doc.user?.firstName} ${doc.user?.lastName}</strong><br/>
            <span style="font-size:12px;color:#2563EB;font-weight:700;">${doc.specialite||''}</span><br/>
            <span style="font-size:11px;color:#64748B;">${doc.city||''} ${doc.wilaya||''}</span><br/>
            <span style="font-size:13px;font-weight:800;color:#0F172A;">${doc.consultationPrice?.toLocaleString('fr-DZ')||'—'} DA</span><br/>
            <button onclick="window.location.href='/medecin/${doc.id}'" style="margin-top:8px;background:#2563EB;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:12px;font-weight:700;cursor:pointer;width:100%;">Prendre RDV</button>
          </div>
        `);
      markersRef.current.push(marker);
    });
  }, [doctors, showMap]);

  /* ─── Helpers ─── */
  const toggleWilaya = nom => setSelWilayas(p => p.includes(nom) ? p.filter(w => w !== nom) : [...p, nom]);
  const toggleSpec   = s   => setSelSpecs(p   => p.includes(s)   ? p.filter(x => x !== s)   : [...p, s]);
  const resetAll = () => { setSelWilayas([]); setSelSpecs([]); setQuery(''); setWilaya(''); setPriceRange(0); setSortBy('rating'); setPage(1); };

  const activeFilters = [
    ...selSpecs.map(s   => ({ label: s,                              rm: () => setSelSpecs(p => p.filter(x => x !== s)) })),
    ...selWilayas.map(w => ({ label: w,                              rm: () => setSelWilayas(p => p.filter(x => x !== w)) })),
    ...(priceRange > 0   ? [{ label: PRICE_RANGES[priceRange].label, rm: () => setPriceRange(0) }] : []),
  ];

  const filteredWilayas = WILAYAS.filter(w => !wilayaSearch || w.nom.toLowerCase().includes(wilayaSearch.toLowerCase()) || w.code.includes(wilayaSearch));
  const filteredSpecs   = specSearch ? ALL_SPECS.filter(s => s.toLowerCase().includes(specSearch.toLowerCase())) : null;

  const initials2 = d => `${d.user?.firstName?.[0]||''}${d.user?.lastName?.[0]||''}`.toUpperCase();
  const stars = n => '★'.repeat(Math.round(Math.min(n || 0, 5))) + '☆'.repeat(5 - Math.round(Math.min(n || 0, 5)));
  const totalPages = Math.ceil(total / PER_PAGE);

  /* ─── Render ─── */
  return (
    <>
      <style>{css}</style>
      <div className="sp" onClick={() => { setShowUserMenu(false); }}>

       {/* ── NAVBAR ── */}
<nav className="sp-nav">
  <div className="sp-nav-in">
    <Link to="/patient" className="sp-logo">Freya</Link>

    <div className="sp-nav-links">
      <Link to="/patient" className="sp-nav-link">Accueil</Link>
      <Link to="/patient/appointments" className="sp-nav-link">Mes rendez-vous</Link>
      <Link to="/search" className="sp-nav-link active">Trouver un médecin</Link>
      <Link to="/patient/messages" className="sp-nav-link">Messages</Link>
      <Link to="/patient/dossier" className="sp-nav-link">Dossier médical</Link>
    </div>

    <div className="sp-nav-right">
      <Link to="/search" className="sp-nav-btn-rdv">Prendre RDV</Link>

      {user ? (
        <div style={{ position:'relative' }} onClick={e => e.stopPropagation()}>
          <div className="sp-user-pill" onClick={() => setShowUserMenu(v => !v)}>
            <div className="sp-user-av">{initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{firstName} {lastName}</div>
              <div style={{ fontSize:11, color:'#94A3B8' }}>Patient</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          {showUserMenu && (
            <div className="sp-dropdown">
              <div className="sp-drop-top">
                <div className="sp-drop-av">{initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{firstName} {lastName}</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ padding:'6px' }}>
                <div className="sp-drop-item" onClick={() => navigate('/patient')}>Accueil</div>
                <div className="sp-drop-item" onClick={() => navigate('/patient/appointments')}>Mes rendez-vous</div>
                <div className="sp-drop-item" onClick={() => navigate('/patient/messages')}>Messages</div>
                <div className="sp-drop-item" onClick={() => navigate('/patient/notifications')}>Notifications</div>
                <div className="sp-drop-item" onClick={() => navigate('/patient/profile')}>Mon profil</div>
                <div className="sp-drop-item danger" onClick={handleLogout}>Déconnexion</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/login"    style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, color:'#2563EB', border:'1.5px solid #E2E8F0', background:'#fff', textDecoration:'none' }}>Se connecter</Link>
          <Link to="/register" style={{ padding:'7px 16px', borderRadius:9, fontSize:13, fontWeight:600, color:'#fff', border:'none', background:'#2563EB', textDecoration:'none' }}>S'inscrire</Link>
        </div>
      )}
    </div>
  </div>
</nav>

        {/* ── HERO SEARCH ── */}
        <div className="sp-hero">
          <div className="sp-hero-in">
            <div className="sp-hero-title">Trouvez le bon <span>médecin</span> près de chez vous</div>
            <div className="sp-searchbar">
              <div className="sp-sb-field" style={{ flex: 2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  placeholder="Spécialité, nom du médecin..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchData()}
                  list="sp-spec-list"
                />
                <datalist id="sp-spec-list">{ALL_SPECS.map(s => <option key={s} value={s}/>)}</datalist>
              </div>
              <div className="sp-sb-loc">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <select value={wilaya} onChange={e => { setWilaya(e.target.value); setSelWilayas(e.target.value ? [e.target.value] : []); }}>
                  <option value="">Toute l'Algérie</option>
                  {WILAYAS.map(w => <option key={w.code} value={w.nom}>{w.code} – {w.nom}</option>)}
                </select>
              </div>
              <button className="sp-sb-btn" onClick={fetchData}>Rechercher</button>
            </div>
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="sp-fbar">
          <div className="sp-fbar-in">
            <button className={`sp-fbtn${selSpecs.length > 0 ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setOpenModal('spec'); }}>
              Spécialité
              {selSpecs.length > 0 && <span className="sp-fbtn-badge">{selSpecs.length}</span>}
            </button>
            <button className={`sp-fbtn${selWilayas.length > 0 ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setOpenModal('wilaya'); }}>
              Wilaya
              {selWilayas.length > 0 && <span className="sp-fbtn-badge">{selWilayas.length}</span>}
            </button>
            <button className={`sp-fbtn${priceRange > 0 ? ' active' : ''}`} onClick={e => { e.stopPropagation(); setOpenModal('price'); }}>
              Tarif
              {priceRange > 0 && <span className="sp-fbtn-badge">1</span>}
            </button>
            {activeFilters.length > 0 && (
              <>
                <div className="sp-fbar-sep"/>
                <span className="sp-chip-clear" onClick={resetAll}>✕ Tout effacer</span>
              </>
            )}

            <div className="sp-fbar-right">
              <button className={`sp-view-btn${!showMap ? ' active' : ''}`} onClick={() => setShowMap(false)}>
                Liste
              </button>
              <button className={`sp-view-btn${showMap ? ' active' : ''}`} onClick={() => setShowMap(true)}>
                Carte
              </button>
            </div>
          </div>
        </div>

        {/* ── CHIPS ACTIFS ── */}
        {activeFilters.length > 0 && (
          <div className="sp-chips">
            <div className="sp-chips-in">
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Filtres actifs :</span>
              {activeFilters.map((f, i) => (
                <button key={i} className="sp-chip" onClick={f.rm}>{f.label} <span>×</span></button>
              ))}
            </div>
          </div>
        )}

        {/* ── BODY ── */}
        <div className="sp-body">

          {/* TABS */}
          <div className="sp-tabs">
            <button className={`sp-tab${tab === 'doctors' ? ' on' : ''}`} onClick={() => setTab('doctors')}>Médecins</button>
            <button className={`sp-tab${tab === 'labs' ? ' on' : ''}`}    onClick={() => setTab('labs')}>Laboratoires</button>
          </div>

          {/* SORT & COUNT */}
          <div className="sp-results-head">
            <p className="sp-count">
              <strong>{total}</strong> {tab === 'doctors' ? 'médecin' : 'laboratoire'}{total !== 1 ? 's' : ''} trouvé{total !== 1 ? 's' : ''}
              {selSpecs.length > 0 && <> · <span style={{ color: '#2563EB' }}>{selSpecs.join(', ')}</span></>}
              {selWilayas.length > 0 && <> · <span style={{ color: '#2563EB' }}>{selWilayas.join(', ')}</span></>}
            </p>
            {tab === 'doctors' && (
              <div className="sp-sort-wrap">
                <span className="sp-sort-lbl">Trier :</span>
                <select className="sp-sort-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* ── CARTE ── */}
          {showMap && tab === 'doctors' && (
            <div className="sp-map-wrap">
              <div id="freya-map" ref={mapRef}/>
            </div>
          )}

          {/* ── LISTE ── */}
          {loading ? <div className="sp-spin"/> :
            tab === 'doctors' ? (
              doctors.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-ic" style={{ fontSize: 48, opacity: 0.2 }}>—</div>
                  <h3>Aucun médecin trouvé</h3>
                  <p>Modifiez vos critères de recherche ou essayez une autre wilaya</p>
                </div>
              ) : doctors.map(doc => (
                <div key={doc.id} className="sp-doc-card" onClick={() => navigate(`/medecin/${doc.id}`)}>
                  <div className="sp-doc-av">
                    {doc.profilePhoto
                      ? <img src={doc.profilePhoto} alt=""/>
                      : initials2(doc)
                    }
                  </div>
                  <div className="sp-doc-body">
                    <div className="sp-doc-name">Dr. {doc.user?.firstName} {doc.user?.lastName}</div>
                    <div className="sp-doc-spec">{doc.specialite}</div>
                    <div className="sp-doc-row">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {doc.city ? `${doc.city}, ` : ''}{doc.wilaya}
                      <span style={{ color: '#E2E8F0' }}>·</span>
                      {doc.experienceYears || 0} ans d'expérience
                      {doc.ordreVerified && <span className="sp-verified">✓ Vérifié CNOM</span>}
                    </div>
                    {doc.languages && (
                      <div className="sp-doc-langs">
                        {doc.languages.split(',').map(l => <span key={l} className="sp-lang-tag">{l.trim()}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="sp-doc-right">
                    <div className="sp-stars">
                      <span className="sp-stars-ic">{stars(doc.ratingAvg)}</span>
                      <span className="sp-stars-ct">({doc.ratingCount || 0})</span>
                    </div>
                    <div>
                      <div className="sp-price">{doc.consultationPrice?.toLocaleString('fr-DZ') || '—'} <span style={{ fontSize: 13 }}>DA</span></div>
                      <span className="sp-price-lbl">/ consultation</span>
                    </div>
                    <button className="sp-rdv-btn" onClick={e => { e.stopPropagation(); navigate(`/medecin/${doc.id}`); }}>
                      Prendre RDV →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              labs.length === 0 ? (
                <div className="sp-empty">
                  <div className="sp-empty-ic" style={{ fontSize: 48, opacity: 0.2 }}>—</div>
                  <h3>Aucun laboratoire trouvé</h3>
                  <p>Essayez une autre wilaya</p>
                </div>
              ) : labs.map(lab => (
                <div key={lab.id} className="sp-lab-card" onClick={() => navigate(`/laboratoire/${lab.id}`)}>
                  <div className="sp-lab-ic" style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>Lab</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>{lab.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {lab.city ? `${lab.city}, ` : ''}{lab.wilaya}{lab.address ? ` — ${lab.address}` : ''}
                    </div>
                    {lab.analyses && (
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                        {lab.analyses.split(',').slice(0, 4).map(a => (
                          <span key={a} style={{ fontSize: 11, padding: '3px 8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, color: '#1E40AF', fontWeight: 600 }}>{a.trim()}</span>
                        ))}
                        {lab.analyses.split(',').length > 4 && <span style={{ fontSize: 11, padding: '3px 8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, color: '#1E40AF', fontWeight: 600 }}>+{lab.analyses.split(',').length - 4}</span>}
                      </div>
                    )}
                    {lab.openingHours && <div style={{ fontSize: 12, color: '#64748B' }}>{lab.openingHours}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, paddingLeft: 16, borderLeft: '1px solid #F1F5F9', flexShrink: 0 }}>
                    {lab.phone && <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{lab.phone}</span>}
                    <button style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); navigate(user ? `/patient/labo/${lab.id}/book` : '/login'); }}>Prendre RDV</button>
                    <button style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={e => { e.stopPropagation(); navigate(`/laboratoire/${lab.id}`); }}>Voir détails</button>
                  </div>
                </div>
              ))
            )
          }

          {/* PAGINATION */}
          {totalPages > 1 && !loading && (
            <div className="sp-pager">
              <button className="sp-pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="sp-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = page <= 4 ? i + 1 : page + i - 3;
                if (p < 1 || p > totalPages) return null;
                return <button key={p} className={`sp-pg-btn${p === page ? ' on' : ''}`} onClick={() => setPage(p)}>{p}</button>;
              })}
              <button className="sp-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              <button className="sp-pg-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          )}
        </div>

        {/* ── MODALS FILTRES ── */}
        {openModal && (
          <div className="sp-modal-bg" onClick={() => setOpenModal(null)}>
            <div className="sp-modal" onClick={e => e.stopPropagation()}>

              {/* MODAL SPÉCIALITÉ */}
              {openModal === 'spec' && (
                <>
                  <div className="sp-modal-head">
                    <span className="sp-modal-title">Spécialité</span>
                    <button className="sp-modal-close" onClick={() => setOpenModal(null)}>×</button>
                  </div>
                  <div className="sp-modal-section">
                    <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }} placeholder="Rechercher une spécialité..." value={specSearch} onChange={e => setSpecSearch(e.target.value)}/>
                    <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                      {(filteredSpecs || ALL_SPECS).length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>Aucune spécialité trouvée</p>
                      ) : filteredSpecs ? filteredSpecs.map(s => (
                        <div key={s} className={`sp-modal-opt${selSpecs.includes(s) ? ' sel' : ''}`} onClick={() => toggleSpec(s)}>
                          <input type="checkbox" checked={selSpecs.includes(s)} readOnly/>
                          <span className="sp-modal-opt-lbl">{s}</span>
                        </div>
                      )) : Object.entries(SPECS_GROUPED).map(([g, specs]) => (
                        <div key={g}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 6px', padding: '0 4px' }}>{g}</div>
                          <div className="sp-modal-opts">
                            {specs.map(s => (
                              <div key={s} className={`sp-modal-opt${selSpecs.includes(s) ? ' sel' : ''}`} onClick={() => toggleSpec(s)}>
                                <input type="checkbox" checked={selSpecs.includes(s)} readOnly/>
                                <span className="sp-modal-opt-lbl">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sp-modal-footer">
                    <button className="sp-modal-reset" onClick={() => setSelSpecs([])}>Effacer</button>
                    <button className="sp-modal-apply" onClick={() => { setOpenModal(null); fetchData(); }}>Afficher les résultats</button>
                  </div>
                </>
              )}

              {/* MODAL WILAYA */}
              {openModal === 'wilaya' && (
                <>
                  <div className="sp-modal-head">
                    <span className="sp-modal-title">Wilaya</span>
                    <button className="sp-modal-close" onClick={() => setOpenModal(null)}>×</button>
                  </div>
                  <div className="sp-modal-section">
                    <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }} placeholder="Chercher une wilaya..." value={wilayaSearch} onChange={e => setWilayaSearch(e.target.value)}/>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, maxHeight: 340, overflowY: 'auto' }}>
                      {filteredWilayas.map(w => (
                        <div key={w.code} className={`sp-modal-opt${selWilayas.includes(w.nom) ? ' sel' : ''}`} onClick={() => toggleWilaya(w.nom)} style={{ borderRadius: 8 }}>
                          <input type="checkbox" checked={selWilayas.includes(w.nom)} readOnly/>
                          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, minWidth: 16 }}>{w.code}</span>
                          <span className="sp-modal-opt-lbl" style={{ fontSize: 12 }}>{w.nom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sp-modal-footer">
                    <button className="sp-modal-reset" onClick={() => setSelWilayas([])}>Effacer</button>
                    <button className="sp-modal-apply" onClick={() => { setOpenModal(null); fetchData(); }}>Afficher les résultats</button>
                  </div>
                </>
              )}

              {/* MODAL TARIF */}
              {openModal === 'price' && (
                <>
                  <div className="sp-modal-head">
                    <span className="sp-modal-title">Tarif de consultation</span>
                    <button className="sp-modal-close" onClick={() => setOpenModal(null)}>×</button>
                  </div>
                  <div className="sp-modal-section">
                    <div className="sp-modal-opts">
                      {PRICE_RANGES.map((r, i) => (
                        <div key={i} className={`sp-modal-opt${priceRange === i ? ' sel' : ''}`} onClick={() => setPriceRange(i)}>
                          <input type="radio" name="price" checked={priceRange === i} readOnly/>
                          <span className="sp-modal-opt-lbl">{r.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sp-modal-footer">
                    <button className="sp-modal-reset" onClick={() => setPriceRange(0)}>Effacer</button>
                    <button className="sp-modal-apply" onClick={() => { setOpenModal(null); fetchData(); }}>Afficher les résultats</button>
                  </div>
                </>
              )}

              {/* MODAL DISPONIBILITÉS — bientôt */}
            </div>
          </div>
        )}

      </div>
    </>
  );
}