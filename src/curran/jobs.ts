/* Joe Curran Electrical Ltd: shared demo data, part 2.
   Jobs, job financials, customer invoices, supplier invoices, pipeline.
   Every figure here is the single source for Home, Jobs, Finance, Dashboard, Work. */
import { SkillKey, Level, CertKey, TODAY, dayDiff, sum, addDays } from "./core";

export type JobStatus = "margin-risk" | "invoice-required" | "constraint" | "on-track";
export const STATUS_LABEL: Record<JobStatus, string> = {
  "margin-risk": "Margin Risk", "invoice-required": "Invoice Required", constraint: "Access Constraint", "on-track": "On Track",
};
export interface Cost3 { labour: number; materials: number; other: number }
export interface Variation { id: string; desc: string; amount: number; status: "Draft" | "Sent to client" | "Approved" }
export interface Milestone { name: string; due: string; done: boolean; billPct?: number }
export interface JobUpdate { when: string; by: string; kind: "voice" | "photo" | "note" | "system" | "issue"; text: string; effect?: string }
export interface JobIssue { id: string; title: string; raised: string; by: string; owner: string; impact: string; severity: "high" | "medium" | "low"; open: boolean }
export interface JobDoc { name: string; kind: "Quote" | "Drawing" | "Spec" | "Certificate" | "RAMS" | "Handover" | "Email"; added: string; by: string }
export interface Job {
  id: string; name: string; customerId: string; siteId: string; type: string; lead: string; crew: string[];
  start: string; target: string; forecastEnd: string; progress: number; status: JobStatus; value: number;
  origMargin: number; budget: Cost3; forecast: Cost3; actual: Cost3; hours: { budget: number; used: number };
  variations: Variation[]; milestones: Milestone[]; updates: JobUpdate[]; issues: JobIssue[]; docs: JobDoc[];
  photos: number; requires: { skill: SkillKey; min: Level }[]; certs: CertKey[]; summary: string; nextMilestone: string;
  constraint?: { raisedAt: string; by: string; text: string; impact: string; owner: string };
  quoteRef: string; poRef?: string; contractIds?: string[];
}
const C = (labour: number, materials: number, other: number): Cost3 => ({ labour, materials, other });
export const LABOUR_RATE = 40; // blended internal cost per hour

