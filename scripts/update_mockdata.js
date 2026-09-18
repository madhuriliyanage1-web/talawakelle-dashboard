import fs from 'fs';
import { INITIAL_PROJECTS, INITIAL_CATEGORIES, INITIAL_EVIDENCE, WORKFLOW_STAGES } from '../src/data/mockData.js';

// The exact 34 GND definitions according to the user's specification
export const EXACT_GNDS = [
  {
    id: "GND-001",
    code: "476/T",
    name: "476/T Waverley",
    displayName: "Waverley",
    ceoOfficer: "S.Yogeswaran",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-002",
    code: "475/F",
    name: "475/F Lindula",
    displayName: "Lindula",
    ceoOfficer: "D.Sinthuja",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-003",
    code: "476 Q",
    name: "476 Q Belmoral",
    displayName: "Belmoral",
    ceoOfficer: "P.Premkumar",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-004",
    code: "475T",
    name: "Eildenhall 475T",
    displayName: "Eildenhall",
    ceoOfficer: "R.Karthic",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-005",
    code: "475 I",
    name: "475 I Holbrook",
    displayName: "Holbrook",
    ceoOfficer: "I.Johara Bee Bee",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-006",
    code: "475/H",
    name: "475/H NAGASENA",
    displayName: "NAGASENA",
    ceoOfficer: "I. THANALINY",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-007",
    code: "476/K",
    name: "476/K Albion",
    displayName: "Albion",
    ceoOfficer: "A.Rosary Fernando",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-008",
    code: "475",
    name: "475 Kotagala",
    displayName: "Kotagala",
    ceoOfficer: "S.Revathy",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-009",
    code: "475 Z",
    name: "475 Z Greatwestern",
    displayName: "Greatwestern",
    ceoOfficer: "K.Yogarajan",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-010",
    code: "475K",
    name: "475K Agarapatana",
    displayName: "Agarapatana",
    ceoOfficer: "S.Vickneshwaran",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-011",
    code: "475U",
    name: "475U Rahanwatta",
    displayName: "Rahanwatta",
    ceoOfficer: "G. Puwaneswary",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-012",
    code: "475/S",
    name: "475/S Hollyrood",
    displayName: "Hollyrood",
    ceoOfficer: "R. Mohanasundary",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-013",
    code: "475/B",
    name: "475/B Dimbula Patana",
    displayName: "Dimbula Patana",
    ceoOfficer: "A.C.R John",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-014",
    code: "475/N",
    name: "475/N Drayton",
    displayName: "Drayton",
    ceoOfficer: "S.Nishanthy",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-015",
    code: "476/S",
    name: "476/S Dayagama East",
    displayName: "Dayagama East",
    ceoOfficer: "N.K.Samantha Lakmal",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-016",
    code: "475Y",
    name: "475Y Yullifield",
    displayName: "Yullifield",
    ceoOfficer: "V.Umadevi",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-017",
    code: "475/J",
    name: "475/J Elbeddha",
    displayName: "Elbeddha",
    ceoOfficer: "R. Dayani",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-018",
    code: "475/L",
    name: "Dayagama West 475/L",
    displayName: "Dayagama West",
    ceoOfficer: "M.Kanahamani",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-019",
    code: "476/N",
    name: "Henfold 476/N",
    displayName: "Henfold",
    ceoOfficer: "M.Kaviyarasu",
    phone: "+94 77 028 0816",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-020",
    code: "475/Q",
    name: "475/Q MOUNTVERNON",
    displayName: "Mountvernon",
    ceoOfficer: "S.S.SUTHAJINI",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-021",
    code: "475P",
    name: "475P Bogawathalawa",
    displayName: "Bogawathalawa",
    ceoOfficer: "M.Prabukala",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-022",
    code: "475/C",
    name: "Devon 475/C",
    displayName: "Devon",
    ceoOfficer: "G. Nalayini",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-023",
    code: "475E",
    name: "475E Talawakelle",
    displayName: "Talawakelle",
    ceoOfficer: "S.Jeyamathi",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-024",
    code: "475D",
    name: "475D Watagoda",
    displayName: "Watagoda",
    ceoOfficer: "J.Nalendran",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-025",
    code: "476J",
    name: "476J Glasgow",
    displayName: "Glasgow",
    ceoOfficer: "RMKU Rathnayaka",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-026",
    code: "476/M",
    name: "476/M Thangakelle",
    displayName: "Thangakelle",
    ceoOfficer: "M.Nalini",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-027",
    code: "475R",
    name: "475R Coombwood",
    displayName: "Coombwood",
    ceoOfficer: "T.Naguleswary",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-028",
    code: "475",
    name: "Lipakelle",
    displayName: "Lipakelle",
    ceoOfficer: "S. Shivagowreiy",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-029",
    code: "476/R",
    name: "476/R Sandringham",
    displayName: "Sandringham",
    ceoOfficer: "M. Chandrasegaran",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-030",
    code: "475 M",
    name: "475 M Stonycliff",
    displayName: "Stonycliff",
    ceoOfficer: "S.Kamalahasan",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-031",
    code: "476/R",
    name: "476/ R Sandringham",
    displayName: "Sandringham (Division 2)",
    ceoOfficer: "M. Chandrasegaran",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-032",
    code: "475x",
    name: "475x Bearwell",
    displayName: "Bearwell",
    ceoOfficer: "M.Devika",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-033",
    code: "476 P",
    name: "476 P Breamore",
    displayName: "Breamore",
    ceoOfficer: "M G J S Bandara",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  },
  {
    id: "GND-034",
    code: "475 A",
    name: "475 A Kuduoya",
    displayName: "Kuduoya",
    ceoOfficer: "C Vithanarachi",
    phone: "+94 52 225 8234",
    division: "Talawakelle DS Division"
  }
];

