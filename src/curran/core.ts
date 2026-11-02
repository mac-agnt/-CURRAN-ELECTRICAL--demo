/* Joe Curran Electrical Ltd: shared demo data, part 1.
   Staff, customers, sites, installed systems, helpers.
   "Today" in the demo is Tuesday 10 November 2026. */

export const TODAY = "2026-11-10";
export const TODAY_LABEL = "Tue 10 Nov";
export const COMPANY = {
  name: "Joe Curran Electrical Ltd",
  short: "Joe Curran Electrical",
  location: "Toor, Waterville, Co. Kerry",
  web: "joecurranelectrical.ie",
  tagline: "Electrical contractors and facilities management",
};

/* ---------- helpers ---------- */
const MS = 864e5;
export const dayDiff = (d: string, from: string = TODAY) => Math.round((Date.parse(d) - Date.parse(from)) / MS);
export const addDays = (d: string, n: number) => new Date(Date.parse(d) + n * MS).toISOString().slice(0, 10);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const fmtDate = (d: string) => {
  const x = new Date(d + "T12:00:00Z");
  return x.getUTCDate() + " " + MON[x.getUTCMonth()];
};
export const fmtDateY = (d: string) => fmtDate(d) + " " + d.slice(0, 4);
export const dow = (d: string) => DOW[new Date(d + "T12:00:00Z").getUTCDay()];
export const fmtDow = (d: string) => dow(d) + " " + fmtDate(d);
export const eur = (n: number) => (n < 0 ? "-€" : "€") + Math.abs(Math.round(n)).toLocaleString("en-IE");
export const eurK = (n: number) => (Math.abs(n) >= 10000 ? "€" + (n / 1000).toFixed(1) + "k" : eur(n));
export const pct = (n: number, d = 0) => (n * 100).toFixed(d) + "%";
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const inDays = (d: string) => {
  const n = dayDiff(d);
  return n === 0 ? "today" : n === 1 ? "tomorrow" : n === -1 ? "yesterday" : n > 0 ? "in " + n + " days" : Math.abs(n) + " days ago";
};

/* ---------- staff ---------- */
export type RoleKey = "md" | "admin" | "senior" | "electrician" | "apprentice";
export const SKILLS = ["Commercial Electrical", "Fire Systems", "CCTV", "Intruder", "Networking", "EV Charging", "Testing", "Emergency Lighting"] as const;
export type SkillKey = (typeof SKILLS)[number];
export type Level = 0 | 1 | 2 | 3;
export const LEVEL_LABEL = ["None", "Basic", "Competent", "Lead"];

export interface Staff {
  id: string;
  name: string;
  first: string;
  initials: string;
  title: string;
  roleKey: RoleKey;
  field: boolean;
  since: number;
  phone: string;
  email: string;
  base: string;
  tint: string;
  skills: Record<SkillKey, Level>;
  emergency: { name: string; relation: string; phone: string };
  ppe: { item: string; issued: string }[];
  van?: string;
}
const sk = (a: Level[]): Record<SkillKey, Level> => Object.fromEntries(SKILLS.map((s, i) => [s, a[i]])) as Record<SkillKey, Level>;
const PPE = (d: string): Staff["ppe"] => [
  { item: "Hard hat", issued: d }, { item: "Hi-vis jacket", issued: d }, { item: "Safety boots (S3)", issued: d }, { item: "Insulated gloves (Class 0)", issued: d },
];

