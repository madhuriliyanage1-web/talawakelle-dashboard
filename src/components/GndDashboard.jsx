import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  MapPin,
  User,
  Phone,
  Building,
  ArrowRight,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

export default function GndDashboard() {
  const {
    gnds = [],
    projects = [],
    filteredProjects = [],
    filters = {},
    openProjectDetail = () => {},
    getProjectAlerts = () => [],
    evidence = []
  } = useProject() || {};

  // If a CEO filter is active, filter GNDs to those assigned to this CEO
  const availableGnds = (filters?.officer && filters.officer !== 'all')
    ? (gnds || []).filter(g => g?.ceoOfficer === filters.officer)
    : (gnds || []);

  const [selectedGndId, setSelectedGndId] = useState(
    (availableGnds || [])[0]?.id || (gnds || [])[0]?.id || ''
  );

  // Keep selectedGndId synced when filter changes
  useEffect(() => {
    if (filters?.officer && filters.officer !== 'all' && (availableGnds || []).length > 0) {
      if (!availableGnds.some(g => g?.id === selectedGndId)) {
        setSelectedGndId(availableGnds[0]?.id || '');
      }
    }
  }, [filters?.officer, availableGnds, selectedGndId]);

  const selectedGnd = (availableGnds || []).find(g => g?.id === selectedGndId) || availableGnds[0] || (gnds || [])[0] || {};
  const gndProjects = (filteredProjects || []).filter(p => p?.gndId === selectedGnd?.id);

  // Compute GND summary stats
  const totalAllocation = (gndProjects || []).reduce((acc, p) => acc + (parseFloat(p?.allocation) || 0), 0);
  const totalExpenditure = (gndProjects || []).reduce((acc, p) => acc + (parseFloat(p?.expenditure) || 0), 0);
  const avgPhysical = gndProjects.length
    ? Math.round(gndProjects.reduce((acc, p) => acc + (Number(p?.physicalProgress ?? p?.progress ?? 0) || 0), 0) / gndProjects.length)
    : 0;
  const avgFinancial = totalAllocation > 0
    ? Math.round((totalExpenditure / totalAllocation) * 100)
    : 0;
  const delayedCount = (gndProjects || []).filter(p => (getProjectAlerts?.(p) || []).length > 0).length;

  const getThumbnail = (projectId) => {
    const item = (evidence || []).find(e => e?.projectId === projectId);
    return item?.imageUrl || null;
  };

  return (
    <div className="space-y-6">
      {/* GND Selector Card & CEO Contact Profile */}
      <div className="gov-card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Dropdown & Details */}
          <div className="space-y-2 max-w-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {filters?.officer && filters.officer !== 'all'
                  ? `GNDs assigned to ${filters.officer} (${(availableGnds || []).length})`
                  : `Select Grama Niladhari Division (${(gnds || []).length} GNDs)`}
              </span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedGndId}
                onChange={(e) => setSelectedGndId(e.target.value)}
                className="py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
              >
                {(availableGnds || []).map(g => (
                  <option key={g?.id} value={g?.id}>
                    {g?.name}
                  </option>
                ))}
              </select>

              <span className="text-xs text-slate-600 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span>Talawakelle DS Division</span>
              </span>
            </div>
          </div>

          {/* Assigned CEO Officer Profile Badge */}
          <div className="flex items-center space-x-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Community Empowerment Officer (CEO)
              </span>
              <h4 className="text-sm font-extrabold text-slate-900">
                {selectedGnd?.ceoOfficer || 'Unassigned'}
              </h4>
              <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold">{selectedGnd?.phone || '+94 52 225 8234'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* GND Summary Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-200">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Projects</span>
            <p className="text-lg font-black text-slate-900">{(gndProjects || []).length}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Allocation</span>
            <p className="text-lg font-black text-amber-600">
              Rs. {(totalAllocation / 1000000).toFixed(2)} Mn
            </p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Avg Physical %</span>
            <p className="text-lg font-black text-emerald-600">{avgPhysical}%</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Financial Progress</span>
            <p className="text-lg font-black text-blue-600">{avgFinancial}%</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Delayed Items</span>
            <p className={`text-lg font-black ${delayedCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {delayedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid for this GND */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Development Projects in {selectedGnd?.displayName || selectedGnd?.name || 'Selected Division'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {(gndProjects || []).length}
            </span>
          </h3>
        </div>

        {(gndProjects || []).length === 0 ? (
          <div className="gov-card p-10 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No projects registered yet for this GND</h4>
            <p className="text-xs text-slate-500">
              Use the "+ New Project" button in the navigation header to register a project under {selectedGnd?.name || 'this division'}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(gndProjects || []).map(proj => {
              const alerts = getProjectAlerts?.(proj) || [];
              const thumb = getThumbnail(proj?.id);
              const pId = proj?.id || 'PROJ';
              const pName = proj?.name || proj?.title || 'Project';
              const pAlloc = parseFloat(proj?.allocation) || 0;
              const pPhys = Number(proj?.physicalProgress ?? proj?.progress ?? 0);
              const pFin = Number(proj?.financialProgress ?? 0);

              return (
                <div
                  key={pId}
                  onClick={() => openProjectDetail?.(proj)}
                  className="gov-card p-4 cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  {/* Card Thumbnail & Badges */}
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={pName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 space-y-1">
                        <ImageIcon className="w-7 h-7 text-slate-300" />
                        <span className="text-[10px] font-semibold text-slate-400">No photo uploaded</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    {/* Category pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-slate-800 border border-slate-200 shadow-sm">
                        {proj?.category || 'General'}
                      </span>
                    </div>

                    {/* ID & Date in bottom overlay */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white">
                      <span className="font-mono bg-black/60 px-1.5 py-0.5 rounded font-bold">
                        {pId}
                      </span>
                      <span className="flex items-center space-x-1 bg-black/60 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Target: {proj?.expectedCompletionDate || proj?.year || '2026'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {pName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {proj?.description || ''}
                    </p>
                  </div>

                  {/* Stage & Alert Badges */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                      {proj?.status || proj?.stage || 'Planning'}
                    </span>

                    {(alerts || []).map((alt, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
                      >
                        {alt?.label}
                      </span>
                    ))}
                  </div>

                  {/* Dual Progress Bars */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-semibold flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span>Physical:</span>
                      </span>
                      <span className="font-bold text-emerald-600">{pPhys}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(Math.max(pPhys, 0), 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-600 font-semibold flex items-center space-x-1">
                        <span>Financial:</span>
                      </span>
                      <span className="font-bold text-amber-600">{pFin}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(Math.max(pFin, 0), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer: Budget & Detail Trigger */}
                  <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Allocation</span>
                      <span className="font-extrabold text-slate-900">
                        Rs. {(pAlloc / 1000000).toFixed(2)} Mn
                      </span>
                    </div>
                    <button className="flex items-center space-x-1 text-emerald-700 font-bold text-xs group-hover:translate-x-1 transition-transform">
                      <span>Inspect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
