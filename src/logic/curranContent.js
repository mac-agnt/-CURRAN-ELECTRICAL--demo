/* Joe Curran Electrical Ltd: content for the stock Pulse pages (Home, Agents, Dashboard, Work, Records, Activity, Settings).
   Everything numeric is derived from src/curran so every page tells the same story. */
import {
  STAFF, CUSTOMERS, CONTACTS as CUST_CONTACTS, SUPPLIERS, SUPPLIER_INVOICES, INVOICES, JOBS, CONTRACTS, QUEUE, TASKS as CT_TASKS, APPROVALS as CT_APPROVALS,
  EXCEPTIONS as CT_EXCEPTIONS, WORKFLOWS as CT_WORKFLOWS, CONFLICTS, AGE_BUCKETS, PIPELINE, SYSTEMS, CERTS,
  jobsSummary, contractSummary, renewingSoon, unbilledRenewals, readyToInvoice, outstandingTotal, overdueTotal, collectedThisMonth, supplierSpendMonth,
  matchedToday, exceptionInvoices, invoiceOutstanding, ageBucket, weekCapacity, weekHours, expiringCerts, certDays, eur, fmtDate, customerById, staffById, jobById,
  jobFin, daysOverdue, staffOnSiteToday, siteById, pipelineTotal, pipelineWeighted, contractMargin, dayDiff, TODAY, SKILLS, FIELD_STAFF, ROLES, roleOf, READY_ITEMS, supplierById
} from "../curran/index";

const LIME = "var(--accent)", GREEN = "var(--ok)", AMBER = "var(--warn)", RED = "var(--bad)", DIM = "var(--dim)", NEUTRAL = "var(--neutral)";

/* ---------- headline numbers (the single story) ---------- */
export const HEAD = (() => {
  const js = jobsSummary(), cs = contractSummary(), cap = weekCapacity("w0");
  const exp = expiringCerts();
  return {
    staff: STAFF.length, jobs: js.count, activeValue: js.activeValue, outstanding: outstandingTotal(), ready: readyToInvoice(), overdue: overdueTotal(),
    risk: js.atRisk.length, avgMargin: js.avgMargin, renewing: cs.renewing, renewalRevenue: cs.renewalRevenue, unbilled: cs.unbilled, expiring: exp.length,
    conflicts: CONFLICTS.length, util: cap.util, collected: collectedThisMonth(), supplierSpend: supplierSpendMonth(), arr: cs.arr, activeContracts: cs.active,
    pipeline: pipelineTotal(), weighted: pipelineWeighted(), approvalsOpen: CT_APPROVALS.filter((a) => a.status === "Awaiting").length,
  };
})();
export const SNAPSHOT = [
  ["Staff", String(HEAD.staff), ""],
  ["Active jobs", String(HEAD.jobs), ""],
  ["Active job value", eur(HEAD.activeValue), ""],
  ["Awaiting collection", eur(HEAD.outstanding), eur(HEAD.overdue) + " overdue"],
  ["Ready to invoice", eur(HEAD.ready), "3 drafts"],
  ["Jobs with margin risk", String(HEAD.risk), ""],
  ["Contracts renewing in 60 days", String(HEAD.renewing), eur(HEAD.renewalRevenue)],
  ["Compliance items expiring", String(HEAD.expiring), ""],
  ["Scheduling conflicts", String(HEAD.conflicts), ""],
];

/* ---------- Records: contacts, files, ontology ---------- */
const TINTS = ["#9fd6f0", "#e6c78a", "#c8b4f0", "#a8e0c0", "#e2a08c", "#8fa6ff", "#f0b48c"];
export const CONTACTS = STAFF.map((s) => [s.name, s.title, s.email, "Joe Curran Electrical", "staff", s.tint])
  .concat(CUST_CONTACTS.map((c, i) => [c.name, c.role, c.email, customerById(c.customerId).name, c.customerId === "c-atlantic" || c.customerId === "c-derr" ? "watch" : "customer", TINTS[i % TINTS.length]]))
  .concat([
    ["Declan Moynihan", "Account manager", "declan@killarneyelectrical.example", "Killarney Electrical Wholesale", "supplier", TINTS[0]],
    ["Gráinne Lyne", "Trade counter", "grainne@munstercable.example", "Munster Cable & Lighting", "supplier", TINTS[1]],
    ["Ronan Hickey", "Fire and security sales", "ronan@swfire.example", "Southwest Fire & Security Supplies", "supplier", TINTS[2]],
    ["Eimear Walsh", "Account manager", "eimear@atlanticdata.example", "Atlantic Data & Networking", "supplier", TINTS[3]],
  ]);

export const REC_SECTIONS = [
  { id: "ontology", label: "Ontology", blurb: "How the company connects: customers, sites, systems, jobs, people, suppliers and money, and the paths between them." },
  { id: "files", label: "Files", blurb: "Quotes, certificates, manuals and invoices, indexed so Pulse can read them." },
  { id: "contacts", label: "Contacts", blurb: "Staff, customers and suppliers in one directory." },
  { id: "relationships", label: "Relationships", blurb: "One job, traced through every record it touches. This is the company's operating memory." },
];

export const FILE_TREE = [
  { type: "folder", id: "f-jobs", name: "Jobs", depth: 0 },
  { type: "file", id: "fl-1", name: "Q-2026-114 Park Hotel upgrade.pdf", depth: 1, parent: "f-jobs", indexed: true, path: "Jobs / Park Hotel Electrical Upgrade", title: "Quote Q-2026-114, Park Hotel Electrical Upgrade",
    facts: [["TYPE", "PDF, 9 pages"], ["VALUE", "€54,800"], ["INDEXED", "All 9 pages"], ["OWNER", "Seamus Curran"]],
    body: ["Fixed price quote for the electrical upgrade across levels 1 to 3, including distribution board changeover and emergency lighting. Cable and containment are priced at the August wholesale list.",
      "The quote carries a 24% target margin. Materials have since moved: the November cable delivery came in 14% above the quoted price, which is why forecast margin is now 17%.",
      "Variation V-02 (extra level 3 emergency lighting, €2,400) is drafted but not yet sent to the client."],
    links: [["Park Hotel Kenmare", "customer"], ["Park Hotel Electrical Upgrade", "job"], ["Job Cost Agent", "agent"]] },
  { type: "file", id: "fl-2", name: "Murphy Retail handover pack.pdf", depth: 1, parent: "f-jobs", indexed: true, path: "Jobs / Murphy Retail Fit-Out", title: "Murphy Retail handover pack",
    facts: [["TYPE", "PDF, 14 pages"], ["ADDED", "9 Nov 2026"], ["INDEXED", "All 14 pages"], ["OWNER", "Darragh Sheehan"]],
    body: ["Signed handover sheet, fire alarm commissioning certificate, as-fitted drawings and cause and effect matrix for the Killorglin store.",
      "This is the document that proves the job is complete. The Invoice Agent used the signed handover as its trigger to prepare the €6,850 balance invoice.",
      "The Kentec Syncro AS panel serial is recorded here and on the site's QR record."],
    links: [["Murphy Retail Fit-Out", "job"], ["Kentec Syncro AS panel", "system"], ["Invoice Agent", "agent"]] },
  { type: "folder", id: "f-comp", name: "Compliance", depth: 0 },
  { type: "file", id: "fl-3", name: "Kyle Murphy, Safe Pass card.pdf", depth: 1, parent: "f-comp", indexed: true, path: "Compliance / Employees", title: "Kyle Murphy, Safe Pass",
    facts: [["TYPE", "PDF, 1 page"], ["EXPIRES", "22 Nov 2026"], ["INDEXED", "Yes"], ["OWNER", "Caitlin Curran"]],
    body: ["SOLAS Safe Pass registration SP-3377105, issued 22 November 2021. Five year validity.",
      "The Compliance Agent flagged this at 08:15 today. It expires in 12 days and Kyle is on annual leave from 12 to 20 November, so the renewal course has to be booked this week.",
      "A renewal task has been created for Caitlin."],
    links: [["Kyle Murphy", "person"], ["Compliance Agent", "agent"], ["Safe Pass renewal task", "task"]] },
  { type: "file", id: "fl-4", name: "Public liability insurance 2026.pdf", depth: 1, parent: "f-comp", indexed: false, path: "Compliance / Insurance", title: "Public liability insurance 2026",
    facts: [["TYPE", "PDF, 12 pages"], ["EXPIRES", "1 Apr 2027"], ["INDEXED", "Not indexed"], ["OWNER", "Caitlin Curran"]],
    body: ["Public liability cover for all trades, including fire and security installation. Not yet indexed, so Pulse cannot answer questions from it.",
      "Several customers ask for this before a site start. Indexing it would let the job pack pull it in automatically."],
    links: [["Joe Curran Electrical", "company"]] },
  { type: "folder", id: "f-tech", name: "Technical", depth: 0 },
  { type: "file", id: "fl-5", name: "Kentec Syncro AS installation guide.pdf", depth: 1, parent: "f-tech", indexed: true, path: "Technical / Fire alarm panels", title: "Kentec Syncro AS installation guide",
    facts: [["TYPE", "PDF, 64 pages"], ["USED ON", "Murphy Retail"], ["INDEXED", "All 64 pages"], ["OWNER", "Darragh Sheehan"]],
    body: ["Manufacturer guide for the Syncro AS two loop panel installed at Murphy Retail, Killorglin. Covers loop wiring, addressing, silencing, resetting and event logs.",
      "Technicians scanning the QR code on the panel are taken to this guide and to the internal reset procedure. Always follow the manufacturer's documentation."],
    links: [["Murphy Retail panel (SYS-2001)", "system"], ["Fire panel service procedure", "procedure"]] },
  { type: "folder", id: "f-fin", name: "Finance", depth: 0 },
  { type: "file", id: "fl-6", name: "INV-4812 Atlantic Lodge stage 1.pdf", depth: 1, parent: "f-fin", indexed: true, path: "Finance / Invoices", title: "INV-4812, Atlantic Lodge stage 1",
    facts: [["TYPE", "PDF, 1 page"], ["VALUE", "€11,200"], ["AGE", "52 days overdue"], ["OWNER", "Caitlin Curran"]],
    body: ["Stage 1 invoice on the Atlantic Lodge fire alarm and emergency lighting job. Unpaid because the hotel has not issued a PO number.",
      "The Collections Agent has sent three reminders. Caitlin spoke to Tadhg Foley on 26 October. A call to head office is the next step."],
    links: [["Atlantic Lodge Hotel", "customer"], ["Collections Agent", "agent"]] },
  { type: "file", id: "fl-7", name: "Hik-Connect cloud renewal notice 2026.pdf", depth: 1, parent: "f-fin", indexed: true, path: "Finance / Supplier notices", title: "Hik-Connect cloud renewal notice",
    facts: [["TYPE", "PDF, 2 pages"], ["COST", "€950 a year"], ["INDEXED", "Both pages"], ["OWNER", "Caitlin Curran"]],
    body: ["Annual cloud storage and 4G failover fees that Joe Curran Electrical pays on behalf of Murphy Retail (€540) and Dunloe Foods (€410).",
      "Both customers must be rebilled. The Contracts Agent has found neither renewal invoiced yet: €860 and €640 are due."],
    links: [["Murphy Retail CCTV cloud (K-03)", "contract"], ["Dunloe Foods security cloud (K-06)", "contract"]] },
  { type: "folder", id: "f-mem", name: "Company memory", depth: 0 },
  { type: "file", id: "fl-8", name: "Tradify export, job history 2019 to 2025.xlsx", depth: 1, parent: "f-mem", indexed: true, path: "Company memory / Imports", title: "Tradify export, job history",
    facts: [["TYPE", "XLSX, 6 sheets"], ["JOBS", "312 structured"], ["INDEXED", "Yes"], ["OWNER", "Seamus Curran"]],
    body: ["Seven years of jobs, customers and quotes exported from Tradify. Pulse has matched 486 customers, reviewed 37 duplicates and attached historic job folders from Dropbox.",
      "This is the starting memory for Pulse. Nothing is retyped."],
    links: [["Company Memory Import", "area"], ["Dropbox", "system"]] },
];

