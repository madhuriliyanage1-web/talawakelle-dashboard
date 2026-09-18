import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  INITIAL_PROJECTS,
  INITIAL_GNDS,
  INITIAL_CATEGORIES,
  INITIAL_EVIDENCE,
  WORKFLOW_STAGES,
  SECRETARIAT_META,
  COMMUNITY_EMPOWERMENT_OFFICERS
} from '../data/mockData';
import { normalizeGndString, isGndMatch } from '../utils/gndMatcher';

const ProjectContext = createContext();

const STORAGE_KEYS = {
  PROJECTS: 'tlw_ds_projects_v4',
  CATEGORIES: 'tlw_ds_categories_v4',
  EVIDENCE: 'tlw_ds_evidence_v4',
  GNDS: 'tlw_ds_gnds_v4',
  YEARS: 'tlw_ds_financial_years_v4',
  CEOS: 'tlw_ds_custom_ceos_v4',
  CEO_DIRECTORY: 'tlw_ds_ceo_dir_v4',
  CUSTOM_FLAG: 'tlw_ds_has_custom_data_v4'
};

export function ProjectProvider({ children }) {
  // 1. Core States backed by localStorage
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const list = saved ? JSON.parse(saved) : INITIAL_PROJECTS;
      // Normalize projects to ensure actual Community Empowerment Officer (CEO) and GND are populated
      return list.map(p => {
        const matchedGnd = INITIAL_GNDS.find(g => isGndMatch(p, g, INITIAL_GNDS));
        const ceo = (matchedGnd ? matchedGnd.ceoOfficer : null) || p.ceoOfficer || (p.responsibleOfficer && !p.responsibleOfficer.includes('(') ? p.responsibleOfficer : (matchedGnd?.ceoOfficer || 'Unassigned'));
        return {
          ...p,
          gndId: matchedGnd ? matchedGnd.id : p.gndId,
          gndName: matchedGnd ? matchedGnd.name : p.gndName,
          gndCode: matchedGnd ? matchedGnd.code : p.gndCode,
          ceoOfficer: ceo,
          responsibleOfficer: ceo
        };
      });
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [evidence, setEvidence] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
      return saved ? JSON.parse(saved) : INITIAL_EVIDENCE;
    } catch {
      return INITIAL_EVIDENCE;
    }
  });

  const [gnds, setGnds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GNDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_GNDS;
    } catch {
      return INITIAL_GNDS;
    }
  });

  const [financialYears, setFinancialYears] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.YEARS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return Array.isArray(SECRETARIAT_META.years) ? SECRETARIAT_META.years : [2026, 2025, 2024];
    } catch {
      return [2026, 2025, 2024];
    }
  });

  const [customCeos, setCustomCeos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CEOS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ceoDirectory, setCeoDirectory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CEO_DIRECTORY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isDemoData, setIsDemoData] = useState(() => {
    return !localStorage.getItem(STORAGE_KEYS.CUSTOM_FLAG);
  });

  // Dynamically extract all unique Community Empowerment Officers (CEO) from GND records + custom registered CEOs
  const ceoOfficers = useMemo(() => {
    const fromGnds = gnds.map(g => g.ceoOfficer?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...fromGnds, ...customCeos])).sort();
    return combined.length > 0 ? combined : COMMUNITY_EMPOWERMENT_OFFICERS;
  }, [gnds, customCeos]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidence));
  }, [evidence]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GNDS, JSON.stringify(gnds));
  }, [gnds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(financialYears));
  }, [financialYears]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CEOS, JSON.stringify(customCeos));
  }, [customCeos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CEO_DIRECTORY, JSON.stringify(ceoDirectory));
  }, [ceoDirectory]);

  // 2. Filter State
  const [filters, setFilters] = useState({
    gndId: 'all',
    category: 'all',
    status: 'all',
    year: 'all',
    officer: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  const resetFilters = () => {
    setFilters({
      gndId: 'all',
      category: 'all',
      status: 'all',
      year: 'all',
      officer: 'all',
      search: '',
      startDate: '',
      endDate: ''
    });
  };

  // 3. Delayed / Flagged Indicator Detector
  const getProjectAlerts = (project) => {
    const alerts = [];
    const today = new Date('2026-09-13'); // Reference planning date

    // 1. Agreement Pending
    if (project.status === 'Agreement Pending') {
      alerts.push({
        type: 'AGREEMENT_PENDING',
        label: 'Agreement Pending',
        severity: 'high',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        description: 'Contract agreement has not been finalized.'
      });
    }

    // 2. Work Not Started (after procurement/agreement)
    const stageIdx = WORKFLOW_STAGES.indexOf(project.status);
    if ((stageIdx >= 9 && stageIdx <= 10) && project.physicalProgress === 0) {
      alerts.push({
        type: 'WORK_NOT_STARTED',
        label: 'Work Not Started',
        severity: 'high',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        description: 'Agreement executed but physical ground work has 0% progress.'
      });
    }

    // 3. Completion Date Passed
    if (project.expectedCompletionDate) {
      const compDate = new Date(project.expectedCompletionDate);
      if (today > compDate && !['Completed', 'Bill Submitted', 'Bill Paid'].includes(project.status)) {
        const daysOver = Math.round((today - compDate) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'COMPLETION_DATE_PASSED',
          label: `Target Date Exceeded (${daysOver}d overdue)`,
          severity: 'urgent',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          description: `Scheduled target completion date (${project.expectedCompletionDate}) has elapsed.`
        });
      }
    }

    // 4. Progress Below Expected (e.g. provisioned > 30 days ago, ongoing, but physical < 30%)
    if (project.status === 'Work Ongoing' && project.physicalProgress < 30) {
      alerts.push({
        type: 'PROGRESS_BELOW_EXPECTED',
        label: 'Progress Below Expected',
        severity: 'medium',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        description: 'Ongoing work progress is lagging behind planning branch schedule.'
      });
    }

    // 5. Bill Pending
    if (project.status === 'Completed' && project.financialProgress < 100) {
      alerts.push({
        type: 'BILL_PENDING',
        label: 'Bill Pending',
        severity: 'medium',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        description: 'Physical work 100% finished but contractor voucher settlement is pending.'
      });
    }

    // 6. Financial Progress Low discrepancy
    if (project.physicalProgress > 40 && (project.physicalProgress - project.financialProgress) > 30) {
      alerts.push({
        type: 'FINANCIAL_PROGRESS_LOW',
        label: 'Financial Progress Low',
        severity: 'medium',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        description: `Physical progress is ${project.physicalProgress}% while financial disbursement is only ${project.financialProgress}%.`
      });
    }

    // 7. Explicit Issues Flag from registry
    if (project.issues?.hasIssue) {
      alerts.push({
        type: 'EXPLICIT_ISSUE',
        label: `Issue Flagged: ${project.issues.escalationLevel || 'Review'}`,
        severity: project.issues.escalationLevel?.toLowerCase() === 'urgent' ? 'urgent' : 'high',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        description: project.issues.description || 'Special management intervention requested.'
      });
    }

    return alerts;
  };

  // 4. Filtered Projects Computation
  const filteredProjects = useMemo(() => {
    return projects.filter(proj => {
      // GND Filter with flexible string normalization (strips hyphens, extra spaces, special chars)
      if (filters.gndId !== 'all') {
        if (!isGndMatch(proj, filters.gndId, gnds)) {
          return false;
        }
      }
      // Category Filter
      if (filters.category !== 'all' && proj.category !== filters.category) {
        return false;
      }
      // Status Filter
      if (filters.status !== 'all' && proj.status !== filters.status) {
        return false;
      }
      // Year Filter
      if (filters.year !== 'all' && String(proj.year || 2026) !== String(filters.year)) {
        return false;
      }
      // Community Empowerment Officer (CEO) Filter
      if (filters.officer !== 'all') {
        const projCeo = proj.ceoOfficer || proj.responsibleOfficer || gnds.find(g => g.id === proj.gndId)?.ceoOfficer;
        if (projCeo !== filters.officer) {
          return false;
        }
      }
      // Date Range Filter (by expectedCompletionDate or provisionDate)
      if (filters.startDate) {
        const projDate = proj.expectedCompletionDate || proj.provisionDate;
        if (projDate && projDate < filters.startDate) return false;
      }
      if (filters.endDate) {
        const projDate = proj.expectedCompletionDate || proj.provisionDate;
        if (projDate && projDate > filters.endDate) return false;
      }
      // Keyword Search
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const matchName = proj.name.toLowerCase().includes(q);
        const matchId = proj.id.toLowerCase().includes(q);
        const matchGnd = (proj.gndName || '').toLowerCase().includes(q);
        const projCeo = proj.ceoOfficer || proj.responsibleOfficer || gnds.find(g => g.id === proj.gndId)?.ceoOfficer || '';
        const matchOfficer = projCeo.toLowerCase().includes(q);
        const matchCategory = (proj.category || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchGnd && !matchOfficer && !matchCategory) {
          return false;
        }
      }
      return true;
    });
  }, [projects, filters, gnds]);

  // 5. Derived Executive Metrics from Filtered Projects
  const executiveMetrics = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const totalAllocation = filteredProjects.reduce((acc, p) => acc + (p.allocation || 0), 0);
    const totalExpenditure = filteredProjects.reduce((acc, p) => acc + (p.expenditure || 0), 0);

    const completed = filteredProjects.filter(p => ['Completed', 'Bill Submitted', 'Bill Paid'].includes(p.status)).length;
    const ongoing = filteredProjects.filter(p => ['Work Started', 'Work Ongoing'].includes(p.status)).length;
    const notStarted = filteredProjects.filter(p => [
      'Project Identification', 'Proposal Preparation', 'Feasibility Study',
      'Estimate Not Prepared', 'Estimate Prepared', 'Approval Pending',
      'Approved', 'Procurement', 'Agreement Pending', 'Agreement Signed'
    ].includes(p.status)).length;

    const delayed = filteredProjects.filter(p => getProjectAlerts(p).length > 0).length;

    const avgPhysicalProgress = totalProjects > 0
      ? Math.round(filteredProjects.reduce((acc, p) => acc + (p.physicalProgress || 0), 0) / totalProjects)
      : 0;

    const totalFinancialProgress = totalAllocation > 0
      ? Math.round((totalExpenditure / totalAllocation) * 100)
      : 0;

    // Unique GNDs in filtered set
    const uniqueGndIds = new Set(filteredProjects.map(p => p.gndId));
    const totalGnds = filters.gndId !== 'all' ? 1 : uniqueGndIds.size || gnds.length;

    return {
      totalGnds,
      totalProjects,
      totalAllocation,
      totalExpenditure,
      completed,
      ongoing,
      notStarted,
      delayed,
      avgPhysicalProgress,
      totalFinancialProgress
    };
  }, [filteredProjects, filters.gndId, gnds]);

  // 6. CRUD Operations
  const addProject = (projectData) => {
    const newId = `PRJ-TLW-${projectData.year || 2026}-${String(projects.length + 1).padStart(3, '0')}`;
    const targetGnd = gnds.find(g => g.id === projectData.gndId) || gnds[0];
    const stageIdx = WORKFLOW_STAGES.indexOf(projectData.status || 'Project Identification');
    const assignedCeo = projectData.ceoOfficer || projectData.responsibleOfficer || targetGnd.ceoOfficer;

    const newProject = {
      ...projectData,
      id: newId,
      gndId: targetGnd.id,
      gndName: targetGnd.name,
      gndCode: targetGnd.code,
      ceoOfficer: assignedCeo,
      responsibleOfficer: assignedCeo,
      allocation: parseFloat(projectData.allocation) || 0,
      expenditure: parseFloat(projectData.expenditure) || 0,
      physicalProgress: parseFloat(projectData.physicalProgress) || 0,
      financialProgress: parseFloat(projectData.financialProgress) || 0,
      currentStageIndex: stageIdx >= 0 ? stageIdx : 0,
      status: projectData.status || 'Project Identification',
      lastUpdated: new Date().toISOString().split('T')[0],
      issues: projectData.issues || {
        hasIssue: false,
        description: '',
        escalationLevel: 'Normal',
        targetActionDate: ''
      }
    };

    setProjects(prev => [newProject, ...prev]);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    setIsDemoData(false);
    return newProject;
  };

  const updateProject = (id, updatedFields) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const targetGnd = updatedFields.gndId ? gnds.find(g => g.id === updatedFields.gndId) : null;
      const stageIdx = updatedFields.status ? WORKFLOW_STAGES.indexOf(updatedFields.status) : p.currentStageIndex;
      const assignedCeo = updatedFields.ceoOfficer || updatedFields.responsibleOfficer || (targetGnd ? targetGnd.ceoOfficer : p.ceoOfficer);

      return {
        ...p,
        ...updatedFields,
        ...(targetGnd ? { gndName: targetGnd.name, gndCode: targetGnd.code } : {}),
        ceoOfficer: assignedCeo,
        responsibleOfficer: assignedCeo,
        currentStageIndex: stageIdx >= 0 ? stageIdx : p.currentStageIndex,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    setIsDemoData(false);
  };

  const updateProgress = (id, { physicalProgress, financialProgress, status, remarks }) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newStatus = status || p.status;
      const stageIdx = WORKFLOW_STAGES.indexOf(newStatus);
      const newPhys = physicalProgress !== undefined ? parseFloat(physicalProgress) : p.physicalProgress;
      const newFin = financialProgress !== undefined ? parseFloat(financialProgress) : p.financialProgress;
      const newExp = Math.round((p.allocation * newFin) / 100);

      return {
        ...p,
        physicalProgress: newPhys,
        financialProgress: newFin,
        expenditure: newExp,
        status: newStatus,
        currentStageIndex: stageIdx >= 0 ? stageIdx : p.currentStageIndex,
        remarks: remarks !== undefined ? remarks : p.remarks,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    }));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setEvidence(prev => prev.filter(e => e.projectId !== id));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const addCategory = ({ name, color }) => {
    const newId = `cat-${categories.length + 1}`;
    const newCat = {
      id: newId,
      name,
      color: color || '#10b981',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    setCategories(prev => [...prev, newCat]);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    return newCat;
  };

  const addEvidence = (newPhoto) => {
    const newId = `EVD-${String(evidence.length + 1).padStart(4, '0')}`;
    const item = {
      ...newPhoto,
      id: newId,
      date: newPhoto.date || new Date().toISOString().split('T')[0]
    };
    setEvidence(prev => [item, ...prev]);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    return item;
  };

  const updateEvidence = (id, updated) => {
    setEvidence(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const deleteEvidence = (id) => {
    setEvidence(prev => prev.filter(e => e.id !== id));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  // GND Management CRUD
  const addGnd = (newGndData) => {
    const newId = `GND-${String(gnds.length + 1).padStart(3, '0')}`;
    const newGnd = {
      id: newId,
      code: newGndData.code || '',
      name: newGndData.name || '',
      displayName: newGndData.displayName || newGndData.name || '',
      ceoOfficer: newGndData.ceoOfficer || '',
      phone: newGndData.phone || '+94 52 225 8234',
      division: 'Talawakelle DS Division'
    };
    setGnds(prev => [...prev, newGnd]);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    return newGnd;
  };

  const updateGnd = (id, updatedFields) => {
    setGnds(prev => prev.map(g => g.id === id ? { ...g, ...updatedFields } : g));
    // Cascade GND name/code/officer updates to linked projects
    setProjects(prev => prev.map(p => {
      if (p.gndId === id) {
        return {
          ...p,
          gndName: updatedFields.name !== undefined ? updatedFields.name : p.gndName,
          gndCode: updatedFields.code !== undefined ? updatedFields.code : p.gndCode,
          ceoOfficer: updatedFields.ceoOfficer !== undefined ? updatedFields.ceoOfficer : p.ceoOfficer,
          responsibleOfficer: updatedFields.ceoOfficer !== undefined ? updatedFields.ceoOfficer : p.responsibleOfficer
        };
      }
      return p;
    }));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const deleteGnd = (id) => {
    setGnds(prev => prev.filter(g => g.id !== id));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  // CEO / Officer Management
  const addCeoOfficer = ({ name, phone, email, designation, gndId }) => {
    if (!name || !name.trim()) return null;
    const trimmed = name.trim();
    setCustomCeos(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed].sort();
    });
    setCeoDirectory(prev => ({
      ...prev,
      [trimmed]: {
        name: trimmed,
        phone: phone || '',
        email: email || '',
        designation: designation || 'Community Empowerment Officer (CEO)',
        gndId: gndId || ''
      }
    }));
    // If gndId was selected, assign this CEO to that GND immediately
    if (gndId && gndId !== 'none' && gndId !== 'all') {
      updateGnd(gndId, {
        ceoOfficer: trimmed,
        ...(phone ? { phone } : {})
      });
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
    return trimmed;
  };

  const renameOfficer = (oldName, newName) => {
    if (!oldName || !newName || oldName === newName) return;
    const trimmedNew = newName.trim();
    setGnds(prev => prev.map(g => g.ceoOfficer?.trim() === oldName.trim() ? { ...g, ceoOfficer: trimmedNew } : g));
    setCustomCeos(prev => prev.map(c => c === oldName.trim() ? trimmedNew : c));
    setCeoDirectory(prev => {
      const copy = { ...prev };
      if (copy[oldName.trim()]) {
        copy[trimmedNew] = { ...copy[oldName.trim()], name: trimmedNew };
        delete copy[oldName.trim()];
      }
      return copy;
    });
    setProjects(prev => prev.map(p => {
      let changed = false;
      const updated = { ...p };
      if (p.ceoOfficer?.trim() === oldName.trim()) {
        updated.ceoOfficer = trimmedNew;
        changed = true;
      }
      if (p.responsibleOfficer?.trim() === oldName.trim()) {
        updated.responsibleOfficer = trimmedNew;
        changed = true;
      }
      return changed ? updated : p;
    }));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const removeOfficer = (officerName) => {
    if (!officerName) return;
    setGnds(prev => prev.map(g => g.ceoOfficer?.trim() === officerName.trim() ? { ...g, ceoOfficer: '' } : g));
    setCustomCeos(prev => prev.filter(c => c !== officerName.trim()));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  // Category Management CRUD
  const updateCategory = (id, updatedFields) => {
    let oldName = null;
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        oldName = c.name;
        return { ...c, ...updatedFields };
      }
      return c;
    }));
    if (oldName && updatedFields.name && updatedFields.name !== oldName) {
      setProjects(prev => prev.map(p => p.category === oldName ? { ...p, category: updatedFields.name } : p));
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  // Financial Year Management
  const addFinancialYear = (year) => {
    const y = parseInt(year, 10);
    if (isNaN(y)) return;
    setFinancialYears(prev => {
      if (prev.includes(y)) return prev;
      return [...prev, y].sort((a, b) => b - a);
    });
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  const deleteFinancialYear = (year) => {
    const y = parseInt(year, 10);
    setFinancialYears(prev => prev.filter(item => item !== y));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FLAG, 'true');
  };

  // Reset to original demo register data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.EVIDENCE);
    localStorage.removeItem(STORAGE_KEYS.GNDS);
    localStorage.removeItem(STORAGE_KEYS.YEARS);
    localStorage.removeItem(STORAGE_KEYS.CEOS);
    localStorage.removeItem(STORAGE_KEYS.CEO_DIRECTORY);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_FLAG);
    setProjects(INITIAL_PROJECTS);
    setCategories(INITIAL_CATEGORIES);
    setEvidence(INITIAL_EVIDENCE);
    setGnds(INITIAL_GNDS);
    setFinancialYears(Array.isArray(SECRETARIAT_META.years) ? SECRETARIAT_META.years : [2026, 2025, 2024]);
    setCustomCeos([]);
    setCeoDirectory({});
    setIsDemoData(true);
  };

  const exportDataJSON = () => {
    const data = {
      projects,
      categories,
      evidence,
      gnds,
      financialYears,
      customCeos,
      ceoDirectory,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Talawakelle_DS_Projects_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Modal States
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddGndOpen, setIsAddGndOpen] = useState(false);
  const [isAddCeoOpen, setIsAddCeoOpen] = useState(false);
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [isAddEvidenceOpen, setIsAddEvidenceOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [evidenceTargetProjectId, setEvidenceTargetProjectId] = useState(null);

  const openProjectDetail = (proj) => {
    setSelectedProject(proj);
    setIsDetailOpen(true);
  };

  const closeProjectDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      filteredProjects,
      gnds,
      setGnds,
      categories,
      evidence,
      financialYears,
      filters,
      setFilters,
      resetFilters,
      executiveMetrics,
      getProjectAlerts,
      addProject,
      updateProject,
      deleteProject,
      updateProgress,
      // GND CRUD
      addGnd,
      updateGnd,
      deleteGnd,
      // CEO / Officer CRUD
      addCeoOfficer,
      renameOfficer,
      removeOfficer,
      ceoDirectory,
      // Category CRUD
      addCategory,
      updateCategory,
      deleteCategory,
      // Year CRUD
      addFinancialYear,
      deleteFinancialYear,
      addEvidence,
      updateEvidence,
      deleteEvidence,
      resetToDemoData,
      exportDataJSON,
      isDemoData,
      WORKFLOW_STAGES,
      SECRETARIAT_META,
      ceoOfficers,
      normalizeGndString,
      isGndMatch,
      // Modals
      selectedProject,
      setSelectedProject,
      isDetailOpen,
      openProjectDetail,
      closeProjectDetail,
      isAddProjectOpen,
      setIsAddProjectOpen,
      isEditProjectOpen,
      setIsEditProjectOpen,
      isAddCategoryOpen,
      setIsAddCategoryOpen,
      isAddGndOpen,
      setIsAddGndOpen,
      isAddCeoOpen,
      setIsAddCeoOpen,
      isQuickUpdateOpen,
      setIsQuickUpdateOpen,
      isAddEvidenceOpen,
      setIsAddEvidenceOpen,
      isSettingsOpen,
      setIsSettingsOpen,
      evidenceTargetProjectId,
      setEvidenceTargetProjectId
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