export const JOBS: Job[] = [
  { id: "J-2641", name: "Park Hotel Electrical Upgrade", customerId: "c-park", siteId: "s-park", type: "Commercial electrical", lead: "eoin", crew: ["eoin", "kyle", "jack", "sean"],
    start: "2026-08-17", target: "2026-11-27", forecastEnd: "2026-11-27", progress: 72, status: "margin-risk", value: 54800, origMargin: 0.24,
    budget: C(19200, 20448, 2000), forecast: C(19600, 23884, 2000), actual: C(14040, 16343, 1300), hours: { budget: 480, used: 351 },
    variations: [{ id: "V-02", desc: "Additional emergency lighting, level 3 corridor", amount: 2400, status: "Draft" }],
    milestones: [{ name: "Deposit and design sign off", due: "2026-08-12", done: true, billPct: 20 }, { name: "First fix complete, levels 1 and 2", due: "2026-09-18", done: true, billPct: 22 }, { name: "Second fix, levels 1 to 3", due: "2026-10-27", done: true, billPct: 31 }, { name: "Distribution board changeover", due: "2026-11-20", done: false, billPct: 17 }, { name: "Testing, certification and handover", due: "2026-11-27", done: false, billPct: 10 }],
    updates: [
      { when: "2026-11-10 08:12", by: "eoin", kind: "voice", text: "Second fix on level 3 done. Distribution board changeover scheduled Friday night, hotel agreed a 4 hour outage.", effect: "Task created: confirm outage with Maeve" },
      { when: "2026-11-09 16:40", by: "jack", kind: "photo", text: "6 photos: level 3 corridor luminaires fitted.", effect: "Attached to job photos" },
      { when: "2026-11-06 11:05", by: "eoin", kind: "issue", text: "Cable price rise on the latest delivery. 3 core 6mm up 14% on the quote.", effect: "Flagged to Job Cost Agent" },
      { when: "2026-11-02 09:30", by: "system", kind: "system", text: "Supplier invoice MCL-90311 matched to this job (€4,812, materials).", effect: "Materials actual updated" },
    ],
    issues: [
      { id: "I-411", title: "Materials 11% over budget at 72% complete", raised: "2026-11-06", by: "Job Cost Agent", owner: "seamus", impact: "Forecast margin fell from 24% to 17%", severity: "high", open: true },
      { id: "I-412", title: "Distribution board changeover needs a hotel outage", raised: "2026-11-09", by: "eoin", owner: "eoin", impact: "Friday 13 Nov, 4 hour window", severity: "medium", open: true },
    ],
    docs: [{ name: "Quote Q-2026-114", kind: "Quote", added: "2026-07-22", by: "seamus" }, { name: "Level 3 distribution drawings rev C", kind: "Drawing", added: "2026-08-10", by: "eoin" }, { name: "Electrical spec, tender issue", kind: "Spec", added: "2026-07-18", by: "seamus" }, { name: "RAMS: live works, distribution board", kind: "RAMS", added: "2026-11-03", by: "eoin" }, { name: "Outage agreement, 13 Nov", kind: "Email", added: "2026-11-09", by: "caitlin" }],
    photos: 64, requires: [{ skill: "Commercial Electrical", min: 2 }], certs: ["Safe Pass", "Electrical Registration"], quoteRef: "Q-2026-114", poRef: "PO-PK-8841", contractIds: ["K-02"],
    summary: "Second fix is done through level 3. Progress is on schedule, but cable and containment prices rose after the quote and materials are running 11% over budget at 72% complete. Forecast margin has fallen from 24% to 17%. A €2,400 variation for extra level 3 emergency lighting is drafted and would recover most of the gap.",
    nextMilestone: "Distribution board changeover, Fri 13 Nov" },
  { id: "J-2652", name: "Murphy Retail Fit-Out", customerId: "c-murphy", siteId: "s-murphy", type: "Commercial electrical and fire", lead: "darragh", crew: ["darragh", "liam", "jack"],
    start: "2026-09-14", target: "2026-11-09", forecastEnd: "2026-11-09", progress: 100, status: "invoice-required", value: 18600, origMargin: 0.26,
    budget: C(5600, 7364, 800), forecast: C(5720, 7616, 800), actual: C(5720, 7616, 800), hours: { budget: 140, used: 143 },
    variations: [],
    milestones: [{ name: "Deposit", due: "2026-09-08", done: true, billPct: 20 }, { name: "First fix and fire alarm cabling", due: "2026-10-05", done: true, billPct: 43 }, { name: "Fire alarm commissioning", due: "2026-11-06", done: true, billPct: 20 }, { name: "Completion, snagging and handover", due: "2026-11-09", done: true, billPct: 17 }],
    updates: [
      { when: "2026-11-09 15:20", by: "darragh", kind: "voice", text: "Snagging cleared. Customer signed the handover sheet. Panel commissioned and certified.", effect: "Job set to 100%. Invoice Agent notified" },
      { when: "2026-11-09 15:42", by: "system", kind: "system", text: "Invoice Agent detected completion with €6,850 still unbilled.", effect: "Draft invoice assembled" },
      { when: "2026-11-06 14:00", by: "darragh", kind: "photo", text: "8 photos: Kentec panel, call points and sounder layout.", effect: "Attached to site record" },
    ],
    issues: [],
    docs: [{ name: "Quote Q-2026-097", kind: "Quote", added: "2026-08-24", by: "seamus" }, { name: "Fire alarm commissioning certificate", kind: "Certificate", added: "2026-11-06", by: "darragh" }, { name: "Handover pack and as-fitted drawings", kind: "Handover", added: "2026-11-09", by: "darragh" }, { name: "Cause and effect matrix", kind: "Spec", added: "2026-11-02", by: "darragh" }],
    photos: 41, requires: [{ skill: "Fire Systems", min: 1 }], certs: ["Safe Pass"], quoteRef: "Q-2026-097", contractIds: ["K-03"],
    summary: "Complete and handed over on Monday. The customer has signed off. €11,750 of the €18,600 contract has been invoiced and paid, leaving €6,850 unbilled. A draft invoice has been prepared from the quote, timesheets and supplier costs and is waiting for Seamus to approve. Final margin is 24%.",
    nextMilestone: "Invoice approval, due today" },
  { id: "J-2658", name: "Kerry Medical Centre Fire Upgrade", customerId: "c-kmc", siteId: "s-kmc", type: "Fire systems", lead: "darragh", crew: ["darragh", "kyle", "seamus"],
    start: "2026-10-12", target: "2026-11-27", forecastEnd: "2026-11-30", progress: 48, status: "constraint", value: 31400, origMargin: 0.25,
    budget: C(10400, 11950, 1200), forecast: C(11200, 12406, 1200), actual: C(5400, 5980, 400), hours: { budget: 260, used: 135 },
    variations: [],
    milestones: [{ name: "Deposit and survey", due: "2026-10-02", done: true, billPct: 20 }, { name: "Cabling and device first fix", due: "2026-11-06", done: true, billPct: 30 }, { name: "New panel fit in plant room", due: "2026-11-12", done: false, billPct: 25 }, { name: "Commissioning and certification", due: "2026-11-25", done: false, billPct: 25 }],
    updates: [
      { when: "2026-11-10 08:54", by: "kyle", kind: "photo", text: "4 photos: ceiling void cabling, first floor corridor.", effect: "Attached to job photos" },
      { when: "2026-11-10 08:51", by: "kyle", kind: "voice", text: "Corridor detectors fitted and tested. First floor done. Can't start the plant room without the key.", effect: "Progress 44% to 48%. Task: chase landlord for key" },
      { when: "2026-11-10 08:42", by: "darragh", kind: "issue", text: "Plant room access unavailable. Landlord's rep off site until Thursday.", effect: "Constraint raised. Owner: Seamus" },
    ],
    issues: [{ id: "I-418", title: "Plant room access unavailable", raised: "2026-11-10", by: "darragh", owner: "seamus", impact: "Possible 1 day completion delay", severity: "high", open: true }],
    docs: [{ name: "Quote Q-2026-103", kind: "Quote", added: "2026-09-02", by: "seamus" }, { name: "Existing zone chart", kind: "Drawing", added: "2026-09-18", by: "darragh" }, { name: "New panel schedule", kind: "Spec", added: "2026-10-01", by: "darragh" }, { name: "RAMS: occupied building works", kind: "RAMS", added: "2026-10-09", by: "darragh" }, { name: "Landlord access agreement", kind: "Email", added: "2026-10-06", by: "caitlin" }],
    photos: 27, requires: [{ skill: "Fire Systems", min: 1 }], certs: ["Safe Pass"], quoteRef: "Q-2026-103", contractIds: ["K-01"],
    constraint: { raisedAt: "08:42", by: "darragh", text: "Plant room access unavailable", impact: "Possible 1 day completion delay", owner: "seamus" },
    summary: "First floor corridor and device cabling is complete and progress moved from 44% to 48% this morning. The new panel cannot go into the plant room until the landlord's rep returns on Thursday. That could move completion by one day, from 27 Nov to 30 Nov, and adds labour that pulls forecast margin from 25% to 21%.",
    nextMilestone: "New panel fit in plant room, 12 Nov (blocked)" },
  { id: "J-2663", name: "Waterville Residence Automation", customerId: "c-hennessy", siteId: "s-hennessy", type: "Home automation", lead: "seamus", crew: ["seamus", "jack", "sean"],
    start: "2026-09-21", target: "2026-11-20", forecastEnd: "2026-11-20", progress: 85, status: "on-track", value: 12750, origMargin: 0.27,
    budget: C(3600, 5208, 500), forecast: C(3640, 5168, 500), actual: C(3100, 4430, 420), hours: { budget: 90, used: 77 },
    variations: [],
    milestones: [{ name: "Deposit", due: "2026-09-15", done: true, billPct: 20 }, { name: "First fix and KNX bus cabling", due: "2026-10-19", done: true, billPct: 62 }, { name: "Programming and scenes", due: "2026-11-13", done: false, billPct: 10 }, { name: "Commissioning and handover", due: "2026-11-20", done: false, billPct: 8 }],
    updates: [
      { when: "2026-11-09 17:05", by: "seamus", kind: "note", text: "Lighting scenes programmed for ground floor. Heating zones next.", effect: "Progress 82% to 85%" },
      { when: "2026-11-03 12:00", by: "seamus", kind: "note", text: "Fiona signed off the living room scene list.", effect: "Milestone evidence attached" },
    ],
    issues: [],
    docs: [{ name: "Quote Q-2026-092", kind: "Quote", added: "2026-08-14", by: "seamus" }, { name: "KNX ETS project file", kind: "Spec", added: "2026-10-20", by: "sean" }, { name: "Scene schedule, signed", kind: "Spec", added: "2026-11-03", by: "seamus" }],
    photos: 19, requires: [{ skill: "Networking", min: 1 }], certs: ["Safe Pass"], quoteRef: "Q-2026-092",
    summary: "Programming is moving well and the job is tracking to quote. Forecast margin is 27%, matching the original. The next invoice milestone is commissioning and handover.",
    nextMilestone: "Heating zone programming, Fri 13 Nov" },
  { id: "J-2667", name: "Atlantic Lodge Fire Alarm and Emergency Lighting", customerId: "c-atlantic", siteId: "s-atl", type: "Fire systems", lead: "liam", crew: ["liam", "kyle", "ciara"],
    start: "2026-10-05", target: "2026-12-11", forecastEnd: "2026-12-11", progress: 55, status: "on-track", value: 28900, origMargin: 0.22,
    budget: C(9400, 11742, 1400), forecast: C(9400, 11742, 1400), actual: C(5170, 6450, 770), hours: { budget: 235, used: 129 },
    variations: [],
    milestones: [{ name: "Deposit", due: "2026-07-31", done: true, billPct: 20 }, { name: "Materials order and first fix", due: "2026-08-20", done: true, billPct: 39 }, { name: "Second fix and loop testing", due: "2026-11-20", done: false, billPct: 25 }, { name: "Commissioning and certification", due: "2026-12-11", done: false, billPct: 16 }],
    updates: [{ when: "2026-11-09 14:10", by: "liam", kind: "note", text: "Loop 2 and loop 3 devices fitted. Loop testing starts Thursday.", effect: "Progress 52% to 55%" }, { when: "2026-11-06 10:00", by: "caitlin", kind: "note", text: "Hotel still has not issued PO for the stage 1 invoice. Chased again.", effect: "Collections Agent follow up scheduled" }],
    issues: [{ id: "I-402", title: "Stage 1 invoice held pending PO from head office", raised: "2026-10-01", by: "caitlin", owner: "caitlin", impact: "€11,200 overdue 52 days", severity: "medium", open: true }],
    docs: [{ name: "Quote Q-2026-081", kind: "Quote", added: "2026-07-10", by: "seamus" }, { name: "Fire strategy drawings", kind: "Drawing", added: "2026-07-28", by: "liam" }, { name: "RAMS: occupied hotel", kind: "RAMS", added: "2026-10-02", by: "liam" }],
    photos: 33, requires: [{ skill: "Fire Systems", min: 1 }, { skill: "Emergency Lighting", min: 1 }], certs: ["Safe Pass"], quoteRef: "Q-2026-081",
    summary: "Second fix is progressing on both fire alarm and emergency lighting. Cost is tracking to budget and forecast margin remains at 22%. The stage 1 invoice is still unpaid because the customer has not issued a PO number.",
    nextMilestone: "Loop testing, Thu 12 Nov" },
  { id: "J-2671", name: "Cahersiveen Nursing Home Security and Data", customerId: "c-cnh", siteId: "s-cnh", type: "Security and data", lead: "darragh", crew: ["darragh", "ciara", "sean"],
    start: "2026-09-28", target: "2026-12-04", forecastEnd: "2026-12-07", progress: 60, status: "margin-risk", value: 21350, origMargin: 0.23,
    budget: C(6800, 8700, 940), forecast: C(7500, 8853, 940), actual: C(4380, 5100, 560), hours: { budget: 170, used: 110 },
    variations: [],
    milestones: [{ name: "Deposit", due: "2026-08-10", done: true, billPct: 20 }, { name: "CCTV upgrade and cabling first floor", due: "2026-09-15", done: true, billPct: 40 }, { name: "Second floor cabling and terminations", due: "2026-11-27", done: false, billPct: 25 }, { name: "Nurse call integration and handover", due: "2026-12-04", done: false, billPct: 15 }],
    updates: [{ when: "2026-11-05 13:30", by: "ciara", kind: "note", text: "Ceiling voids on first floor took longer than planned. Residents' rooms only accessible 10:00 to 15:00.", effect: "Labour forecast raised" }],
    issues: [{ id: "I-409", title: "Labour 8% over budget: restricted access windows", raised: "2026-11-05", by: "Job Cost Agent", owner: "seamus", impact: "Forecast margin 23% to 19%", severity: "medium", open: true }],
    docs: [{ name: "Quote Q-2026-088", kind: "Quote", added: "2026-07-30", by: "seamus" }, { name: "Cabling schedule", kind: "Drawing", added: "2026-09-22", by: "ciara" }, { name: "Infection control method statement", kind: "RAMS", added: "2026-09-25", by: "darragh" }],
    photos: 22, requires: [{ skill: "Networking", min: 1 }], certs: ["Safe Pass"], quoteRef: "Q-2026-088", contractIds: ["K-04"],
    summary: "Work is slowed by restricted access windows on residents' floors. Labour is running 8% over budget and forecast margin has slipped from 23% to 19%. Materials are tracking to budget.",
    nextMilestone: "Second floor terminations, 27 Nov" },
  { id: "J-2674", name: "Dunloe Foods Power, CCTV and EV Chargers", customerId: "c-dunloe", siteId: "s-dunloe", type: "Commercial electrical and EV", lead: "sean", crew: ["sean", "liam"],
    start: "2026-10-26", target: "2026-12-18", forecastEnd: "2026-12-18", progress: 30, status: "on-track", value: 16800, origMargin: 0.21,
    budget: C(4800, 7672, 800), forecast: C(4800, 7672, 800), actual: C(1360, 2300, 150), hours: { budget: 120, used: 34 },
    variations: [],
    milestones: [{ name: "Stage 1: materials order", due: "2026-10-29", done: true, billPct: 29 }, { name: "Refrigeration supplies and CCTV", due: "2026-11-27", done: false, billPct: 40 }, { name: "EV chargers commissioned", due: "2026-12-18", done: false, billPct: 31 }],
    updates: [{ when: "2026-11-04 16:00", by: "sean", kind: "note", text: "Chargers 1 and 2 mounted. Waiting for ESB Networks connection date.", effect: "Task created: chase ESB Networks" }],
    issues: [{ id: "I-415", title: "ESB Networks connection date not confirmed", raised: "2026-11-04", by: "sean", owner: "sean", impact: "Could affect charger commissioning in December", severity: "low", open: true }],
    docs: [{ name: "Quote Q-2026-120", kind: "Quote", added: "2026-09-30", by: "seamus" }, { name: "Single line diagram", kind: "Drawing", added: "2026-10-20", by: "sean" }],
    photos: 9, requires: [{ skill: "EV Charging", min: 2 }], certs: ["Safe Pass", "Electrical Registration"], quoteRef: "Q-2026-120", contractIds: ["K-06"],
    summary: "Early stage. Cost is tracking to budget and forecast margin is 21%. Chargers 1 and 2 are mounted and commissioning depends on the ESB Networks connection date.",
    nextMilestone: "Refrigeration supplies and CCTV, 27 Nov" },
];
export const jobById = (id: string) => JOBS.find((j) => j.id === id)!;

