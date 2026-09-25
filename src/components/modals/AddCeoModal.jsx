import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, UserCheck, Plus, Pencil, MapPin, Phone, Mail, BadgeInfo, CheckCircle2, Save, Users, Building2 } from 'lucide-react';

export default function AddCeoModal() {
  const {
    isAddCeoOpen = false,
    setIsAddCeoOpen = () => {},
    addCeoOfficer = () => {},
    updateCeoOfficer = () => {},
    getCeoContact = () => ({}),
    ceoOfficers = [],
    gnds = [],
    projects = [],
    editingCeo = null,
    setEditingCeo = () => {}
  } = useProject() || {};

  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'edit'
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Form state
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDesignation, setAddDesignation] = useState('Community Empowerment Officer (CEO)');
  const [addTargetGndId, setAddTargetGndId] = useState('');

  // Edit Form state
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDesignation, setEditDesignation] = useState('Community Empowerment Officer (CEO)');
  const [editTargetGndId, setEditTargetGndId] = useState('');

  // Load officer details into edit form
  const loadOfficerData = (officerName) => {
    if (!officerName) return;
    const contact = getCeoContact?.(officerName) || {};
    setSelectedOfficer(officerName);
    setEditName(officerName);
    setEditPhone(contact?.phone || '+94 52 225 8234');
    setEditEmail(contact?.email || '');
    setEditDesignation(contact?.designation || 'Community Empowerment Officer (CEO)');
    setEditTargetGndId(contact?.gndId || '');
  };

  useEffect(() => {
    if (isAddCeoOpen) {
      setSuccessMessage('');
      if (editingCeo) {
        setActiveTab('edit');
        loadOfficerData(editingCeo);
      } else if (activeTab === 'edit' && !selectedOfficer && (ceoOfficers || []).length > 0) {
        loadOfficerData(ceoOfficers[0]);
      }
    }
  }, [isAddCeoOpen, editingCeo]);

  // When switching to edit tab, ensure an officer is selected
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSuccessMessage('');
    if (tab === 'edit') {
      const initial = editingCeo || selectedOfficer || (ceoOfficers || [])[0] || '';
      if (initial) loadOfficerData(initial);
    }
  };

  if (!isAddCeoOpen) return null;

  const handleClose = () => {
    setSuccessMessage('');
    setEditingCeo?.(null);
    setIsAddCeoOpen?.(false);
  };

  // Add submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addName?.trim()) {
      alert('Please enter the Community Empowerment Officer name.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addCeoOfficer?.({
        name: addName.trim(),
        phone: addPhone?.trim() || '',
        email: addEmail?.trim() || '',
        designation: addDesignation?.trim() || 'Community Empowerment Officer (CEO)',
        gndId: addTargetGndId
      });

      setSuccessMessage(`Officer "${addName.trim()}" registered successfully!`);
      // Reset add form
      setAddName('');
      setAddPhone('');
      setAddEmail('');
      setAddDesignation('Community Empowerment Officer (CEO)');
      setAddTargetGndId('');

      setTimeout(() => {
        handleClose();
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficer) {
      alert('Please select an officer to update.');
      return;
    }
    if (!editName?.trim()) {
      alert('Officer name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await updateCeoOfficer?.({
        oldName: selectedOfficer,
        name: editName.trim(),
        phone: editPhone?.trim() || '',
        email: editEmail?.trim() || '',
        designation: editDesignation?.trim() || 'Community Empowerment Officer (CEO)',
        gndId: editTargetGndId
      });

      if (success !== false) {
        setSuccessMessage(`Officer "${editName.trim()}" details and contact phone updated successfully!`);
        setSelectedOfficer(editName.trim());
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats for the currently selected officer in edit mode
  const linkedGndsForSelected = (gnds || []).filter(g => g?.ceoOfficer?.trim() === selectedOfficer);
  const linkedProjectsForSelected = (projects || []).filter(
    p => p?.ceoOfficer?.trim() === selectedOfficer || p?.responsibleOfficer?.trim() === selectedOfficer
  );

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e?.stopPropagation?.()}
        className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Community Empowerment Officers (CEOs)</h3>
              <p className="text-[11px] text-slate-400">
                Register new officers or manage and update contact phone numbers for existing officers
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/40 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleTabSwitch('add')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'add'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New CEO</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('edit')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'edit'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Manage & Edit Existing CEO ({(ceoOfficers || []).length})</span>
          </button>
        </div>

        {/* Success message banner */}
        {successMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: ADD NEW CEO                                               */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Officer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Sivaganeshan, M. Rajendran..."
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>Contact Phone / Mobile *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +94 77 123 4567"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address (Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ceo@tlw.ds.gov.lk"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <BadgeInfo className="w-3.5 h-3.5 text-slate-400" />
                  <span>Official Designation</span>
                </label>
                <input
                  type="text"
                  placeholder="Community Empowerment Officer (CEO)"
                  value={addDesignation}
                  onChange={(e) => setAddDesignation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Map / Assign to GND (Optional)</span>
                </label>
                <select
                  value={addTargetGndId}
                  onChange={(e) => setAddTargetGndId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">-- Leave Unassigned / Standalone Pool --</option>
                  {(gnds || []).map((g) => (
                    <option key={g?.id} value={g?.id}>
                      {g?.code ? `[${g.code}] ` : ''}{g?.name} {g?.ceoOfficer ? `(Current CEO: ${g.ceoOfficer})` : '(No CEO)'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Selecting a GND will immediately link this officer and phone number to the GND record.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Register CEO Officer'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: EDIT EXISTING CEO                                         */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Officer Selector Dropdown */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <label className="block text-amber-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Select Officer to Manage & Update *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {(ceoOfficers || []).length} registered officers
                  </span>
                </label>
                <select
                  value={selectedOfficer}
                  onChange={(e) => loadOfficerData(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white font-semibold focus:ring-2 focus:ring-amber-500 text-xs"
                >
                  {(ceoOfficers || []).map((name) => {
                    const info = getCeoContact?.(name) || {};
                    return (
                      <option key={name} value={name}>
                        {name} — Phone: {info.phone || '+94 52 225 8234'} {info.gndName ? `• GND: ${info.gndName}` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quick stats for selected officer */}
              {selectedOfficer && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Assigned GND(s)</span>
                      <span className="font-semibold text-white">
                        {linkedGndsForSelected.length > 0
                          ? linkedGndsForSelected.map(g => g?.code || g?.name).join(', ')
                          : 'Unassigned Pool'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Supervised Projects</span>
                      <span className="font-semibold text-white">
                        {linkedProjectsForSelected.length} projects linked
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Editable Fields */}
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500"
                  />
                  {selectedOfficer && editName !== selectedOfficer && (
                    <p className="text-[10px] text-amber-400 mt-1">
                      Note: Renaming this officer will automatically update all linked GNDs and project records.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contact Phone / Mobile *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +94 77 123 4567"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Updating this phone will sync across system state, Firestore, and linked GNDs.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address (Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. ceo@tlw.ds.gov.lk"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                    <BadgeInfo className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Designation</span>
                  </label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Assigned / Mapped GND</span>
                  </label>
                  <select
                    value={editTargetGndId}
                    onChange={(e) => setEditTargetGndId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- No specific assignment (Keep current) --</option>
                    {(gnds || []).map((g) => (
                      <option key={g?.id} value={g?.id}>
                        {g?.code ? `[${g.code}] ` : ''}{g?.name} {g?.ceoOfficer ? `(Current CEO: ${g.ceoOfficer})` : '(No CEO)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving Changes...' : 'Save & Update Officer'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
