// ─────────────────────────────────────────────────────────────────────────────
// ProjectContext.jsx — Talawakelle Divisional Secretariat
// Real-time Firestore sync (replaces localStorage + Google Sheets CSV)
// ─────────────────────────────────────────────────────────────────────────────
import React, {
  createContext, useContext, useState, useEffect, useMemo, useRef, useCallback
} from 'react';
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
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  addDoc
} from 'firebase/firestore';

// ─── Internal Context Object ──────────────────────────────────────────────────
const ProjectContext = createContext(null);

// ─── Project Record Normalizer ────────────────────────────────────────────────
const normalizeProjectRecord = (p, index = 0, gndsList = (INITIAL_GNDS || [])) => {
  const gndName = p?.gndName || p?.gnd || '';
  const matchedGnd =
    (gndsList || []).find(g => g?.id && p?.gndId && (g.id === p.gndId || normalizeGndString(g.id) === normalizeGndString(p.gndId))) ||
    (gndsList || []).find(g =>
      isGndMatch({ ...p, gndName, gnd: gndName }, g, gndsList || [])
    );
  const ceo =
    (matchedGnd ? matchedGnd.ceoOfficer : null) ||
    p?.ceoOfficer ||
    (p?.responsibleOfficer && !p?.responsibleOfficer?.includes('(')
      ? p.responsibleOfficer
      : (matchedGnd?.ceoOfficer || 'Unassigned'));
  const title = p?.title || p?.name || 'Untitled Project';
  const progressVal = Number(p?.physicalProgress ?? p?.progress ?? 0) || 0;
  const stageVal = p?.status || p?.stage || 'Project Identification';
  const allocVal = parseFloat(p?.allocation) || 0;
  const expVal = parseFloat(p?.expenditure) || 0;
  const finProgressVal =
    Number(p?.financialProgress ?? (allocVal > 0 ? Math.round((expVal / allocVal) * 100) : 0)) || 0;
  const yearVal = String(p?.financialYear || p?.year || '2026');

  return {
    ...p,
    id: p?.id || `PROJ-${String(index + 1).padStart(2, '0')}`,
    title,
    name: title,
    description:
      p?.description || `${title} in ${matchedGnd ? matchedGnd.name : (gndName || 'Talawakelle')}`,
    gndId: matchedGnd ? matchedGnd.id : (p?.gndId || `GND-${String(index + 1).padStart(2, '0')}`),
    gndName: matchedGnd ? matchedGnd.name : gndName,
    gndCode: matchedGnd ? matchedGnd.code : (p?.gndCode || ''),
    gnd: matchedGnd ? matchedGnd.name : gndName,
    category: p?.category || 'Rural Road Development',
    allocation: allocVal,
    expenditure: expVal,
    physicalProgress: progressVal,
    progress: progressVal,
    financialProgress: finProgressVal,
    status: stageVal,
    stage: stageVal,
    ceoOfficer: ceo,
    responsibleOfficer: ceo,
    financialYear: yearVal,
    year: yearVal,
    expectedCompletionDate: p?.expectedCompletionDate || '2026-12-31',
    approvalDate: p?.approvalDate || '2026-01-15',
    provisionDate: p?.provisionDate || '2026-02-01',
    evidence: p?.evidence || [],
    remarks: p?.remarks || '',
    issues: p?.issues || { hasIssue: false, description: '', escalationLevel: 'Normal' },
    lastUpdated: p?.lastUpdated || new Date().toISOString().split('T')[0]
  };
};

// ─── Helper: Delete all docs in a Firestore collection ───────────────────────
const clearCollection = async (colName) => {
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
};