export const STAFF: Staff[] = [
  { id: "seamus", name: "Seamus Curran", first: "Seamus", initials: "SC", title: "Managing Director / Operations", roleKey: "md", field: true, since: 2004, phone: "087 412 7731", email: "seamus@joecurranelectrical.ie", base: "Waterville", tint: "#1c93e3", skills: sk([3, 2, 2, 2, 1, 2, 3, 2]), emergency: { name: "Orla Curran", relation: "Spouse", phone: "087 233 0418" }, ppe: PPE("2025-03-01"), van: "Van 1 (Kerry 20-KY-4417)" },
  { id: "caitlin", name: "Caitlin Curran", first: "Caitlin", initials: "CC", title: "Administration & Operations", roleKey: "admin", field: false, since: 2023, phone: "087 655 2290", email: "caitlin@joecurranelectrical.ie", base: "Waterville (office)", tint: "#7fc4f2", skills: sk([0, 0, 0, 0, 0, 0, 0, 0]), emergency: { name: "Seamus Curran", relation: "Father", phone: "087 412 7731" }, ppe: [] },
  { id: "eoin", name: "Eoin Fitzgerald", first: "Eoin", initials: "EF", title: "Senior Electrician", roleKey: "senior", field: true, since: 2011, phone: "086 301 5527", email: "eoin@joecurranelectrical.ie", base: "Waterville", tint: "#9bd0b6", skills: sk([3, 2, 1, 1, 1, 2, 3, 3]), emergency: { name: "Mairéad Fitzgerald", relation: "Spouse", phone: "086 144 9082" }, ppe: PPE("2025-06-12"), van: "Van 2 (Kerry 19-KY-2086)" },
  { id: "liam", name: "Liam O'Sullivan", first: "Liam", initials: "LO", title: "Senior Electrician", roleKey: "senior", field: true, since: 2014, phone: "087 970 3316", email: "liam@joecurranelectrical.ie", base: "Cahersiveen", tint: "#e6c78a", skills: sk([3, 1, 1, 0, 1, 3, 2, 2]), emergency: { name: "Noreen O'Sullivan", relation: "Spouse", phone: "087 120 6674" }, ppe: PPE("2025-04-22"), van: "Van 3 (Kerry 21-KY-1190)" },
  { id: "kyle", name: "Kyle Murphy", first: "Kyle", initials: "KM", title: "Electrician", roleKey: "electrician", field: true, since: 2019, phone: "085 777 4108", email: "kyle@joecurranelectrical.ie", base: "Waterville", tint: "#c8b4f0", skills: sk([2, 1, 1, 1, 2, 1, 1, 1]), emergency: { name: "Deirdre Murphy", relation: "Mother", phone: "085 330 9915" }, ppe: PPE("2025-09-02") },
  { id: "sean", name: "Seán Moriarty", first: "Seán", initials: "SM", title: "Electrician (EV & Data)", roleKey: "electrician", field: true, since: 2020, phone: "086 622 8143", email: "sean@joecurranelectrical.ie", base: "Sneem", tint: "#f0b48c", skills: sk([2, 0, 2, 1, 3, 3, 1, 1]), emergency: { name: "Aoife Moriarty", relation: "Sister", phone: "086 508 2271" }, ppe: PPE("2025-07-15"), van: "Van 4 (Kerry 22-KY-0733)" },
  { id: "ciara", name: "Ciara Counihan", first: "Ciara", initials: "CO", title: "Electrical Technician", roleKey: "electrician", field: true, since: 2021, phone: "087 845 1960", email: "ciara@joecurranelectrical.ie", base: "Cahersiveen", tint: "#e2a08c", skills: sk([1, 1, 0, 0, 1, 1, 3, 3]), emergency: { name: "Pat Counihan", relation: "Father", phone: "087 391 7706" }, ppe: PPE("2025-05-08") },
  { id: "darragh", name: "Darragh Sheehan", first: "Darragh", initials: "DS", title: "Security / Fire Technician", roleKey: "senior", field: true, since: 2017, phone: "083 114 6620", email: "darragh@joecurranelectrical.ie", base: "Killorglin", tint: "#8fa6ff", skills: sk([1, 3, 3, 3, 2, 0, 2, 2]), emergency: { name: "Sinéad Sheehan", relation: "Spouse", phone: "083 902 3351" }, ppe: PPE("2025-02-18"), van: "Van 5 (Kerry 20-KY-6602)" },
  { id: "jack", name: "Jack Riordan", first: "Jack", initials: "JR", title: "Electrical Apprentice (Year 3)", roleKey: "apprentice", field: true, since: 2023, phone: "089 260 5513", email: "jack@joecurranelectrical.ie", base: "Waterville", tint: "#7fd8a4", skills: sk([1, 0, 0, 0, 1, 1, 0, 1]), emergency: { name: "Mary Riordan", relation: "Mother", phone: "089 417 8820" }, ppe: PPE("2025-10-01") },
];
export const staffById = (id: string) => STAFF.find((s) => s.id === id)!;
export const FIELD_STAFF = STAFF.filter((s) => s.field);

/* Permission groups. `can` is what each role may see across the app. */
export type Perm = "finance" | "margins" | "contracts" | "people" | "compliance" | "settings" | "allJobs" | "schedule" | "customers";
export const ROLES: { key: RoleKey; label: string; who: string; staffId: string; perms: Perm[]; blurb: string }[] = [
  { key: "md", label: "Managing Director", who: "Seamus Curran", staffId: "seamus", perms: ["finance", "margins", "contracts", "people", "compliance", "settings", "allJobs", "schedule", "customers"], blurb: "Full company visibility." },
  { key: "admin", label: "Admin & Operations", who: "Caitlin Curran", staffId: "caitlin", perms: ["finance", "contracts", "people", "compliance", "allJobs", "schedule", "customers"], blurb: "Scheduling, invoicing, customers, contracts, compliance. Job margins and settings stay with Seamus." },
  { key: "senior", label: "Senior Electrician", who: "Eoin Fitzgerald", staffId: "eoin", perms: ["allJobs", "schedule", "customers"], blurb: "Assigned jobs and crews, site documents, job progress and cost status. No company revenue or margins." },
  { key: "electrician", label: "Electrician", who: "Kyle Murphy", staffId: "kyle", perms: [], blurb: "Assigned jobs, site information, documentation, updates." },
  { key: "apprentice", label: "Apprentice", who: "Jack Riordan", staffId: "jack", perms: [], blurb: "Assigned jobs and approved site and knowledge information only." },
];
export const roleOf = (k: RoleKey) => ROLES.find((r) => r.key === k)!;
export const can = (role: RoleKey, p: Perm) => roleOf(role).perms.indexOf(p) > -1;

