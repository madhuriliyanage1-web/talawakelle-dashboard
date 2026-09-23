import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, MapPin, Plus, UserCheck, Phone, FileText } from 'lucide-react';

export default function AddGndModal() {
  const {
    isAddGndOpen = false,
    setIsAddGndOpen = () => {},
    addGnd = () => {},
    ceoOfficers = []
  } = useProject() || {};

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [ceoOfficer, setCeoOfficer] = useState('');
  const [customOfficer, setCustomOfficer] = useState('');
  const [isCustomOfficer, setIsCustomOfficer] = useState(false);
  const [phone, setPhone] = useState('+94 52 225 8234');

  if (!isAddGndOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name?.trim()) {
      alert('Please enter a GND Division name.');
      return;
    }

    const finalCeo = isCustomOfficer ? (customOfficer?.trim() || '') : (ceoOfficer?.trim() || '');

    addGnd?.({
      name: name.trim(),
      code: code?.trim() || '',
      displayName: displayName?.trim() || name.trim(),
      ceoOfficer: finalCeo,
      phone: phone?.trim() || '+94 52 225 8234'
    });

    // Reset form
    setName('');
    setCode('');
    setDisplayName('');
    setCeoOfficer('');
    setCustomOfficer('');
    setIsCustomOfficer(false);
    setPhone('+94 52 225 8234');
    setIsAddGndOpen?.(false);
  };

  return (
    <div
      onClick={() => setIsAddGndOpen?.(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e?.stopPropagation?.()}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Grama Niladhari Division (GND)</h3>
              <p className="text-[11px] text-slate-400">Register a new GND and map its Community Empowerment Officer</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddGndOpen?.(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-3 gap-3">
            {/* GND Code */}
            <div className="col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">
                GND Code
              </label>
              <input
                type="text"
                placeholder="e.g. 476/U"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* GND Name */}
            <div className="col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                GND Division Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 476/U Great Western East"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Display / Short Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Display / Short Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Great Western East"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Assigned CEO Officer */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Assigned CEO Officer</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomOfficer(!isCustomOfficer)}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                {isCustomOfficer ? '← Pick from list' : '+ Enter new officer'}
              </button>
            </div>

            {isCustomOfficer ? (
              <input
                type="text"
                placeholder="Enter full name of Community Empowerment Officer"
                value={customOfficer}
                onChange={(e) => setCustomOfficer(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-amber-500/50 text-white focus:ring-1 focus:ring-amber-500"
              />
            ) : (
              <select
                value={ceoOfficer}
                onChange={(e) => setCeoOfficer(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">-- Select Community Empowerment Officer --</option>
                {(ceoOfficers || []).map((ceo) => (
                  <option key={ceo} value={ceo}>
                    {ceo}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact Phone / Extension</span>
            </label>
            <input
              type="text"
              placeholder="+94 52 225 8234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddGndOpen?.(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Save GND</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