export const ONTO_NODES = [
  ["Customer", "entity", 500, 300, 1, "A person or business we work for. Customers have sites, contacts, contracts and invoices."],
  ["Site", "entity", 300, 190, 1, "A physical address. A customer can have many sites; jobs and systems are attached to a site."],
  ["Installed system", "entity", 700, 190, 1, "A fire panel, CCTV system, EV charger. Carries make, serial, service history and a QR code."],
  ["Job", "entity", 250, 430, 1, "The central object. Opening a job shows quote, crew, hours, costs, photos, certificates and invoice status."],
  ["Employee", "entity", 690, 430, 1, "Staff, their skills, certificates and leave. Employees work on jobs."],
  ["Contract", "entity", 850, 320, 0, "Recurring service and cloud contracts that generate service visits and renewal invoices."],
  ["Quote", "ledger", 390, 95, 0, "A priced proposal. Accepted quotes become jobs."],
  ["Customer invoice", "ledger", 620, 95, 0, "Raised from a job or contract. RedBook stays the ledger."],
  ["Supplier invoice", "module", 860, 470, 0, "Arrives by email, matched to a job, becomes a job cost."],
  ["Document", "entity", 140, 300, 0, "Manuals, drawings, certificates attached to the right record."],
  ["has site", "predicate", 395, 240, 0, "Customer to Site."],
  ["has system", "predicate", 605, 240, 0, "Site to Installed system."],
  ["works on", "predicate", 460, 390, 0, "Employee to Job."],
  ["bills", "predicate", 510, 190, 0, "Job to Customer invoice."],
  ["attached to", "predicate", 140, 372, 0, "Document to any record."],
];
export const ONTO_EDGES = [[500, 300, 300, 190], [500, 300, 700, 190], [500, 300, 250, 430], [500, 300, 690, 430], [500, 300, 850, 320], [500, 300, 390, 95], [500, 300, 620, 95], [500, 300, 140, 300], [300, 190, 250, 430], [700, 190, 860, 470], [690, 430, 860, 470], [390, 95, 620, 95]];
export const CLUSTERS = [
  ["Customers", "#1c93e3", 0.0, 0.62, 46], ["Sites", "#4fd4d0", 0.9, 0.7, 40], ["Systems", "#5fe0a8", 1.75, 0.66, 50], ["Jobs", "#f0b45a", 2.55, 0.72, 56],
  ["People", "#9d8cf5", 3.35, 0.6, 36], ["Suppliers", "#f08a4b", 4.15, 0.7, 40], ["Invoices", "#f07a9d", 4.95, 0.64, 44], ["Documents", "#a9b8c6", 5.65, 0.72, 52],
];

