import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, UserCheck, Plus, MapPin, Phone, Mail, BadgeInfo } from 'lucide-react';

export default function AddCeoModal() {
  const {
    isAddCeoOpen,
    setIsAddCeoOpen,
    addCeoOfficer,
    gnds
  } = useProject();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('Community Empowerment Officer (CEO)');
  const [targetGndId, setTargetGndId] = useState('');

  if (!isAddCeoOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter the Community Empowerment Officer name.');
      return;
    }

    addCeoOfficer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      designation: designation.trim() || 'Community Empowerment Officer (CEO)',
      gndId: targetGndId
    });

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setDesignation('Community Empowerment Officer (CEO)');
    setTargetGndId('');
    setIsAddCeoOpen(false);
  };

  return (
    <div
      onClick={() => setIsAddCeoOpen(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Community Empowerment Officer (CEO)</h3>
              <p className="text-[11px] text-slate-400">Register a new CEO officer and link to division records</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddCeoOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Officer Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Officer Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. K. Sivaganeshan, M. Rajendran..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Contact Phone / Mobile *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                placeholder="e.g. ceo@tlw.ds.gov.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
              <BadgeInfo className="w-3.5 h-3.5 text-slate-400" />
              <span>Official Designation</span>
            </label>
            <input
              type="text"
              placeholder="Community Empowerment Officer (CEO)"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Assign / Map to GND */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Map / Assign to GND (Optional)</span>
            </label>
            <select
              value={targetGndId}
              onChange={(e) => setTargetGndId(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-teal-500"
            >
              <option value="">-- Leave Unassigned / Standalone Pool --</option>
              {gnds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.code ? `[${g.code}] ` : ''}{g.name} {g.ceoOfficer ? `(Current CEO: ${g.ceoOfficer})` : '(No CEO)'}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Selecting a GND will immediately update that division's assigned CEO and cascade to all linked projects.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddCeoOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Save CEO Officer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