/* ---------- customers, contacts, sites ---------- */
export interface Contact { id: string; name: string; role: string; phone: string; email: string; customerId: string; primary?: boolean }
export interface Customer { id: string; name: string; kind: string; since: number; terms: string; accountsRef: string; siteIds: string[]; note: string }
export interface Site { id: string; customerId: string; name: string; address: string; town: string; lat: number; lon: number; access: string; contactId: string }

export const CUSTOMERS: Customer[] = [
  { id: "c-park", name: "Park Hotel Kenmare", kind: "Hospitality", since: 2016, terms: "30 days", accountsRef: "RB-PHK01", siteIds: ["s-park"], note: "Five star. Works around guests; noisy work before 08:00 not allowed." },
  { id: "c-murphy", name: "Murphy Retail Group", kind: "Retail", since: 2019, terms: "30 days", accountsRef: "RB-MRG02", siteIds: ["s-murphy"], note: "Multi-site group. Killorglin is the first full fit-out." },
  { id: "c-kmc", name: "Kerry Medical Centre", kind: "Healthcare", since: 2018, terms: "30 days", accountsRef: "RB-KMC01", siteIds: ["s-kmc"], note: "Plant room access is controlled by the building landlord." },
  { id: "c-hennessy", name: "Hennessy Residence", kind: "Private", since: 2025, terms: "Stage payments", accountsRef: "RB-HEN01", siteIds: ["s-hennessy"], note: "Private home automation project. Fiona is the day to day contact." },
  { id: "c-atlantic", name: "Atlantic Lodge Hotel", kind: "Hospitality", since: 2021, terms: "30 days", accountsRef: "RB-ALH01", siteIds: ["s-atl"], note: "Payment held up waiting on a PO number from head office." },
  { id: "c-cnh", name: "Iveragh Care Group", kind: "Healthcare", since: 2017, terms: "30 days", accountsRef: "RB-ICG01", siteIds: ["s-cnh"], note: "Cahersiveen Nursing Home. Work on residents' floors by appointment." },
  { id: "c-dunloe", name: "Dunloe Foods Ltd", kind: "Food production", since: 2022, terms: "30 days", accountsRef: "RB-DUN01", siteIds: ["s-dunloe"], note: "Refrigeration power, CCTV and EV chargers on one site." },
  { id: "c-golf", name: "Waterville Golf Links", kind: "Leisure", since: 2013, terms: "30 days", accountsRef: "RB-WGL01", siteIds: ["s-golf"], note: "Long standing customer. CCTV and intruder on contract." },
  { id: "c-sneem", name: "Sneem Pharmacy", kind: "Retail", since: 2020, terms: "30 days", accountsRef: "RB-SNP01", siteIds: ["s-sneem"], note: "Intruder alarm with cloud app. Asking about cheaper cloud options." },
  { id: "c-derr", name: "Derrynane Holiday Homes", kind: "Hospitality", since: 2022, terms: "30 days", accountsRef: "RB-DHH01", siteIds: ["s-derr"], note: "Invoice 103 days old. Collections agent has escalated to Caitlin." },
  { id: "c-kcu", name: "Kenmare Credit Union", kind: "Financial", since: 2018, terms: "14 days", accountsRef: "RB-KCU01", siteIds: ["s-kcu"], note: "Pays promptly." },
  { id: "c-oshea", name: "O'Shea Motors", kind: "Motor trade", since: 2015, terms: "14 days", accountsRef: "RB-OSM01", siteIds: ["s-oshea"], note: "Three-phase supply and workshop lighting." },
  { id: "c-caher", name: "Caherdaniel Bay Hotel", kind: "Hospitality", since: 2019, terms: "30 days", accountsRef: "RB-CBH01", siteIds: ["s-caher"], note: "Annual emergency lighting test and certification." },
];
export const customerById = (id: string) => CUSTOMERS.find((c) => c.id === id)!;

