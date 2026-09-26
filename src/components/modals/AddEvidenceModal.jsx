import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Camera, Upload, Plus } from 'lucide-react';

export default function AddEvidenceModal() {
  const {
    isAddEvidenceOpen = false,
    setIsAddEvidenceOpen = () => {},
    projects = [],
    evidenceTargetProjectId = null,
    addEvidence = () => {},
    SECRETARIAT_META = {},
    ceoOfficers = []
  } = useProject() || {};

  const [projectId, setProjectId] = useState(evidenceTargetProjectId || (projects || [])[0]?.id || '');
  const [activity, setActivity] = useState('During');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedBy, setUploadedBy] = useState((ceoOfficers || [])[0] || (SECRETARIAT_META?.officers || [])[0] || 'Technical Officer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isAddEvidenceOpen) return null;

  // Preset sample photo choices for convenient one-click selection
  const sampleSuggestions = [
    { label: 'Rural Road Baseline', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },
    { label: 'Civil Excavation', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80' },
    { label: 'Completed Asphalting', url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80' },
    { label: 'Building Construction', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl) {
      alert('Please provide an image URL or choose a photo file.');
      return;
    }
    if (!description?.trim()) {
      alert('Please provide an inspection description.');
      return;
    }

    addEvidence?.({
      projectId: projectId || evidenceTargetProjectId || (projects || [])[0]?.id || 'PRJ-01',
      activity,
      description: description.trim(),
      imageUrl,
      uploadedBy,
      date
    });

    setIsAddEvidenceOpen?.(false);
  };

  return (
    <div
      onClick={() => setIsAddEvidenceOpen?.(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e?.stopPropagation?.()}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Upload Photographic Evidence</h3>
          </div>
          <button
            onClick={() => setIsAddEvidenceOpen?.(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Project */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Project *</label>
            <select
              value={projectId || evidenceTargetProjectId || ''}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            >
              {(projects || []).map(p => (
                <option key={p?.id} value={p?.id}>
                  {(p?.title || p?.name || 'Unnamed Project').slice(0, 60)}{(p?.title || p?.name || '').length > 60 ? '…' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Lifecycle Phase */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Activity Phase *</label>
            <div className="grid grid-cols-3 gap-2">
              {['Before', 'During', 'Completed'].map(phase => (
                <button
                  type="button"
                  key={phase}
                  onClick={() => setActivity(phase)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    activity === phase
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {phase} Phase
                </button>
              ))}
            </div>
          </div>

          {/* Photo Source: File Upload or Direct URL */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold">Image Source *</label>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
            />

            <div className="relative">
              <input
                type="text"
                placeholder="Or paste an image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-[11px]"
              />
            </div>

            {/* Quick Preset Samples */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              <span className="text-[10px] text-slate-500 whitespace-nowrap">Presets:</span>
              {sampleSuggestions.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(s.url)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Image Preview Box */}
            {imageUrl && (
              <div className="h-28 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Photo Description & Audit Notes *</label>
            <textarea
              required
              rows={2}
              placeholder="Detailed caption indicating location, chainage, or inspection observations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Date & Officer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date Taken</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Community Empowerment Officer (CEO)
              </label>
              <select
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {(ceoOfficers || []).map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddEvidenceOpen?.(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
            >
              <Upload className="w-4 h-4" />
              <span>Attach Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
