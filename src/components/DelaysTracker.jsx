import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  AlertTriangle,
  AlertOctagon,
  Clock,
  Send,
  UserCheck,
  Calendar,
  CheckCircle,
  FileCheck2,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function DelaysTracker() {
  const {
    filteredProjects,
    getProjectAlerts,
    openProjectDetail,
    setSelectedProject,
    setIsQuickUpdateOpen,
    updateProject
  } = useProject();

  const [filterSeverity, setFilterSeverity] = useState('all');
  const [interventionNotice, setInterventionNotice] = useState(null);

  // Collect all filtered projects with delays/alerts
  const flaggedProjects = filteredProjects
    .map(p => ({
      project: p,
      alerts: getProjectAlerts(p)
    }))
    .filter(item => item.alerts.length > 0);

  // Filter by severity if selected
  const filteredFlagged = flaggedProjects.filter(({ alerts }) => {
    if (filterSeverity === 'all') return true;
    return alerts.some(a => a.severity === filterSeverity);
  });

  const handleIntervention = (project, actionType) => {
    if (actionType === 'expedite') {
      updateProject(project.id, {
        remarks: `${project.remarks || ''} [Intervention: Expedite instruction issued by Divisional Secretary on ${new Date().toISOString().split('T')[0]}]`
      });
      setInterventionNotice(`Notice sent to technical officer and contractor for ${project.id}.`);
    } else if (actionType === 'escalate') {
      updateProject(project.id, {
        issues: {
          ...project.issues,
          hasIssue: true,
          escalationLevel: 'Urgent',
          description: `Escalated to District Secretariat Planning Director: ${project.issues?.description || 'Delay remediation required.'}`
        }
      });
      setInterventionNotice(`Project ${project.id} formally escalated to District Secretariat.`);
    }
    setTimeout(() => setInterventionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Alert Stats */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Secretariat Delays & Bottlenecks Dashboard
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Active Issues, Overdue Milestones & Remedial Action
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Automated compliance checks flagging contract agreement delays, work not started post-award, target date exceedance, and low financial disbursement.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {['all', 'urgent', 'high', 'medium'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {interventionNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{interventionNotice}</span>
        </div>
      )}

      {/* Flagged Projects Cards */}
      {filteredFlagged.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Flagged Bottlenecks in this View</h3>
          <p className="text-xs text-slate-400">
            All filtered projects are executing within acceptable statutory parameters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFlagged.map(({ project, alerts }) => (
            <div
              key={project.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              {/* Header: ID, GND, Severity Pill */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {project.id}
                    </span>
                    <span className="text-slate-400">
                      {project.gndCode} - {project.gndName}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5 hover:text-emerald-300 cursor-pointer"
                    onClick={() => openProjectDetail(project)}>
                    {project.name}
                  </h3>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {alerts[0]?.severity || 'Review'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: {project.expectedCompletionDate}
                  </span>
                </div>
              </div>

              {/* Alert Badges & Reasons */}
              <div className="space-y-2 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                {alerts.map((alt, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-300">{alt.label}</p>
                      <p className="text-[11px] text-slate-400">{alt.description}</p>
                    </div>
                  </div>
                ))}

                {project.issues?.description && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 flex items-start space-x-2">
                    <span className="font-semibold text-amber-400">Officer Remarks:</span>
                    <span>{project.issues.description}</span>
                  </div>
                )}
              </div>

              {/* Progress & Officer */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Physical</span>
                  <span className="font-bold text-emerald-400">{project.physicalProgress}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Financial</span>
                  <span className="font-bold text-amber-400">{project.financialProgress}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block" title="Community Empowerment Officer (CEO)">CEO</span>
                  <span className="font-semibold text-teal-300 truncate block" title={project.ceoOfficer || project.responsibleOfficer}>
                    {project.ceoOfficer || project.responsibleOfficer || 'Unassigned'}
                  </span>
                </div>
              </div>

              {/* Quick Management Intervention Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleIntervention(project, 'expedite')}
                    className="flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition"
                  >
                    <Send className="w-3 h-3" />
                    <span>Issue Notice</span>
                  </button>

                  <button
                    onClick={() => handleIntervention(project, 'escalate')}
                    className="flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition"
                  >
                    <AlertOctagon className="w-3 h-3" />
                    <span>Escalate to DS</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setIsQuickUpdateOpen(true);
                    }}
                    className="flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    <Sliders className="w-3 h-3 text-emerald-400" />
                    <span>Update %</span>
                  </button>
                </div>

                <button
                  onClick={() => openProjectDetail(project)}
                  className="flex items-center space-x-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
