import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Settings,
  MapPin,
  UserCheck,
  Layers,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  Building2
} from 'lucide-react';

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'gnds',       label: 'GNDs',           icon: MapPin,      color: 'text-emerald-400' },
  { id: 'officers',   label: 'Officers (CEOs)', icon: UserCheck,   color: 'text-teal-400'    },
  { id: 'categories', label: 'Categories',      icon: Layers,      color: 'text-blue-400'    },
  { id: 'years',      label: 'Financial Years', icon: Calendar,    color: 'text-purple-400'  },
];

// ─── Shared input styling ─────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs ' +
  'placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition';

const btnPrimary =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 ' +
  'text-slate-950 text-xs font-bold shadow transition';

const btnDanger =
  'p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition';

const btnEdit =
  'p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition';

// ─── GNDs Tab ─────────────────────────────────────────────────────────────────
function GndsTab() {
  const { gnds = [], addGnd = () => {}, updateGnd = () => {}, deleteGnd = () => {}, projects = [] } = useProject() || {};

  const emptyForm = { code: '', name: '', displayName: '', ceoOfficer: '', phone: '' };
  const [showAdd, setShowAdd]     = useState(false);
  const [addForm, setAddForm]     = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [search, setSearch]       = useState('');

  const projectCountForGnd = (gndId) =>
    (projects || []).filter(p => p?.gndId === gndId).length;

  const filtered = (gnds || []).filter(g =>
    (g?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g?.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (g?.ceoOfficer || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!addForm?.name?.trim()) return;
    addGnd?.(addForm);
    setAddForm(emptyForm);
    setShowAdd(false);
  };

  const startEdit = (g) => {
    if (!g) return;
    setEditingId(g.id);
    setEditForm({ code: g?.code || '', name: g?.name || '', displayName: g?.displayName || '', ceoOfficer: g?.ceoOfficer || '', phone: g?.phone || '' });
  };

  const saveEdit = (id) => {
    updateGnd?.(id, editForm);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search + Add */}
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Search by name, code or officer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setShowAdd(v => !v)} className={btnPrimary}>
          <Plus className="w-3.5 h-3.5" />
          Add GND
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-4 grid grid-cols-2 gap-2 animate-fadeIn">
          <input className={inputCls} placeholder="Code (e.g. 476/T)" value={addForm.code}       onChange={e => setAddForm(p => ({ ...p, code: e.target.value }))} />
          <input className={inputCls} placeholder="Full name *"        value={addForm.name}       onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} />
          <input className={inputCls} placeholder="Display name"       value={addForm.displayName}onChange={e => setAddForm(p => ({ ...p, displayName: e.target.value }))} />
          <input className={inputCls} placeholder="CEO Officer name"   value={addForm.ceoOfficer} onChange={e => setAddForm(p => ({ ...p, ceoOfficer: e.target.value }))} />
          <input className={`${inputCls} col-span-2`} placeholder="Phone" value={addForm.phone}  onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} />
          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition">Cancel</button>
            <button onClick={handleAdd} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save GND</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-y-auto flex-1 -mx-1 px-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 text-left border-b border-slate-800">
              <th className="pb-2 pl-1 font-semibold w-10">#</th>
              <th className="pb-2 font-semibold">Code</th>
              <th className="pb-2 font-semibold">Name</th>
              <th className="pb-2 font-semibold">CEO Officer</th>
              <th className="pb-2 font-semibold text-center w-16">Projects</th>
              <th className="pb-2 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((g, idx) => (
              <tr key={g?.id || idx} className="group hover:bg-slate-800/40 transition">
                {editingId === g?.id ? (
                  <>
                    <td className="py-2 pl-1 text-slate-500">{idx + 1}</td>
                    <td className="py-2 pr-1"><input className={inputCls} value={editForm.code} onChange={e => setEditForm(p => ({ ...p, code: e.target.value }))} /></td>
                    <td className="py-2 pr-1"><input className={inputCls} value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></td>
                    <td className="py-2 pr-1"><input className={inputCls} value={editForm.ceoOfficer} onChange={e => setEditForm(p => ({ ...p, ceoOfficer: e.target.value }))} /></td>
                    <td className="py-2 text-center text-slate-400">{projectCountForGnd(g?.id)}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(g?.id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"><Save className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingId(null)} className={btnEdit}><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 pl-1 text-slate-500">{idx + 1}</td>
                    <td className="py-2 pr-2"><span className="font-mono text-amber-400 text-[11px]">{g?.code || ''}</span></td>
                    <td className="py-2 pr-2 text-slate-200 font-medium">{g?.name || ''}</td>
                    <td className="py-2 pr-2 text-slate-400">{g?.ceoOfficer || <span className="text-rose-400 italic">Unassigned</span>}</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${projectCountForGnd(g?.id) > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                        {projectCountForGnd(g?.id)}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => startEdit(g)} className={btnEdit}><Pencil className="w-3.5 h-3.5" /></button>
                        {projectCountForGnd(g?.id) === 0 && (
                          <button onClick={() => deleteGnd?.(g?.id)} className={btnDanger}><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 text-xs py-8">No GNDs match your search.</p>
        )}
      </div>

      <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        GNDs with active projects cannot be deleted. Edit CEO Officer to update all linked project records.
      </p>
    </div>
  );
}

// ─── Officers Tab ─────────────────────────────────────────────────────────────
function OfficersTab() {
  const { gnds = [], ceoOfficers = [], renameOfficer = () => {}, removeOfficer = () => {}, projects = [] } = useProject() || {};
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');

  const officerStats = (ceoOfficers || []).map(name => {
    const linkedGnds = (gnds || []).filter(g => g?.ceoOfficer?.trim() === name);
    const projectCount = (projects || []).filter(p => p?.ceoOfficer?.trim() === name || p?.responsibleOfficer?.trim() === name).length;
    return { name, gndCount: linkedGnds.length, projectCount, gnds: linkedGnds };
  });

  const filtered = officerStats.filter(o =>
    (o?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o?.gnds || []).some(g => (g?.name || '').toLowerCase().includes(search.toLowerCase()) || (g?.code || '').toLowerCase().includes(search.toLowerCase()))
  );

  const startEdit = (name) => {
    setEditingOfficer(name);
    setEditName(name);
  };

  const saveEdit = (oldName) => {
    if (editName.trim() && editName.trim() !== oldName) {
      renameOfficer?.(oldName, editName.trim());
    }
    setEditingOfficer(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search + Info */}
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder="Search officer or assigned GND..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-y-auto flex-1 -mx-1 px-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 text-left border-b border-slate-800">
              <th className="pb-2 pl-1 font-semibold w-8">#</th>
              <th className="pb-2 font-semibold">Officer Name</th>
              <th className="pb-2 font-semibold">Assigned GND(s)</th>
              <th className="pb-2 font-semibold text-center w-16">Projects</th>
              <th className="pb-2 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((o, idx) => (
              <tr key={o?.name || idx} className="hover:bg-slate-800/40 transition group">
                <td className="py-2 pl-1 text-slate-500">{idx + 1}</td>
                {editingOfficer === o?.name ? (
                  <>
                    <td className="py-2 pr-2" colSpan={2}>
                      <input
                        className={inputCls}
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveEdit(o?.name)}
                        autoFocus
                      />
                    </td>
                    <td className="py-2 text-center text-slate-400">{o?.projectCount || 0}</td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(o?.name)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingOfficer(null)} className={btnEdit}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 text-slate-200 font-medium">{o?.name}</td>
                    <td className="py-2 text-slate-400">
                      <div className="flex flex-wrap gap-1">
                        {(o?.gnds || []).map(g => (
                          <span key={g?.id} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-amber-400" title={g?.name}>
                            {g?.code || g?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(o?.projectCount || 0) > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-500'}`}>
                        {o?.projectCount || 0}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => startEdit(o?.name)} className={btnEdit} title="Rename officer across all records">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {(o?.projectCount || 0) === 0 && (
                          <button onClick={() => removeOfficer?.(o?.name)} className={btnDanger} title="Unassign officer from GNDs">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-slate-500 text-xs py-8">No officers match your search.</p>
        )}
      </div>

      <div className="bg-slate-800/30 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-slate-400">
        <span>Active Community Empowerment Officers (CEOs)</span>
        <span className="text-sm font-bold text-teal-400">{(ceoOfficers || []).length}</span>
      </div>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────
const PRESET_COLORS = [
  '#10b981','#3b82f6','#8b5cf6','#ec4899','#f59e0b',
  '#06b6d4','#f97316','#14b8a6','#6366f1','#84cc16',
  '#eab308','#64748b','#a855f7','#ef4444','#78716c',
];

function CategoriesTab() {
  const { categories = [], addCategory = () => {}, updateCategory = () => {}, deleteCategory = () => {}, projects = [] } = useProject() || {};

  const [showAdd, setShowAdd]     = useState(false);
  const [newName, setNewName]     = useState('');
  const [newColor, setNewColor]   = useState('#10b981');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');
  const [editColor, setEditColor] = useState('');

  const projectCountForCat = (name) =>
    (projects || []).filter(p => p?.category === name).length;

  const handleAdd = () => {
    if (!newName?.trim()) return;
    addCategory?.({ name: newName.trim(), color: newColor });
    setNewName('');
    setNewColor('#10b981');
    setShowAdd(false);
  };

  const startEdit = (c) => {
    if (!c) return;
    setEditingId(c.id);
    setEditName(c?.name || '');
    setEditColor(c?.color || '#10b981');
  };

  const saveEdit = (c) => {
    updateCategory?.(c?.id, { name: editName, color: editColor });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Add button */}
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(v => !v)} className={btnPrimary}>
          <Plus className="w-3.5 h-3.5" /> Add Category
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-800/60 border border-amber-500/30 rounded-xl p-4 animate-fadeIn">
          <div className="flex gap-2 mb-3">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Category name *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <span>Colour</span>
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                style={{ background: c }}
                className={`w-5 h-5 rounded-full transition ring-offset-slate-900 ${newColor === c ? 'ring-2 ring-white ring-offset-2' : 'hover:scale-110'}`}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs hover:bg-slate-600 transition">Cancel</button>
            <button onClick={handleAdd} className={btnPrimary}><Save className="w-3.5 h-3.5" /> Save</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto flex-1 space-y-1.5 -mx-1 px-1">
        {(categories || []).map((c) => (
          <div key={c?.id} className="group flex items-center gap-3 bg-slate-800/40 border border-slate-800 rounded-xl px-3 py-2.5 hover:border-slate-700 transition">
            {editingId === c?.id ? (
              <>
                <div className="relative">
                  <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0" />
                </div>
                <input
                  className={`${inputCls} flex-1`}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <div className="flex flex-wrap gap-1 my-1">
                  {PRESET_COLORS.map(col => (
                    <button key={col} onClick={() => setEditColor(col)}
                      style={{ background: col }}
                      className={`w-4 h-4 rounded-full transition ${editColor === col ? 'ring-1 ring-white ring-offset-1 ring-offset-slate-800' : 'hover:scale-110'}`}
                    />
                  ))}
                </div>
                <button onClick={() => saveEdit(c)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"><Save className="w-3.5 h-3.5" /></button>
                <button onClick={() => setEditingId(null)} className={btnEdit}><X className="w-3.5 h-3.5" /></button>
              </>
            ) : (
              <>
                <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: c?.color || '#64748b' }} />
                <span className="flex-1 text-xs text-slate-200 font-medium">{c?.name || ''}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                  projectCountForCat(c?.name) > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-500'
                }`}>
                  {projectCountForCat(c?.name)} projects
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => startEdit(c)} className={btnEdit}><Pencil className="w-3.5 h-3.5" /></button>
                  {projectCountForCat(c?.name) === 0 && (
                    <button onClick={() => deleteCategory?.(c?.id)} className={btnDanger}><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Categories with active projects cannot be deleted.
      </p>
    </div>
  );
}

// ─── Financial Years Tab ──────────────────────────────────────────────────────
function YearsTab() {
  const { financialYears = [], addFinancialYear = () => {}, deleteFinancialYear = () => {}, projects = [] } = useProject() || {};
  const [newYear, setNewYear] = useState('');

  const projectCountForYear = (year) =>
    (projects || []).filter(p => String(p?.year || p?.financialYear || '') === String(year)).length;

  const handleAdd = () => {
    const y = parseInt(newYear, 10);
    if (isNaN(y) || y < 2000 || y > 2100) return;
    addFinancialYear?.(y);
    setNewYear('');
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Add Year */}
      <div className="flex gap-2">
        <input
          className={`${inputCls} flex-1`}
          type="number"
          placeholder="Enter year (e.g. 2027)"
          min={2000}
          max={2100}
          value={newYear}
          onChange={e => setNewYear(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className={btnPrimary}>
          <Plus className="w-3.5 h-3.5" /> Add Year
        </button>
      </div>

      {/* Year list */}
      <div className="overflow-y-auto flex-1 space-y-2 -mx-1 px-1">
        {(financialYears || []).map(year => {
          const count = projectCountForYear(year);
          return (
            <div key={year} className="group flex items-center gap-3 bg-slate-800/40 border border-slate-800 rounded-xl px-4 py-3 hover:border-slate-700 transition">
              <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-bold text-slate-200">{year}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                count > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-500'
              }`}>
                {count} projects
              </span>
              {count === 0 && (
                <button
                  onClick={() => deleteFinancialYear?.(year)}
                  className={`${btnDanger} opacity-0 group-hover:opacity-100 transition`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
        {(financialYears || []).length === 0 && (
          <p className="text-center text-slate-500 text-xs py-8">No financial years configured.</p>
        )}
      </div>

      <p className="text-[10px] text-slate-600 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Years with active projects cannot be deleted. Years appear in the Year filter dropdown.
      </p>
    </div>
  );
}

// ─── Main SettingsModal ───────────────────────────────────────────────────────
export default function SettingsModal() {
  const { isSettingsOpen = false, setIsSettingsOpen = () => {}, gnds = [], ceoOfficers = [], categories = [], financialYears = [] } = useProject() || {};
  const [activeTab, setActiveTab] = useState('gnds');

  if (!isSettingsOpen) return null;

  const counts = {
    gnds: (gnds || []).length,
    officers: (ceoOfficers || []).length,
    categories: (categories || []).length,
    years: (financialYears || []).length,
  };

  const tabContent = {
    gnds: <GndsTab />,
    officers: <OfficersTab />,
    categories: <CategoriesTab />,
    years: <YearsTab />,
  };

  return (
    <div
      onClick={() => setIsSettingsOpen?.(false)}
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
    >
      <div
        onClick={e => e?.stopPropagation?.()}
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Settings className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">Settings & Configuration</h2>
              <p className="text-[11px] text-slate-400">Manage master data for GNDs, Officers, Categories & Financial Years</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen?.(false)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-slate-800 flex-shrink-0 overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap border-b-2 transition-all
                  ${isActive
                    ? 'bg-slate-800 border-amber-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-slate-500'}`} />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-0.5 ${
                  isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'
                }`}>
                  {counts[tab.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden p-5">
          <div className="h-full flex flex-col">
            {tabContent[activeTab]}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            Talawakelle Divisional Secretariat — Planning Branch
          </div>
          <button
            onClick={() => setIsSettingsOpen?.(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