/* ---------- job financials, all derived ---------- */
const tot = (c: Cost3) => c.labour + c.materials + c.other;
export interface JobFin {
  contract: number; approvedVar: number; value: number; invoiced: number; collected: number; unbilled: number;
  budgetCost: number; actualCost: number; forecastCost: number; earned: number; gpToDate: number; gpToDatePct: number;
  origMargin: number; fcMargin: number; fcGp: number; marginDrift: number; matOverPct: number; labOverPct: number;
  hoursPct: number; atRisk: boolean; costToComplete: number;
}
export function jobFin(j: Job): JobFin {
  const approvedVar = sum(j.variations.filter((v) => v.status === "Approved").map((v) => v.amount));
  const value = j.value + approvedVar;
  const inv = INVOICES.filter((i) => i.jobId === j.id);
  const invoiced = sum(inv.map((i) => i.amount));
  const collected = sum(inv.filter((i) => i.paid).map((i) => i.amount));
  const actualCost = tot(j.actual), forecastCost = tot(j.forecast), budgetCost = tot(j.budget);
  const earned = Math.round(value * j.progress / 100);
  const p = j.progress / 100 || 1;
  const fcMargin = (value - forecastCost) / value;
  return {
    contract: j.value, approvedVar, value, invoiced, collected, unbilled: value - invoiced, budgetCost, actualCost, forecastCost,
    earned, gpToDate: earned - actualCost, gpToDatePct: earned ? (earned - actualCost) / earned : 0, origMargin: j.origMargin, fcMargin,
    fcGp: value - forecastCost, marginDrift: fcMargin - j.origMargin,
    matOverPct: j.actual.materials / (j.budget.materials * p) - 1, labOverPct: j.actual.labour / (j.budget.labour * p) - 1,
    hoursPct: j.hours.used / j.hours.budget, atRisk: fcMargin < j.origMargin - 0.03, costToComplete: forecastCost - actualCost,
  };
}