console.log('Loaded EXACT_GNDS count:', EXACT_GNDS.length);

const gndMap = Object.fromEntries(EXACT_GNDS.map(g => [g.id, g]));

// Extract unique Community Empowerment Officers (CEO)
const uniqueCeos = [...new Set(EXACT_GNDS.map(g => g.ceoOfficer.trim()))].sort();
console.log('Total unique CEOs:', uniqueCeos.length);

// Update each project with actual CEO and clean GND data
const updatedProjects = INITIAL_PROJECTS.map(p => {
  const gnd = gndMap[p.gndId] || EXACT_GNDS[0];
  return {
    ...p,
    gndId: gnd.id,
    gndName: gnd.name,
    gndCode: gnd.code,
    ceoOfficer: gnd.ceoOfficer,
    responsibleOfficer: gnd.ceoOfficer
  };
});

const secretariatMeta = {
  division: "Talawakelle Divisional Secretariat",
  district: "Nuwara Eliya District",
  province: "Central Province, Sri Lanka",
  branch: "Planning Branch",
  ceoOfficers: uniqueCeos,
  officers: uniqueCeos,
  planningOfficers: [
    "K. Sivalingam (Planning Officer)",
    "M. Rathnayake (Assistant Director Planning)",
    "P. Chandrasekaran (Technical Officer)",
    "S. Jayalath (Development Officer)",
    "R. Thangarajah (Community Development Officer)",
    "N. Samantha (Technical Officer)"
  ],
  years: [2026, 2025, 2024],
  lastAuditDate: "2026-09-13"
};

const output = `/**
 * Talawakelle Divisional Secretariat Planning Branch
 * Project Monitoring Portal - Master Data Schema & Authentic Records
 * Generated from official Talawakelle Excel Project Register & Administrative Records
 */

export const WORKFLOW_STAGES = ${JSON.stringify(WORKFLOW_STAGES, null, 2)};

export const INITIAL_CATEGORIES = ${JSON.stringify(INITIAL_CATEGORIES, null, 2)};

export const INITIAL_GNDS = ${JSON.stringify(EXACT_GNDS, null, 2)};

export const COMMUNITY_EMPOWERMENT_OFFICERS = ${JSON.stringify(uniqueCeos, null, 2)};

export const INITIAL_PROJECTS = ${JSON.stringify(updatedProjects, null, 2)};

export const INITIAL_EVIDENCE = ${JSON.stringify(INITIAL_EVIDENCE, null, 2)};

export const SECRETARIAT_META = ${JSON.stringify(secretariatMeta, null, 2)};
`;

fs.writeFileSync('./src/data/mockData.js', output, 'utf8');
console.log('Updated ./src/data/mockData.js successfully with EXACT_GNDS.');

const altPath = 'c:/Users/madhu/OneDrive/Documents/Dashboard Talawakelle/mockData.js';
if (fs.existsSync(altPath)) {
  fs.writeFileSync(altPath, output, 'utf8');
  console.log('Updated', altPath, 'successfully with EXACT_GNDS.');
}
