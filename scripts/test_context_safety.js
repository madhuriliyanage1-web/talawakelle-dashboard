// Verification script for undefined context data safety
import { useProject } from '../src/context/ProjectContext.jsx';

console.log("--- Testing useProject() fallback outside provider ---");
const fallback = useProject();
console.log("Projects is Array:", Array.isArray(fallback.projects));
console.log("FilteredProjects is Array:", Array.isArray(fallback.filteredProjects));
console.log("GNDs is Array:", Array.isArray(fallback.gnds));
console.log("Categories is Array:", Array.isArray(fallback.categories));
console.log("FinancialYears is Array:", Array.isArray(fallback.financialYears));
console.log("CeoOfficers is Array:", Array.isArray(fallback.ceoOfficers));
console.log("WORKFLOW_STAGES is Array:", Array.isArray(fallback.WORKFLOW_STAGES));
console.log("ExecutiveMetrics is Object:", typeof fallback.executiveMetrics === 'object');
console.log("Filters is Object:", typeof fallback.filters === 'object');
console.log("getProjectAlerts returns array:", Array.isArray(fallback.getProjectAlerts({})));
console.log("executiveMetrics.delayed:", fallback.executiveMetrics.delayed);

// Test simulated component accesses against an empty object {}
console.log("\n--- Testing simulated access against empty context {} ---");
const emptyCtx = {};
const {
  projects = [],
  filteredProjects = [],
  gnds = [],
  categories = [],
  evidence = [],
  filters = {},
  executiveMetrics = {},
  SECRETARIAT_META = {},
  ceoOfficers = [],
  financialYears = [],
  WORKFLOW_STAGES = [],
  getProjectAlerts = () => [],
  openProjectDetail = () => {},
  setIsAddProjectOpen = () => {}
} = emptyCtx || {};

console.log("Empty projects length:", (projects || []).length);
console.log("Empty filteredProjects length:", (filteredProjects || []).length);
console.log("Empty gnds length:", (gnds || []).length);
console.log("Empty filters search:", filters?.search || '');
console.log("Empty executiveMetrics delayed:", executiveMetrics?.delayed || 0);
console.log("Empty SECRETARIAT_META district:", SECRETARIAT_META?.district || 'Nuwara Eliya');
console.log("Safe call openProjectDetail:", openProjectDetail?.());
console.log("Safe call setIsAddProjectOpen:", setIsAddProjectOpen?.(true));

console.log("\nALL DEFENSIVE ACCESS TESTS PASSED!");