/* ---------- customer invoices ---------- */
export interface Invoice {
  id: string; customerId: string; jobId?: string; contractId?: string; desc: string; amount: number; issued: string; due: string;
  paid?: string; chases: { date: string; by: "Collections Agent" | "Caitlin"; channel: "Email" | "SMS" | "Call"; note: string }[]; hold?: string;
}
const inv = (id: string, customerId: string, ref: { jobId?: string; contractId?: string }, desc: string, amount: number, issued: string, due: string, paid?: string, chases: Invoice["chases"] = [], hold?: string): Invoice =>
  ({ id, customerId, ...ref, desc, amount, issued, due, paid, chases, hold });
export const INVOICES: Invoice[] = [
  inv("INV-4821", "c-park", { jobId: "J-2641" }, "Deposit, Park Hotel Electrical Upgrade", 10960, "2026-08-12", "2026-09-11", "2026-09-03"),
  inv("INV-4856", "c-park", { jobId: "J-2641" }, "Interim 1: first fix levels 1 and 2", 12000, "2026-09-18", "2026-10-18", "2026-10-09"),
  inv("INV-4902", "c-park", { jobId: "J-2641" }, "Interim 2: second fix levels 1 to 3", 17240, "2026-10-27", "2026-11-26"),
  inv("INV-4911", "c-park", { contractId: "K-02" }, "Annual fire and emergency lighting maintenance 2026/27", 1180, "2026-11-02", "2026-12-02"),
  inv("INV-4833", "c-murphy", { jobId: "J-2652" }, "Deposit, Murphy Retail Fit-Out", 3720, "2026-09-08", "2026-10-08", "2026-09-22"),
  inv("INV-4881", "c-murphy", { jobId: "J-2652" }, "Interim: first fix and fire alarm cabling", 8030, "2026-10-05", "2026-11-04", "2026-11-04"),
  inv("INV-4838", "c-kmc", { jobId: "J-2658" }, "Deposit and survey, fire upgrade", 6280, "2026-09-10", "2026-10-10", "2026-10-02"),
  inv("INV-4887", "c-kmc", { jobId: "J-2658" }, "Stage 1: cabling and device first fix", 9420, "2026-10-06", "2026-11-05", undefined,
    [{ date: "2026-11-06", by: "Collections Agent", channel: "Email", note: "Friendly reminder, 1 day overdue" }]),
  inv("INV-4850", "c-hennessy", { jobId: "J-2663" }, "Deposit, home automation", 2550, "2026-09-15", "2026-09-22", "2026-09-19"),
  inv("INV-4903", "c-hennessy", { jobId: "J-2663" }, "Stage 2: first fix and KNX bus cabling", 7940, "2026-11-02", "2026-11-16"),
  inv("INV-4780", "c-atlantic", { jobId: "J-2667" }, "Deposit, fire alarm and emergency lighting", 5780, "2026-07-31", "2026-08-30", "2026-08-25"),
  inv("INV-4812", "c-atlantic", { jobId: "J-2667" }, "Stage 1: materials order and first fix", 11200, "2026-08-20", "2026-09-19", undefined,
    [{ date: "2026-09-28", by: "Collections Agent", channel: "Email", note: "Reminder 1, 9 days overdue" }, { date: "2026-10-12", by: "Collections Agent", channel: "Email", note: "Reminder 2, asked for PO number" }, { date: "2026-10-26", by: "Caitlin", channel: "Call", note: "Spoke to Tadhg. PO coming from head office" }, { date: "2026-11-09", by: "Collections Agent", channel: "SMS", note: "Reminder 3 to Tadhg Foley" }], "Awaiting customer PO"),
  inv("INV-4798", "c-cnh", { jobId: "J-2671" }, "Deposit, security and data", 4270, "2026-08-10", "2026-09-09", "2026-09-01"),
  inv("INV-4837", "c-cnh", { jobId: "J-2671" }, "Interim: CCTV upgrade and first floor cabling", 8540, "2026-09-15", "2026-10-15", undefined,
    [{ date: "2026-10-22", by: "Collections Agent", channel: "Email", note: "Reminder 1, 7 days overdue" }, { date: "2026-11-05", by: "Collections Agent", channel: "Email", note: "Reminder 2, accounts team copied" }]),
  inv("INV-4895", "c-dunloe", { jobId: "J-2674" }, "Stage 1: materials order", 4900, "2026-10-29", "2026-11-28"),
  inv("INV-4871", "c-golf", { jobId: "J-2644" }, "Final: CCTV upgrade, 8 cameras", 3260, "2026-10-14", "2026-11-13"),
  inv("INV-4702", "c-sneem", { jobId: "J-2615" }, "Shop-fit sockets and data points", 2780, "2026-08-05", "2026-09-04", undefined,
    [{ date: "2026-09-14", by: "Collections Agent", channel: "Email", note: "Reminder 1" }, { date: "2026-10-01", by: "Collections Agent", channel: "Email", note: "Reminder 2" }, { date: "2026-10-21", by: "Caitlin", channel: "Call", note: "Pharmacist says cheque is in the post" }]),
  inv("INV-4641", "c-derr", { jobId: "J-2588" }, "EV charger installation", 1990, "2026-06-30", "2026-07-30", undefined,
    [{ date: "2026-08-10", by: "Collections Agent", channel: "Email", note: "Reminder 1" }, { date: "2026-09-02", by: "Collections Agent", channel: "Email", note: "Reminder 2" }, { date: "2026-10-05", by: "Caitlin", channel: "Call", note: "No answer, left message" }, { date: "2026-11-03", by: "Collections Agent", channel: "Email", note: "Final notice drafted for Caitlin" }]),
  inv("INV-4868", "c-kcu", { jobId: "J-2629" }, "LED lighting upgrade", 6420, "2026-10-22", "2026-11-05", "2026-11-05"),
  inv("INV-4879", "c-oshea", { jobId: "J-2638" }, "Three-phase supply and workshop lighting", 1860, "2026-10-28", "2026-11-11", "2026-11-06"),
  inv("INV-4893", "c-golf", { contractId: "K-05" }, "Annual CCTV and intruder maintenance 2026/27", 1050, "2026-10-24", "2026-11-23", "2026-11-04"),
  /* completed small works and service calls, billed and collected in October */
  inv("INV-4840", "c-kcu", { jobId: "J-2631" }, "Server room power and UPS circuit", 4200, "2026-10-12", "2026-10-26", "2026-10-23"),
  inv("INV-4842", "c-golf", { jobId: "J-2632" }, "Clubhouse kitchen extraction power", 5600, "2026-10-12", "2026-11-11", "2026-10-30"),
  inv("INV-4844", "c-oshea", { jobId: "J-2633" }, "Compressor circuits and isolators", 3850, "2026-10-13", "2026-10-27", "2026-10-24"),
  inv("INV-4846", "c-park", { jobId: "J-2630" }, "Spa lighting controls", 7300, "2026-10-14", "2026-11-13", "2026-10-29"),
  inv("INV-4849", "c-caher", { jobId: "J-2634" }, "Bedroom wing socket repairs", 2950, "2026-10-14", "2026-11-13", "2026-10-28"),
  inv("INV-4851", "c-sneem", { jobId: "J-2635" }, "Dispensary lighting", 1780, "2026-10-15", "2026-11-14", "2026-10-27"),
  inv("INV-4853", "c-atlantic", { jobId: "J-2636" }, "Kitchen refit electrical", 6200, "2026-10-16", "2026-11-15", "2026-10-30"),
  inv("INV-4855", "c-cnh", { jobId: "J-2637" }, "Fire door holders and interface", 4650, "2026-10-16", "2026-11-15", "2026-10-28"),
  inv("INV-4858", "c-dunloe", { jobId: "J-2639" }, "Packing line power", 5300, "2026-10-19", "2026-11-18", "2026-10-31"),
  inv("INV-4860", "c-murphy", { jobId: "J-2640" }, "Emergency lighting survey and fix", 3900, "2026-10-19", "2026-11-18", "2026-10-29"),
  inv("INV-4862", "c-kcu", { jobId: "J-2642" }, "Branch lighting controls", 2100, "2026-10-20", "2026-11-03", "2026-10-30"),
  inv("INV-4864", "c-oshea", { jobId: "J-2643" }, "Workshop three-phase extension", 4570, "2026-10-22", "2026-11-05", "2026-10-30"),
];
export const invoiceOutstanding = () => INVOICES.filter((i) => !i.paid);
export const daysOverdue = (i: Invoice) => Math.max(0, -dayDiff(i.due));
export const AGE_BUCKETS = ["Current", "1-30 days", "31-60 days", "61-90 days", "90+ days"] as const;
export const ageBucket = (i: Invoice) => { const d = daysOverdue(i); return d === 0 ? 0 : d <= 30 ? 1 : d <= 60 ? 2 : d <= 90 ? 3 : 4; };

