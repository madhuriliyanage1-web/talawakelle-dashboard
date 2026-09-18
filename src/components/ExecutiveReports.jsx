import React from 'react';
import { useProject } from '../context/ProjectContext';
import {
  Printer,
  FileText,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';

export default function ExecutiveReports() {
  const {
    projects,
    filteredProjects,
    filters,
    gnds,
    categories,
    executiveMetrics,
    SECRETARIAT_META
  } = useProject();

  const handlePrint = () => {
    window.print();
  };

  // Group stats by GND (filtered by active filters / CEO if selected)
  const targetGnds = filters.officer !== 'all'
    ? gnds.filter(g => g.ceoOfficer === filters.officer)
    : gnds;

  const gndMatrix = targetGnds.map(g => {
    const pList = filteredProjects.filter(p => p.gndId === g.id);
    const alloc = pList.reduce((sum, p) => sum + (p.allocation || 0), 0);
    const exp = pList.reduce((sum, p) => sum + (p.expenditure || 0), 0);
    const comp = pList.filter(p => ['Completed', 'Bill Submitted', 'Bill Paid'].includes(p.status)).length;
    const ongoing = pList.filter(p => ['Work Started', 'Work Ongoing'].includes(p.status)).length;
    const avgPhys = pList.length ? Math.round(pList.reduce((sum, p) => sum + p.physicalProgress, 0) / pList.length) : 0;
    const avgFin = alloc > 0 ? Math.round((exp / alloc) * 100) : 0;

    return {
      gnd: g,
      total: pList.length,
      comp,
      ongoing,
      alloc,
      exp,
      avgPhys,
      avgFin
    };
  }).filter(item => item.total > 0 || filters.officer !== 'all');

  return (
    <div className="space-y-6">
      {/* Top Action Header (hidden on print) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Official Secretariat Progress Dossier
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            District Secretariat Submission & Executive Report
          </h2>
          <p className="text-xs text-slate-400">
            Formally formatted according to Ministry of Public Administration & Provincial Council reporting standards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl space-y-8 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="text-center border-b-2 border-emerald-600 pb-6 space-y-1.5 print:border-black">
          <div className="text-xs font-bold tracking-widest uppercase text-slate-400 print:text-slate-700">
            DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA
          </div>
          <h1 className="text-2xl font-black uppercase text-white print:text-black tracking-tight">
            DIVISIONAL SECRETARIAT — TALAWAKELLE
          </h1>
          <p className="text-sm font-semibold text-emerald-400 print:text-emerald-800">
            PLANNING BRANCH | ANNUAL CAPITAL DEVELOPMENT PROGRAMME
          </p>
          <p className="text-xs text-slate-400 print:text-slate-600">
            Progress Monitoring Review & District Secretariat Submission Matrix (2026)
          </p>
          <div className="text-[11px] text-slate-400 print:text-slate-500 pt-2 flex items-center justify-center space-x-4">
            <span>District: Nuwara Eliya</span>
            <span>•</span>
            <span>Date of Generation: {new Date().toLocaleDateString('en-GB')}</span>
            <span>•</span>
            <span>Status: Verified</span>
          </div>
        </div>

        {/* Executive Summary Metrics Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 print:text-black border-l-4 border-emerald-500 pl-2">
            1. Executive Summary & Macro Portfolio Status
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:grid-cols-4">
            <div className="p-3.5 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Total Projects</span>
              <p className="text-xl font-black text-white print:text-black">{projects.length}</p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">Across 34 GNDs</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Total Allocation</span>
              <p className="text-xl font-black text-amber-400 print:text-black">
                Rs. {(executiveMetrics.totalAllocation / 1000000).toFixed(2)} Mn
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">Approved Budget</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Total Expenditure</span>
              <p className="text-xl font-black text-emerald-400 print:text-black">
                Rs. {(executiveMetrics.totalExpenditure / 1000000).toFixed(2)} Mn
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">
                {executiveMetrics.totalFinancialProgress}% Disbursed
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700 print:border-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Avg Physical Execution</span>
              <p className="text-xl font-black text-emerald-400 print:text-black">
                {executiveMetrics.avgPhysicalProgress}%
              </p>
              <span className="text-[10px] text-slate-400 print:text-slate-600">
                {executiveMetrics.completed} Completed
              </span>
            </div>
          </div>
        </div>

        {/* GND-wise Progress Matrix */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 print:text-black border-l-4 border-emerald-500 pl-2">
            2. Grama Niladhari Division Performance Matrix
          </h3>

          <div className="overflow-x-auto border border-slate-700 print:border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800 print:bg-slate-200 text-[10px] uppercase font-bold text-slate-300 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">GND Code & Name</th>
                  <th className="py-2.5 px-3">Community Empowerment Officer (CEO)</th>
                  <th className="py-2.5 px-3 text-center">Projects</th>
                  <th className="py-2.5 px-3 text-center">Completed</th>
                  <th className="py-2.5 px-3 text-center">Ongoing</th>
                  <th className="py-2.5 px-3 text-right">Allocation (Mn)</th>
                  <th className="py-2.5 px-3 text-right">Expenditure (Mn)</th>
                  <th className="py-2.5 px-3 text-center">Phys %</th>
                  <th className="py-2.5 px-3 text-center">Fin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                {gndMatrix.map((m, idx) => (
                  <tr key={idx} className="print:text-black">
                    <td className="py-2 px-3 font-semibold">
                      {m.gnd.code || ''} {m.gnd.displayName}
                    </td>
                    <td className="py-2 px-3 text-slate-400 print:text-slate-700">
                      {m.gnd.ceoOfficer}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{m.total}</td>
                    <td className="py-2 px-3 text-center text-emerald-400 print:text-black font-semibold">{m.comp}</td>
                    <td className="py-2 px-3 text-center text-blue-400 print:text-black font-semibold">{m.ongoing}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      Rs. {(m.alloc / 1000000).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      Rs. {(m.exp / 1000000).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-400 print:text-black">{m.avgPhys}%</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-400 print:text-black">{m.avgFin}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Focus Areas & Remedial Directives */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 print:text-black border-l-4 border-rose-500 pl-2">
            3. Critical Focus Areas & District Secretariat Directives
          </h3>

          <div className="p-4 rounded-xl bg-slate-800/60 print:bg-slate-50 border border-slate-700 print:border-slate-300 text-xs space-y-2 print:text-black">
            <p className="font-semibold text-slate-200 print:text-black">
              • Contractor Mobilization in Estate Corridors:
            </p>
            <p className="text-slate-400 print:text-slate-700">
              Technical officers must expedite agreement signing for rural road tenders in Greatwestern, Holbrook, and Waverley to guarantee completion prior to the northeast monsoon period.
            </p>
            <p className="font-semibold text-slate-200 print:text-black">
              • Voucher Settlement Acceleration:
            </p>
            <p className="text-slate-400 print:text-slate-700">
              Projects with 100% physical completion must submit final measurement sheets and bills to the Divisional Secretariat within 7 working days to close audit records.
            </p>
          </div>
        </div>

        {/* Official Signature Lines */}
        <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs print:pt-16">
          <div className="border-t border-slate-600 print:border-black pt-2">
            <p className="font-bold text-white print:text-black">K. Sivalingam</p>
            <p className="text-[10px] text-slate-400 print:text-slate-600">Planning Officer</p>
            <p className="text-[9px] text-slate-500 print:text-slate-500">Divisional Secretariat</p>
          </div>

          <div className="border-t border-slate-600 print:border-black pt-2">
            <p className="font-bold text-white print:text-black">M. Rathnayake</p>
            <p className="text-[10px] text-slate-400 print:text-slate-600">Assistant Director (Planning)</p>
            <p className="text-[9px] text-slate-500 print:text-slate-500">Planning Branch</p>
          </div>

          <div className="border-t border-slate-600 print:border-black pt-2">
            <p className="font-bold text-white print:text-black">Divisional Secretary</p>
            <p className="text-[10px] text-slate-400 print:text-slate-600">Talawakelle Divisional Secretariat</p>
            <p className="text-[9px] text-slate-500 print:text-slate-500">Official Seal & Approval</p>
          </div>
        </div>
      </div>
    </div>
  );
}
