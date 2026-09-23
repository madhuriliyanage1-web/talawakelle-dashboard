import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Search,
  Filter,
  X,
  Calendar,
  Layers,
  MapPin,
  UserCheck,
  Flag,
  Settings,
  Plus,
  Tag
} from 'lucide-react';

export default function GlobalFilterBar() {
  const {
    filters = {},
    setFilters = () => {},
    resetFilters = () => {},
    gnds = [],
    categories = [],
    filteredProjects = [],
    projects = [],
    WORKFLOW_STAGES = [],
    SECRETARIAT_META = {},
    ceoOfficers = [],
    financialYears = [],
    setIsSettingsOpen = () => {},
    setIsAddGndOpen = () => {},
    setIsAddCeoOpen = () => {},
    setIsAddCategoryOpen = () => {}
  } = useProject() || {};

  const handleFilterChange = (key, value) => {
    setFilters?.(prev => ({ ...(prev || {}), [key]: value }));
  };

  const activeCount = [
    filters?.gndId && filters.gndId !== 'all',
    filters?.category && filters.category !== 'all',
    filters?.status && filters.status !== 'all',
    filters?.year && filters.year !== 'all',
    filters?.officer && filters.officer !== 'all',
    Boolean(filters?.search),
    Boolean(filters?.startDate),
    Boolean(filters?.endDate)
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-sm no-print">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top row: Search input + Quick pills + Reset + Quick-Add Buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project title, ID, GND, CEO..."
              value={filters?.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
            />
            {filters?.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Active Filter Counter & Quick Add Management Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-xs text-slate-600 hidden sm:block">
              Showing <span className="font-bold text-slate-900">{(filteredProjects || []).length}</span> of{' '}
              <span className="font-semibold text-slate-600">{(projects || []).length}</span> projects
            </div>

            {activeCount > 0 && (
              <button
                onClick={() => resetFilters?.()}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
              >
                <X className="w-3 h-3" />
                <span>Clear ({activeCount})</span>
              </button>
            )}

            {/* Quick-add buttons matching + Category styling */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsAddGndOpen?.(true)}
                title="Quick Add Grama Niladhari Division (GND)"
                className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-sm transition"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ GND</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddCeoOpen?.(true)}
                title="Quick Add Community Empowerment Officer (CEO)"
                className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-sm transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>+ CEO</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddCategoryOpen?.(true)}
                title="Quick Add Programme Category"
                className="hidden sm:flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow-sm transition"
              >
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Category</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen?.(true)}
                title="Settings & Master Configuration"
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {/* GND Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                <span>GND</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddGndOpen?.(true)}
                title="Add New GND"
                className="text-emerald-600 hover:text-emerald-800 font-extrabold text-xs px-1 leading-none transition"
              >
                +
              </button>
            </div>
            <select
              value={filters?.gndId || 'all'}
              onChange={(e) => handleFilterChange('gndId', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="all">All GNDs ({(gnds || []).length})</option>
              {(gnds || []).map(g => (
                <option key={g?.id} value={g?.id}>
                  {g?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <Layers className="w-2.5 h-2.5 text-blue-600" />
                <span>Category</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen?.(true)}
                title="Add New Category"
                className="text-blue-600 hover:text-blue-800 font-extrabold text-xs px-1 leading-none transition"
              >
                +
              </button>
            </div>
            <select
              value={filters?.category || 'all'}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="all">All Categories ({(categories || []).length})</option>
              {(categories || []).map(c => (
                <option key={c?.id} value={c?.name}>
                  {c?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow Status Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1">
              <Flag className="w-2.5 h-2.5 text-amber-600" />
              <span>Workflow Stage</span>
            </label>
            <select
              value={filters?.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="all">All Stages ({(WORKFLOW_STAGES || []).length})</option>
              {(WORKFLOW_STAGES || []).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1">
              <Calendar className="w-2.5 h-2.5 text-purple-600" />
              <span>Year</span>
            </label>
            <select
              value={filters?.year || 'all'}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="all">All Years ({(financialYears || []).length})</option>
              {(financialYears || []).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Community Empowerment Officer (CEO) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1 truncate"
                title="Community Empowerment Officer (CEO)"
              >
                <UserCheck className="w-2.5 h-2.5 text-teal-600 flex-shrink-0" />
                <span className="truncate">CEO Officer</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddCeoOpen?.(true)}
                title="Add New CEO Officer"
                className="text-teal-600 hover:text-teal-800 font-extrabold text-xs px-1 leading-none transition flex-shrink-0"
              >
                +
              </button>
            </div>
            <select
              value={filters?.officer || 'all'}
              onChange={(e) => handleFilterChange('officer', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium truncate"
              title={filters?.officer !== 'all' ? filters?.officer : 'Filter by Community Empowerment Officer (CEO)'}
            >
              <option value="all">All CEOs ({(ceoOfficers || []).length})</option>
              {(ceoOfficers || []).map(ceo => (
                <option key={ceo} value={ceo}>{ceo}</option>
              ))}
            </select>
          </div>

          {/* Target Date Range (End Date) */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1">
              <Calendar className="w-2.5 h-2.5 text-rose-600" />
              <span>Target Before</span>
            </label>
            <input
              type="date"
              value={filters?.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