/* ---------- invoice queue (Invoice Readiness Engine) ---------- */
export type QueueStage = "Opportunity detected" | "Draft prepared" | "Awaiting approval" | "Approved" | "Sent" | "Paid";
export const QUEUE_STAGES: QueueStage[] = ["Opportunity detected", "Draft prepared", "Awaiting approval", "Approved", "Sent", "Paid"];
export interface QueueItem {
  id: string; stage: QueueStage; customerId: string; title: string; amount: number; jobId?: string; contractId?: string; kind: "Job completion" | "Service job" | "Callout" | "Contract renewal" | "Milestone";
  trigger: string; ready: boolean; approver?: string; since: string; ageDays: number; lines: { desc: string; amount: number }[]; note?: string; invoiceId?: string; sources: string[];
}
export const QUEUE: QueueItem[] = [
  { id: "Q-1", stage: "Awaiting approval", customerId: "c-murphy", title: "Murphy Retail Fit-Out", amount: 6850, jobId: "J-2652", kind: "Job completion", trigger: "Job completed Mon 9 Nov, 100% progress, handover signed", ready: true, approver: "seamus", since: "2026-11-10 09:14", ageDays: 1,
    lines: [{ desc: "Fire alarm installation, commissioning and certification (balance)", amount: 3900 }, { desc: "Emergency lighting, final fix and test", amount: 1850 }, { desc: "Snagging and handover documentation", amount: 1100 }], sources: ["Quote Q-2026-097", "Timesheets: 143 hours", "Supplier costs: 4 invoices", "Customer details", "Handover sheet"], note: "Quote €18,600. Invoiced €11,750. Balance €6,850. No variations." },
  { id: "Q-2", stage: "Awaiting approval", customerId: "c-caher", title: "Caherdaniel Bay Hotel, annual emergency lighting test", amount: 1590, jobId: "S-0412", kind: "Service job", trigger: "Service job completed Fri 30 Oct, certificate issued, 11 days unbilled", ready: true, approver: "caitlin", since: "2026-11-10 09:16", ageDays: 11,
    lines: [{ desc: "Annual test and certification, 74 fittings", amount: 1120 }, { desc: "Replacement fittings x4", amount: 330 }, { desc: "Certificate and test register", amount: 140 }], sources: ["Service sheet S-0412", "Timesheets: 3 technicians", "Test certificate"] },
  { id: "Q-3", stage: "Draft prepared", customerId: "c-golf", title: "Waterville Golf Links, intruder callout", amount: 800, jobId: "S-0419", kind: "Callout", trigger: "Callout completed Tue 3 Nov, 7 days unbilled", ready: true, approver: "caitlin", since: "2026-11-10 09:21", ageDays: 7,
    lines: [{ desc: "Call-out and fault finding, 2 technicians, 3.5 hours", amount: 700 }, { desc: "Materials: terminal block, labels", amount: 45 }, { desc: "Mileage", amount: 55 }], sources: ["Service sheet S-0419", "Voice note 3 Nov"] },
  { id: "Q-4", stage: "Awaiting approval", customerId: "c-kmc", title: "Kerry Fire Maintenance, annual renewal", amount: 1240, contractId: "K-01", kind: "Contract renewal", trigger: "Contract renews 24 Nov. Draft prepared by Contracts Agent", ready: false, approver: "caitlin", since: "2026-11-10 08:02", ageDays: 0,
    lines: [{ desc: "Annual fire alarm service and maintenance agreement, 2 visits", amount: 1240 }], sources: ["Contract K-01", "Last year's invoice"] },
  { id: "Q-5", stage: "Approved", customerId: "c-cnh", title: "Cahersiveen intruder monitoring renewal", amount: 720, contractId: "K-04", kind: "Contract renewal", trigger: "Approved by Caitlin 09:02. Queued for RedBook", ready: false, approver: "caitlin", since: "2026-11-10 09:02", ageDays: 0,
    lines: [{ desc: "Annual intruder alarm monitoring and service", amount: 720 }], sources: ["Contract K-04"] },
  { id: "Q-6", stage: "Opportunity detected", customerId: "c-hennessy", title: "Waterville Residence Automation, final milestone", amount: 2260, jobId: "J-2663", kind: "Milestone", trigger: "Commissioning milestone forecast for Fri 20 Nov", ready: false, since: "2026-11-10 07:50", ageDays: 0,
    lines: [{ desc: "Programming, commissioning and handover", amount: 2260 }], sources: ["Quote Q-2026-092", "Job progress 85%"], note: "Not yet billable. Becomes ready when job reaches 100%." },
  { id: "Q-7", stage: "Opportunity detected", customerId: "c-murphy", title: "Murphy Retail CCTV cloud renewal", amount: 860, contractId: "K-03", kind: "Contract renewal", trigger: "Renews 1 Dec. Cloud cost €540 already committed", ready: false, since: "2026-11-10 07:58", ageDays: 0,
    lines: [{ desc: "Annual CCTV cloud storage and remote access", amount: 860 }], sources: ["Contract K-03", "Hikvision cloud renewal notice"] },
  { id: "Q-8", stage: "Opportunity detected", customerId: "c-dunloe", title: "Dunloe Foods security cloud renewal", amount: 640, contractId: "K-06", kind: "Contract renewal", trigger: "Renews 18 Dec. Cloud and 4G cost €410 already committed", ready: false, since: "2026-11-10 07:58", ageDays: 0,
    lines: [{ desc: "Annual CCTV cloud storage and 4G failover", amount: 640 }], sources: ["Contract K-06"] },
  { id: "Q-9", stage: "Sent", customerId: "c-hennessy", title: "Waterville Residence, Stage 2", amount: 7940, jobId: "J-2663", kind: "Milestone", trigger: "Sent 2 Nov, due 16 Nov", ready: false, since: "2026-11-02", ageDays: 8, lines: [], sources: [], invoiceId: "INV-4903" },
  { id: "Q-10", stage: "Sent", customerId: "c-park", title: "Park Hotel maintenance renewal", amount: 1180, contractId: "K-02", kind: "Contract renewal", trigger: "Sent 2 Nov, due 2 Dec", ready: false, since: "2026-11-02", ageDays: 8, lines: [], sources: [], invoiceId: "INV-4911" },
  { id: "Q-11", stage: "Paid", customerId: "c-murphy", title: "Murphy Retail Fit-Out, interim", amount: 8030, jobId: "J-2652", kind: "Milestone", trigger: "Paid 4 Nov", ready: false, since: "2026-11-04", ageDays: 6, lines: [], sources: [], invoiceId: "INV-4881" },
  { id: "Q-12", stage: "Paid", customerId: "c-kcu", title: "Kenmare Credit Union LED upgrade", amount: 6420, jobId: "J-2629", kind: "Job completion", trigger: "Paid 5 Nov", ready: false, since: "2026-11-05", ageDays: 5, lines: [], sources: [], invoiceId: "INV-4868" },
];
export const READY_ITEMS = QUEUE.filter((q) => q.ready);

