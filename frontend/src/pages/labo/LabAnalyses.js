import React, { useState } from 'react';
import toast from 'react-hot-toast';
import LabNavbar from '../../components/LabNavbar';

const CATEGORIES_INIT = [
  { id: 1, cat: 'Hématologie', items: [
    { id: 11, nom: 'Numération Formule Sanguine (NFS)', prix: 350, delai: '2h' },
    { id: 12, nom: 'Groupe Sanguin + Rhésus', prix: 300, delai: '1h' },
    { id: 13, nom: 'VS (Vitesse de Sédimentation)', prix: 200, delai: '2h' },
  ]},
  { id: 2, cat: 'Biochimie', items: [
    { id: 21, nom: 'Glycémie à jeun', prix: 250, delai: '1h' },
    { id: 22, nom: 'Bilan lipidique complet', prix: 800, delai: '3h' },
    { id: 23, nom: 'Créatinine + Urée', prix: 500, delai: '2h' },
    { id: 24, nom: 'Transaminases (ASAT/ALAT)', prix: 600, delai: '3h' },
  ]},
  { id: 3, cat: 'Sérologie', items: [
    { id: 31, nom: 'VIH 1+2 (Ag/Ac)', prix: 800, delai: '24h' },
    { id: 32, nom: 'Hépatite B (AgHBs)', prix: 700, delai: '24h' },
    { id: 33, nom: 'H. pylori (sérologie)', prix: 750, delai: '24h' },
  ]},
  { id: 4, cat: 'Hormonologie', items: [
    { id: 41, nom: 'TSH ultra-sensible', prix: 900, delai: '24h' },
    { id: 42, nom: 'T3 + T4 libres', prix: 1200, delai: '24h' },
    { id: 43, nom: 'FSH / LH', prix: 1000, delai: '24h' },
  ]},
  { id: 5, cat: 'Microbiologie', items: [
    { id: 51, nom: 'ECBU (Examen Cytobactériologique)', prix: 600, delai: '48h' },
    { id: 52, nom: 'Coproculture', prix: 700, delai: '48h' },
  ]},
];

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);

