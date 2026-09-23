import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Camera,
  Plus,
  Filter,
  Calendar,
  User,
  X,
  Maximize2,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function EvidenceGallery() {
  const {
    evidence = [],
    projects = [],
    setIsAddEvidenceOpen = () => {},
    setEvidenceTargetProjectId = () => {},
    openProjectDetail = () => {}
  } = useProject() || {};

  const [phaseFilter, setPhaseFilter] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // Filter evidence
  const filteredEvidence = (evidence || []).filter(item => {
    if (!item) return false;
    if (phaseFilter !== 'all' && item?.activity !== phaseFilter) return false;
    if (selectedProjectId !== 'all' && item?.projectId !== selectedProjectId) return false;
    return true;
  });

  const getPhaseBadge = (phase) => {
    switch (phase) {
      case 'Before':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'During':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleAddPhoto = () => {
    setEvidenceTargetProjectId?.(selectedProjectId !== 'all' ? selectedProjectId : (projects || [])[0]?.id);
    setIsAddEvidenceOpen?.(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Photographic Evidence & Site Verification
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Physical Inspection & Progress Sequence
          </h2>
          <p className="text-xs text-slate-400">
            Chronological audit photographs verifying pre-construction, ongoing site excavation, and final handover.
          </p>
        </div>

        <button
          onClick={handleAddPhoto}
          className="flex items-center space-x-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Evidence</span>
        </button>
      </div>

      {/* Filter Tabs: Project Selector & Phase Filters */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Phase Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['all', 'Before', 'During', 'Completed'].map(phase => (
            <button
              key={phase}
              onClick={() => setPhaseFilter(phase)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                phaseFilter === phase
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {phase === 'all' ? 'All Phases' : phase}
            </button>
          ))}
        </div>

        {/* Project Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400">Filter by Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Projects ({(projects || []).length})</option>
            {(projects || []).map(p => (
              <option key={p?.id} value={p?.id}>
                {p?.id} - {(p?.name || p?.title || '').slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Photo Grid */}
      {(filteredEvidence || []).length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
          <Camera className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Photographic Evidence Found</h3>
          <p className="text-xs text-slate-400">
            No photos match the selected project or lifecycle phase. Click "Upload Evidence" to add new photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvidence.map(item => {
            const proj = (projects || []).find(p => p?.id === item?.projectId);
            const itemId = item?.id || 'EVD';
            const itemPhotoUrl = item?.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80";

            return (
              <div
                key={itemId}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden group hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                {/* Image Container with Zoom Trigger */}
                <div
                  onClick={() => setLightboxPhoto(item)}
                  className="relative h-48 w-full bg-slate-900 cursor-pointer overflow-hidden"
                >
                  <img
                    src={itemPhotoUrl}
                    alt={item?.description || 'Site photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Phase Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border backdrop-blur-md ${getPhaseBadge(item?.activity)}`}>
                      {item?.activity || 'General'} Phase
                    </span>
                  </div>

                  {/* Zoom Overlay Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900/90 text-xs font-semibold text-white border border-slate-700">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Inspect Photo</span>
                    </span>
                  </div>

                  {/* Date badge */}
                  <div className="absolute bottom-2.5 left-3 text-[11px] text-slate-300 flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    <span>{item?.date || ''}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">{item?.projectId || ''}</span>
                    <span className="text-slate-400 text-[10px] flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{item?.uploadedBy?.split('(')[0] || 'Technical Officer'}</span>
                    </span>
                  </div>

                  <h4
                    onClick={() => proj && openProjectDetail?.(proj)}
                    className="text-xs font-bold text-white hover:text-emerald-300 cursor-pointer line-clamp-1"
                  >
                    {proj?.name || proj?.title || 'Project Reference'}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {item?.description || ''}
                  </p>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500 font-mono">{itemId}</span>
                    {proj && (
                      <button
                        onClick={() => openProjectDetail?.(proj)}
                        className="text-emerald-400 text-[11px] font-semibold flex items-center space-x-1 hover:underline"
                      >
                        <span>Project View</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={lightboxPhoto?.imageUrl}
                alt={lightboxPhoto?.description || 'Inspection photo'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 space-y-2 bg-slate-900">
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getPhaseBadge(lightboxPhoto?.activity)}`}>
                  {lightboxPhoto?.activity || 'Site'} Phase
                </span>
                <span className="font-mono text-xs text-emerald-400 font-bold">
                  {lightboxPhoto?.projectId || ''}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lightboxPhoto?.date || ''}</span>
                </span>
              </div>
              <p className="text-sm text-slate-200">{lightboxPhoto?.description || ''}</p>
              <p className="text-xs text-slate-400">
                Uploaded by: <span className="text-slate-300 font-semibold">{lightboxPhoto?.uploadedBy || 'Technical Officer'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