/* ---------- suppliers and supplier invoices ---------- */
export interface Supplier { id: string; name: string; short: string; prefix: string; key: boolean; category: string }
export const SUPPLIERS: Supplier[] = [
  { id: "sup-ke", name: "Killarney Electrical Wholesale", short: "Killarney Electrical", prefix: "KE", key: true, category: "Cable, containment, accessories" },
  { id: "sup-mcl", name: "Munster Cable & Lighting", short: "Munster Cable", prefix: "MCL", key: true, category: "Cable, luminaires, lighting" },
  { id: "sup-sfs", name: "Southwest Fire & Security Supplies", short: "SW Fire & Security", prefix: "SFS", key: true, category: "Fire panels, detectors, sounders" },
  { id: "sup-adn", name: "Atlantic Data & Networking", short: "Atlantic Data", prefix: "ADN", key: true, category: "Fibre, structured cabling, Wi-Fi" },
  { id: "sup-acd", name: "Alarm & CCTV Distribution", short: "Alarm & CCTV Dist.", prefix: "ACD", key: false, category: "CCTV, intruder equipment" },
  { id: "sup-kph", name: "Kerry Plant Hire", short: "Kerry Plant Hire", prefix: "KPH", key: false, category: "MEWP and access plant hire" },
];
export const supplierById = (id: string) => SUPPLIERS.find((s) => s.id === id)!;
export type SIStatus = "matched" | "review" | "missing" | "duplicate";
export interface SupplierInvoice {
  id: string; supplierId: string; number: string; amount: number; date: string; received: string; jobId?: string; category: "Materials" | "Plant hire" | "Subcontract";
  status: SIStatus; confidence: number; note?: string; candidates?: { jobId: string; score: number }[]; dupOf?: string; auto: boolean; subject: string;
}
const si = (n: string, supplierId: string, number: string, amount: number, date: string, jobId: string | undefined, received: string, extra: Partial<SupplierInvoice> = {}): SupplierInvoice =>
  ({ id: n, supplierId, number, amount, date, received, jobId, category: "Materials", status: "matched", confidence: 97, auto: true, subject: "Invoice " + number, ...extra });