export const CONTACTS: Contact[] = [
  { id: "ct-1", customerId: "c-park", name: "Maeve Sheehy", role: "Facilities Manager", phone: "064 664 1189", email: "maeve.sheehy@parkkenmare.example", primary: true },
  { id: "ct-2", customerId: "c-park", name: "Fergal Dwyer", role: "Head of Engineering", phone: "087 305 7712", email: "fergal.dwyer@parkkenmare.example" },
  { id: "ct-3", customerId: "c-murphy", name: "Brian Murphy", role: "Property Manager", phone: "087 701 3345", email: "brian@murphyretail.example", primary: true },
  { id: "ct-4", customerId: "c-kmc", name: "Orla Brosnan", role: "Practice Manager", phone: "064 663 2209", email: "orla@kerrymedical.example", primary: true },
  { id: "ct-5", customerId: "c-kmc", name: "Ger Teahan", role: "Building Landlord Rep", phone: "086 912 0043", email: "ger.teahan@rocklandlords.example" },
  { id: "ct-6", customerId: "c-hennessy", name: "Fiona Hennessy", role: "Owner", phone: "087 118 6034", email: "fiona@hennessy.example", primary: true },
  { id: "ct-7", customerId: "c-atlantic", name: "Tadhg Foley", role: "General Manager", phone: "066 947 2216", email: "tadhg@atlanticlodge.example", primary: true },
  { id: "ct-8", customerId: "c-cnh", name: "Nuala Cronin", role: "Director of Nursing", phone: "066 947 2870", email: "nuala@iveraghcare.example", primary: true },
  { id: "ct-9", customerId: "c-dunloe", name: "Pádraig Kelliher", role: "Operations Manager", phone: "087 440 2381", email: "padraig@dunloefoods.example", primary: true },
  { id: "ct-10", customerId: "c-golf", name: "Con O'Connell", role: "Club Manager", phone: "066 947 4102", email: "con@watervillegolf.example", primary: true },
  { id: "ct-11", customerId: "c-sneem", name: "Aisling Walsh", role: "Pharmacist in charge", phone: "064 664 5518", email: "aisling@sneempharmacy.example", primary: true },
  { id: "ct-12", customerId: "c-derr", name: "Michael Courtney", role: "Owner", phone: "087 556 7203", email: "michael@derrynaneholidays.example", primary: true },
  { id: "ct-13", customerId: "c-kcu", name: "Deirdre Fleming", role: "Branch Manager", phone: "064 664 1550", email: "deirdre@kenmarecu.example", primary: true },
  { id: "ct-14", customerId: "c-oshea", name: "Donal O'Shea", role: "Owner", phone: "087 802 9941", email: "donal@osheamotors.example", primary: true },
  { id: "ct-15", customerId: "c-caher", name: "Róisín Sugrue", role: "Duty Manager", phone: "066 947 5120", email: "roisin@caherdanielbay.example", primary: true },
];