/* ---------- Settings: people, integrations, cards ---------- */
export const PEOPLE = STAFF.map((s) => [s.name, s.title, s.email, s.base, "active", roleOf(s.roleKey).label, s.id === "seamus" ? "2 min ago" : s.id === "caitlin" ? "6 min ago" : s.field ? "1 h ago" : "3 h ago"]);
export const ROLE_LEVELS = ROLES.map((r) => r.label);
export const PERM_KEYS = [["view", "View records"], ["edit", "Edit records"], ["approve", "Approve invoices"]];
export const DEFAULT_PERMS = {
  "Managing Director": { view: true, edit: true, approve: true }, "Admin & Operations": { view: true, edit: true, approve: true },
  "Senior Electrician": { view: true, edit: true, approve: false }, Electrician: { view: true, edit: true, approve: false }, Apprentice: { view: true, edit: false, approve: false },
};
export const INTEGRATIONS = [
  { name: "RedBook", blurb: "The accounting ledger stays in RedBook. Pulse prepares invoices, pushes approved ones and reads payment status back.", tint: "#1c93e3", status: "sync configured", statusKind: "ok",
    glyph: "M4.5 12a7.5 7.5 0 0 1 12.8-5.3 M19.5 12a7.5 7.5 0 0 1-12.8 5.3 M17.3 4v3.3h-3.3 M6.7 20v-3.3H10", lastSync: "2 min ago", usage: "1 invoice queued, 9 synced today", auth: "API key", scopes: ["Read", "Write"] },
  { name: "Tradify", blurb: "Seven years of jobs, customers and quotes. Pulse imports the history so the field team no longer needs to open it.", tint: "#f0803a", status: "import available", statusKind: "warn",
    glyph: "M5 7.2h14v10.6H5V7.2Z M5 11h14 M9 7.2V5h6v2.2", lastSync: "Export uploaded 6 Nov", usage: "312 jobs structured", auth: "CSV export", scopes: ["Read"] },
  { name: "Connecteam", blurb: "Employee folders, expiry reminders, leave and rotas. Pulse People and Schedule take these over, with leave joined to jobs.", tint: "#9d8cf5", status: "migration planned", statusKind: "off",
    glyph: "M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4", lastSync: "Not connected", usage: "9 employee folders to migrate", auth: "Export", scopes: [] },
  { name: "Dropbox", blurb: "Historic job folders, drawings and supplier PDFs, classified and attached to the right job, site or system.", tint: "#4f8cf0", status: "connected", statusKind: "ok",
    glyph: "M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z", lastSync: "11 min ago", usage: "8,420 files indexed", auth: "OAuth 2.0", scopes: ["Read"] },
  { name: "Excel", blurb: "Pricing sheets, job trackers and renewal lists. Imported once, then retired.", tint: "#5fe0a8", status: "import available", statusKind: "warn",
    glyph: "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17", lastSync: "14 workbooks imported", usage: "5 more waiting for review", auth: "File upload", scopes: ["Read"] },
  { name: "Email", blurb: "The invoices@ inbox is watched for supplier invoices. Threads attach to the right customer and job.", tint: "#f07a9d", status: "connected", statusKind: "ok",
    glyph: "M4 7.2 12 13 20 7.2 M4 7.2v10.6h16V7.2 M4 7.2 8.5 4h7L20 7.2", lastSync: "3 min ago", usage: "126 emails a day", auth: "OAuth 2.0", scopes: ["Read", "Send"] },
  { name: "Calendar", blurb: "Staff calendars and site visits, kept in step with the planner so nobody is double booked.", tint: "#8fa6ff", status: "connected", statusKind: "ok",
    glyph: "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z", lastSync: "5 min ago", usage: "9 calendars", auth: "OAuth 2.0", scopes: ["Read", "Write"] },
];
export const ADMIN_CARDS = [
  { id: "people", group: "ORGANISATION", title: "People & access", icon: "people", tint: "#6ad0f0", blurb: "Who uses Pulse and what they can see. Technicians never see company finance.",
    tags: ["9 people", "5 permission groups", "1 location"], badge: "1 pending leave", badgeKind: "warn", footer: "Last login checked 4 minutes ago", action: "Review access", listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Add or remove employees", ""], ["Permission groups", "5"], ["Managing Director", "Seamus Curran"], ["Admin & Operations", "Caitlin Curran"], ["Field roles", "Senior, Electrician, Apprentice"], ["View last login", "9 people tracked"]] },
  { id: "teams", group: "ORGANISATION", title: "Roles & permissions", icon: "shield", tint: "var(--accent)", blurb: "Exactly what each group reaches, from full visibility to assigned jobs only.",
    tags: ["5 groups", "Finance hidden from field", "Margins: MD only"], heroLabel: "THE QUESTION THIS ANSWERS", heroAction: "Show me what Kyle can see",
    heroText: "Pick a person and see every job, document and number they can reach. Use the View Pulse As control in the sidebar to try each group.", footer: "Preview Pulse as another user", action: "Open preview", listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Managing Director", "Full company visibility"], ["Admin & Operations", "Scheduling, invoicing, customers, contracts, compliance"], ["Senior Electrician", "Assigned jobs, crews, site documents"], ["Electrician", "Assigned jobs and site information"], ["Apprentice", "Approved site and knowledge only"]] },
  { id: "structure", group: "ORGANISATION", title: "Company structure", icon: "structure", tint: "#f0c04b", blurb: "A family run company in transition: Seamus running operations, Caitlin taking on administration.",
    tags: ["Waterville, Co. Kerry", "Europe/Dublin", "EUR"], listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Company", "Joe Curran Electrical Ltd"], ["Base", "Toor, Waterville, Co. Kerry"], ["Services", "Electrical, fire, security, data, EV"], ["Staff", "9"], ["Working hours", "07:30 to 17:00, Mon to Fri"], ["Holidays", "Irish public holidays"], ["Default currency", "EUR, VAT 23%"]] },
  { id: "agents", group: "CONTROL", title: "Agents & AI controls", icon: "agent", tint: "var(--accent)", blurb: "What agents may read, what they may do, and where they must stop for a person.",
    tags: ["8 agents", "187 actions today", "€0.41 spent"], heroLabel: "GLOBAL CONTROL", heroAction: "Pause every agent", heroText: "One switch stops every agent immediately. Anything mid run finishes its current step and then holds.",
    footer: "Invoices and customer messages always need a yes", action: "Review limits", listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Approved agent roles", "8"], ["Invoice Agent may read", "jobs, hours, supplier costs"], ["Collections Agent may send", "reminders only", true], ["Approval required", "invoices, variations, final notices", true], ["Spending cap", "€40 a month"], ["Agent memory", "90 days"]] },
  { id: "wf", group: "CONTROL", title: "Workflow controls", icon: "flow", tint: "#9d8cf5", blurb: "Pulse does the routine 80% and sends the unusual 20% to the right person.",
    tags: ["Exceptions only", "3 approval rules", "Retry twice"], footer: "Building workflows happens in Work", action: "Open Work", listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Who can create workflows", "Managing Director"], ["Maximum autonomy", "drafts, never sends", true], ["Approval rules", "invoices, variations, leave"], ["Failure handling", "retry twice, then notify"], ["Global pause", "all workflows", true]] },
  { id: "notif", group: "CONTROL", title: "Notifications", icon: "bell", tint: "#f0994b", blurb: "Which events reach which person, and when not to.",
    tags: ["Inbox", "WhatsApp", "Quiet 19:00 to 07:00"], listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Site constraints", "Seamus, immediately"], ["Draft invoices", "Seamus or Caitlin", true], ["Certificate expiry", "Caitlin, 45 days ahead", true], ["Supplier exceptions", "Caitlin only", true], ["Quiet hours", "19:00 to 07:00"], ["Daily summary", "07:00 weekdays"]] },
  { id: "integrations", group: "SYSTEMS", title: "Systems", icon: "plug", tint: "#6ad0f0", blurb: "The tools Pulse sits over today, and the ones it can retire. A frontend demo: statuses show the plan, not live connections.",
    tags: ["7 sources", "3 connected", "1 migration planned"], badge: "Import ready", badgeKind: "warn", footer: "Tradify export waiting for import", action: "Open systems", listLabel: "CONNECTIONS",
    rows: [["RedBook", "sync configured"], ["Tradify", "import available"], ["Connecteam", "migration planned"], ["Dropbox", "connected"], ["Excel", "import available"], ["Email", "connected"], ["Calendar", "connected"]] },
  { id: "modules", group: "SYSTEMS", title: "Modules & configuration", icon: "modules", tint: "#f0c04b", blurb: "Jobs, Schedule, Customers, Finance, Service Contracts, People and Knowledge, all on one record.",
    tags: ["7 modules", "1 company ontology"], heroLabel: "TERMINOLOGY", heroAction: "Edit terminology", heroText: "Organisation reads as Customer and Task reads as Job, everywhere in the interface.",
    listLabel: "WHAT YOU CONTROL HERE", rows: [["Enable or disable modules", "7 installed"], ["Rename business terms", "2 overridden"], ["Custom fields", "11"], ["Job statuses", "4"], ["Required job information", "site, scope, lead"]] },
  { id: "health", group: "SYSTEMS", title: "Data health", icon: "health", tint: "#e2705c", blurb: "What is wrong with the company's memory and how to fix it.",
    tags: ["5 issue types", "58 records affected"], badge: "37 reviewed", badgeKind: "ok", footer: "Last scanned 12 minutes ago", action: "Review 6", listLabel: "ISSUES FOUND",
    trend: [112, 104, 96, 84, 74, 66, 58], bySeverity: [["High", "6", RED], ["Medium", "22", AMBER], ["Low", "30", DIM]],
    issues: [["Duplicate customers", "37", "medium", "Reviewed and merged during import", "Done"], ["Jobs with no site", "6", "high", "Historic jobs imported without an address", "Review"], ["Documents unclassified", "14", "low", "Waiting for a category", "Classify"], ["Out of date contacts", "22", "low", "Not touched in 3 years", "Review"], ["Unmatched supplier PDFs", "4", "medium", "No job reference found", "Open inbox"]], rows: [] },
  { id: "security", group: "GOVERNANCE", title: "Security", icon: "lock", tint: "#8fa6ff", blurb: "Sign in, devices and the keys that reach other systems.",
    tags: ["2FA enforced", "9 devices"], listLabel: "WHAT YOU CONTROL HERE", rows: [["Two factor authentication", "enforced", true], ["Active sessions", "11"], ["Field phones", "7 approved"], ["API keys", "2 active"], ["Data retention", "7 years"]] },
  { id: "audit", group: "GOVERNANCE", title: "Audit log", icon: "audit", tint: "#9d8cf5", blurb: "Every agent action and every approval, written as the person or agent that did it.",
    tags: ["Append only", "7 year retention"], footer: "Nobody can edit or delete entries", action: "Export", listLabel: "WHAT IS RECORDED",
    rows: [["Invoice approvals", "41 this month"], ["Agent actions", "1,402"], ["Permission changes", "3"], ["Deleted records", "0"]] },
  { id: "datamgmt", group: "GOVERNANCE", title: "Company memory", icon: "data", tint: "#5fe0a8", blurb: "History from Dropbox, Excel and Tradify, turned into structured company memory. Pulse starts from what you already know.",
    tags: ["8,420 files", "312 jobs", "486 customers"], footer: "Last backup completed 02:00 today", action: "Open import", listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Dropbox files indexed", "8,420"], ["Excel workbooks imported", "14"], ["Historic jobs structured", "312"], ["Customer records matched", "486"], ["Duplicates reviewed", "37"], ["Technical documents classified", "214"]] },
  { id: "brand", group: "EXPERIENCE", title: "Branding", icon: "brand", tint: "var(--accent)", blurb: "Logo, accent colour and how invoices and quotes look.",
    tags: ["Brand blue", "2 templates"], listLabel: "WHAT YOU CONTROL HERE",
    rows: [["Company logo", "jce-logo.png"], ["Pulse accent colour", "#1c93e3"], ["Quote template", "1"], ["Invoice template", "1"], ["Customer portal branding", "on", true]] },
  { id: "appearance", group: "EXPERIENCE", title: "Appearance & themes", icon: "brand", tint: "#6ad0f0", blurb: "Pick a light or dark theme for how Pulse looks to you.", tags: ["8 themes", "4 dark", "4 light"], listLabel: "THEMES", rows: [] },
];
export const ADMIN_GROUPS = [["ORGANISATION", "repeat(3,1fr)"], ["CONTROL", "repeat(3,1fr)"], ["SYSTEMS", "repeat(3,1fr)"], ["GOVERNANCE", "repeat(3,1fr)"], ["EXPERIENCE", "repeat(3,1fr)"]];
export const COMPANY_MEMORY = [
  ["Dropbox", "8,420", "files indexed", 0.92], ["Excel", "14", "workbooks imported", 0.74], ["Historic job folders", "312", "jobs structured", 1],
  ["Customer records", "486", "matched", 0.97], ["Duplicate records", "37", "reviewed", 1], ["Technical documents", "214", "classified", 0.83],
];

/* ---------- activity feeds ---------- */
export const SRC_TINT = { RedBook: "#1c93e3", Pulse: "var(--accent)", Email: "#f07a9d", Tradify: "#f0803a", Connecteam: "#9d8cf5", Dropbox: "#4f8cf0", Excel: "#5fe0a8", Calendar: "#8fa6ff", Agent: "var(--accent)", Field: "#5fe0a8" };
export const SRC_ABBR = { RedBook: "RB", Pulse: "PL", Email: "EM", Tradify: "TR", Connecteam: "CT", Dropbox: "DB", Excel: "XL", Calendar: "CA", Agent: "AI", Field: "FD" };
export const DATA_EVENTS = [
  ["Supplier invoice received", "KE-28492 from Killarney Electrical Wholesale, €2,184, matched to Park Hotel Electrical Upgrade.", "invoices@ inbox", "Park Hotel Kenmare", "Email", "completed"],
  ["Site photos uploaded", "4 photos from Kerry Medical Centre filed against the job and the first floor corridor.", "Kyle Murphy", "Kerry Medical Centre", "Field", "completed"],
  ["Voice update processed", "Site voice note turned into a progress change, 44% to 48%, and a task for the landlord's key.", "Kyle Murphy", "Kerry Medical Centre", "Field", "completed"],
  ["Invoice posted", "INV-4911 for €1,180 posted to RedBook and sent to Park Hotel Kenmare.", "RedBook sync", "Park Hotel Kenmare", "RedBook", "completed"],
  ["Files indexed", "42 historic drawings from Dropbox classified against Hennessy Residence.", "Dropbox", "Hennessy Residence", "Dropbox", "completed"],
  ["Supplier invoice received", "MCL-90402 for €3,140 has an unclear job reference and needs Caitlin.", "invoices@ inbox", "Munster Cable & Lighting", "Email", "awaiting"],
  ["Calendar updated", "Thursday site visit moved to fit the landlord's availability.", "Calendar", "Kerry Medical Centre", "Calendar", "completed"],
  ["Workbook imported", "Renewals.xlsx matched to 44 service contracts.", "Excel", "Service Contracts", "Excel", "completed"],
  ["Payment received", "INV-4868 for €6,420 matched to Kenmare Credit Union.", "RedBook sync", "Kenmare Credit Union", "RedBook", "completed"],
];
export const PEOPLE_EVENTS = [
  ["Darragh raised a constraint", "Plant room access unavailable at Kerry Medical Centre. Possible one day delay.", "Darragh Sheehan", "Kerry Medical Centre", "Field", "completed"],
  ["Caitlin approved a renewal", "Cahersiveen intruder monitoring renewal, €720, queued to RedBook.", "Caitlin Curran", "Iveragh Care Group", "Pulse", "completed"],
  ["Eoin logged materials", "3 core 6mm cable, 6 drums, added to Park Hotel.", "Eoin Fitzgerald", "Park Hotel Kenmare", "Field", "completed"],
  ["Seán requested leave", "17 to 19 November. Overlaps Kyle's annual leave.", "Seán Moriarty", "Schedule", "Pulse", "awaiting"],
  ["Seamus signed off scenes", "Hennessy living room scene list signed by the customer.", "Seamus Curran", "Hennessy Residence", "Pulse", "completed"],
  ["Ciara completed a test", "Annual emergency lighting test certificate issued at Caherdaniel Bay Hotel.", "Ciara Counihan", "Caherdaniel Bay Hotel", "Field", "completed"],
  ["Jack finished a checklist", "Level 3 corridor second fix checklist ticked, 6 photos attached.", "Jack Riordan", "Park Hotel Kenmare", "Field", "completed"],
  ["Liam checked in", "Loop 2 and 3 devices fitted at Atlantic Lodge.", "Liam O'Sullivan", "Atlantic Lodge Hotel", "Field", "completed"],
];
export const AI_EVENTS = [
  ["Invoice Agent prepared a draft", "€6,850 invoice for Murphy Retail Fit-Out assembled from quote, hours and supplier costs. Waiting for Seamus.", "Invoice Agent", "Murphy Retail Group", "Agent", "awaiting"],
  ["Job Cost Agent updated a forecast", "Park Hotel materials 11% over budget. Forecast margin 24% to 17%.", "Job Cost Agent", "Park Hotel Kenmare", "Agent", "completed"],
  ["Compliance Agent flagged an expiry", "Kyle Murphy Safe Pass expires in 12 days. Renewal task created for Caitlin.", "Compliance Agent", "Kyle Murphy", "Agent", "completed"],
  ["Contracts Agent found renewals", "3 renewals not yet invoiced, €2,740. One draft prepared.", "Contracts Agent", "Service Contracts", "Agent", "working"],
  ["Collections Agent sent reminders", "2 payment reminders sent. Atlantic Lodge still waiting on a PO.", "Collections Agent", "Atlantic Lodge Hotel", "Agent", "working"],
  ["Supplier invoice matched", "KE-28492 matched to Park Hotel with 99% confidence. Job cost updated.", "Job Cost Agent", "Park Hotel Kenmare", "Agent", "completed"],
  ["Ops Watchdog flagged a clash", "Kerry Medical slips to Thursday 12 November: Kyle on leave, Darragh double booked.", "Ops Watchdog", "Kerry Medical Centre", "Agent", "awaiting"],
  ["Briefing Agent posted the morning brief", "Five things need you. Everything else is handled.", "Briefing Agent", "Seamus Curran", "Agent", "completed"],
];
export const STREAM_DEFS = [
  { id: "data", title: "New data", sub: "Information entering Pulse", pool: DATA_EVENTS, every: 3200, tint: "#6ad0f0", icon: "M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" },
  { id: "people", title: "Staff on site", sub: "What the team did", pool: PEOPLE_EVENTS, every: 6400, tint: "#f0c04b", icon: "M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9" },
  { id: "ai", title: "AI activity", sub: "Agents at work", pool: AI_EVENTS, every: 4600, tint: "var(--accent)", icon: "M2 12h4l2.5-6 3.5 12 3-8 2 2h5" },
];
/* the dated log Home and Activity quote */
export const LOG_TODAY = [
  ["09:14", "Invoice Agent prepared €6,850 invoice for Murphy Retail Fit-Out."],
  ["09:07", "Supplier invoice KE-28492 automatically matched to Park Hotel Electrical Upgrade."],
  ["08:54", "Kyle uploaded 4 photos from Kerry Medical Centre."],
  ["08:51", "Site voice update processed. Job progress changed 44% to 48%."],
  ["08:42", "Access constraint raised at Kerry Medical Centre."],
  ["08:15", "Compliance Agent flagged Kyle's Safe Pass expiry."],
  ["07:58", "Contracts Agent identified 3 uninvoiced renewals."],
];
export const AI_HANDLED = [
  { who: "Job Cost Agent", what: "matched 4 supplier invoices to jobs", event: "supplier.invoice.matched", when: "09:07", dot: LIME },
  { who: "Collections Agent", what: "sent 2 customer payment reminders", event: "invoice.reminder.sent", when: "09:00", dot: LIME },
  { who: "Contracts Agent", what: "drafted 1 recurring service invoice", event: "contract.invoice.drafted", when: "08:02", dot: LIME },
  { who: "Site Knowledge Agent", what: "converted 3 site voice notes into job updates", event: "field.voice.processed", when: "08:51", dot: LIME },
  { who: "Compliance Agent", what: "created 1 technician certificate expiry task", event: "compliance.task.created", when: "08:15", dot: AMBER },
];

/* ---------- inbox items: what needs Seamus now ---------- */
export const ITEMS = {
  park: { kind: "Alert", importance: "high", icon: "M3 12.5h3.4l2-5 3 10 2.2-5H21", age: "72%", title: "Park Hotel Electrical Upgrade", group: "Alerts",
    why: "Materials 11% over budget. Forecast margin fallen from 24% to 17%.",
    detail: "72% complete and on programme, but the November cable delivery came in 14% over the quote and materials are running 11% over budget. Forecast margin has fallen from 24% to 17%. Review the remaining materials, and send the €2,400 level 3 emergency lighting variation that Maeve Sheehy asked for.",
    actionLabel: "Open job", secondaryLabel: "Review variation", link: { page: "Jobs", tab: "active", sel: { job: "J-2641", jobTab: "financials" } },
    fields: [{ k: "Agent", v: "Job Cost Agent" }, { k: "Contract", v: "€54,800" }, { k: "Forecast margin", v: "17% (was 24%)" }, { k: "Cause", v: "Material cost increase" }],
    history: [{ when: "Today 09:07", text: "Supplier invoice KE-28492 matched, €2,184 materials" }, { when: "6 Nov 11:05", text: "Eoin flagged a cable price rise by voice" }] },
  murphy: { kind: "Approval", importance: "high", icon: "M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7", age: "09:14", title: "Murphy Retail Fit-Out", group: "Approvals",
    why: "Job complete. €6,850 ready to invoice. Draft prepared.",
    detail: "The job finished yesterday and the customer signed the handover. €11,750 of €18,600 has been invoiced. The Invoice Agent assembled the €6,850 balance from the quote, 143 hours and four supplier invoices. It needs your approval before it goes to RedBook.",
    actionLabel: "Approve invoice", secondaryLabel: "Open draft", link: { page: "Finance", tab: "queue", sel: { queue: "Q-1" } },
    fields: [{ k: "Agent", v: "Invoice Agent" }, { k: "Amount", v: "€6,850" }, { k: "Approver", v: "Seamus Curran" }, { k: "Status", v: "Ready to invoice" }],
    history: [{ when: "Yesterday 15:20", text: "Darragh completed handover" }, { when: "Today 09:14", text: "Draft invoice prepared" }] },
  renewals: { kind: "Approval", importance: "high", icon: "M18.5 8.5A5.5 5.5 0 0 0 7.5 7.5 M5.5 3.8v3.7h3.7 M5.5 15.5a5.5 5.5 0 0 0 11 1 M18.5 20.2v-3.7h-3.7", age: "60d", title: "Security Renewals", group: "Approvals",
    why: "€6,840 renewals due within 60 days. 3 not yet invoiced.",
    detail: "Eight service contracts renew in the next 60 days, worth €6,840. Three have not been invoiced: Kerry Fire Maintenance €1,240 (draft ready), Murphy Retail CCTV cloud €860 and Dunloe Foods security cloud €640. The last two have platform fees already paid to Hikvision, so each day of delay is margin lost.",
    actionLabel: "Review renewals", secondaryLabel: "Open Service Contracts", link: { page: "Contracts", tab: "renewals", sel: {} },
    fields: [{ k: "Agent", v: "Contracts Agent" }, { k: "Renewals", v: "8, €6,840" }, { k: "Not invoiced", v: "3, €2,740" }, { k: "Highest", v: "€1,240" }],
    history: [{ when: "Today 07:58", text: "Contracts Agent found 3 uninvoiced renewals" }] },
  safepass: { kind: "Task", importance: "high", icon: "M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9", age: "12d", title: "Kyle Murphy Safe Pass", group: "Work",
    why: "Expires in 12 days. Renewal task created for Caitlin.",
    detail: "Kyle's SOLAS Safe Pass expires on 22 November. He is on annual leave from 12 to 20 November, so the course has to be booked this week. Caitlin has been notified and a task exists. Liam O'Sullivan's Manual Handling expires in 31 days.",
    actionLabel: "Open compliance", secondaryLabel: "Message Kyle", link: { page: "People", tab: "compliance", sel: {} },
    fields: [{ k: "Agent", v: "Compliance Agent" }, { k: "Expires", v: "22 Nov 2026" }, { k: "Owner", v: "Caitlin Curran" }, { k: "Status", v: "Renewal required" }],
    history: [{ when: "Today 08:15", text: "Compliance Agent flagged the expiry" }, { when: "Today 08:15", text: "Task created for Caitlin" }] },
  kmc: { kind: "Alert", importance: "critical", icon: "M12 4 2.8 19.5h18.4L12 4Z M12 10v4.5 M12 17.2h.01", age: "08:42", title: "Kerry Medical Centre", group: "Alerts",
    why: "Technician reported access constraint at 08:42. Completion may move by one day.",
    detail: "Darragh reported at 08:42 that the plant room is unavailable until the landlord's rep returns on Thursday. The new panel fit slips from Wednesday to Thursday, which collides with Kyle's leave and Darragh's booking at Cahersiveen. Completion may move from 27 to 30 November, and forecast margin from 25% to 21%.",
    actionLabel: "Open job", secondaryLabel: "See schedule clash", link: { page: "Jobs", tab: "active", sel: { job: "J-2658" } },
    fields: [{ k: "Raised by", v: "Darragh Sheehan, 08:42" }, { k: "Owner", v: "Seamus Curran" }, { k: "Impact", v: "Possible 1 day delay" }, { k: "Contract", v: "€31,400, 48% complete" }],
    history: [{ when: "Today 08:42", text: "Constraint raised in the field app" }, { when: "Today 08:51", text: "Kyle's voice note moved progress 44% to 48%" }] },
};
export const ORDER = ["park", "murphy", "renewals", "safepass", "kmc"];

/* ---------- Home chat answers ---------- */
const readyRows = READY_ITEMS.map((q) => [customerById(q.customerId).name.replace(" Group", ""), eur(q.amount), q.ageDays + (q.ageDays === 1 ? " day" : " days"), staffById(q.approver).first]);
export const ANSWERS = {
  invoices: { tool: "pulse_invoices_ready", effect: "read",
    text: eur(HEAD.ready) + " across three jobs is ready to bill and none of it has been invoiced. Murphy Retail Fit-Out is the big one at €6,850, handed over yesterday, and the draft is already prepared for you. The other two are small, 7 and 11 days old, exactly the kind that used to slip.",
    cols: ["Job", "Amount", "Waiting", "Approver"], rows: readyRows, actions: [["Open the invoice queue", 1, { page: "Finance", tab: "queue", sel: { queue: "Q-1" } }], ["Show the Murphy draft", 0, { page: "Finance", tab: "queue", sel: { queue: "Q-1" } }]] },
  margin: { tool: "pulse_jobs_health", effect: "read",
    text: "Three jobs have margin risk. Park Hotel is the one that matters: 72% complete, materials 11% over budget after the November cable price rise, and forecast margin has fallen from 24% to 17%. The €2,400 level 3 variation would recover most of it. Kerry Medical and Cahersiveen Nursing Home are slipping on access and labour.",
    cols: ["Job", "Progress", "Was", "Forecast"], rows: JOBS.filter((j) => jobFin(j).atRisk).map((j) => [j.name.split(" ").slice(0, 3).join(" "), j.progress + "%", Math.round(j.origMargin * 100) + "%", Math.round(jobFin(j).fcMargin * 100) + "%"]),
    actions: [["Open Park Hotel financials", 1, { page: "Jobs", tab: "active", sel: { job: "J-2641", jobTab: "financials" } }], ["Open job profitability", 0, { page: "Finance", tab: "profit", sel: {} }]] },
  renewals: { tool: "pulse_contracts_renewals", effect: "read",
    text: "Eight contracts renew in the next 60 days, worth " + eur(HEAD.renewalRevenue) + ". Three are not invoiced yet, " + eur(2740) + " in all. The two that worry me are Murphy Retail and Dunloe Foods: we already paid Hikvision for their cloud platform and have not rebilled them.",
    cols: ["Contract", "Renews", "Billing", "Status"], rows: renewingSoon().slice(0, 4).map((c) => [c.customer, fmtDate(c.renew), eur(c.billing), c.invoice]),
    actions: [["Open renewals", 1, { page: "Contracts", tab: "renewals", sel: {} }], ["Draft the two rebills", 0, { page: "Finance", tab: "queue", sel: {} }]] },
  schedule: { tool: "pulse_schedule_check", effect: "read",
    text: "One scheduling conflict. The Kerry Medical plant room fit slips to Thursday 12 November because of the access constraint, and on that day Kyle is on annual leave and Darragh is booked at Cahersiveen Nursing Home. Eoin and Seamus are the only other people with Fire Systems level 2.",
    actions: [["Open the planner", 1, { page: "Schedule", tab: "planner", sel: {} }], ["See Kyle's leave", 0, { page: "Schedule", tab: "leave", sel: {} }]] },
  compliance: { tool: "pulse_compliance_expiring", effect: "read",
    text: "Two records are expiring. Kyle Murphy's Safe Pass runs out in 12 days, on 22 November, and he is on leave from the 12th, so the renewal needs booking this week. Liam O'Sullivan's Manual Handling expires in 31 days. Caitlin has a task for each.",
    cols: ["Employee", "Record", "Expires", "Days"], rows: expiringCerts().map((c) => [staffById(c.staffId).name, c.cert, fmtDate(c.expires), String(certDays(c))]),
    actions: [["Open compliance", 1, { page: "People", tab: "compliance", sel: {} }]] },
  supplier: { tool: "pulse_supplier_inbox", effect: "read",
    text: "Four supplier invoices were matched to jobs this morning with no typing, including KE-28492 for €2,184 on Park Hotel. Four need Caitlin: one low confidence match, one with no job reference, one possible duplicate and one plant hire to categorise.",
    cols: ["Invoice", "Supplier", "Amount", "Status"], rows: exceptionInvoices().map((s) => [s.number, supplierById(s.supplierId).short, eur(s.amount), s.status === "review" ? "Needs review" : s.status === "missing" ? "Missing job" : "Possible duplicate"]),
    actions: [["Open supplier costs", 1, { page: "Finance", tab: "supplier", sel: {} }]] },
  constraint: { tool: "pulse_jobs_constraints", effect: "read",
    text: "One live site constraint. At 08:42 Darragh reported that the Kerry Medical plant room is unavailable. The landlord's rep is back Thursday. Completion may move by one day and you own the decision: wait, or move the crew to Cahersiveen and come back.",
    actions: [["Open Kerry Medical", 1, { page: "Jobs", tab: "active", sel: { job: "J-2658" } }], ["See the clash", 0, { page: "Schedule", tab: "planner", sel: {} }]] },
  site: { tool: "pulse_site_knowledge", effect: "read",
    text: "The Murphy Retail panel is a Kentec Syncro AS, installed under J-2652 and commissioned by Darragh Sheehan on 6 November. The reset procedure is in the Knowledge base and also opens from the QR code on the panel. Always follow the manufacturer's documentation.",
    actions: [["Open the site record", 1, { page: "Customers", tab: "systems", sel: { system: "SYS-2001" } }], ["Ask Pulse in Knowledge", 0, { page: "Knowledge", tab: "ask", sel: {} }]] },
  chase: { tool: "pulse_invoice_approve", effect: "write", confirm: true,
    confirmSummary: "Approve draft invoice Q-1 for Murphy Retail Group, €6,850 (balance of €18,600 contract), and queue it to RedBook. A reminder cadence starts on the due date.",
    text: "Prepared. Approving an invoice is a write action, so I have not sent it. The draft is stored with a hash of its exact lines. Confirming queues those lines to RedBook and nothing else.",
    actions: [["Confirm and queue to RedBook", 1], ["Edit draft", 0, { page: "Finance", tab: "queue", sel: { queue: "Q-1" } }]] },
  fallback: { tool: "pulse_search", effect: "read",
    text: "I can answer that from jobs, customers, finance, contracts, people and the knowledge base you can see. Everything I read goes through a registered tool with a permission, and anything you cannot see comes back as not found. Try asking what is ready to invoice, which jobs are at risk, or what renews soon.",
    actions: [["What needs me today?", 0]] },
};
export function pickAnswer(q) {
  const s = q.toLowerCase();
  if (/approve|confirm|send the invoice/.test(s) && /murphy|draft|invoice/.test(s)) return ANSWERS.chase;
  if (/reset|panel|kentec|manual|how do i|procedure|qr/.test(s)) return ANSWERS.site;
  if (/ready to (invoice|bill)|invoice|billing|unbilled|murphy/.test(s)) return ANSWERS.invoices;
  if (/margin|profit|park|risk|over budget|cost/.test(s)) return ANSWERS.margin;
  if (/renew|contract|cloud|recurring|subscription/.test(s)) return ANSWERS.renewals;
  if (/schedule|clash|conflict|holiday|leave|cover|assign/.test(s)) return ANSWERS.schedule;
  if (/safe pass|compliance|expir|cert|training/.test(s)) return ANSWERS.compliance;
  if (/supplier|matched|duplicate|inbox/.test(s)) return ANSWERS.supplier;
  if (/constraint|access|kerry medical|delay|site/.test(s)) return ANSWERS.constraint;
  return ANSWERS.fallback;
}

/* ---------- agents ---------- */
const brief = (n) => n;
export const AGENT_DEFS = [
  { id: "billing", name: "Billing run", shape: "rim-capsule", tint: "#1b2430", state: "working", group: true, members: ["invoice", "jobcost", "collections"], role: "Invoice, Job Cost and Collections Agents working the same morning",
    when: "09:14", preview: "murphy draft is with seamus. nothing else is held up.",
    thread: [
      { kind: "stamp", text: "Today 09:04" },
      { kind: "routine", text: "Ran routine", routine: "Morning billing run" },
      { kind: "agent", from: "jobcost", text: "four supplier invoices matched overnight. park hotel is the one that moved: materials are now 11% over budget at 72% complete." },
      { kind: "agent", from: "invoice", text: "murphy retail finished yesterday and the handover is signed. i have prepared the €6,850 balance and routed it to seamus." },
      { kind: "agent", from: "collections", text: "two reminders went out at 09:00. atlantic lodge is still waiting on a PO number, so that one needs a call from caitlin." },
      { kind: "user", text: "what is the quickest win today" },
      { kind: "agent", from: "invoice", text: "approve murphy. it is the biggest unbilled job and the paperwork is complete. two smaller drafts, caherdaniel and the golf links callout, are waiting on caitlin." },
    ] },
  { id: "briefing", name: "Briefing", shape: "crown-pebble", tint: "#191c1f", state: "complete", role: "Reads the whole company every morning and tells Seamus what needs him",
    when: "07:02", preview: "five things need you. everything else is handled.",
    thread: [
      { kind: "stamp", text: "Today 07:00" }, { kind: "routine", text: "Ran routine", routine: "Morning briefing" },
      { kind: "agent", text: "good morning seamus. the company in one look:", lines: [
        { k: "Jobs", v: HEAD.jobs + " active · " + eur(HEAD.activeValue) + " · " + HEAD.risk + " with margin risk" },
        { k: "Money", v: eur(HEAD.ready) + " ready to invoice · " + eur(HEAD.outstanding) + " awaiting collection" },
        { k: "Contracts", v: HEAD.renewing + " renewing in 60 days · " + eur(HEAD.renewalRevenue) + " · " + HEAD.unbilled + " not invoiced" },
        { k: "People", v: HEAD.expiring + " compliance items expiring · " + HEAD.conflicts + " scheduling conflict" }] },
      { kind: "agent", text: "five things need you: park hotel margin, the murphy invoice, security renewals, kyle's safe pass and the kerry medical access constraint. everything else is covered." },
      { kind: "user", text: "move park hotel to the top" },
      { kind: "agent", text: "done. i will bring the variation draft for the €2,400 level 3 lighting to this afternoon's review." },
    ] },
  { id: "ops", name: "Ops Watchdog", shape: "shield", tint: "#2b1b1e", state: "attention", role: "Watches sites, schedule clashes and constraints, and tells you when something stops working",
    when: "08:42", preview: "kerry medical plant room access. one day delay possible.",
    thread: [
      { kind: "stamp", text: "Today 08:42" },
      { kind: "agent", text: "darragh raised an access constraint at kerry medical centre: plant room unavailable, landlord's rep back thursday. completion may move from 27 to 30 november. you own this one." },
      { kind: "agent", text: "that moves the panel fit to thursday 12 november. kyle is on leave and darragh is booked at cahersiveen, so thursday has no one with fire systems level 2 free except eoin and seamus." },
      { kind: "user", text: "can eoin move" },
      { kind: "agent", text: "eoin is the park hotel lead and the distribution board outage is friday night. moving him thursday is possible but leaves hennessy and park with one fewer pair of hands. i would rather ask the landlord for early access first." },
    ] },
  { id: "invoice", name: "Invoice Agent", shape: "executive-capsule", tint: "#2a2118", state: "waiting", role: "Spots completed work and billing milestones, prepares the invoice and asks for approval",
    when: "09:14", preview: "murphy draft ready. two smaller drafts with caitlin.",
    thread: [
      { kind: "stamp", text: "Today 09:14" },
      { kind: "agent", text: "billable work found: " + eur(HEAD.ready) + " across three jobs. none invoiced.", lines: READY_ITEMS.map((q) => ({ k: customerById(q.customerId).name.split(" ").slice(0, 2).join(" "), v: eur(q.amount) + " · waiting " + q.ageDays + " days" })) },
      { kind: "agent", text: "i built the murphy invoice from the quote, 143 hours, four supplier invoices and the signed handover. it goes to seamus because it is over €5,000." },
      { kind: "user", text: "why did these get missed before" },
      { kind: "agent", text: "the large jobs got the admin time. the small ones were 7 and 11 days old before anyone looked. i now look at every completed job and milestone each morning, whatever its size." },
    ] },
  { id: "collections", name: "Collections Agent", shape: "low-dome", tint: "#241b2e", state: "working", role: "Watches unpaid invoices and runs the follow up cadence so Caitlin only handles calls",
    when: "09:00", preview: "two reminders sent. atlantic lodge needs a call.",
    thread: [
      { kind: "stamp", text: "Today 09:00" },
      { kind: "agent", text: "ageing: current €34,520, 1 to 30 days €17,960, 31 to 60 days €11,200, 61 to 90 days €2,780, 90 plus €1,990." },
      { kind: "agent", text: "reminders sent this morning to kerry medical centre and atlantic lodge. the lodge has had three, it is waiting on a PO from head office." },
      { kind: "user", text: "what should caitlin do" },
      { kind: "agent", text: "call head office at atlantic lodge, and approve the final notice for derrynane holiday homes (103 days). everything else runs on its own cadence: day 1 reminder, day 7, day 21 call task, day 35 final notice." },
    ] },
  { id: "contracts", name: "Contracts Agent", shape: "control-cube", tint: "#16241f", state: "thinking", role: "Monitors renewals, recurring charges and service visits",
    when: "07:58", preview: "3 renewals not invoiced. 1 draft prepared.",
    thread: [
      { kind: "stamp", text: "Today 07:58" },
      { kind: "agent", text: HEAD.renewing + " contracts renew in the next 60 days, " + eur(HEAD.renewalRevenue) + ". three are not invoiced." },
      { kind: "agent", text: "murphy retail and dunloe foods both have hikvision cloud fees we have already paid (€540 and €410). if we do not rebill, we absorb them. i have drafted kerry fire maintenance (€1,240) and queued the other two." },
      { kind: "user", text: "which one is highest priority" },
      { kind: "agent", text: "kerry fire maintenance at €1,240, renewing 24 november, and the draft is ready for caitlin to approve." },
    ] },
  { id: "jobcost", name: "Job Cost Agent", shape: "offset-pebble", tint: "#191c1f", state: "working", role: "Reads supplier invoices, labour and hours to forecast margin on every job",
    when: "09:07", preview: "ke-28492 matched to park hotel. margin 17%.",
    thread: [
      { kind: "stamp", text: "Today 09:07" },
      { kind: "agent", text: "ke-28492 from killarney electrical wholesale, €2,184, matched to park hotel electrical upgrade. materials, confidence 99%, no duplicate." },
      { kind: "agent", text: "park hotel: materials are 11% over budget at 72% complete. forecast margin has fallen from 24% to 17%. cause: cable price increase in the november delivery." },
      { kind: "user", text: "what can we do about it" },
      { kind: "agent", text: "review the remaining materials order, and send the €2,400 emergency lighting variation. together they recover most of the gap." },
    ] },
  { id: "compliance", name: "Compliance Agent", shape: "wide-eyed", tint: "#2b1b1e", state: "waiting", role: "Watches safety certificates and required documents against every employee and job",
    when: "08:15", preview: "kyle's safe pass expires in 12 days.",
    thread: [
      { kind: "stamp", text: "Today 08:15" },
      { kind: "agent", text: "two records are inside the 45 day window: kyle murphy safe pass (12 days) and liam o'sullivan manual handling (31 days)." },
      { kind: "agent", text: "caitlin has been notified and a renewal task exists for each. kyle is on leave from 12 to 20 november, so the course has to be booked before thursday." },
      { kind: "user", text: "who else is close" },
      { kind: "agent", text: "darragh's PSA licence expires 31 december, 51 days out. i will flag it on 16 november." },
    ] },
  { id: "knowledge", name: "Site Knowledge Agent", shape: "tall-unit", tint: "#16241f", state: "working", role: "Answers technician questions from manuals, installed systems and job history",
    when: "08:51", preview: "3 voice notes turned into job updates.",
    thread: [
      { kind: "stamp", text: "Today 08:51" },
      { kind: "agent", text: "three site voice notes processed this morning. kyle's note at kerry medical moved progress 44% to 48% and created a task to chase the landlord for the key." },
      { kind: "user", text: "how do i reset the panel at murphy retail" },
      { kind: "agent", text: "that is the kentec syncro AS installed under J-2652. the reset steps are in knowledge, procedures, fire panel service procedure. the qr code on the panel opens the same page. follow the manufacturer's documentation." },
    ] },
];

/* ---------- dashboard ---------- */
const sumInv = (f) => INVOICES.filter(f).reduce((a, i) => a + i.amount, 0);
const rev30 = sumInv((i) => dayDiff(i.issued) >= -30);
const cash30 = sumInv((i) => i.paid && dayDiff(i.paid) >= -30);
export const REVENUE_MONTHS = [["Dec", 74], ["Jan", 81], ["Feb", 88], ["Mar", 92], ["Apr", 97], ["May", 101], ["Jun", 94], ["Jul", 89], ["Aug", 102], ["Sep", 108],
  ["Oct", Math.round(sumInv((i) => i.issued.slice(0, 7) === "2026-10") / 100) / 10]];
const MARGIN_DRIFT = (() => { const v = JOBS.reduce((a, j) => a + j.value, 0); const o = JOBS.reduce((a, j) => a + j.value * j.origMargin, 0) / v; return "−" + ((o - HEAD.avgMargin) * 100).toFixed(1) + "pt"; })();
export const KPI_DEFS = {
  revenue: { label: "Invoiced, 30 days", value: eur(rev30), delta: "+8.4%", dir: "up", hint: "vs previous 30 days", hero: true },
  margin: { label: "Forecast gross margin", value: (HEAD.avgMargin * 100).toFixed(1) + "%", delta: MARGIN_DRIFT, dir: "down", hint: "active jobs, vs quote" },
  active: { label: "Active job value", value: eur(HEAD.activeValue), delta: "7 jobs", dir: "up", hint: "contract value in progress" },
  ready: { label: "Ready to invoice", value: eur(HEAD.ready), delta: "3 drafts", dir: "down", hint: "not yet billed" },
  debtors: { label: "Outstanding debtors", value: eur(HEAD.outstanding), delta: eur(HEAD.overdue) + " overdue", dir: "down", hint: "RedBook ledger" },
  utilisation: { label: "Field utilisation", value: Math.round(HEAD.util * 100) + "%", delta: "this week", dir: "up", hint: "job days over available days" },
  risk: { label: "Jobs at risk", value: String(HEAD.risk), delta: "margin", dir: "down", hint: "forecast under quote" },
  renewals: { label: "Renewals, 60 days", value: eur(HEAD.renewalRevenue), delta: HEAD.unbilled + " not invoiced", dir: "down", hint: HEAD.renewing + " contracts" },
  cash: { label: "Cash collected, 30 days", value: eur(cash30), delta: "+5.1%", dir: "up", hint: "RedBook receipts" },
};
const ageSplit = AGE_BUCKETS.map((b, i) => [b, invoiceOutstanding().filter((x) => ageBucket(x) === i).reduce((a, x) => a + x.amount, 0)]);
const cap = ["w0", "w1", "w2", "w3"].map((w) => weekCapacity(w));
const finRows = JOBS.map((j) => ({ j, f: jobFin(j) }));
export const ASPECT_DEFS = [
  { id: "executive", label: "Executive", color: "var(--accent)", owner: "SEAMUS CURRAN", description: "Revenue, margin, work in progress and cash, on one page.",
    kind: "columns", chartTitle: "Invoiced by month", chartUnit: "€K",
    chart: REVENUE_MONTHS.map((m) => [m[0], m[1], "€" + m[1] + "k"]),
    splitTitle: "Where invoicing comes from", split: [["Project work", "€" + Math.round(rev30 * 0.71 / 100) / 10 + "k", "71%", 1], ["Service contracts", "€" + Math.round(rev30 * 0.16 / 100) / 10 + "k", "16%", 0], ["Callouts and small works", "€" + Math.round(rev30 * 0.13 / 100) / 10 + "k", "13%", 0]],
    tableCols: ["Customer", "Invoiced, 30 days", "Outstanding", "Active jobs"],
    table: ["c-park", "c-murphy", "c-golf", "c-kcu"].map((id) => [customerById(id).name, eur(sumInv((i) => i.customerId === id && dayDiff(i.issued) >= -30)), eur(invoiceOutstanding().filter((i) => i.customerId === id).reduce((a, i) => a + i.amount, 0)), String(JOBS.filter((j) => j.customerId === id).length)]),
    metrics: [["Invoiced, 30 days", eur(rev30), "+8.4%", "up", "vs previous", [.4, .55, .5, .62, .6, .7, .66, .8, 1]],
      ["Forecast margin", (HEAD.avgMargin * 100).toFixed(1) + "%", MARGIN_DRIFT, "down", "vs quote", [.8, .78, .76, .74, .7, .68, .66, .64, .62]],
      ["Pipeline", eur(HEAD.pipeline), eur(HEAD.weighted) + " weighted", "up", "2027 quotes", [.3, .4, .44, .5, .56, .66, .7, .8, .9]],
      ["Utilisation", Math.round(HEAD.util * 100) + "%", "this week", "up", "field staff", [.7, .72, .74, .76, .8, .82, .84, .9, .94]]] },
  { id: "jobs", label: "Jobs", color: "#9fd6f0", owner: "SEAMUS CURRAN", description: "Progress is operational. Profitability is financial. This is where they meet.",
    kind: "columns", chartTitle: "Forecast margin by active job", chartUnit: "%",
    chart: finRows.map(({ j, f }) => [j.id.slice(2), Math.round(f.fcMargin * 1000) / 10, (f.fcMargin * 100).toFixed(1) + "%"]),
    splitTitle: "Value by status", split: [["on-track", "On track"], ["margin-risk", "Margin risk"], ["constraint", "Access constraint"], ["invoice-required", "Invoice required"]].map((st, i) => { const v = JOBS.filter((j) => j.status === st[0]).reduce((a, j) => a + j.value, 0); return [st[1], eur(v), Math.round(v / HEAD.activeValue * 100) + "%", i === 0 ? 1 : 0]; }),
    tableCols: ["Job", "Progress", "Quote", "Forecast margin"],
    table: finRows.map(({ j, f }) => [j.name, j.progress + "%", eur(j.value), (f.fcMargin * 100).toFixed(1) + "%"]),
    metrics: [["Active jobs", String(HEAD.jobs), eur(HEAD.activeValue), "up", "live value", [.4, .5, .5, .6, .6, .7, .8, .8, .9]],
      ["Jobs at risk", String(HEAD.risk), "of 7", "down", "forecast under quote", [.2, .3, .3, .4, .5, .5, .6, .7, .8]],
      ["Hours this week", String(weekHours()), "scheduled", "up", "all jobs", [.5, .6, .6, .7, .7, .8, .8, .9, 1]],
      ["Avg progress", Math.round(JOBS.reduce((a, j) => a + j.progress, 0) / JOBS.length) + "%", "7 jobs", "up", "weighted", [.4, .46, .5, .55, .6, .62, .66, .7, .74]]] },
  { id: "finance", label: "Finance", color: "#7fd8a4", owner: "CAITLIN CURRAN", description: "Cash in, debt by age and what is waiting to be billed. RedBook stays the ledger.",
    kind: "area", chartTitle: "Cash collected by month", chartUnit: "€K",
    chart: [["Dec", 70], ["Jan", 78], ["Feb", 84], ["Mar", 88], ["Apr", 93], ["May", 99], ["Jun", 90], ["Jul", 87], ["Aug", 98], ["Sep", 104], ["Oct", 96], ["Nov", 17.4]].map((m) => [m[0], m[1], "€" + m[1] + "k"]),
    splitTitle: "Debt by age", split: ageSplit.map((a, i) => [a[0], eur(a[1]), Math.round(a[1] / HEAD.outstanding * 100) + "%", i === 0 ? 1 : 0]),
    tableCols: ["Customer", "Outstanding", "Oldest", "Chasing"],
    table: ["c-park", "c-kmc", "c-atlantic", "c-hennessy", "c-cnh"].map((id) => { const rows = invoiceOutstanding().filter((i) => i.customerId === id); return [customerById(id).name, eur(rows.reduce((a, i) => a + i.amount, 0)), Math.max(...rows.map((i) => daysOverdue(i))) ? Math.max(...rows.map((i) => daysOverdue(i))) + " days over" : "Not due", rows.some((i) => i.chases.length) ? "Reminders sent" : "Not yet due"]; }),
    metrics: [["Outstanding", eur(HEAD.outstanding), eur(HEAD.overdue) + " overdue", "down", "RedBook", [.5, .5, .6, .55, .6, .7, .75, .8, .85]],
      ["Ready to invoice", eur(HEAD.ready), "3 drafts", "down", "unbilled", [.3, .4, .4, .5, .5, .6, .7, .8, .9]],
      ["Collected, Nov", eur(HEAD.collected), "10 days", "up", "month to date", [.2, .3, .35, .4, .5, .6, .65, .7, .8]],
      ["Supplier spend, Nov", eur(HEAD.supplierSpend), "matched", "up", "to jobs", [.3, .4, .5, .5, .6, .6, .7, .7, .8]]] },
  { id: "workforce", label: "Workforce", color: "#e6c78a", owner: "SEAMUS CURRAN", description: "Who is on which job, who is away, and how full the next four weeks are.",
    kind: "stacked", legend: ["On jobs", "Leave and training", "Office and admin"], stacked: cap.map((c, i) => [["This week", "Next week", "23 Nov", "30 Nov"][i], [c.jobs, c.leave + c.training + c.pending, c.office]]),
    chartTitle: "Field staff days by week", chartUnit: "DAYS",
    chart: cap.map((c, i) => [["This week", "Next week", "23 Nov", "30 Nov"][i], Math.round(c.util * 100), Math.round(c.util * 100) + "%"]),
    splitTitle: "Skills depth", split: [["Fire Systems level 2+", "3 people", "33%", 1], ["EV Charging level 2+", "4 people", "44%", 0], ["Emergency Lighting level 2+", "5 people", "56%", 0]],
    tableCols: ["Employee", "This week", "Safe Pass", "Skills"],
    table: FIELD_STAFF.slice(0, 5).map((s) => [s.name, "Scheduled", CERTS.find((c) => c.staffId === s.id && c.cert === "Safe Pass") ? fmtDate(CERTS.find((c) => c.staffId === s.id && c.cert === "Safe Pass").expires) : "None", SKILLS.filter((k) => s.skills[k] >= 2).length + " at level 2+"]),
    metrics: [["Utilisation", Math.round(HEAD.util * 100) + "%", "this week", "up", "job days", [.7, .74, .76, .8, .84, .86, .9, .92, .94]],
      ["On leave, 4 weeks", String(cap.reduce((a, c) => a + c.leave, 0)), "days", "flat", "approved", [.2, .2, .3, .3, .5, .6, .5, .4, .4]],
      ["Compliance expiring", String(HEAD.expiring), "45 day window", "down", "Kyle, Liam", [.2, .2, .2, .3, .3, .4, .5, .7, .9]],
      ["Pending leave", "1", "Seán Moriarty", "down", "overlaps Kyle", [.1, .1, .1, .1, .1, .2, .3, .5, .6]]] },
  { id: "service", label: "Service Revenue", color: "#c8b4f0", owner: "CAITLIN CURRAN", description: "Recurring contracts, renewals and the platform costs that must be rebilled.",
    kind: "columns", chartTitle: "Renewals by month", chartUnit: "€",
    chart: (() => { const by = {}; CONTRACTS.forEach((c) => { const k = c.renew.slice(0, 7); by[k] = (by[k] || 0) + c.billing; }); const names = { "2026-11": "Nov", "2026-12": "Dec", "2027-01": "Jan", "2027-02": "Feb", "2027-03": "Mar", "2027-04": "Apr" }; return Object.keys(names).map((k) => [names[k], Math.round((by[k] || 0)), eur(by[k] || 0)]); })(),
    splitTitle: "Annual recurring revenue", split: [["Maintenance and testing", eur(HEAD.arr * 0.62), "62%", 1], ["Security and cloud", eur(HEAD.arr * 0.24), "24%", 0], ["Monitoring and support", eur(HEAD.arr * 0.14), "14%", 0]],
    tableCols: ["Contract", "Renews", "Billing", "Status"],
    table: renewingSoon().slice(0, 5).map((c) => [c.customer, fmtDate(c.renew), eur(c.billing), c.invoice]),
    metrics: [["Active contracts", String(HEAD.activeContracts), "", "up", "recurring", [.5, .52, .56, .6, .64, .7, .74, .8, .86]],
      ["ARR", eur(HEAD.arr), "", "up", "annual", [.5, .55, .6, .62, .66, .7, .74, .8, .86]],
      ["Renewals, 60 days", eur(HEAD.renewalRevenue), HEAD.unbilled + " not invoiced", "down", HEAD.renewing + " contracts", [.3, .4, .5, .5, .6, .7, .8, .85, .9]],
      ["Platform margin", "37%", "cloud rebills", "up", "after supplier fees", [.5, .5, .55, .55, .6, .6, .62, .64, .66]]] },
];
export const FILTER_GROUPS = [
  { title: "AREA", items: ["Executive", "Jobs", "Finance", "Workforce", "Service Revenue"] },
  { title: "SPINE", items: ["Customer", "Site", "Job", "Employee", "Contract"] },
  { title: "TIME", items: ["This week", "This month", "This quarter", "Year to date"] },
];

/* ---------- work: tasks, approvals, workflows, exceptions ---------- */
const initials = (id) => (id === "seamus" ? "SC" : id === "caitlin" ? "CC" : staffById(id).initials);
export const WORK_SECTIONS = [
  { id: "tasks", label: "Tasks", blurb: "Everything assigned to you or your team, from agents, voice notes and the office.", views: ["All tasks", "Due tasks", "Review", "Done"], filters: ["Due date", "Any status", "Anyone", "Any due date"] },
  { id: "approvals", label: "Approvals", blurb: "Draft invoices, renewals, variations and leave. Every decision is written as the person who made it.", views: ["Awaiting you", "Awaiting others", "Decided"], filters: ["Raised date", "Any value", "Anyone"] },
  { id: "workflows", label: "Workflows", blurb: "What the agents run on their own, and the single step where a person comes in.", views: [], filters: [] },
  { id: "schedules", label: "Exceptions", blurb: "Only what needs a person. Pulse does the routine 80% and sends the unusual 20% to the right desk.", views: [], filters: [] },
];
export const WORK_TASKS = CT_TASKS.map((t) => ({ id: "w" + t.id.slice(2), title: t.title, status: t.status, priority: t.priority, who: initials(t.owner), due: t.due, late: false, client: t.link,
  day: t.due, mins: t.source, view: t.status === "Review" ? "Review" : t.status === "Done" ? "Done" : "Due tasks", done: t.status === "Done" }));
export const OPS_FILTERS = [["all", "All"], ["routine", "Agent routines"], ["automation", "Automations"], ["report", "Scheduled reports"], ["approval", "Needs approval"], ["failed", "Failed"]];
export const OPS_DEFS = CT_WORKFLOWS.map((w, i) => ({ id: "o" + (i + 1), name: w.name, kind: ["automation", "automation", "automation", "automation", "routine", "routine", "report", "automation"][i], owner: w.agent, ownerKind: "agent",
  initials: w.agent.split(" ").map((x) => x[0]).join("").slice(0, 2), trigger: w.trigger, triggerKind: /weekday|hourly/i.test(w.trigger) ? "schedule" : "event", next: "Event based", last: w.result,
  status: w.humanStep !== "None" && w.humanStep !== "Exceptions only" ? "approval" : "healthy", rate: Math.round(w.autoRate * 100), on: true,
  what: w.name + ". " + w.trigger + ". " + w.steps.join(", then ").toLowerCase() + ".", why: "A person only steps in at: " + w.humanStep.toLowerCase() + ".",
  saved: Math.round(w.runs / 6) + " hours a month", steps: w.steps.map((s) => [s.split(" ")[0], s, /approval|calls|booking/i.test(s) ? "gate" : undefined].filter(Boolean)),
  runs: [[w.last, "9s", "ok", w.result, "€0.01"]] }));
export const WORKFLOWS = [];
export const SCHEDULES = [];
export const WIDGET_DEFS = [["kpi", "Business snapshot"], ["inbox", "Needs attention"], ["work", "My work"], ["activity", "AI handled"], ["visits", "On site today"]];
export const WORK_WIDGETS = [
  { id: "queue", label: "My queue", value: "7", hint: "assigned to you", icon: "work", queue: "mine" },
  { id: "late", label: "Needs a decision", value: String(HEAD.approvalsOpen), hint: "approvals waiting", icon: "health", queue: "overdue" },
  { id: "unassigned", label: "Exceptions", value: String(CT_EXCEPTIONS.length), hint: "need a person", icon: "teams", queue: "unassigned" },
  { id: "week", label: "Next 7 days", value: "5", hint: "due this week", icon: "visits", queue: "upcoming" },
];
export const SKILL_DEFS = [["Search jobs", "read"], ["Read invoices", "read"], ["Read supplier costs", "read"], ["Read schedule", "read"], ["Check certificates", "read"], ["Draft invoice", "write"], ["Create task", "write"], ["Update job", "write"], ["Schedule crew", "write"], ["Send reminder", "external"], ["Post to RedBook", "external"], ["Message technician", "external"]];
export const CONTEXT_DEFS = [["Customers", "records", "Accounts, sites, contacts"], ["Jobs", "work", "Progress, crews, costs"], ["Installed systems", "records", "Panels, CCTV, serials"], ["Employees", "records", "Skills and certificates"], ["Schedule", "work", "Planner and leave"], ["Supplier invoices", "money", "Matched and exceptions"], ["Customer invoices", "money", "Drafts, sent, paid"], ["Contracts", "money", "Renewals and cloud costs"], ["Knowledge", "records", "Manuals and procedures"], ["Activity log", "system", "Every event"]];
export const CONTEXT_SOURCES = CONTEXT_DEFS.map((c) => c[0]);
export const TRAIN_PHASES = [["Reading the company ontology", "8,420 files, 312 jobs"], ["Learning how Joe Curran Electrical words things", "customer, job, site, system"], ["Reading the quotes, manuals and procedures", "214 technical documents"], ["Writing its own system prompt", "980 tokens"]];
export const BRIEF_QUESTIONS = [
  { title: "What should it cover?", sub: "Pick as many as you like.", options: [["Jobs", "Progress, margin and constraints"], ["Money", "Ready to invoice and overdue"], ["People", "Leave and certificates"], ["Contracts", "Renewals and service visits"], ["Something else", "Tell me in the next message"]] },
  { title: "When should it land?", sub: "One is enough to start.", options: [["Every morning 07:00", "Before the vans leave"], ["Weekdays 08:00", "Monday to Friday only"], ["Only when something changes", "Event driven, no noise"], ["On demand", "When you ask for it"]] },
];
export const ORGS = CUSTOMERS.map((c) => [c.name, "Customer", eur(invoiceOutstanding().filter((i) => i.customerId === c.id).reduce((a, i) => a + i.amount, 0)), "30 days", "active"]);
export const TEAMS = ROLES.map((r) => [r.label, "", r.who, r.perms.join(", ") || "assigned jobs only"]);
export const LOCATIONS = [["Waterville office", "Toor, Waterville, Co. Kerry", "9 staff", "active"]];

/* extra sources shown in the command palette and notifications */
export const NOTIFICATIONS = [
  { dot: RED, text: "Kerry Medical Centre: access constraint raised by Darragh at 08:42", event: "job.constraint.raised", channel: "Inbox · WhatsApp", meta: "08:42" },
  { dot: LIME, text: "Invoice Agent prepared €6,850 for Murphy Retail Fit-Out. Needs your approval", event: "invoice.draft.created", channel: "Inbox", meta: "09:14" },
  { dot: AMBER, text: "Park Hotel forecast margin fell from 24% to 17%", event: "job.margin.changed", channel: "Inbox", meta: "09:07" },
  { dot: AMBER, text: "Kyle Murphy Safe Pass expires in 12 days", event: "compliance.expiry.flagged", channel: "Inbox", meta: "08:15" },
  { dot: NEUTRAL, text: "Contracts Agent found 3 uninvoiced renewals, €2,740", event: "contract.renewal.flagged", channel: "Inbox", meta: "07:58" },
  { dot: NEUTRAL, text: "Your morning briefing is ready", event: "core.briefing.sent", channel: "WhatsApp", meta: "07:00" },
];

/* ---------- approvals, with the work visible before the yes ---------- */
const money2 = (n) => "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const invTable = (title, sub, lines, risk, thinking) => {
  const net = lines.reduce((a, l) => a + l[1], 0), vat = Math.round(net * 0.135 * 100) / 100;
  return { kind: "table", label: "DRAFT INVOICE", viewLabel: "View draft", headline: title, sub, cols: ["Line", "Basis", "Amount"], align: ["left", "left", "right"],
    rows: lines.map((l) => [l[0], l[2] || "Quote", money2(l[1])]), totals: [["Net", money2(net)], ["VAT 13.5%", money2(vat)], ["Payable", money2(net + vat)]],
    thinking, tools: [["jobs.read", "read"], ["timesheets.read", "read"], ["redbook.invoice.queue", "external"]], risk };
};
export const APPROVALS_DEF = [
  { id: "a1", title: "Draft invoice, Murphy Retail Fit-Out €6,850", subject: "Murphy Retail Group · prepared by Invoice Agent", age: "09:14", status: "awaiting you",
    steps: [{ who: "Invoice Agent", state: "prepared 09:14", dot: GREEN }, { who: "Seamus Curran", state: "pending", dot: AMBER }],
    work: invTable("Murphy Retail Fit-Out, balance", "Quote Q-2026-097, €18,600. €11,750 already invoiced and paid.", [["Fire alarm installation, commissioning and certification", 3900, "Quote, 143 hours"], ["Emergency lighting, final fix and test", 1850, "Quote"], ["Snagging and handover documentation", 1100, "Quote"]],
      "Job complete and handover signed on Monday. No variations. Final margin is 24%, original quote assumed 26%.",
      [["Detected completion", "Job at 100%, handover sheet signed 9 Nov"], ["Matched the quote", "Balance of €18,600 less €11,750 invoiced"], ["Checked costs", "4 supplier invoices, 143 hours, no unmatched costs"], ["Routed for approval", "Over €5,000 so it needs Seamus"]]) },
  { id: "a2", title: "Contract renewal, Kerry Fire Maintenance €1,240", subject: "Kerry Medical Centre · prepared by Contracts Agent", age: "08:02", status: "awaiting others",
    steps: [{ who: "Contracts Agent", state: "prepared 08:02", dot: GREEN }, { who: "Caitlin Curran", state: "pending", dot: AMBER }],
    work: invTable("Kerry Fire Maintenance, annual renewal", "Renews 24 Nov 2026. Same price as last year.", [["Annual fire alarm service and maintenance agreement, 2 visits", 1240, "Contract K-01"]],
      "The panel is being replaced under J-2658, so the first visit on the new panel will be the commissioning check.", [["Found the renewal", "Contract K-01 renews in 14 days"], ["Checked price", "Unchanged since 2025"], ["Routed for approval", "Contract renewals go to Caitlin"]]) },
  { id: "a3", title: "Supplier invoice MCL-90402 unmatched €3,140", subject: "Munster Cable & Lighting · low confidence", age: "07:21", status: "awaiting others",
    steps: [{ who: "Supplier Inbox", state: "received 07:21", dot: GREEN }, { who: "Caitlin Curran", state: "pending", dot: AMBER }],
    work: { kind: "diff", label: "SUPPLIER INVOICE", viewLabel: "View match", headline: "MCL-90402 · Munster Cable & Lighting", sub: "Three fields are waiting for a decision",
      diff: [["Job", "Unmatched", "Park Hotel Electrical Upgrade"], ["Category", "Materials", "Materials"], ["Cost to job", "€0", "€3,140"], ["Confidence", "62%", "Confirmed by Caitlin"]],
      thinking: [["Read the invoice", "Reference reads 'Kenmare hotel'"], ["Matched candidates", "Park Hotel 62%, Atlantic Lodge 21%"], ["Checked duplicates", "None found"]], tools: [["supplier.invoice.read", "read"], ["job.costs.update", "write"]], risk: "A wrong match would move margin on the wrong job." } },
  { id: "a4", title: "Job variation, Park Hotel level 3 lighting €2,400", subject: "Park Hotel Kenmare · drafted by Job Cost Agent", age: "Yesterday", status: "awaiting you",
    steps: [{ who: "Job Cost Agent", state: "drafted", dot: GREEN }, { who: "Seamus Curran", state: "pending", dot: AMBER }],
    work: { kind: "doc", label: "VARIATION V-02", viewLabel: "Read variation", headline: "Additional emergency lighting, level 3 corridor", sub: "Prepared for Maeve Sheehy, Park Hotel Kenmare",
      doc: [["Scope", "Supply and fit 14 additional self-test emergency luminaires on the level 3 corridor and connect to the existing addressable loop, as requested on site on 5 November."], ["Why now", "Second fix on level 3 is complete. Adding the fittings now avoids a second visit and a second outage."], ["Commercials", "€2,400 fixed price, invoiced with the next interim. Does not change the programme."], ["Margin effect", "Recovers most of the 7 point margin drop on this job. Forecast margin goes from 17% to about 20%."]],
      totals: [["Materials", "€1,540.00"], ["Labour", "€640.00"], ["Margin", "€220.00"], ["Total", "€2,400.00"]],
      thinking: [["Read the job", "Materials 11% over budget at 72% complete"], ["Priced from the supplier list", "Fittings at the November Munster price"], ["Checked programme", "No change to completion"]], tools: [["jobs.read", "read"], ["email.send", "external"]], risk: "The client has not agreed in writing. Send only after Seamus is happy." } },
  { id: "a5", title: "Leave request, Seán Moriarty 17 to 19 Nov", subject: "Overlaps Kyle Murphy leave", age: "Sun", status: "awaiting others",
    steps: [{ who: "Seán Moriarty", state: "requested", dot: GREEN }, { who: "Caitlin Curran", state: "pending", dot: AMBER }],
    work: { kind: "diff", label: "LEAVE", viewLabel: "View impact", headline: "Seán Moriarty, annual leave", sub: "Planner impact if approved",
      diff: [["Status", "Pending", "Approved"], ["Field staff off, 17 to 19 Nov", "1 of 8 (Kyle)", "2 of 8"], ["Dunloe EV commissioning", "Planned", "At risk"], ["Allowance left", "9 days", "6 days"]],
      thinking: [["Checked the planner", "Kyle is off 12 to 20 Nov"], ["Checked skills", "Seán is one of 4 with EV Charging level 2+"], ["Checked jobs", "Dunloe chargers 3 and 4 need EV skill"]], tools: [["schedule.read", "read"], ["leave.update", "write"]], risk: "Dunloe commissioning depends on ESB Networks. Approving may push it to December." } },
  { id: "a6", title: "Supplier invoice KE-28217 possible duplicate €3,960", subject: "Killarney Electrical Wholesale", age: "06:58", status: "awaiting others",
    steps: [{ who: "Supplier Inbox", state: "flagged 06:58", dot: GREEN }, { who: "Caitlin Curran", state: "pending", dot: AMBER }],
    work: { kind: "diff", label: "DUPLICATE CHECK", viewLabel: "View match", headline: "KE-28217, resent by supplier", sub: "Identical to an invoice already on Park Hotel",
      diff: [["Number", "KE-28217", "KE-28217"], ["Amount", "€3,960", "€3,960"], ["Received", "15 Oct", "10 Nov"], ["Action", "Matched", "Reject copy"]],
      thinking: [["Compared invoices", "Same supplier, number and amount"], ["Checked dates", "Original received 15 Oct"]], tools: [["supplier.invoice.read", "read"], ["supplier.invoice.reject", "write"]], risk: "None. Rejecting the copy keeps job cost correct." } },
  { id: "a7", title: "Contract renewal, Cahersiveen Intruder Monitoring €720", subject: "Iveragh Care Group · Contracts Agent", age: "Yesterday", status: "approved",
    steps: [{ who: "Contracts Agent", state: "prepared", dot: GREEN }, { who: "Caitlin Curran", state: "approved 09:02", dot: GREEN }],
    work: { kind: "diff", label: "RENEWAL", viewLabel: "View renewal", headline: "K-04, annual intruder monitoring", sub: "Applied on approval",
      diff: [["Status", "Draft", "Queued to RedBook"], ["Amount", "€720", "€720"]], thinking: [["Checked price", "Unchanged"]], tools: [["redbook.invoice.queue", "external"]], risk: "None." } },
];
export const TASKS_DEF = [
  { id: "t1", title: "Approve draft invoice for Murphy Retail Fit-Out (€6,850)", due: "09:30", who: "SC", queue: ["mine"], subject: "Murphy Retail Fit-Out", priority: "high" },
  { id: "t2", title: "Decide on Kerry Medical plant room delay", due: "Today", who: "SC", queue: ["mine"], subject: "Kerry Medical Centre", priority: "high" },
  { id: "t3", title: "Review Park Hotel materials and price the €2,400 variation", due: "Thu", who: "SC", queue: ["mine", "upcoming"], subject: "Park Hotel Electrical Upgrade", priority: "high" },
  { id: "t4", title: "Book Safe Pass renewal for Kyle Murphy", due: "Fri", who: "CC", queue: ["team", "upcoming"], subject: "Kyle Murphy", priority: "high" },
  { id: "t5", title: "Chase Atlantic Lodge for the PO number", due: "11:00", who: "CC", queue: ["team", "overdue"], subject: "Atlantic Lodge Hotel", priority: "normal", late: true },
  { id: "t6", title: "Confirm Friday outage with Park Hotel", due: "Wed", who: "EF", queue: ["team", "upcoming"], subject: "Park Hotel Kenmare", priority: "normal" },
  { id: "t7", title: "Approve Kerry Fire Maintenance renewal (€1,240)", due: "Today", who: "CC", queue: ["team"], subject: "Contract K-01", priority: "normal" },
  { id: "t8", title: "Decide Seán's leave request, 17 to 19 Nov", due: "Fri", who: "CC", queue: ["team", "upcoming"], subject: "Schedule", priority: "low" },
];
export const SITE_TODAY = JOBS.map((j) => ({ j, crew: staffOnSiteToday(j.id) })).filter((x) => x.crew.length).map((x) => ({
  title: x.j.name.split(" ").slice(0, 3).join(" ") + " · " + x.crew.map((s) => s.first).join(", "), when: siteById(x.j.siteId).town, dot: x.j.status === "constraint" ? AMBER : LIME,
}));
export const MINI_ACTIVITY = AI_HANDLED;
export const EXCEPTIONS = CT_EXCEPTIONS;
export const EXCEPTION_COUNT = CT_EXCEPTIONS.length;