export const SUPPLIER_INVOICES: SupplierInvoice[] = [
  si("SI-01", "sup-ke", "KE-27944", 2410, "2026-08-28", "J-2641", "2026-08-28 10:12"),
  si("SI-02", "sup-mcl", "MCL-89977", 1977, "2026-09-18", "J-2641", "2026-09-18 08:40"),
  si("SI-03", "sup-ke", "KE-28217", 3960, "2026-10-15", "J-2641", "2026-10-15 09:05"),
  si("SI-04", "sup-sfs", "SFS-5530", 1000, "2026-10-28", "J-2641", "2026-10-28 14:30", { confidence: 93 }),
  si("SI-05", "sup-mcl", "MCL-90311", 4812, "2026-11-02", "J-2641", "2026-11-02 09:28"),
  si("SI-06", "sup-ke", "KE-28492", 2184, "2026-11-10", "J-2641", "2026-11-10 09:07", { confidence: 99, subject: "Invoice KE-28492, ref Park Hotel Kenmare / J-2641" }),
  si("SI-07", "sup-ke", "KE-27651", 2940, "2026-09-28", "J-2652", "2026-09-28 11:00"),
  si("SI-08", "sup-mcl", "MCL-88740", 1876, "2026-10-06", "J-2652", "2026-10-06 09:44"),
  si("SI-09", "sup-sfs", "SFS-5390", 2100, "2026-10-14", "J-2652", "2026-10-14 13:20"),
  si("SI-10", "sup-ke", "KE-27992", 700, "2026-10-29", "J-2652", "2026-10-29 08:15"),
  si("SI-11", "sup-sfs", "SFS-5488", 4120, "2026-10-20", "J-2658", "2026-10-20 10:02"),
  si("SI-12", "sup-sfs", "SFS-5520", 1860, "2026-11-10", "J-2658", "2026-11-10 08:31", { confidence: 96 }),
  si("SI-13", "sup-mcl", "MCL-88902", 2640, "2026-09-30", "J-2663", "2026-09-30 09:10"),
  si("SI-14", "sup-adn", "ADN-3302", 1540, "2026-10-08", "J-2663", "2026-10-08 15:42"),
  si("SI-15", "sup-ke", "KE-28101", 250, "2026-11-10", "J-2663", "2026-11-10 07:46", { confidence: 94 }),
  si("SI-16", "sup-sfs", "SFS-5301", 3300, "2026-09-03", "J-2667", "2026-09-03 09:22"),
  si("SI-17", "sup-ke", "KE-27777", 1980, "2026-10-02", "J-2667", "2026-10-02 10:35"),
  si("SI-18", "sup-mcl", "MCL-89410", 1170, "2026-10-22", "J-2667", "2026-10-22 08:50"),
  si("SI-19", "sup-adn", "ADN-3188", 1950, "2026-09-22", "J-2671", "2026-09-22 11:05"),
  si("SI-20", "sup-acd", "ACD-7712", 2150, "2026-10-05", "J-2671", "2026-10-05 09:48", { confidence: 91 }),
  si("SI-21", "sup-ke", "KE-27903", 1000, "2026-10-12", "J-2671", "2026-10-12 12:18"),
  si("SI-22", "sup-ke", "KE-28390", 1400, "2026-11-04", "J-2674", "2026-11-04 09:30"),
  si("SI-23", "sup-mcl", "MCL-90260", 900, "2026-11-10", "J-2674", "2026-11-10 08:12", { confidence: 95 }),
  /* the queue Caitlin sees: exceptions only */
  si("SI-Q1", "sup-mcl", "MCL-90402", 3140, "2026-11-10", undefined, "2026-11-10 07:21", { status: "review", confidence: 62, auto: false, note: "Job reference reads 'Kenmare hotel'. Two active jobs fit.", candidates: [{ jobId: "J-2641", score: 62 }, { jobId: "J-2667", score: 21 }], subject: "Invoice MCL-90402, delivered Kenmare hotel" }),
  si("SI-Q2", "sup-acd", "ACD-7790", 1460, "2026-11-09", undefined, "2026-11-09 16:40", { status: "missing", confidence: 38, auto: false, note: "No job reference found on the invoice or in the email.", candidates: [{ jobId: "J-2671", score: 38 }, { jobId: "J-2674", score: 33 }], subject: "Invoice ACD-7790" }),
  si("SI-Q3", "sup-ke", "KE-28217", 3960, "2026-10-15", "J-2641", "2026-11-10 06:58", { status: "duplicate", confidence: 98, auto: false, dupOf: "SI-03", note: "Same supplier, number and amount as SI-03 received 15 Oct.", subject: "Re: Invoice KE-28217 (resent)" }),
  si("SI-Q4", "sup-kph", "KPH-0417", 620, "2026-11-09", "J-2641", "2026-11-09 17:12", { status: "review", category: "Plant hire", confidence: 71, auto: false, note: "MEWP hire. Confirm category before it is added to job costs.", subject: "Invoice KPH-0417, Park Hotel atrium" }),
];
export const matchedForJob = (id: string) => SUPPLIER_INVOICES.filter((s) => s.jobId === id && s.status === "matched");
export const supplierSpendMonth = () => sum(SUPPLIER_INVOICES.filter((s) => s.status === "matched" && s.date.slice(0, 7) === TODAY.slice(0, 7)).map((s) => s.amount));
export const matchedToday = () => SUPPLIER_INVOICES.filter((s) => s.status === "matched" && s.received.slice(0, 10) === TODAY);
export const exceptionInvoices = () => SUPPLIER_INVOICES.filter((s) => s.status !== "matched");

