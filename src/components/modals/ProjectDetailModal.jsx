import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  X,
  Calendar,
  Building,
  User,
  Banknote,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Camera,
  Plus,
  Sliders,
  Edit2,
  Phone,
  Users,
  ShieldCheck
} from 'lucide-react';

export default function ProjectDetailModal() {
  const {
    selectedProject = null,
    isDetailOpen = false,
    closeProjectDetail = () => {},
    WORKFLOW_STAGES = [],
    updateProgress = () => {},
    evidence = [],
    setIsQuickUpdateOpen = () => {},
    setIsEditProjectOpen = () => {},
    setIsAddEvidenceOpen = () => {},
    setEvidenceTargetProjectId = () => {},
    getProjectAlerts = () => [],
    getCeoContact = () => ({})
  } = useProject() || {};

  if (!isDetailOpen || !selectedProject) return null;

  const currentStageIndex = (WORKFLOW_STAGES || []).indexOf(selectedProject?.status || selectedProject?.stage);
  const alerts = getProjectAlerts?.(selectedProject) || [];
  const projectPhotos = (evidence || []).filter(e => e?.projectId === selectedProject?.id || (selectedProject?.projectCode && e?.projectId === selectedProject?.projectCode));

  const handleStageClick = (stageName) => {
    let phys = Number(selectedProject?.physicalProgress ?? selectedProject?.progress ?? 0);
    let fin = Number(selectedProject?.financialProgress ?? 0);
    if (stageName === 'Completed') {
      phys = 100;
      fin = 100;
    } else if (stageName === 'Work Ongoing' && phys < 30) {
      phys = 50;
    }
    if (selectedProject?.id) {
      updateProgress?.(selectedProject.id, {
        status: stageName,
        physicalProgress: phys,
        financialProgress: fin,
        remarks: `Stage updated to ${stageName} on ${new Date().toISOString().split('T')[0]}`
      });
    }
  };

  const handleAddPhoto = () => {
    if (selectedProject?.id) {
      setEvidenceTargetProjectId?.(selectedProject.id);
      setIsAddEvidenceOpen?.(true);
    }
  };

  const pAlloc = parseFloat(selectedProject?.allocation) || 0;
  const pExp = parseFloat(selectedProject?.expenditure) || 0;
  const pPhys = Number(selectedProject?.physicalProgress ?? selectedProject?.progress ?? 0);
  const pFin = Number(selectedProject?.financialProgress ?? 0);
  const pOfficer = selectedProject?.ceoOfficer || selectedProject?.responsibleOfficer || 'Unassigned';
  const officerContact = getCeoContact?.(pOfficer) || {};

  return (
    <div
      onClick={() => closeProjectDetail?.()}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedProject?.id || 'PROJ'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {selectedProject?.category || 'General'}
              </span>
              <span className="text-slate-400">
                {selectedProject?.gndCode || ''}{selectedProject?.gndCode && selectedProject?.gndName ? ' • ' : ''}{selectedProject?.gndName || selectedProject?.gnd || ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5">
              {selectedProject?.name || selectedProject?.title || 'Project Details'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{selectedProject?.description || ''}</p>
          </div>

          <button
            onClick={() => closeProjectDetail?.()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual 15-Stage Workflow Timeline Highlighter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Statutory 15-Stage Workflow Timeline
              </h3>
              <span className="text-xs text-slate-400">
                Current: <strong className="text-white">{selectedProject?.status || selectedProject?.stage || 'Planning'}</strong> (Stage {currentStageIndex >= 0 ? currentStageIndex + 1 : 1} of {(WORKFLOW_STAGES || []).length || 15})
              </span>
            </div>

            {/* Stepper Scroll Container */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center space-x-1 min-w-[750px] p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                {(WORKFLOW_STAGES || []).map((stage, idx) => {
                  const isPast = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <button
                      key={stage}
                      onClick={() => handleStageClick(stage)}
                      title={`Click to set stage to ${stage}`}
                      className={`flex-1 flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 font-bold ring-2 ring-emerald-400/50 scale-105'
                          : isPast
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50'
                          : 'bg-slate-800/40 text-slate-400 border border-slate-800 hover:bg-slate-800 text-[10px]'
                      }`}
                    >
                      <span className="text-[10px] font-mono opacity-70 mb-0.5">#{idx + 1}</span>
                      <span className="text-[10px] leading-tight line-clamp-2">{stage}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Alerts Banner */}
          {(alerts || []).length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-2">
              <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Active Bottleneck Warnings ({alerts.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alerts.map((a, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <p className="font-bold text-rose-300">{a?.label}</p>
                    <p className="text-[11px] text-slate-400">{a?.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core Metadata & Financial Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Approved Allocation</span>
              <p className="text-base font-black text-amber-400 mt-0.5">
                Rs. {(pAlloc / 1000000).toFixed(2)} Mn
              </p>
              <p className="text-[10px] text-slate-500">LKR {pAlloc.toLocaleString()}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Actual Expenditure</span>
              <p className="text-base font-black text-emerald-400 mt-0.5">
                Rs. {(pExp / 1000000).toFixed(2)} Mn
              </p>
              <p className="text-[10px] text-slate-500">LKR {pExp.toLocaleString()}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Physical Progress</span>
              <p className="text-base font-black text-white mt-0.5">
                {pPhys}%
              </p>
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${Math.min(Math.max(pPhys, 0), 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Financial Progress</span>
              <p className="text-base font-black text-white mt-0.5">
                {pFin}%
              </p>
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${Math.min(Math.max(pFin, 0), 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Dates & Responsible Personnel */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Approval Date</span>
              <span className="font-semibold text-slate-200">{selectedProject?.approvalDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Provision Received</span>
              <span className="font-semibold text-slate-200">{selectedProject?.provisionDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Target Completion</span>
              <span className="font-semibold text-rose-300 font-mono">
                {selectedProject?.expectedCompletionDate || selectedProject?.year || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase block">Community Empowerment Officer (CEO)</span>
              <span className="font-semibold text-slate-200">
                {pOfficer}
              </span>
              {officerContact?.phone && (
                <a
                  href={`tel:${officerContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-mono mt-0.5"
                  title="Call Officer"
                >
                  <Phone className="w-3 h-3 text-teal-400" />
                  <span>{officerContact.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Beneficiaries Section (if recorded) */}
          {(Number(selectedProject?.directBeneficiaries || 0) > 0 || Number(selectedProject?.indirectBeneficiaries || 0) > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Direct Beneficiaries</span>
                  <p className="text-base font-black text-white font-mono">
                    {Number(selectedProject?.directBeneficiaries || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Directly serviced residents or families</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Indirect Beneficiaries</span>
                  <p className="text-base font-black text-white font-mono">
                    {Number(selectedProject?.indirectBeneficiaries || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Broader community & commuter reach</p>
                </div>
              </div>
            </div>
          )}

          {/* Quality Control & Handover Details (if recorded) */}
          {(selectedProject?.physicalCompletionDate ||
            selectedProject?.coreCuttingDate ||
            selectedProject?.coreCuttingTestDate ||
            selectedProject?.hammerTestDate ||
            selectedProject?.handoverDate ||
            selectedProject?.handoverMaintenanceDate ||
            selectedProject?.handoverParty ||
            selectedProject?.handoverAgency ||
            selectedProject?.retentionReleaseDate) && (
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/60 space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verification, Quality Testing & Handover</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedProject?.physicalCompletionDate && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Physical Completion Date</span>
                    <span className="font-mono text-slate-200">{selectedProject.physicalCompletionDate}</span>
                  </div>
                )}
                {(selectedProject?.coreCuttingDate || selectedProject?.coreCuttingTestDate) && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Core Cutting Test Date</span>
                    <span className="font-mono text-emerald-300">
                      {selectedProject?.coreCuttingDate || selectedProject?.coreCuttingTestDate}
                    </span>
                  </div>
                )}
                {selectedProject?.hammerTestDate && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Hammer Test Date</span>
                    <span className="font-mono text-cyan-300">{selectedProject.hammerTestDate}</span>
                  </div>
                )}
                {(selectedProject?.handoverDate || selectedProject?.handoverMaintenanceDate) && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Handover to Maintenance</span>
                    <span className="font-mono text-amber-300">
                      {selectedProject?.handoverDate || selectedProject?.handoverMaintenanceDate}
                    </span>
                  </div>
                )}
                {(selectedProject?.handoverParty || selectedProject?.handoverAgency) && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Handover Agency / Party</span>
                    <span className="text-slate-200 font-semibold">
                      {selectedProject?.handoverParty || selectedProject?.handoverAgency}
                    </span>
                  </div>
                )}
                {selectedProject?.retentionReleaseDate && (
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Retention Release Date</span>
                    <span className="font-mono text-purple-300">{selectedProject.retentionReleaseDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photographic Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Attached Photographic Evidence Sequence ({(projectPhotos || []).length})</span>
              </h3>
              <button
                onClick={handleAddPhoto}
                className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30"
              >
                <Plus className="w-3 h-3" />
                <span>Add Photo</span>
              </button>
            </div>

            {(projectPhotos || []).length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                No inspection photos uploaded for this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Before', 'During', 'Completed'].map(phase => {
                  const photo = (projectPhotos || []).find(p => p?.activity === phase);
                  return (
                    <div
                      key={phase}
                      className="rounded-xl bg-slate-800/70 border border-slate-700/80 overflow-hidden flex flex-col"
                    >
                      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] font-bold">
                        <span>{phase} Phase</span>
                        {photo && <span className="text-[10px] text-slate-400">{photo?.date}</span>}
                      </div>
                      {photo ? (
                        <div className="h-32 bg-slate-950 overflow-hidden relative">
                          <img
                            src={photo?.imageUrl}
                            alt={photo?.description || 'Site photo'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-slate-950/40 flex items-center justify-center text-slate-500 text-xs">
                          Pending {phase} Photo
                        </div>
                      )}
                      <div className="p-2.5 text-[11px] text-slate-300 flex-1">
                        {photo ? photo?.description : 'No photo uploaded for this stage.'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Remarks & Notes */}
          {selectedProject?.remarks && (
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px]">Planning Branch Remarks:</span>
              <p className="text-slate-300">{selectedProject.remarks}</p>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Last Updated: <span className="text-slate-200">{selectedProject?.lastUpdated || 'N/A'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsQuickUpdateOpen?.(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Update Progress</span>
            </button>

            <button
              onClick={() => {
                setIsEditProjectOpen?.(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => closeProjectDetail?.()}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
