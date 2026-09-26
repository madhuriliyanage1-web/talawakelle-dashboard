import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Edit2,
  Sliders,
  Trash2,
  Plus,
  Tag,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

export default function MasterTable() {
  const {
    filteredProjects = [],
    openProjectDetail = () => {},
    setSelectedProject = () => {},
    setIsEditProjectOpen = () => {},
    setIsQuickUpdateOpen = () => {},
    setIsAddProjectOpen = () => {},
    setIsAddCategoryOpen = () => {},
    deleteProject = () => {},
    getProjectAlerts = () => []
  } = useProject() || {};

  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableSearch, setTableSearch] = useState('');

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Inline table filter & sorting
  const processedProjects = useMemo(() => {
    let list = [...(filteredProjects || [])];

    if (tableSearch) {
      const q = String(tableSearch).toLowerCase();
      list = list.filter(p =>
        (p?.name || p?.title || '').toLowerCase().includes(q) ||
        (p?.projectCode || p?.id || '').toLowerCase().includes(q) ||
        (p?.gndName || p?.gnd || '').toLowerCase().includes(q) ||
        (p?.category || '').toLowerCase().includes(q) ||
        (p?.ceoOfficer || p?.responsibleOfficer || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredProjects, tableSearch, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil((processedProjects || []).length / pageSize) || 1;
  const paginatedProjects = (processedProjects || []).slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      'Project ID', 'GND Code', 'GND Name', 'Project Name', 'Category',
      'Allocation (LKR)', 'Expenditure (LKR)', 'Physical Progress %',
      'Financial Progress %', 'Workflow Status', 'Community Empowerment Officer (CEO)',
      'Target Completion Date', 'Remarks'
    ];

    const rows = (processedProjects || []).map(p => [
      p?.projectCode || p?.id || '',
      p?.gndCode || '',
      `"${String(p?.gndName || p?.gnd || '').replace(/"/g, '""')}"`,
      `"${String(p?.name || p?.title || '').replace(/"/g, '""')}"`,
      `"${String(p?.category || '').replace(/"/g, '""')}"`,
      p?.allocation || 0,
      p?.expenditure || 0,
      p?.physicalProgress ?? p?.progress ?? 0,
      p?.financialProgress ?? 0,
      p?.status || p?.stage || '',
      `"${String(p?.ceoOfficer || p?.responsibleOfficer || '').replace(/"/g, '""')}"`,
      p?.expectedCompletionDate || '',
      `"${String(p?.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Talawakelle_DS_Projects_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (p, e) => {
    e?.stopPropagation?.();
    setSelectedProject?.(p);
    setIsEditProjectOpen?.(true);
  };

  const handleQuickUpdate = (p, e) => {
    e?.stopPropagation?.();
    setSelectedProject?.(p);
    setIsQuickUpdateOpen?.(true);
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation?.();
    if (window.confirm(`Are you sure you want to delete project ${id}?`)) {
      deleteProject?.(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Table Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search inside Table */}
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <span className="text-xs text-slate-400">
            Total records: <span className="font-bold text-white">{(processedProjects || []).length}</span>
          </span>
        </div>

        {/* Action Buttons: Add Project, New Category, Export */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddProjectOpen?.(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>

          <button
            onClick={() => setIsAddCategoryOpen?.(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>New Category</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Download CSV for Excel analysis"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white min-w-[240px]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Project Title & Description</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gndName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>GND</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('allocation')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Allocation</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('physicalProgress')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Physical %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('financialProgress')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Financial %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Status / Stage</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('expectedCompletionDate')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center space-x-1">
                    <span>Target Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(paginatedProjects || []).length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No matching projects found.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  const alerts = getProjectAlerts?.(p) || [];
                  const pId = p?.projectCode || p?.id || 'PROJ';
                  const pName = p?.name || p?.title || 'Project';
                  const pAlloc = parseFloat(p?.allocation) || 0;
                  const pPhys = Number(p?.physicalProgress ?? p?.progress ?? 0);
                  const pFin = Number(p?.financialProgress ?? 0);
                  const pGnd = p?.gndCode || p?.gndName || p?.gnd || '';
                  const pOfficer = p?.ceoOfficer || p?.responsibleOfficer || 'Unassigned';

                  return (
                    <tr
                      key={pId}
                      onClick={() => openProjectDetail?.(p)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-300 font-bold">
                        {pId}
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-white line-clamp-1">{pName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{p?.description || ''}</div>
                        {(alerts || []).length > 0 && (
                          <div className="mt-1 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span className="text-[10px] text-rose-400 font-semibold">
                              {alerts?.[0]?.label}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* GND & Assigned CEO */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-200 block">{pGnd}</span>
                        <span className="text-[11px] text-teal-400 block font-normal mt-0.5">
                          CEO: {pOfficer}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                          {p?.category || 'General'}
                        </span>
                      </td>

                      {/* Allocation */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-200">
                        Rs. {(pAlloc / 1000000).toFixed(2)} M
                      </td>

                      {/* Physical Progress */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <span className="font-bold text-emerald-400">{pPhys}%</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(Math.max(pPhys, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Financial Progress */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <span className="font-bold text-amber-400">{pFin}%</span>
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${Math.min(Math.max(pFin, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          {p?.status || p?.stage || 'Planning'}
                        </span>
                      </td>

                      {/* Target Date */}
                      <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                        {p?.expectedCompletionDate || p?.year || '2026'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={(e) => { e?.stopPropagation?.(); openProjectDetail?.(p); }}
                            className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="Inspect Project Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleQuickUpdate(p, e)}
                            className="p-1 rounded hover:bg-slate-700 text-amber-400 hover:text-amber-300"
                            title="Quick Progress Slider Update"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleEdit(p, e)}
                            className="p-1 rounded hover:bg-slate-700 text-blue-400 hover:text-blue-300"
                            title="Edit Project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(pId, e)}
                            className="p-1 rounded hover:bg-rose-900/40 text-rose-400 hover:text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded bg-slate-800 border border-slate-700 text-slate-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