/* ---------- completed and pipeline ---------- */
export interface DoneJob { id: string; name: string; customerId: string; value: number; margin: number; finished: string; invoiceState: string }
export const COMPLETED: DoneJob[] = [
  { id: "J-2644", name: "Waterville Golf Links CCTV Upgrade", customerId: "c-golf", value: 9800, margin: 0.31, finished: "2026-10-09", invoiceState: "Final invoice outstanding" },
  { id: "J-2629", name: "Kenmare Credit Union LED Upgrade", customerId: "c-kcu", value: 15200, margin: 0.28, finished: "2026-10-20", invoiceState: "Paid" },
  { id: "J-2638", name: "O'Shea Motors Three-Phase and Workshop Lighting", customerId: "c-oshea", value: 6100, margin: 0.29, finished: "2026-10-27", invoiceState: "Paid" },
  { id: "S-0412", name: "Caherdaniel Bay Hotel Emergency Lighting Test", customerId: "c-caher", value: 1590, margin: 0.41, finished: "2026-10-30", invoiceState: "Ready to invoice" },
  { id: "S-0419", name: "Waterville Golf Links Intruder Callout", customerId: "c-golf", value: 800, margin: 0.38, finished: "2026-11-03", invoiceState: "Ready to invoice" },
  { id: "J-2615", name: "Sneem Pharmacy Shop-Fit Electrical", customerId: "c-sneem", value: 7400, margin: 0.26, finished: "2026-08-02", invoiceState: "Final invoice outstanding" },
  { id: "J-2588", name: "Derrynane EV Charger Installation", customerId: "c-derr", value: 4200, margin: 0.33, finished: "2026-06-28", invoiceState: "Final invoice outstanding" },
  { id: "J-2574", name: "Kenmare Primary School Lighting Controls", customerId: "c-kcu", value: 11800, margin: 0.27, finished: "2026-06-12", invoiceState: "Paid" },
];
export interface Quote { id: string; name: string; customer: string; value: number; prob: number; stage: "Survey booked" | "Quoted" | "Awaiting decision" | "Verbal yes"; start: string; owner: string }
export const PIPELINE: Quote[] = [
  { id: "Q-2026-131", name: "Skellig Coast Hotel Fire Alarm and Emergency Lighting Replacement", customer: "Skellig Coast Hotel", value: 86000, prob: 0.7, stage: "Verbal yes", start: "2027-01-18", owner: "seamus" },
  { id: "Q-2026-128", name: "Cahersiveen Marina Apartments, 12 units", customer: "Marina Developments Ltd", value: 96400, prob: 0.4, stage: "Awaiting decision", start: "2027-03-01", owner: "seamus" },
  { id: "Q-2026-126", name: "Killarney Retail Park EV Hub, 8 chargers", customer: "Killarney Retail Park", value: 58200, prob: 0.5, stage: "Quoted", start: "2027-02-08", owner: "seamus" },
  { id: "Q-2026-124", name: "Kenmare Primary School LED and PV Preparation", customer: "Kenmare Primary School", value: 41500, prob: 0.6, stage: "Awaiting decision", start: "2027-06-28", owner: "seamus" },
  { id: "Q-2026-122", name: "Sneem Community Centre Rewire", customer: "Sneem Community Centre", value: 17900, prob: 0.8, stage: "Verbal yes", start: "2027-01-11", owner: "eoin" },
  { id: "Q-2026-119", name: "Park Hotel Spa Wing Electrical", customer: "Park Hotel Kenmare", value: 38600, prob: 0.5, stage: "Quoted", start: "2027-02-22", owner: "seamus" },
  { id: "Q-2026-117", name: "Waterville Golf Links Pro Shop Refit", customer: "Waterville Golf Links", value: 12400, prob: 0.6, stage: "Quoted", start: "2027-03-15", owner: "eoin" },
  { id: "Q-2026-133", name: "Derrynane Cottages Fibre and Wi-Fi", customer: "Derrynane Holiday Homes", value: 9300, prob: 0.3, stage: "Survey booked", start: "2027-04-12", owner: "sean" },
];
export const pipelineTotal = () => sum(PIPELINE.map((q) => q.value));
export const pipelineWeighted = () => Math.round(sum(PIPELINE.map((q) => q.value * q.prob)));

/* ---------- derived business numbers used everywhere ---------- */
export function jobsSummary() {
  const fins = JOBS.map((j) => ({ j, f: jobFin(j) }));
  const activeValue = sum(fins.map((x) => x.f.value));
  const fcGp = sum(fins.map((x) => x.f.fcGp));
  return {
    count: JOBS.length, activeValue, avgMargin: fcGp / activeValue,
    atRisk: fins.filter((x) => x.f.atRisk).map((x) => x.j),
    hoursUsed: sum(JOBS.map((j) => j.hours.used)),
  };
}
export const readyToInvoice = () => sum(READY_ITEMS.map((q) => q.amount));
export const outstandingTotal = () => sum(invoiceOutstanding().map((i) => i.amount));
export const overdueTotal = () => sum(invoiceOutstanding().filter((i) => daysOverdue(i) > 0).map((i) => i.amount));
export const collectedThisMonth = () => sum(INVOICES.filter((i) => i.paid && i.paid.slice(0, 7) === TODAY.slice(0, 7)).map((i) => i.amount));
export const dueIn = (i: Invoice) => dayDiff(i.due);
export { addDays };