// ─────────────────────────────────────────────────────────────────────────────
// ProjectProvider
// ─────────────────────────────────────────────────────────────────────────────
export function ProjectProvider({ children }) {
  // ── Core state (sourced from Firestore) ──────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [gnds, setGnds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [financialYears, setFinancialYears] = useState([2026, 2025, 2024]);
  const [customCeos, setCustomCeos] = useState([]);
  const [ceoDirectory, setCeoDirectory] = useState({});
  const [isDemoData, setIsDemoData] = useState(true);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // ── Refs to avoid stale closures in Firestore async callbacks ────────────
  const gndsRef = useRef([]);
  const projectsRef = useRef([]);
  const categoriesRef = useRef([]);
  const customCeosRef = useRef([]);
  const ceoDirectoryRef = useRef({});
  const financialYearsRef = useRef([2026, 2025, 2024]);

  useEffect(() => { gndsRef.current = gnds; }, [gnds]);
  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);
  useEffect(() => { customCeosRef.current = customCeos; }, [customCeos]);
  useEffect(() => { ceoDirectoryRef.current = ceoDirectory; }, [ceoDirectory]);
  useEffect(() => { financialYearsRef.current = financialYears; }, [financialYears]);

  // ── Seed initial data to Firestore (first-run only) ──────────────────────
  const seedInitialData = useCallback(async () => {
    try {
      const gndsToSeed = INITIAL_GNDS || [];

      // 1. Seed GNDs first (so project normalization can use them)
      const batchGnds = writeBatch(db);
      gndsToSeed.forEach(g => batchGnds.set(doc(db, 'gnds', g.id), g));
      await batchGnds.commit();

      // 2. Seed Projects
      const batchProj = writeBatch(db);
      (INITIAL_PROJECTS || []).forEach((p, i) => {
        const normalized = normalizeProjectRecord(p, i, gndsToSeed);
        batchProj.set(doc(db, 'projects', normalized.id), normalized);
      });
      await batchProj.commit();

      // 3. Seed Categories
      const batchCats = writeBatch(db);
      (INITIAL_CATEGORIES || []).forEach(c => batchCats.set(doc(db, 'categories', c.id), c));
      await batchCats.commit();

      // 4. Seed Evidence
      const batchEvid = writeBatch(db);
      (INITIAL_EVIDENCE || []).forEach((e, i) => {
        const evId = e?.id || `EVD-${String(i + 1).padStart(3, '0')}`;
        batchEvid.set(doc(db, 'evidence', evId), { ...e, id: evId });
      });
      await batchEvid.commit();

      // 5. Write settings document (triggers onSnapshot → setLoading(false))
      await setDoc(doc(db, 'settings', 'config'), {
        financialYears: Array.isArray(SECRETARIAT_META?.years)
          ? SECRETARIAT_META.years
          : [2026, 2025, 2024],
        customCeos: [],
        ceoDirectory: {},
        isDemoData: true
      });
    } catch (err) {
      console.error('Firestore seed error:', err);
      setDbError(err?.message || 'Failed to initialize database. Check your Firebase credentials.');
      setLoading(false);
    }
  }, []);

  // ── Real-time Firestore Listeners ─────────────────────────────────────────
  useEffect(() => {
    // 1. Projects
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      snapshot => {
        const data = snapshot.docs.map(d => ({ ...d.data() }));
        setProjects(data.map((p, i) => normalizeProjectRecord(p, i, gndsRef.current)));
      },
      err => {
        console.error('Projects listener error:', err);
        setDbError(err?.message || 'Could not load projects');
      }
    );

    // 2. GNDs
    const unsubGnds = onSnapshot(
      collection(db, 'gnds'),
      snapshot => {
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setGnds(data);
        gndsRef.current = data;
      },
      err => console.error('GNDs listener error:', err)
    );

    // 3. Categories
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      snapshot => {
        setCategories(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      },
      err => console.error('Categories listener error:', err)
    );

    // 4. Evidence
    const unsubEvidence = onSnapshot(
      collection(db, 'evidence'),
      snapshot => {
        setEvidence(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
      },
      err => console.error('Evidence listener error:', err)
    );

    // 5. Settings — triggers seeding on first run if document doesn't exist
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'config'),
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          setFinancialYears(data.financialYears || [2026, 2025, 2024]);
          setCustomCeos(data.customCeos || []);
          setCeoDirectory(data.ceoDirectory || {});
          setIsDemoData(data.isDemoData !== false);
          setLoading(false);
        } else {
          // First run — auto-seed all collections
          seedInitialData();
        }
      },
      err => {
        console.error('Settings listener error:', err);
        setDbError(err?.message || 'Could not connect to database. Check Firebase credentials.');
        setLoading(false);
      }
    );

    return () => {
      unsubProjects();
      unsubGnds();
      unsubCategories();
      unsubEvidence();
      unsubSettings();
    };
  }, [seedInitialData]);

  // ── Filter State (local only — not persisted to Firestore) ───────────────
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

  const resetFilters = () => setFilters({
    gndId: 'all',
    category: 'all',
    status: 'all',
    year: 'all',
    officer: 'all',
    search: '',
    startDate: '',
    endDate: ''
  });

  // ── CEO Officers (derived) ────────────────────────────────────────────────
  const ceoOfficers = useMemo(() => {
    const fromGnds = (gnds || []).map(g => g?.ceoOfficer?.trim()).filter(Boolean);
    const combined = Array.from(new Set([...fromGnds, ...(customCeos || [])])).sort();
    return combined.length > 0 ? combined : (COMMUNITY_EMPOWERMENT_OFFICERS || []);
  }, [gnds, customCeos]);

  // ── Alert Detection ───────────────────────────────────────────────────────
  const getProjectAlerts = (project) => {
    if (!project) return [];
    const alerts = [];
    const today = new Date('2026-09-13');
    const pStatus = project?.status || project?.stage || '';
    const pPhys = Number(project?.physicalProgress ?? project?.progress ?? 0) || 0;
    const pFin = Number(project?.financialProgress ?? 0) || 0;

    if (pStatus === 'Agreement Pending') {
      alerts.push({
        type: 'AGREEMENT_PENDING', label: 'Agreement Pending', severity: 'high',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        description: 'Contract agreement has not been finalized.'
      });
    }

    const stageIdx = (WORKFLOW_STAGES || []).indexOf(pStatus);
    if ((stageIdx >= 9 && stageIdx <= 10) && pPhys === 0) {
      alerts.push({
        type: 'WORK_NOT_STARTED', label: 'Work Not Started', severity: 'high',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        description: 'Agreement executed but physical ground work has 0% progress.'
      });
    }

    if (project?.expectedCompletionDate) {
      const compDate = new Date(project.expectedCompletionDate);
      if (today > compDate && !['Completed', 'Bill Submitted', 'Bill Paid'].includes(pStatus)) {
        const daysOver = Math.round((today - compDate) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'COMPLETION_DATE_PASSED',
          label: `Target Date Exceeded (${daysOver}d overdue)`, severity: 'urgent',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          description: `Scheduled target completion date (${project.expectedCompletionDate}) has elapsed.`
        });
      }
    }

    if ((pStatus === 'Work Ongoing' || pStatus === 'Execution') && pPhys < 30) {
      alerts.push({
        type: 'PROGRESS_BELOW_EXPECTED', label: 'Progress Below Expected', severity: 'medium',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        description: 'Ongoing work progress is lagging behind planning branch schedule.'
      });
    }

    if (pStatus === 'Completed' && pFin < 100) {
      alerts.push({
        type: 'BILL_PENDING', label: 'Bill Pending', severity: 'medium',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        description: 'Physical work 100% finished but contractor voucher settlement is pending.'
      });
    }

    if (pPhys > 40 && (pPhys - pFin) > 30) {
      alerts.push({
        type: 'FINANCIAL_PROGRESS_LOW', label: 'Financial Progress Low', severity: 'medium',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        description: `Physical progress is ${pPhys}% while financial disbursement is only ${pFin}%.`
      });
    }

    if (project?.issues?.hasIssue) {
      alerts.push({
        type: 'EXPLICIT_ISSUE',
        label: `Issue Flagged: ${project?.issues?.escalationLevel || 'Review'}`,
        severity: project?.issues?.escalationLevel?.toLowerCase() === 'urgent' ? 'urgent' : 'high',
        badge: 'bg-red-500/20 text-red-300 border-red-500/40',
        description: project?.issues?.description || 'Special management intervention requested.'
      });
    }

    return alerts;
  };

  // ── Filtered Projects ─────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return list.filter(proj => {
      if (!proj) return false;

      if (filters?.gndId && filters.gndId !== 'all') {
        if (!isGndMatch(proj, filters.gndId, gnds || [])) return false;
      }
      if (filters?.category && filters.category !== 'all' && proj?.category !== filters.category) {
        return false;
      }
      if (filters?.status && filters.status !== 'all') {
        const pStatus = proj?.status || proj?.stage || '';
        if (pStatus !== filters.status) return false;
      }
      if (filters?.year && filters.year !== 'all') {
        const pYear = String(proj?.year || proj?.financialYear || '2026');
        if (pYear !== String(filters.year)) return false;
      }
      if (filters?.officer && filters.officer !== 'all') {
        const projCeo =
          proj?.ceoOfficer ||
          proj?.responsibleOfficer ||
          (gnds || []).find(g => g?.id === proj?.gndId)?.ceoOfficer;
        if (projCeo !== filters.officer) return false;
      }
      if (filters?.startDate) {
        const projDate = proj?.expectedCompletionDate || proj?.provisionDate;
        if (projDate && projDate < filters.startDate) return false;
      }
      if (filters?.endDate) {
        const projDate = proj?.expectedCompletionDate || proj?.provisionDate;
        if (projDate && projDate > filters.endDate) return false;
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase().trim();
        const matchName = String(proj?.name || proj?.title || '').toLowerCase().includes(q);
        const matchId = String(proj?.id || '').toLowerCase().includes(q);
        const matchGnd = String(proj?.gndName || proj?.gnd || '').toLowerCase().includes(q);
        const projCeo = String(
          proj?.ceoOfficer ||
          proj?.responsibleOfficer ||
          (gnds || []).find(g => g?.id === proj?.gndId)?.ceoOfficer || ''
        );
        const matchOfficer = projCeo.toLowerCase().includes(q);
        const matchCategory = String(proj?.category || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchGnd && !matchOfficer && !matchCategory) return false;
      }
      return true;
    });
  }, [projects, filters, gnds]);

  // ── Executive Metrics ─────────────────────────────────────────────────────
  const executiveMetrics = useMemo(() => {
    const list = Array.isArray(filteredProjects) ? filteredProjects : [];
    const totalProjects = list.length;
    const totalAllocation = list.reduce((acc, p) => acc + (parseFloat(p?.allocation) || 0), 0);
    const totalExpenditure = list.reduce((acc, p) => acc + (parseFloat(p?.expenditure) || 0), 0);

    const completed = list.filter(p =>
      ['Completed', 'Bill Submitted', 'Bill Paid'].includes(p?.status || p?.stage)
    ).length;
    const ongoing = list.filter(p =>
      ['Work Started', 'Work Ongoing', 'Execution'].includes(p?.status || p?.stage) ||
      (Number(p?.physicalProgress ?? p?.progress ?? 0) > 0 &&
       Number(p?.physicalProgress ?? p?.progress ?? 0) < 100)
    ).length;
    const notStarted = list.filter(p =>
      [
        'Project Identification', 'Proposal Preparation', 'Feasibility Study',
        'Estimate Not Prepared', 'Estimate Prepared', 'Approval Pending',
        'Approved', 'Procurement', 'Agreement Pending', 'Agreement Signed', 'Planning'
      ].includes(p?.status || p?.stage) &&
      Number(p?.physicalProgress ?? p?.progress ?? 0) === 0
    ).length;

    const delayed = list.filter(p => (getProjectAlerts(p) || []).length > 0).length;

    const avgPhysicalProgress = totalProjects > 0
      ? Math.round(
          list.reduce((acc, p) => acc + (Number(p?.physicalProgress ?? p?.progress ?? 0) || 0), 0) /
          totalProjects
        )
      : 0;

    const totalFinancialProgress = totalAllocation > 0
      ? Math.round((totalExpenditure / totalAllocation) * 100)
      : 0;

    const uniqueGndIds = new Set(list.map(p => p?.gndId).filter(Boolean));
    const totalGnds =
      filters?.gndId && filters.gndId !== 'all'
        ? 1
        : uniqueGndIds.size || (gnds || []).length;

    return {
      totalGnds, totalProjects, totalAllocation, totalExpenditure,
      completed, ongoing, notStarted, delayed, avgPhysicalProgress, totalFinancialProgress
    };
  }, [filteredProjects, filters?.gndId, gnds]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const totalProjects = list.length;
    const completed = list.filter(p =>
      Number(p?.progress ?? p?.physicalProgress ?? 0) === 100 ||
      p?.stage === 'Completed' || p?.status === 'Completed'
    ).length;
    const inProgress = list.filter(p => {
      const prog = Number(p?.progress ?? p?.physicalProgress ?? 0);
      return prog > 0 && prog < 100;
    }).length;
    const delayed = list.filter(p =>
      p?.stage === 'Delayed' || p?.status === 'Delayed' ||
      (getProjectAlerts(p) || []).length > 0
    ).length;
    const totalAllocation = list.reduce((acc, p) => acc + (parseFloat(p?.allocation) || 0), 0);
    return { totalProjects, completed, inProgress, delayed, totalAllocation };
  }, [projects]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — Project
  // ═══════════════════════════════════════════════════════════════════════════

  const addProject = async (projectData) => {
    if (!projectData) return;
    try {
      const currentGnds = gndsRef.current;
      const currentProjects = projectsRef.current;
      // Human-readable code kept for display; Firestore doc ID is auto-generated below.
      const projectCode = `PRJ-TLW-${projectData?.year || 2026}-${String(currentProjects.length + 1).padStart(3, '0')}`;
      const targetGnd =
        currentGnds.find(g => g?.id === projectData?.gndId) || currentGnds[0] || {};
      const assignedCeo =
        projectData?.ceoOfficer || projectData?.responsibleOfficer || targetGnd?.ceoOfficer || '';

      const newProject = normalizeProjectRecord({
        ...projectData,
        id: projectCode,           // temporary — overwritten after addDoc resolves
        projectCode,               // human-readable label preserved
        gndId: targetGnd?.id || 'GND-01',
        gndName: targetGnd?.name || '',
        gndCode: targetGnd?.code || '',
        ceoOfficer: assignedCeo,
        responsibleOfficer: assignedCeo,
        allocation: parseFloat(projectData?.allocation) || 0,
        expenditure: parseFloat(projectData?.expenditure) || 0,
        physicalProgress: parseFloat(projectData?.physicalProgress) || 0,
        financialProgress: parseFloat(projectData?.financialProgress) || 0,
        status: projectData?.status || 'Project Identification',
        lastUpdated: new Date().toISOString().split('T')[0]
      }, currentProjects.length, currentGnds);

      // addDoc always creates a NEW document — no more overwriting existing projects.
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      // Write the real Firestore ID back into the document so the app can reference it.
      await updateDoc(docRef, { id: docRef.id });
      await setDoc(doc(db, 'settings', 'config'), { isDemoData: false }, { merge: true });
    } catch (err) {
      console.error('addProject error:', err);
    }
  };

  const updateProject = async (id, updatedFields) => {
    if (!id) return;
    try {
      const current = projectsRef.current.find(p => p?.id === id);
      if (!current) return;

      const currentGnds = gndsRef.current || [];
      const selectedGndId = updatedFields?.gndId !== undefined ? updatedFields.gndId : current?.gndId;
      const matchingGnd =
        currentGnds.find(g => g?.id === selectedGndId) ||
        currentGnds.find(g => normalizeGndString(g?.id) === normalizeGndString(selectedGndId));

      const gndUpdates = matchingGnd
        ? {
            gndId: matchingGnd.id,
            gndName: matchingGnd.name || '',
            gndCode: matchingGnd.code || '',
            gnd: matchingGnd.name || ''
          }
        : {};

      const updated = normalizeProjectRecord(
        {
          ...current,
          ...updatedFields,
          ...gndUpdates,
          lastUpdated: new Date().toISOString().split('T')[0]
        },
        0,
        currentGnds
      );
      await setDoc(doc(db, 'projects', id), updated);
      await setDoc(doc(db, 'settings', 'config'), { isDemoData: false }, { merge: true });
      if (selectedProject?.id === id) {
        setSelectedProject(updated);
      }
    } catch (err) {
      console.error('updateProject error:', err);
    }
  };

  const deleteProject = async (id) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error('deleteProject error:', err);
    }
  };

  const updateProgress = async (id, { physicalProgress, financialProgress, status, remarks }) => {
    if (!id) return;
    try {
      const updates = { lastUpdated: new Date().toISOString().split('T')[0] };
      if (physicalProgress !== undefined) {
        updates.physicalProgress = physicalProgress;
        updates.progress = physicalProgress;
      }
      if (financialProgress !== undefined) updates.financialProgress = financialProgress;
      if (status !== undefined) {
        updates.status = status;
        updates.stage = status;
        const stageIdx = (WORKFLOW_STAGES || []).indexOf(status);
        if (stageIdx >= 0) updates.currentStageIndex = stageIdx;
      }
      if (remarks !== undefined) updates.remarks = remarks;
      await updateDoc(doc(db, 'projects', id), updates);
    } catch (err) {
      console.error('updateProgress error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — GND
  // ═══════════════════════════════════════════════════════════════════════════

  const addGnd = async (gndData) => {
    if (!gndData?.name?.trim()) return;
    try {
      const currentGnds = gndsRef.current;
      const newGnd = {
        id: `GND-${String(currentGnds.length + 1).padStart(2, '0')}`,
        code: gndData?.code || '',
        name: gndData?.name?.trim(),
        displayName: gndData?.displayName?.trim() || gndData?.name?.trim(),
        ceoOfficer: gndData?.ceoOfficer?.trim() || '',
        phone: gndData?.phone?.trim() || '+94 52 225 8234'
      };
      await setDoc(doc(db, 'gnds', newGnd.id), newGnd);
      await setDoc(doc(db, 'settings', 'config'), { isDemoData: false }, { merge: true });
    } catch (err) {
      console.error('addGnd error:', err);
    }
  };

  const updateGnd = async (id, updatedFields) => {
    if (!id) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'gnds', id), updatedFields);

      // Cascade updates to all projects in this GND
      projectsRef.current
        .filter(p => p?.gndId === id)
        .forEach(p => {
          const projUpdate = {};
          if (updatedFields?.name !== undefined) projUpdate.gndName = updatedFields.name;
          if (updatedFields?.code !== undefined) projUpdate.gndCode = updatedFields.code;
          if (updatedFields?.ceoOfficer !== undefined) {
            projUpdate.ceoOfficer = updatedFields.ceoOfficer;
            projUpdate.responsibleOfficer = updatedFields.ceoOfficer;
          }
          if (Object.keys(projUpdate).length > 0) {
            batch.update(doc(db, 'projects', p.id), projUpdate);
          }
        });

      await batch.commit();
      await setDoc(doc(db, 'settings', 'config'), { isDemoData: false }, { merge: true });
    } catch (err) {
      console.error('updateGnd error:', err);
    }
  };

  const deleteGnd = async (id) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'gnds', id));
    } catch (err) {
      console.error('deleteGnd error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — CEO / Officer
  // ═══════════════════════════════════════════════════════════════════════════

  const addCeoOfficer = async ({ name, phone, email, designation, gndId }) => {
    if (!name?.trim()) return null;
    try {
      const trimmed = name.trim();
      const currentCeos = customCeosRef.current;
      const currentDir = ceoDirectoryRef.current;

      if (!currentCeos.includes(trimmed)) {
        const newCeos = [...currentCeos, trimmed].sort();
        const newDir = {
          ...currentDir,
          [trimmed]: {
            name: trimmed,
            phone: phone || '',
            email: email || '',
            designation: designation || 'Community Empowerment Officer (CEO)',
            gndId: gndId || ''
          }
        };
        await updateDoc(doc(db, 'settings', 'config'), {
          customCeos: newCeos,
          ceoDirectory: newDir,
          isDemoData: false
        });
      }

      if (gndId && gndId !== 'none' && gndId !== 'all') {
        await updateDoc(doc(db, 'gnds', gndId), {
          ceoOfficer: trimmed,
          ...(phone ? { phone } : {})
        });
      }
      return trimmed;
    } catch (err) {
      console.error('addCeoOfficer error:', err);
      return null;
    }
  };

  const renameOfficer = async (oldName, newName) => {
    if (!oldName || !newName || oldName === newName) return;
    try {
      const trimmedOld = oldName.trim();
      const trimmedNew = newName.trim();
      const batch = writeBatch(db);

      // Update GNDs
      gndsRef.current
        .filter(g => g?.ceoOfficer?.trim() === trimmedOld)
        .forEach(g => batch.update(doc(db, 'gnds', g.id), { ceoOfficer: trimmedNew }));

      // Update Projects
      projectsRef.current.forEach(p => {
        const updates = {};
        if (p?.ceoOfficer?.trim() === trimmedOld) updates.ceoOfficer = trimmedNew;
        if (p?.responsibleOfficer?.trim() === trimmedOld) updates.responsibleOfficer = trimmedNew;
        if (Object.keys(updates).length > 0) {
          batch.update(doc(db, 'projects', p.id), updates);
        }
      });

      await batch.commit();

      // Update settings
      const currentCeos = customCeosRef.current;
      const currentDir = { ...ceoDirectoryRef.current };
      const newCeos = currentCeos.map(c => c === trimmedOld ? trimmedNew : c).sort();
      if (currentDir[trimmedOld]) {
        currentDir[trimmedNew] = { ...currentDir[trimmedOld], name: trimmedNew };
        delete currentDir[trimmedOld];
      }
      await updateDoc(doc(db, 'settings', 'config'), {
        customCeos: newCeos,
        ceoDirectory: currentDir
      });
    } catch (err) {
      console.error('renameOfficer error:', err);
    }
  };

  const removeOfficer = async (officerName) => {
    if (!officerName) return;
    try {
      const trimmed = officerName.trim();
      const batch = writeBatch(db);

      gndsRef.current
        .filter(g => g?.ceoOfficer?.trim() === trimmed)
        .forEach(g => batch.update(doc(db, 'gnds', g.id), { ceoOfficer: '' }));

      await batch.commit();

      const newCeos = customCeosRef.current.filter(c => c !== trimmed);
      await updateDoc(doc(db, 'settings', 'config'), { customCeos: newCeos, isDemoData: false });
    } catch (err) {
      console.error('removeOfficer error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — Category
  // ═══════════════════════════════════════════════════════════════════════════

  const addCategory = async (cat) => {
    if (!cat?.name?.trim()) return;
    try {
      const newCat = {
        id: `CAT-${String(categoriesRef.current.length + 1).padStart(2, '0')}`,
        name: cat.name.trim(),
        color: cat.color || '#10b981'
      };
      await setDoc(doc(db, 'categories', newCat.id), newCat);
      await setDoc(doc(db, 'settings', 'config'), { isDemoData: false }, { merge: true });
    } catch (err) {
      console.error('addCategory error:', err);
    }
  };

  const updateCategory = async (id, updatedFields) => {
    if (!id) return;
    try {
      const oldCat = categoriesRef.current.find(c => c?.id === id);
      await updateDoc(doc(db, 'categories', id), updatedFields);

      // Cascade category name change to all affected projects
      if (oldCat?.name && updatedFields?.name && updatedFields.name !== oldCat.name) {
        const affectedProjects = projectsRef.current.filter(p => p?.category === oldCat.name);
        if (affectedProjects.length > 0) {
          const batch = writeBatch(db);
          affectedProjects.forEach(p => {
            batch.update(doc(db, 'projects', p.id), { category: updatedFields.name });
          });
          await batch.commit();
        }
      }
    } catch (err) {
      console.error('updateCategory error:', err);
    }
  };

  const deleteCategory = async (id) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      console.error('deleteCategory error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — Financial Year
  // ═══════════════════════════════════════════════════════════════════════════

  const addFinancialYear = async (year) => {
    const y = parseInt(year, 10);
    if (isNaN(y)) return;
    try {
      const current = financialYearsRef.current || [];
      if (current.includes(y)) return;
      const newYears = [...current, y].sort((a, b) => b - a);
      await updateDoc(doc(db, 'settings', 'config'), { financialYears: newYears });
    } catch (err) {
      console.error('addFinancialYear error:', err);
    }
  };

  const deleteFinancialYear = async (year) => {
    const y = parseInt(year, 10);
    try {
      const newYears = (financialYearsRef.current || []).filter(item => item !== y);
      await updateDoc(doc(db, 'settings', 'config'), { financialYears: newYears });
    } catch (err) {
      console.error('deleteFinancialYear error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CRUD — Evidence
  // ═══════════════════════════════════════════════════════════════════════════

  const addEvidence = async (item) => {
    if (!item) return;
    try {
      const newEv = {
        id: `EVD-${String((evidence || []).length + 1).padStart(3, '0')}`,
        projectId: item.projectId || 'PRJ-01',
        activity: item.activity || 'During',
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        uploadedBy: item.uploadedBy || 'Technical Officer',
        date: item.date || new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'evidence', newEv.id), newEv);
    } catch (err) {
      console.error('addEvidence error:', err);
    }
  };

  const updateEvidence = async (id, updatedFields) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, 'evidence', id), updatedFields);
    } catch (err) {
      console.error('updateEvidence error:', err);
    }
  };

  const deleteEvidence = async (id) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'evidence', id));
    } catch (err) {
      console.error('deleteEvidence error:', err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Reset to Demo Data (clears Firestore, re-seeds from mockData)
  // ═══════════════════════════════════════════════════════════════════════════

  const resetToDemoData = async () => {
    try {
      setLoading(true);
      // Clear all collections and the settings doc
      await Promise.all([
        clearCollection('projects'),
        clearCollection('gnds'),
        clearCollection('categories'),
        clearCollection('evidence'),
        deleteDoc(doc(db, 'settings', 'config'))
      ]);
      // settings/config deletion triggers onSnapshot → !snap.exists() → seedInitialData()
    } catch (err) {
      console.error('resetToDemoData error:', err);
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Export to JSON (reads from local state — no Firestore call needed)
  // ═══════════════════════════════════════════════════════════════════════════

  const exportDataJSON = () => {
    try {
      const data = {
        projects: projects || [],
        categories: categories || [],
        evidence: evidence || [],
        gnds: gnds || [],
        financialYears: financialYears || [],
        customCeos: customCeos || [],
        ceoDirectory: ceoDirectory || {},
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Talawakelle_DS_Projects_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('JSON Export error:', e);
    }
  };

  // ─── Modal State (local only) ─────────────────────────────────────────────
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
    if (proj) {
      setSelectedProject(proj);
      setIsDetailOpen(true);
    }
  };

  const closeProjectDetail = () => setIsDetailOpen(false);

  // ─── Full Context Value ───────────────────────────────────────────────────
  const value = {
    // Status
    loading,
    dbError,
    // Data
    projects: projects || [],
    setProjects,
    filteredProjects: filteredProjects || [],
    gnds: gnds || [],
    setGnds,
    categories: categories || [],
    evidence: evidence || [],
    financialYears: financialYears || [2026, 2025, 2024],
    years: (financialYears || [2026, 2025, 2024]).map(String),
    ceos: ceoOfficers || [],
    ceoOfficers: ceoOfficers || [],
    customCeos: customCeos || [],
    ceoDirectory: ceoDirectory || {},
    // Filters
    filters: filters || {},
    setFilters,
    resetFilters,
    // Metrics
    executiveMetrics: executiveMetrics || {},
    stats: stats || {},
    totalProjects: stats?.totalProjects || 0,
    completedProjects: stats?.completed || 0,
    inProgressProjects: stats?.inProgress || 0,
    delayedProjects: stats?.delayed || 0,
    totalAllocation: stats?.totalAllocation || 0,
    // Meta
    secretariatMeta: SECRETARIAT_META || {},
    SECRETARIAT_META: SECRETARIAT_META || {},
    workflowStages: WORKFLOW_STAGES || [],
    WORKFLOW_STAGES: WORKFLOW_STAGES || [],
    isDemoData,
    // Helpers
    getProjectAlerts,
    normalizeGndString,
    isGndMatch,
    // Project CRUD
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
    // Category CRUD
    addCategory,
    updateCategory,
    deleteCategory,
    // Year CRUD
    addFinancialYear,
    deleteFinancialYear,
    // Evidence CRUD
    addEvidence,
    updateEvidence,
    deleteEvidence,
    // Demo / Export
    resetToDemoData,
    exportDataJSON,
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
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

// ─── Hook: useProject ─────────────────────────────────────────────────────────
// Returns full fallback defaults if called outside ProjectProvider
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    return {
      loading: false,
      dbError: null,
      projects: [],
      filteredProjects: [],
      setProjects: () => {},
      stats: { totalProjects: 0, completed: 0, inProgress: 0, delayed: 0, totalAllocation: 0 },
      executiveMetrics: {
        totalGnds: 0, totalProjects: 0, totalAllocation: 0, totalExpenditure: 0,
        completed: 0, ongoing: 0, notStarted: 0, delayed: 0,
        avgPhysicalProgress: 0, totalFinancialProgress: 0
      },
      getProjectAlerts: () => [],
      totalProjects: 0,
      completedProjects: 0,
      inProgressProjects: 0,
      delayedProjects: 0,
      totalAllocation: 0,
      categories: INITIAL_CATEGORIES || [],
      evidence: INITIAL_EVIDENCE || [],
      gnds: INITIAL_GNDS || [],
      years: ['2026', '2025', '2024'],
      financialYears: [2026, 2025, 2024],
      ceos: COMMUNITY_EMPOWERMENT_OFFICERS || [],
      ceoOfficers: COMMUNITY_EMPOWERMENT_OFFICERS || [],
      ceoDirectory: {},
      secretariatMeta: SECRETARIAT_META || {},
      SECRETARIAT_META: SECRETARIAT_META || {},
      workflowStages: WORKFLOW_STAGES || [],
      WORKFLOW_STAGES: WORKFLOW_STAGES || [],
      filters: { gndId: 'all', category: 'all', status: 'all', year: 'all', officer: 'all', search: '', startDate: '', endDate: '' },
      setFilters: () => {},
      resetFilters: () => {},
      selectedGnd: 'ALL', setSelectedGnd: () => {},
      selectedYear: 'ALL', setSelectedYear: () => {},
      selectedCategory: 'ALL', setSelectedCategory: () => {},
      selectedCeo: 'ALL', setSelectedCeo: () => {},
      searchQuery: '', setSearchQuery: () => {},
      addProject: async () => {},
      updateProject: async () => {},
      deleteProject: async () => {},
      updateProgress: async () => {},
      addGnd: async () => {},
      updateGnd: async () => {},
      deleteGnd: async () => {},
      addCeoOfficer: async () => null,
      renameOfficer: async () => {},
      removeOfficer: async () => {},
      addCategory: async () => {},
      updateCategory: async () => {},
      deleteCategory: async () => {},
      addFinancialYear: async () => {},
      deleteFinancialYear: async () => {},
      addEvidence: async () => {},
      updateEvidence: async () => {},
      deleteEvidence: async () => {},
      resetToDemoData: async () => {},
      exportDataJSON: () => {},
      isDemoData: true,
      normalizeGndString: (s) => s || '',
      isGndMatch: () => false,
      selectedProject: null, setSelectedProject: () => {},
      isDetailOpen: false, openProjectDetail: () => {}, closeProjectDetail: () => {},
      isAddProjectOpen: false, setIsAddProjectOpen: () => {},
      isEditProjectOpen: false, setIsEditProjectOpen: () => {},
      isAddCategoryOpen: false, setIsAddCategoryOpen: () => {},
      isAddGndOpen: false, setIsAddGndOpen: () => {},
      isAddCeoOpen: false, setIsAddCeoOpen: () => {},
      isQuickUpdateOpen: false, setIsQuickUpdateOpen: () => {},
      isAddEvidenceOpen: false, setIsAddEvidenceOpen: () => {},
      isSettingsOpen: false, setIsSettingsOpen: () => {},
      evidenceTargetProjectId: null, setEvidenceTargetProjectId: () => {}
    };
  }
  return context;
}

export { ProjectContext };