export const SITES: Site[] = [
  { id: "s-park", customerId: "c-park", name: "Park Hotel Kenmare", address: "Shelbourne Street, Kenmare, Co. Kerry", town: "Kenmare", lat: 51.88, lon: -9.5833, access: "Staff entrance, rear car park. Sign in at reception.", contactId: "ct-1" },
  { id: "s-murphy", customerId: "c-murphy", name: "Murphy Retail, Killorglin", address: "Langford Street, Killorglin, Co. Kerry", town: "Killorglin", lat: 52.1056, lon: -9.7836, access: "Side loading door. Site manager on duty from 07:30.", contactId: "ct-3" },
  { id: "s-kmc", customerId: "c-kmc", name: "Kerry Medical Centre", address: "Rock Road, Killarney, Co. Kerry", town: "Killarney", lat: 52.0599, lon: -9.5044, access: "Plant room key held by landlord rep. Book 24 hours ahead.", contactId: "ct-4" },
  { id: "s-hennessy", customerId: "c-hennessy", name: "Hennessy Residence", address: "Currane Road, Waterville, Co. Kerry", town: "Waterville", lat: 51.8275, lon: -10.1711, access: "Gate code with Fiona. Dog on site.", contactId: "ct-6" },
  { id: "s-atl", customerId: "c-atlantic", name: "Atlantic Lodge Hotel", address: "Marine Road, Cahersiveen, Co. Kerry", town: "Cahersiveen", lat: 51.9475, lon: -10.2217, access: "Back of house, kitchen delivery door.", contactId: "ct-7" },
  { id: "s-cnh", customerId: "c-cnh", name: "Cahersiveen Nursing Home", address: "Valentia Road, Cahersiveen, Co. Kerry", town: "Cahersiveen", lat: 51.9421, lon: -10.2189, access: "Ring bell at main door. Visitors' log is mandatory.", contactId: "ct-8" },
  { id: "s-dunloe", customerId: "c-dunloe", name: "Dunloe Foods, Killorglin", address: "Killorglin Business Park, Co. Kerry", town: "Killorglin", lat: 52.1012, lon: -9.7701, access: "Hi-vis, hair net and boot wash for production areas.", contactId: "ct-9" },
  { id: "s-golf", customerId: "c-golf", name: "Waterville Golf Links Clubhouse", address: "Ring of Kerry, Waterville, Co. Kerry", town: "Waterville", lat: 51.8301, lon: -10.1802, access: "Clubhouse office, ask for Con.", contactId: "ct-10" },
  { id: "s-sneem", customerId: "c-sneem", name: "Sneem Pharmacy", address: "North Square, Sneem, Co. Kerry", town: "Sneem", lat: 51.8386, lon: -9.9031, access: "Via shop front during opening hours.", contactId: "ct-11" },
  { id: "s-derr", customerId: "c-derr", name: "Derrynane Holiday Homes", address: "Derrynane, Caherdaniel, Co. Kerry", town: "Caherdaniel", lat: 51.75, lon: -10.0833, access: "Key safe at house 1.", contactId: "ct-12" },
  { id: "s-kcu", customerId: "c-kcu", name: "Kenmare Credit Union", address: "Main Street, Kenmare, Co. Kerry", town: "Kenmare", lat: 51.8806, lon: -9.5819, access: "After hours only for panel work.", contactId: "ct-13" },
  { id: "s-oshea", customerId: "c-oshea", name: "O'Shea Motors", address: "Main Street, Waterville, Co. Kerry", town: "Waterville", lat: 51.8283, lon: -10.1692, access: "Workshop side door.", contactId: "ct-14" },
  { id: "s-caher", customerId: "c-caher", name: "Caherdaniel Bay Hotel", address: "Caherdaniel, Co. Kerry", town: "Caherdaniel", lat: 51.7769, lon: -10.0903, access: "Reception, then maintenance corridor.", contactId: "ct-15" },
];
export const siteById = (id: string) => SITES.find((s) => s.id === id)!;
export const contactById = (id: string) => CONTACTS.find((c) => c.id === id)!;
export const driveMins = (a: string, b: string) => {
  if (a === b) return 0;
  const A = SITES.find((s) => s.town === a) || SITES[0], B = SITES.find((s) => s.town === b) || SITES[0];
  const R = 6371, rad = Math.PI / 180;
  const dLat = (B.lat - A.lat) * rad, dLon = (B.lon - A.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(A.lat * rad) * Math.cos(B.lat * rad) * Math.sin(dLon / 2) ** 2;
  return Math.max(5, Math.round(((2 * R * Math.asin(Math.sqrt(h))) * 1.45 / 58) * 60));
};

/* ---------- installed systems ---------- */
export type SystemKind = "Fire alarm" | "Emergency lighting" | "CCTV" | "Intruder" | "Structured cabling" | "Wi-Fi" | "Home automation" | "EV charging";
export interface InstalledSystem {
  id: string; siteId: string; kind: SystemKind; label: string; make: string; model: string; serial: string; installed: string;
  installJob?: string; lastService: string; lastBy: string; nextService: string; contractId?: string;
  known: string[]; repairs: { date: string; note: string; by: string }[]; manuals: string[];
}
const sy = (o: Partial<InstalledSystem> & Pick<InstalledSystem, "id" | "siteId" | "kind" | "label" | "make" | "model" | "serial" | "installed" | "lastService" | "lastBy" | "nextService">): InstalledSystem =>
  ({ known: [], repairs: [], manuals: [], ...o });

export const SYSTEMS: InstalledSystem[] = [
  sy({ id: "SYS-1001", siteId: "s-park", kind: "Fire alarm", label: "Fire alarm panel, 4 loop", make: "Advanced", model: "MxPro 5", serial: "MX5-118204", installed: "2021-03-18", lastService: "2026-09-14", lastBy: "darragh", nextService: "2027-03-14", contractId: "K-02",
    known: ["Zone 7 kitchen extract: false alarm 2 Oct, detector swapped for heat type"], repairs: [{ date: "2026-10-02", note: "Replaced optical detector with heat detector, zone 7 kitchen extract", by: "darragh" }, { date: "2025-04-09", note: "Loop 2 isolator replaced after water ingress", by: "eoin" }], manuals: ["MxPro 5 Engineer Handbook", "Park Hotel zone chart", "Park Hotel as-fitted drawings"] }),
  sy({ id: "SYS-1002", siteId: "s-park", kind: "Emergency lighting", label: "Addressable self-test emergency lighting", make: "Ansell Lighting", model: "Self-test addressable", serial: "EL-PHK-2021", installed: "2021-04-02", lastService: "2026-06-23", lastBy: "ciara", nextService: "2026-12-23", contractId: "K-02",
    known: ["Fittings 14 and 15 on Level 2 corridor flag battery fault each winter"], repairs: [{ date: "2026-06-23", note: "Six monthly test, 3 batteries replaced", by: "ciara" }], manuals: ["Emergency lighting test register"] }),
  sy({ id: "SYS-1003", siteId: "s-park", kind: "CCTV", label: "CCTV, 14 cameras", make: "Hikvision", model: "DS-7616NI-K2 NVR", serial: "HK-7616-30981", installed: "2022-05-11", lastService: "2026-02-03", lastBy: "darragh", nextService: "2027-02-03",
    known: ["Camera 9 (rear car park) drops out in heavy rain"], repairs: [{ date: "2026-02-03", note: "Re-terminated PoE run to camera 9", by: "darragh" }], manuals: ["Hikvision NVR quick start", "Camera schedule"] }),
  sy({ id: "SYS-1004", siteId: "s-park", kind: "Structured cabling", label: "Cat6A and fibre backbone", make: "Atlantic Data", model: "Cat6A + OM4 backbone", serial: "SC-PHK-22", installed: "2022-08-30", lastService: "2025-11-05", lastBy: "sean", nextService: "2027-11-05",
    known: [], repairs: [], manuals: ["Patch panel schedule", "Fibre test results"] }),
  sy({ id: "SYS-2001", siteId: "s-murphy", kind: "Fire alarm", label: "Fire alarm panel, 2 loop", make: "Kentec", model: "Syncro AS", serial: "KT-SY-40517", installed: "2026-11-06", installJob: "J-2652", lastService: "2026-11-06", lastBy: "darragh", nextService: "2027-02-06",
    known: ["Commissioned 6 Nov. 3 month post-commissioning check due"], repairs: [], manuals: ["Kentec Syncro AS installation guide", "Murphy Retail commissioning certificate", "Murphy Retail cause and effect"] }),
  sy({ id: "SYS-2002", siteId: "s-murphy", kind: "CCTV", label: "CCTV with cloud storage, 6 cameras", make: "Hikvision", model: "DS-7608NI-K2 + Hik-Connect cloud", serial: "HK-7608-44120", installed: "2024-11-14", lastService: "2025-11-12", lastBy: "darragh", nextService: "2026-12-01", contractId: "K-03",
    known: ["Cloud subscription renews 1 Dec, not yet invoiced"], repairs: [], manuals: ["Hikvision NVR quick start", "Hik-Connect cloud setup"] }),
  sy({ id: "SYS-2003", siteId: "s-murphy", kind: "Intruder", label: "Intruder alarm", make: "Pyronix", model: "Enforcer 32-WE", serial: "PX-E32-21177", installed: "2023-02-20", lastService: "2026-03-02", lastBy: "darragh", nextService: "2027-03-02", known: [], repairs: [], manuals: ["Pyronix Enforcer engineer manual"] }),
  sy({ id: "SYS-3001", siteId: "s-kmc", kind: "Fire alarm", label: "Fire alarm panel (legacy, being replaced)", make: "Gent", model: "Vigilon Compact", serial: "GV-C-05512", installed: "2008-06-01", lastService: "2026-03-20", lastBy: "darragh", nextService: "2026-12-01", contractId: "K-01",
    known: ["Panel obsolete, replacement with Advanced MxPro in progress (J-2658)", "Plant room access needs 24 hours notice"], repairs: [{ date: "2026-03-20", note: "Annual service, 6 detectors replaced", by: "darragh" }], manuals: ["Gent Vigilon engineer guide", "Kerry Medical zone chart"] }),
  sy({ id: "SYS-3002", siteId: "s-kmc", kind: "Emergency lighting", label: "Emergency lighting, 62 fittings", make: "Ansell Lighting", model: "Maintained LED", serial: "EL-KMC-2016", installed: "2016-09-10", lastService: "2026-05-14", lastBy: "ciara", nextService: "2026-11-14", known: ["6 monthly test due 14 Nov"], repairs: [], manuals: ["Emergency lighting test register"] }),
  sy({ id: "SYS-4001", siteId: "s-hennessy", kind: "Home automation", label: "KNX home automation", make: "MDT", model: "KNX IP router + actuators", serial: "KNX-HEN-01", installed: "2026-09-21", installJob: "J-2663", lastService: "2026-11-03", lastBy: "seamus", nextService: "2026-11-20", known: ["Programming 85% complete, scenes outstanding"], repairs: [], manuals: ["KNX ETS project file", "Hennessy scene schedule"] }),
  sy({ id: "SYS-4002", siteId: "s-hennessy", kind: "Wi-Fi", label: "Whole home Wi-Fi, 5 access points", make: "Ubiquiti", model: "UniFi U6 Pro", serial: "UNF-HEN-5", installed: "2026-10-05", installJob: "J-2663", lastService: "2026-10-05", lastBy: "sean", nextService: "2027-10-05", known: [], repairs: [], manuals: ["UniFi controller notes"] }),
  sy({ id: "SYS-5001", siteId: "s-atl", kind: "Fire alarm", label: "Fire alarm refit, 3 loop", make: "Advanced", model: "MxPro 5", serial: "MX5-120931", installed: "2026-10-12", installJob: "J-2667", lastService: "2026-10-30", lastBy: "darragh", nextService: "2026-12-10", known: ["Commissioning not yet complete"], repairs: [], manuals: ["MxPro 5 Engineer Handbook", "Atlantic Lodge zone chart"] }),
  sy({ id: "SYS-5002", siteId: "s-atl", kind: "Emergency lighting", label: "Emergency lighting upgrade", make: "Ansell Lighting", model: "Self-test addressable", serial: "EL-ATL-2026", installed: "2026-10-26", installJob: "J-2667", lastService: "2026-10-26", lastBy: "ciara", nextService: "2027-04-26", known: [], repairs: [], manuals: ["Emergency lighting test register"] }),
  sy({ id: "SYS-6001", siteId: "s-cnh", kind: "Intruder", label: "Intruder alarm with monitoring", make: "Pyronix", model: "Enforcer 32-WE", serial: "PX-E32-18802", installed: "2020-01-15", lastService: "2026-01-21", lastBy: "darragh", nextService: "2026-12-12", contractId: "K-04", known: [], repairs: [{ date: "2026-01-21", note: "Replaced PIR in corridor B", by: "darragh" }], manuals: ["Pyronix Enforcer engineer manual"] }),
  sy({ id: "SYS-6002", siteId: "s-cnh", kind: "CCTV", label: "CCTV, 8 cameras", make: "Hikvision", model: "DS-7608NI-K2", serial: "HK-7608-29044", installed: "2021-07-08", lastService: "2026-01-21", lastBy: "darragh", nextService: "2027-01-21", known: [], repairs: [], manuals: ["Hikvision NVR quick start"] }),
  sy({ id: "SYS-6003", siteId: "s-cnh", kind: "Structured cabling", label: "Nurse call and data network", make: "Atlantic Data", model: "Cat6 + nurse call backbone", serial: "SC-CNH-26", installed: "2026-10-01", installJob: "J-2671", lastService: "2026-11-05", lastBy: "ciara", nextService: "2026-12-20", known: ["Second floor still to be terminated"], repairs: [], manuals: ["Patch panel schedule"] }),
  sy({ id: "SYS-7001", siteId: "s-dunloe", kind: "CCTV", label: "CCTV with cloud, 10 cameras", make: "Hikvision", model: "DS-7616NI-K2 + cloud", serial: "HK-7616-55302", installed: "2023-12-12", lastService: "2025-12-18", lastBy: "darragh", nextService: "2026-12-18", contractId: "K-06", known: ["Cloud and 4G router fee paid to supplier in advance"], repairs: [], manuals: ["Hikvision NVR quick start", "Hik-Connect cloud setup"] }),
  sy({ id: "SYS-7002", siteId: "s-dunloe", kind: "EV charging", label: "EV charging, 4 x 22kW", make: "Zappi", model: "Commercial 22kW", serial: "EV-DUN-4", installed: "2026-11-04", installJob: "J-2674", lastService: "2026-11-04", lastBy: "sean", nextService: "2027-05-04", known: ["Chargers 3 and 4 still to be commissioned"], repairs: [], manuals: ["EV charger commissioning checklist"] }),
  sy({ id: "SYS-8001", siteId: "s-golf", kind: "CCTV", label: "CCTV upgrade, 8 cameras", make: "Hikvision", model: "DS-7608NI-K2", serial: "HK-7608-61007", installed: "2026-10-09", lastService: "2026-10-09", lastBy: "darragh", nextService: "2027-10-09", contractId: "K-05", known: [], repairs: [], manuals: ["Hikvision NVR quick start"] }),
  sy({ id: "SYS-8002", siteId: "s-golf", kind: "Intruder", label: "Intruder alarm", make: "Pyronix", model: "Enforcer 32-WE", serial: "PX-E32-15540", installed: "2018-04-10", lastService: "2026-04-14", lastBy: "darragh", nextService: "2027-04-14", contractId: "K-05", known: ["Callout 3 Nov: fault finding on keypad bus"], repairs: [{ date: "2026-11-03", note: "Fault found on keypad bus, loose terminal. Not yet invoiced", by: "ciara" }], manuals: ["Pyronix Enforcer engineer manual"] }),
  sy({ id: "SYS-9001", siteId: "s-sneem", kind: "Intruder", label: "Intruder alarm with cloud app", make: "Pyronix", model: "Enforcer 32-WE + HomeControl+", serial: "PX-E32-20311", installed: "2022-01-24", lastService: "2026-01-12", lastBy: "darragh", nextService: "2027-01-03", contractId: "K-07", known: ["Customer asking about cheaper cloud option"], repairs: [], manuals: ["Pyronix Enforcer engineer manual"] }),
  sy({ id: "SYS-9101", siteId: "s-caher", kind: "Emergency lighting", label: "Emergency lighting, 74 fittings", make: "Ansell Lighting", model: "Maintained LED", serial: "EL-CBH-2019", installed: "2019-03-14", lastService: "2026-10-30", lastBy: "ciara", nextService: "2027-04-30", contractId: "K-08", known: ["Annual test completed 30 Oct. Certificate issued, invoice not yet raised"], repairs: [{ date: "2026-10-30", note: "Annual test and certification, 4 fittings replaced", by: "ciara" }], manuals: ["Emergency lighting test register"] }),
  sy({ id: "SYS-9201", siteId: "s-kcu", kind: "Intruder", label: "Intruder alarm", make: "Pyronix", model: "Enforcer 32-WE", serial: "PX-E32-17220", installed: "2019-08-06", lastService: "2026-02-10", lastBy: "darragh", nextService: "2027-02-10", known: [], repairs: [], manuals: ["Pyronix Enforcer engineer manual"] }),
  sy({ id: "SYS-9301", siteId: "s-derr", kind: "EV charging", label: "EV charger, 7kW single", make: "Zappi", model: "7kW tethered", serial: "EV-DHH-1", installed: "2025-06-20", lastService: "2025-06-20", lastBy: "sean", nextService: "2026-12-20", known: [], repairs: [], manuals: ["EV charger commissioning checklist"] }),
];
export const systemById = (id: string) => SYSTEMS.find((s) => s.id === id)!;
export const systemsAt = (siteId: string) => SYSTEMS.filter((s) => s.siteId === siteId);

/* ---------- skills a job needs, and compliance records ---------- */
export type CertKey = "Safe Pass" | "Manual Handling" | "Working at Height" | "Electrical Registration" | "PSA Licence" | "First Aid" | "Fire Systems Cert";
export interface Cert { staffId: string; cert: CertKey; body: string; number: string; issued: string; expires: string; doc: boolean; renewalBooked?: string }
const cert = (staffId: string, c: CertKey, body: string, number: string, issued: string, expires: string, renewalBooked?: string): Cert => ({ staffId, cert: c, body, number, issued, expires, doc: true, renewalBooked });
export const CERTS: Cert[] = [
  cert("seamus", "Safe Pass", "SOLAS", "SP-4410922", "2023-03-11", "2028-03-11"),
  cert("seamus", "Electrical Registration", "RECI", "RECI-30711", "2025-01-15", "2027-01-15"),
  cert("seamus", "Manual Handling", "Kerry ETB", "MH-2210", "2025-02-20", "2028-02-20"),
  cert("seamus", "First Aid", "Irish Red Cross", "PFA-1180", "2025-06-05", "2028-06-05"),
  cert("seamus", "Fire Systems Cert", "FDIA", "FDIA-0914", "2024-09-02", "2027-09-02"),
  cert("eoin", "Safe Pass", "SOLAS", "SP-3980441", "2024-03-04", "2029-03-04"),
  cert("eoin", "Electrical Registration", "RECI", "RECI-31220", "2025-01-15", "2027-01-15"),
  cert("eoin", "Manual Handling", "Kerry ETB", "MH-2301", "2025-02-20", "2028-02-20"),
  cert("eoin", "Working at Height", "Kerry ETB", "WAH-0871", "2025-05-12", "2028-05-12"),
  cert("eoin", "Fire Systems Cert", "FDIA", "FDIA-1021", "2025-03-18", "2028-03-18"),
  cert("liam", "Safe Pass", "SOLAS", "SP-4102288", "2023-10-02", "2028-10-02"),
  cert("liam", "Manual Handling", "Kerry ETB", "MH-2008", "2023-12-11", "2026-12-11"),
  cert("liam", "Electrical Registration", "RECI", "RECI-30954", "2025-01-15", "2027-01-15"),
  cert("liam", "Working at Height", "Kerry ETB", "WAH-0620", "2024-08-20", "2027-08-20"),
  cert("kyle", "Safe Pass", "SOLAS", "SP-3377105", "2021-11-22", "2026-11-22"),
  cert("kyle", "Manual Handling", "Kerry ETB", "MH-2455", "2025-09-10", "2028-09-10"),
  cert("kyle", "Electrical Registration", "RECI", "RECI-34177", "2024-02-01", "2027-02-01"),
  cert("sean", "Safe Pass", "SOLAS", "SP-4220918", "2024-06-18", "2029-06-18"),
  cert("sean", "Manual Handling", "Kerry ETB", "MH-2390", "2025-04-01", "2028-04-01"),
  cert("sean", "Electrical Registration", "RECI", "RECI-34890", "2025-01-15", "2027-01-15"),
  cert("sean", "PSA Licence", "Private Security Authority", "PSA-IN-88214", "2025-03-30", "2027-03-30"),
  cert("ciara", "Safe Pass", "SOLAS", "SP-4301177", "2025-01-27", "2030-01-27"),
  cert("ciara", "Manual Handling", "Kerry ETB", "MH-2412", "2025-05-09", "2028-05-09"),
  cert("ciara", "Electrical Registration", "RECI", "RECI-35260", "2025-01-15", "2027-01-15"),
  cert("darragh", "Safe Pass", "SOLAS", "SP-3890210", "2022-02-14", "2027-02-14"),
  cert("darragh", "PSA Licence", "Private Security Authority", "PSA-IN-61177", "2024-12-01", "2026-12-31"),
  cert("darragh", "Fire Systems Cert", "FDIA", "FDIA-0775", "2024-05-06", "2027-05-06"),
  cert("darragh", "Manual Handling", "Kerry ETB", "MH-2244", "2024-10-18", "2027-10-18"),
  cert("jack", "Safe Pass", "SOLAS", "SP-4388021", "2023-09-12", "2028-09-12"),
  cert("jack", "Manual Handling", "Kerry ETB", "MH-2490", "2025-09-24", "2028-09-24"),
];
/* A record counts as "expiring soon" inside this window. */
export const EXPIRY_WINDOW = 45;
export const certDays = (c: Cert) => dayDiff(c.expires);
export const expiringCerts = () => CERTS.filter((c) => certDays(c) <= EXPIRY_WINDOW).sort((a, b) => certDays(a) - certDays(b));
