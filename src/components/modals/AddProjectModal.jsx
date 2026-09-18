import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Plus, Save, Building } from 'lucide-react';

export default function AddProjectModal() {
  const {
    isAddProjectOpen,
    setIsAddProjectOpen,
    isEditProjectOpen,
    setIsEditProjectOpen,
    selectedProject,
    gnds,
    categories,
    WORKFLOW_STAGES,
    SECRETARIAT_META,
    ceoOfficers,
    addProject,
    updateProject
  } = useProject();

  const isOpen = isAddProjectOpen || isEditProjectOpen;
  const isEditing = isEditProjectOpen && selectedProject;

  const defaultGnd = gnds[0];
  const defaultCeo = defaultGnd?.ceoOfficer || ceoOfficers[0] || '';

  const [formData, setFormData] = useState({
    name: '',
    gndId: defaultGnd?.id || '',
    category: 'Rural Road Development',
    description: '',
    allocation: '',
    expenditure: '',
    approvalDate: new Date().toISOString().split('T')[0],
    provisionDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: '2026-12-31',
    status: 'Project Identification',
    physicalProgress: 0,
    financialProgress: 0,
    ceoOfficer: defaultCeo,
    responsibleOfficer: defaultCeo,
    remarks: '',
    year: 2026
  });

  useEffect(() => {
    if (isEditing && selectedProject) {
      const projCeo = selectedProject.ceoOfficer || selectedProject.responsibleOfficer || gnds.find(g => g.id === selectedProject.gndId)?.ceoOfficer || ceoOfficers[0];
      setFormData({
        name: selectedProject.name || '',
        gndId: selectedProject.gndId || gnds[0]?.id || '',
        category: selectedProject.category || 'Rural Road Development',
        description: selectedProject.description || '',
        allocation: selectedProject.allocation || '',
        expenditure: selectedProject.expenditure || '',
        approvalDate: selectedProject.approvalDate || '',
        provisionDate: selectedProject.provisionDate || '',
        expectedCompletionDate: selectedProject.expectedCompletionDate || '',
        status: selectedProject.status || 'Project Identification',
        physicalProgress: selectedProject.physicalProgress || 0,
        financialProgress: selectedProject.financialProgress || 0,
        ceoOfficer: projCeo,
        responsibleOfficer: projCeo,
        remarks: selectedProject.remarks || '',
        year: selectedProject.year || 2026
      });
    } else {
      const defGnd = gnds[0];
      const defCeo = defGnd?.ceoOfficer || ceoOfficers[0] || '';
      setFormData({
        name: '',
        gndId: defGnd?.id || '',
        category: 'Rural Road Development',
        description: '',
        allocation: '',
        expenditure: '',
        approvalDate: new Date().toISOString().split('T')[0],
        provisionDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: '2026-12-31',
        status: 'Project Identification',
        physicalProgress: 0,
        financialProgress: 0,
        ceoOfficer: defCeo,
        responsibleOfficer: defCeo,
        remarks: '',
        year: 2026
      });
    }
  }, [isEditing, selectedProject, isOpen, gnds, ceoOfficers]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAddProjectOpen(false);
    setIsEditProjectOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a project name.');
      return;
    }

    if (isEditing) {
      updateProject(selectedProject.id, formData);
    } else {
      addProject(formData);
    }
    handleClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[90vh]"
      >
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              {isEditing ? `Edit Project: ${selectedProject.id}` : 'Register New Development Project'}
            </h3>
            <p className="text-xs text-slate-400">
              Talawakelle Divisional Secretariat Planning Branch Record
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Project Name / Description Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Waverley Estate Road Concreting and Drainage"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* GND & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Grama Niladhari Division (GND) *
              </label>
              <select
                value={formData.gndId}
                onChange={(e) => {
                  const newGndId = e.target.value;
                  const chosenGnd = gnds.find(x => x.id === newGndId);
                  setFormData(prev => ({
                    ...prev,
                    gndId: newGndId,
                    ceoOfficer: chosenGnd?.ceoOfficer || prev.ceoOfficer,
                    responsibleOfficer: chosenGnd?.ceoOfficer || prev.responsibleOfficer
                  }));
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {gnds.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Programme Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Allocation & Expenditure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Approved Allocation (LKR / Rs.) *
              </label>
              <input
                type="number"
                required
                placeholder="2500000"
                value={formData.allocation}
                onChange={(e) => setFormData({ ...formData, allocation: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Actual Expenditure (LKR)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.expenditure}
                onChange={(e) => setFormData({ ...formData, expenditure: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Status & Officer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Current Workflow Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {WORKFLOW_STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Community Empowerment Officer (CEO)
              </label>
              <select
                value={formData.ceoOfficer || formData.responsibleOfficer}
                onChange={(e) => setFormData({
                  ...formData,
                  ceoOfficer: e.target.value,
                  responsibleOfficer: e.target.value
                })}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {ceoOfficers.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Approval Date</label>
              <input
                type="date"
                value={formData.approvalDate}
                onChange={(e) => setFormData({ ...formData, approvalDate: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Provision Date</label>
              <input
                type="date"
                value={formData.provisionDate}
                onChange={(e) => setFormData({ ...formData, provisionDate: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Completion</label>
              <input
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          {/* Progress Percentages */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Physical Progress ({formData.physicalProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.physicalProgress}
                onChange={(e) => setFormData({ ...formData, physicalProgress: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Financial Progress ({formData.financialProgress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.financialProgress}
                onChange={(e) => setFormData({ ...formData, financialProgress: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Remarks & Field Notes</label>
            <textarea
              rows={2}
              placeholder="Site observations, contractor details, or procurement references..."
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
