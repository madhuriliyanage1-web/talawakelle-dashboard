import React, { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Plus, Save, Building, Users, ChevronDown, ChevronUp, ShieldCheck, Calendar } from 'lucide-react';

export default function AddProjectModal() {
  const {
    isAddProjectOpen = false,
    setIsAddProjectOpen = () => {},
    isEditProjectOpen = false,
    setIsEditProjectOpen = () => {},
    selectedProject = null,
    gnds = [],
    categories = [],
    WORKFLOW_STAGES = [],
    SECRETARIAT_META = {},
    ceoOfficers = [],
    addProject = () => {},
    updateProject = () => {}
  } = useProject() || {};

  const isOpen = Boolean(isAddProjectOpen || isEditProjectOpen);
  const isEditing = Boolean(isEditProjectOpen && selectedProject);

  const defaultGnd = (gnds || [])[0];
  const defaultCeo = defaultGnd?.ceoOfficer || (ceoOfficers || [])[0] || '';

  const [formData, setFormData] = useState({
    name: '',
    gndId: defaultGnd?.id || '',
    gndName: defaultGnd?.name || '',
    gndCode: defaultGnd?.code || '',
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
    year: 2026,
    // Optional Beneficiaries (default 0)
    directBeneficiaries: 0,
    indirectBeneficiaries: 0,
    // Additional Details & Quality Testing (Optional)
    physicalCompletionDate: '',
    coreCuttingDate: '',
    hammerTestDate: '',
    handoverDate: '',
    handoverParty: '',
    retentionReleaseDate: ''
  });

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  useEffect(() => {
    if (isEditing && selectedProject) {
      const projCeo = selectedProject?.ceoOfficer || selectedProject?.responsibleOfficer || (gnds || []).find(g => g?.id === selectedProject?.gndId)?.ceoOfficer || (ceoOfficers || [])[0] || '';
      const hasQualityOrHandoverData = Boolean(
        selectedProject?.physicalCompletionDate ||
        selectedProject?.coreCuttingDate ||
        selectedProject?.coreCuttingTestDate ||
        selectedProject?.hammerTestDate ||
        selectedProject?.handoverDate ||
        selectedProject?.handoverMaintenanceDate ||
        selectedProject?.handoverParty ||
        selectedProject?.handoverAgency ||
        selectedProject?.retentionReleaseDate
      );
      if (hasQualityOrHandoverData) {
        setIsAccordionOpen(true);
      }

      setFormData({
        name: selectedProject?.name || selectedProject?.title || '',
        gndId: selectedProject?.gndId || (gnds || [])[0]?.id || '',
        gndName: selectedProject?.gndName || (gnds || []).find(g => g?.id === selectedProject?.gndId)?.name || '',
        gndCode: selectedProject?.gndCode || (gnds || []).find(g => g?.id === selectedProject?.gndId)?.code || '',
        category: selectedProject?.category || 'Rural Road Development',
        description: selectedProject?.description || '',
        allocation: selectedProject?.allocation ?? '',
        expenditure: selectedProject?.expenditure ?? '',
        approvalDate: selectedProject?.approvalDate || '',
        provisionDate: selectedProject?.provisionDate || '',
        expectedCompletionDate: selectedProject?.expectedCompletionDate || '',
        status: selectedProject?.status || selectedProject?.stage || 'Project Identification',
        physicalProgress: Number(selectedProject?.physicalProgress ?? selectedProject?.progress ?? 0),
        financialProgress: Number(selectedProject?.financialProgress ?? 0),
        ceoOfficer: projCeo,
        responsibleOfficer: projCeo,
        remarks: selectedProject?.remarks || '',
        year: selectedProject?.year || 2026,
        directBeneficiaries: Number(selectedProject?.directBeneficiaries ?? selectedProject?.directBeneficiariesCount ?? 0),
        indirectBeneficiaries: Number(selectedProject?.indirectBeneficiaries ?? selectedProject?.indirectBeneficiariesCount ?? 0),
        physicalCompletionDate: selectedProject?.physicalCompletionDate || '',
        coreCuttingDate: selectedProject?.coreCuttingDate || selectedProject?.coreCuttingTestDate || '',
        hammerTestDate: selectedProject?.hammerTestDate || '',
        handoverDate: selectedProject?.handoverDate || selectedProject?.handoverMaintenanceDate || '',
        handoverParty: selectedProject?.handoverParty || selectedProject?.handoverAgency || '',
        retentionReleaseDate: selectedProject?.retentionReleaseDate || ''
      });
    } else {
      const defGnd = (gnds || [])[0];
      const defCeo = defGnd?.ceoOfficer || (ceoOfficers || [])[0] || '';
      setIsAccordionOpen(false);
      setFormData({
        name: '',
        gndId: defGnd?.id || '',
        gndName: defGnd?.name || '',
        gndCode: defGnd?.code || '',
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
        year: 2026,
        directBeneficiaries: 0,
        indirectBeneficiaries: 0,
        physicalCompletionDate: '',
        coreCuttingDate: '',
        hammerTestDate: '',
        handoverDate: '',
        handoverParty: '',
        retentionReleaseDate: ''
      });
    }
  }, [isEditing, selectedProject, isOpen, gnds, ceoOfficers]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsAddProjectOpen?.(false);
    setIsEditProjectOpen?.(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a project name.');
      return;
    }

    const payload = {
      ...formData,
      directBeneficiaries: Number(formData.directBeneficiaries) || 0,
      indirectBeneficiaries: Number(formData.indirectBeneficiaries) || 0,
      directBeneficiariesCount: Number(formData.directBeneficiaries) || 0,
      indirectBeneficiariesCount: Number(formData.indirectBeneficiaries) || 0,
      physicalCompletionDate: formData.physicalCompletionDate || '',
      coreCuttingDate: formData.coreCuttingDate || '',
      coreCuttingTestDate: formData.coreCuttingDate || '',
      hammerTestDate: formData.hammerTestDate || '',
      handoverDate: formData.handoverDate || '',
      handoverMaintenanceDate: formData.handoverDate || '',
      handoverParty: formData.handoverParty || '',
      handoverAgency: formData.handoverParty || '',
      retentionReleaseDate: formData.retentionReleaseDate || ''
    };

    if (isEditing && selectedProject?.id) {
      updateProject?.(selectedProject.id, payload);
    } else {
      addProject?.(payload);
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
              {isEditing ? `Edit Project: ${selectedProject?.id || ''}` : 'Register New Development Project'}
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
                  const chosenGnd = (gnds || []).find(x => x?.id === newGndId);
                  setFormData(prev => {
                    // Replace old GND name/code references in description with new GND name
                    let updatedDescription = prev.description || '';
                    const oldGndName = prev.gndName || '';
                    const oldGndCode = prev.gndCode || '';
                    const newGndName = chosenGnd?.name || oldGndName;
                    if (newGndName && newGndName !== oldGndName) {
                      // Replace exact old GND name
                      if (oldGndName) {
                        updatedDescription = updatedDescription.split(oldGndName).join(newGndName);
                      }
                      // Also replace old GND code if it appears standalone
                      if (oldGndCode && oldGndCode !== oldGndName) {
                        updatedDescription = updatedDescription.split(oldGndCode).join(chosenGnd?.code || oldGndCode);
                      }
                    }
                    return {
                      ...prev,
                      gndId: newGndId,
                      gndName: newGndName,
                      gndCode: chosenGnd?.code || prev.gndCode || '',
                      description: updatedDescription,
                      ceoOfficer: chosenGnd?.ceoOfficer || prev.ceoOfficer,
                      responsibleOfficer: chosenGnd?.ceoOfficer || prev.responsibleOfficer
                    };
                  });
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500"
              >
                {(gnds || []).map(g => (
                  <option key={g?.id} value={g?.id}>
                    {g?.name}
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
                {(categories || []).map(c => (
                  <option key={c?.id} value={c?.name}>{c?.name}</option>
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
                {(WORKFLOW_STAGES || []).map(s => (
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
                {(ceoOfficers || []).map(o => (
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

          {/* Beneficiaries Section (2-column layout) */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-xs text-white">
                Community Beneficiaries (Optional)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Direct Beneficiaries Count
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.directBeneficiaries}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      directBeneficiaries: val === '' ? '' : Math.max(0, parseInt(val, 10) || 0)
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Directly serviced residents or families</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Indirect Beneficiaries Count
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.indirectBeneficiaries}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      indirectBeneficiaries: val === '' ? '' : Math.max(0, parseInt(val, 10) || 0)
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-1 focus:ring-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Wider community & commuter reach</span>
              </div>
            </div>
          </div>

          {/* Expandable Accordion Section: Additional Project Details & Quality Testing (Optional) */}
          <div className="rounded-2xl border border-slate-700/80 bg-slate-800/30 overflow-hidden transition-all duration-200">
            <button
              type="button"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:border-teal-500/40">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-xs text-white block">
                    Additional Project Details & Quality Testing (Optional)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Quality tests (core cutting, hammer), completion & handover records
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(formData.physicalCompletionDate || formData.coreCuttingDate || formData.hammerTestDate || formData.handoverDate || formData.handoverParty || formData.retentionReleaseDate) && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Details Entered
                  </span>
                )}
                {isAccordionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {isAccordionOpen && (
              <div className="p-4 pt-2 space-y-4 border-t border-slate-800/80 bg-slate-900/50">
                {/* Verification & Quality Control Dates */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
                    <span>Verification & Quality Control Dates</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Physical Completion Date
                      </label>
                      <input
                        type="date"
                        value={formData.physicalCompletionDate}
                        onChange={(e) => setFormData({ ...formData, physicalCompletionDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Core Cutting Test Date
                      </label>
                      <input
                        type="date"
                        value={formData.coreCuttingDate}
                        onChange={(e) => setFormData({ ...formData, coreCuttingDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Hammer Test Date
                      </label>
                      <input
                        type="date"
                        value={formData.hammerTestDate}
                        onChange={(e) => setFormData({ ...formData, hammerTestDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Handover & Closure */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                    <span>Handover & Closure</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Handover Date to Maintenance Party
                      </label>
                      <input
                        type="date"
                        value={formData.handoverDate}
                        onChange={(e) => setFormData({ ...formData, handoverDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Handover Agency / Party
                      </label>
                      <input
                        type="text"
                        list="handoverAgenciesList"
                        placeholder="Select or enter agency..."
                        value={formData.handoverParty}
                        onChange={(e) => setFormData({ ...formData, handoverParty: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500"
                      />
                      <datalist id="handoverAgenciesList">
                        <option value="Pradeshiya Sabha (Talawakelle / Nuwara Eliya)" />
                        <option value="Urban Council (Talawakelle - Lindula)" />
                        <option value="Road Development Authority (RDA)" />
                        <option value="Road Development Department (RDD - Central Province)" />
                        <option value="Community Based Organization (CBO)" />
                        <option value="Rural Development Society (RDS)" />
                        <option value="Estate Management / Regional Plantation Company (RPC)" />
                        <option value="Department of Agrarian Development" />
                        <option value="National Water Supply and Drainage Board (NWSDB)" />
                        <option value="Ceylon Electricity Board (CEB)" />
                        <option value="School Development Society (SDS)" />
                        <option value="Farmer Organization" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Retention Release Date
                      </label>
                      <input
                        type="date"
                        value={formData.retentionReleaseDate}
                        onChange={(e) => setFormData({ ...formData, retentionReleaseDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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
