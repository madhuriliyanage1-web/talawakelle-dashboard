import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Sliders, CheckCircle2 } from 'lucide-react';

export default function QuickUpdateProgressModal() {
  const {
    isQuickUpdateOpen = false,
    setIsQuickUpdateOpen = () => {},
    selectedProject = null,
    WORKFLOW_STAGES = [],
    updateProgress = () => {}
  } = useProject() || {};

  const [physical, setPhysical] = useState(0);
  const [financial, setFinancial] = useState(0);
  const [status, setStatus] = useState('Work Ongoing');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (selectedProject) {
      setPhysical(Number(selectedProject?.physicalProgress ?? selectedProject?.progress ?? 0));
      setFinancial(Number(selectedProject?.financialProgress ?? 0));
      setStatus(selectedProject?.status || selectedProject?.stage || 'Work Ongoing');
      setRemarks(selectedProject?.remarks || '');
    }
  }, [selectedProject]);

  if (!isQuickUpdateOpen || !selectedProject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProject?.id) {
      updateProgress?.(selectedProject.id, {
        physicalProgress: physical,
        financialProgress: financial,
        status,
        remarks
      });
    }
    setIsQuickUpdateOpen?.(false);
  };

  const pId = selectedProject?.id || 'PROJ';
  const pName = selectedProject?.name || selectedProject?.title || 'Project';
  const pOfficer = selectedProject?.ceoOfficer || selectedProject?.responsibleOfficer || 'Unassigned';
  const pAlloc = parseFloat(selectedProject?.allocation) || 0;

  return (
    <div
      onClick={() => setIsQuickUpdateOpen?.(false)}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Quick Progress Update</h3>
              <p className="text-[11px] text-slate-400">
                {pId} • {pName} • <span className="text-teal-300 font-semibold">CEO: {pOfficer}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickUpdateOpen?.(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Physical Progress Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-300">Physical Progress</span>
              <span className="text-emerald-400 text-sm font-mono">{physical}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={physical}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPhysical(val);
                if (val === 100 && status !== 'Completed') {
                  setStatus('Completed');
                }
              }}
              className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Financial Progress Slider */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-300">Financial Progress</span>
              <span className="text-amber-400 text-sm font-mono">{financial}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={financial}
              onChange={(e) => setFinancial(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">
              Calculated Expenditure: Rs. {((pAlloc * financial) / 100000000).toFixed(2)} Mn
            </div>
          </div>

          {/* Workflow Stage */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Workflow Lifecycle Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            >
              {(WORKFLOW_STAGES || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Progress Remarks / Field Note
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Asphalting completed on 500m stretch..."
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsQuickUpdateOpen?.(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
