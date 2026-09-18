import { INITIAL_GNDS, INITIAL_PROJECTS } from '../src/data/mockData.js';

const normalizeGndString = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')
    .trim();
};

const isGndMatch = (project, targetGndOrId, gndsList = []) => {
  if (!project) return false;
  if (!targetGndOrId || targetGndOrId === 'all') return true;

  let targetGnd = null;
  let targetVal = targetGndOrId;

  if (typeof targetGndOrId === 'object' && targetGndOrId !== null) {
    targetGnd = targetGndOrId;
    targetVal = targetGnd.id || targetGnd.name;
  } else if (gndsList && gndsList.length > 0) {
    targetGnd = gndsList.find(g => 
      g.id === targetGndOrId || 
      normalizeGndString(g.id) === normalizeGndString(targetGndOrId) ||
      normalizeGndString(g.name) === normalizeGndString(targetGndOrId) ||
      normalizeGndString(g.displayName) === normalizeGndString(targetGndOrId)
    );
  }

  // 1. Direct ID matching (exact or normalized)
  if (targetGnd && project.gndId) {
    if (project.gndId === targetGnd.id) return true;
    if (normalizeGndString(project.gndId) === normalizeGndString(targetGnd.id)) return true;
  }
  if (project.gndId && normalizeGndString(project.gndId) === normalizeGndString(targetVal)) {
    return true;
  }

  // 2. Normalized name comparison
  const normProjectGndName = normalizeGndString(project.gndName);
  const normTargetVal = normalizeGndString(targetVal);

  if (normProjectGndName && normTargetVal && normProjectGndName === normTargetVal) {
    return true;
  }

  if (targetGnd) {
    const normTargetName = normalizeGndString(targetGnd.name);
    const normTargetDisplay = normalizeGndString(targetGnd.displayName);
    const normTargetCode = normalizeGndString(targetGnd.code);

    if (normProjectGndName && normTargetName && normProjectGndName === normTargetName) {
      return true;
    }

    if (normProjectGndName && normTargetDisplay && normProjectGndName.includes(normTargetDisplay)) {
      if (!normTargetCode || normProjectGndName.includes(normTargetCode) || normalizeGndString(project.gndCode).includes(normTargetCode)) {
        return true;
      }
    }
  }

  return false;
};

console.log('Testing GND matches:');
let totalMatches = 0;
INITIAL_GNDS.forEach(g => {
  const matches = INITIAL_PROJECTS.filter(p => isGndMatch(p, g, INITIAL_GNDS));
  if (matches.length > 0) {
    console.log(`${g.name} (${g.id}): ${matches.length} projects`);
    totalMatches += matches.length;
  }
});
console.log('Total matches across GNDs:', totalMatches, '(expected 28)');

// Test dirty/flexible strings
const testP = { gndId: 'GND-001', gndName: '476/T - Waverley', gndCode: '476/T' };
console.log('Match "476/T - Waverley" with "476/T Waverley":', isGndMatch(testP, INITIAL_GNDS[0], INITIAL_GNDS));
console.log('Match by id string "gnd-001":', isGndMatch(testP, 'gnd-001', INITIAL_GNDS));
console.log('Match by name "476/T - Waverley":', isGndMatch(INITIAL_PROJECTS[0], '476/T - Waverley', INITIAL_GNDS));