export default function LabAnalyses() {
  const [categories, setCategories] = useState(CATEGORIES_INIT);
  const [editing,    setEditing]    = useState(null); // { catId, itemId }
  const [editForm,   setEditForm]   = useState({ nom: '', prix: '', delai: '' });
  const [addingCat,  setAddingCat]  = useState(null); // catId
  const [addForm,    setAddForm]    = useState({ nom: '', prix: '', delai: '24h' });

  const totalItems = categories.reduce((a, c) => a + c.items.length, 0);

  const startEdit = (catId, item) => {
    setEditing({ catId, itemId: item.id });
    setEditForm({ nom: item.nom, prix: String(item.prix), delai: item.delai });
  };

  const saveEdit = () => {
    setCategories(prev => prev.map(c =>
      c.id === editing.catId
        ? { ...c, items: c.items.map(it => it.id === editing.itemId ? { ...it, nom: editForm.nom, prix: parseInt(editForm.prix) || 0, delai: editForm.delai } : it) }
        : c
    ));
    setEditing(null);
    toast.success('Analyse mise à jour');
  };

  const deleteItem = (catId, itemId) => {
    setCategories(prev => prev.map(c =>
      c.id === catId ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c
    ));
    toast.success('Analyse supprimée');
  };

  const addItem = (catId) => {
    if (!addForm.nom.trim()) return;
    setCategories(prev => prev.map(c =>
      c.id === catId
        ? { ...c, items: [...c.items, { id: Date.now(), nom: addForm.nom.trim(), prix: parseInt(addForm.prix) || 0, delai: addForm.delai }] }
        : c
    ));
    setAddingCat(null);
    setAddForm({ nom: '', prix: '', delai: '24h' });
    toast.success('Analyse ajoutée');
  };

  const inputCls = 'px-3 py-1.5 rounded-lg border-[1.5px] border-slate-200 text-sm text-slate-900 bg-white outline-none focus:border-primary-400 transition-colors font-sans';

  return (
    <div className="font-sans bg-slate-50 min-h-screen">
      <LabNavbar active="analyses" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Gestion des analyses</h1>
            <p className="text-sm text-slate-500 mt-1">{totalItems} analyses sur {categories.length} catégories</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-3.5 mb-6">
          {[
            { val: categories.length, label: 'Catégories',          cls: 'border-t-primary-500 text-primary-600' },
            { val: totalItems,        label: 'Analyses disponibles', cls: 'border-t-green-500  text-green-600'   },
            { val: Math.round(categories.flatMap(c => c.items).reduce((a, i) => a + i.prix, 0) / Math.max(totalItems, 1)), label: 'Prix moyen (DA)', cls: 'border-t-amber-500 text-amber-600' },
          ].map((st, i) => (
            <div key={i} className={`bg-white rounded-2xl border border-slate-200 border-t-[3px] shadow-card p-5 ${st.cls.split(' ')[0]}`}>
              <div className={`text-3xl font-extrabold tracking-tight mb-1 ${st.cls.split(' ')[1]}`}>{st.val}</div>
              <div className="text-xs text-slate-500 font-medium">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Catégories */}
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <span className="text-sm font-bold text-slate-900">{cat.cat}</span>
                <span className="text-[11px] text-slate-400">{cat.items.length} analyses</span>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Examen</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Délai</th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prix (DA)</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map(item => (
                    <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                      {editing?.catId === cat.id && editing?.itemId === item.id ? (
                        <>
                          <td className="px-4 py-2.5">
                            <input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} className={`${inputCls} w-full`} />
                          </td>
                          <td className="px-4 py-2.5">
                            <input value={editForm.delai} onChange={e => setEditForm(f => ({ ...f, delai: e.target.value }))} className={`${inputCls} w-20`} placeholder="24h" />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <input type="number" value={editForm.prix} onChange={e => setEditForm(f => ({ ...f, prix: e.target.value }))} className={`${inputCls} w-24 text-right`} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex gap-1.5 justify-end">
                              <button onClick={saveEdit} className="bg-primary-600 text-white border-0 rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer">OK</button>
                              <button onClick={() => setEditing(null)} className="bg-slate-100 text-slate-600 border-0 rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer">Annuler</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3 text-sm text-slate-800">{item.nom}</td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{item.delai}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{item.prix.toLocaleString('fr-DZ')}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 justify-end">
                              <button onClick={() => startEdit(cat.id, item)} className="text-slate-400 hover:text-primary-600 cursor-pointer bg-transparent border-0 p-1 transition-colors">
                                <EditIcon />
                              </button>
                              <button onClick={() => deleteItem(cat.id, item.id)} className="text-slate-400 hover:text-red-500 cursor-pointer bg-transparent border-0 p-1 transition-colors">
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Ajouter une analyse */}
              {addingCat === cat.id ? (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2.5">
                  <input value={addForm.nom} onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))} placeholder="Nom de l'analyse" className={`${inputCls} flex-1`} autoFocus />
                  <input value={addForm.delai} onChange={e => setAddForm(f => ({ ...f, delai: e.target.value }))} placeholder="Délai" className={`${inputCls} w-20`} />
                  <input type="number" value={addForm.prix} onChange={e => setAddForm(f => ({ ...f, prix: e.target.value }))} placeholder="Prix (DA)" className={`${inputCls} w-24`} />
                  <button onClick={() => addItem(cat.id)} className="bg-primary-600 text-white border-0 rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer">Ajouter</button>
                  <button onClick={() => setAddingCat(null)} className="bg-slate-100 text-slate-600 border-0 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer">Annuler</button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingCat(cat.id); setAddForm({ nom: '', prix: '', delai: '24h' }); }}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-primary-600 hover:text-primary-800 cursor-pointer bg-transparent border-0 px-5 py-3 w-full font-sans border-t border-slate-100 transition-colors"
                >
                  <PlusIcon /> Ajouter une analyse
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
