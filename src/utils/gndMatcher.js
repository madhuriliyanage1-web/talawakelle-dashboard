/**
 * Flexible GND String Normalization & Matching Utilities
 * Normalizes GND codes and names by stripping hyphens, slashes, punctuation,
 * extra whitespaces, and case differences.
 * Example: "476/T - Waverley" === "476/T Waverley" === "476twaverley"
 */

export const normalizeGndString = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '')
    .trim();
};

/**
 * Flexible matching between a project and a target GND (object, ID, or name).
 * @param {Object} project - The project record
 * @param {Object|string} targetGndOrId - Selected GND object, GND ID, or GND name
 * @param {Array} [gndsList=[]] - Full list of available GND objects
 * @returns {boolean}
 */
export const isGndMatch = (project, targetGndOrId, gndsList = []) => {
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

  // 1. Direct ID comparison
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

    // Match code + display name
    if (normProjectGndName && normTargetDisplay && normProjectGndName.includes(normTargetDisplay)) {
      if (!normTargetCode || normProjectGndName.includes(normTargetCode) || normalizeGndString(project.gndCode).includes(normTargetCode)) {
        return true;
      }
    }

    if (project.gndCode && normTargetCode && normalizeGndString(project.gndCode) === normTargetCode) {
      if (!normTargetDisplay || normProjectGndName.includes(normTargetDisplay)) {
        return true;
      }
    }
  }

  // 3. Fallback inclusion check for flexible typing
  if (normProjectGndName && normTargetVal) {
    if (normProjectGndName.includes(normTargetVal) || normTargetVal.includes(normProjectGndName)) {
      return true;
    }
  }

  return false;
};
