/* Joe Curran Electrical Ltd: shared demo data, part 3.
   Service contracts, schedule, leave, capacity, assignment checks, work items. */
import { TODAY, addDays, dayDiff, sum, STAFF, FIELD_STAFF, staffById, customerById, siteById, systemById, SYSTEMS, driveMins, CERTS, certDays, SkillKey, Level } from "./core";
import { JOBS, jobById, jobsSummary, Job } from "./jobs";

/* ---------- service contracts ---------- */
export type InvoiceState = "Paid" | "Sent" | "Approved" | "Draft ready" | "Not drafted" | "Scheduled";
export interface Contract {
  id: string; customer: string; customerId?: string; siteId?: string; systemIds: string[]; name: string; type: string; platform?: string;
  start: string; renew: string; billing: number; supplierCost: number; auto: boolean; invoice: InvoiceState; lastService: string; nextService: string; risk?: string;
}
const K = (id: string, customerId: string, name: string, type: string, start: string, renew: string, billing: number, supplierCost: number, auto: boolean, invoice: InvoiceState, lastService: string, nextService: string, extra: Partial<Contract> = {}): Contract => {
  const c = customerById(customerId);
  return { id, customer: c.name, customerId, siteId: c.siteIds[0], systemIds: SYSTEMS.filter((s) => s.contractId === id).map((s) => s.id), name, type, start, renew, billing, supplierCost, auto, invoice, lastService, nextService, ...extra };
};
export const CONTRACTS: Contract[] = [
  K("K-01", "c-kmc", "Kerry Fire Maintenance", "Fire alarm maintenance", "2022-11-24", "2026-11-24", 1240, 420, false, "Draft ready", "2026-03-20", "2026-12-01"),
  K("K-02", "c-park", "Park Hotel Fire and Emergency Lighting Maintenance", "Fire and emergency lighting", "2021-11-30", "2026-11-30", 1180, 400, true, "Sent", "2026-09-14", "2026-12-23"),
  K("K-03", "c-murphy", "Murphy Retail CCTV Cloud and Remote Access", "CCTV cloud", "2024-12-01", "2026-12-01", 860, 540, false, "Not drafted", "2025-11-12", "2026-12-01", { platform: "Hik-Connect cloud storage, 6 cameras", risk: "Renews in 21 days, not yet invoiced" }),
  K("K-04", "c-cnh", "Cahersiveen Intruder Monitoring", "Intruder monitoring", "2020-12-12", "2026-12-12", 720, 260, true, "Approved", "2026-01-21", "2026-12-12", { platform: "Monitoring station fee" }),
  K("K-05", "c-golf", "Waterville Golf Links CCTV and Intruder", "CCTV and intruder maintenance", "2018-12-15", "2026-12-15", 1050, 330, true, "Paid", "2026-04-14", "2027-04-14"),
  K("K-06", "c-dunloe", "Dunloe Foods Security Cloud and 4G Failover", "Security cloud", "2023-12-18", "2026-12-18", 640, 410, false, "Not drafted", "2025-12-18", "2026-12-18", { platform: "Hik-Connect cloud and 4G router, 10 cameras", risk: "Platform cost already paid, renewal not invoiced" }),
  K("K-07", "c-sneem", "Sneem Pharmacy Intruder and Cloud App", "Intruder with cloud", "2022-01-03", "2027-01-03", 520, 300, false, "Scheduled", "2026-01-12", "2027-01-03", { platform: "Pyronix HomeControl+ cloud", risk: "Customer asking about a cheaper cloud option" }),
  K("K-08", "c-caher", "Caherdaniel Bay Emergency Lighting Test", "Emergency lighting test", "2019-01-08", "2027-01-08", 630, 210, true, "Scheduled", "2026-10-30", "2027-04-30"),
  K("K-09", "c-kcu", "Kenmare Credit Union Intruder and CCTV", "Intruder and CCTV", "2020-02-10", "2027-02-10", 1420, 360, true, "Scheduled", "2026-02-10", "2027-02-10"),
  K("K-10", "c-oshea", "O'Shea Motors Emergency Lighting and PAT", "Testing", "2021-02-24", "2027-02-24", 980, 280, true, "Scheduled", "2026-02-24", "2027-02-24"),
  K("K-11", "c-derr", "Derrynane EV Charger Service", "EV charger service", "2025-06-20", "2027-06-20", 760, 180, false, "Scheduled", "2025-06-20", "2026-12-20"),
  K("K-12", "c-park", "Park Hotel CCTV and Cabling Support", "CCTV and network support", "2022-02-03", "2027-02-03", 1150, 420, true, "Scheduled", "2026-02-03", "2027-02-03"),
  K("K-13", "c-cnh", "Cahersiveen Fire and Emergency Lighting", "Fire and emergency lighting", "2019-04-26", "2027-04-26", 890, 300, true, "Scheduled", "2026-04-26", "2026-12-20"),
  K("K-14", "c-atlantic", "Atlantic Lodge Emergency Lighting Test", "Emergency lighting test", "2026-12-11", "2027-12-11", 540, 160, true, "Scheduled", "2026-10-26", "2027-04-26"),
  K("K-15", "c-murphy", "Murphy Retail Fire Alarm Maintenance", "Fire alarm maintenance", "2026-11-09", "2027-11-09", 1320, 440, true, "Scheduled", "2026-11-06", "2027-02-06"),
  K("K-16", "c-dunloe", "Dunloe Foods EV Charger Service", "EV charger service", "2026-12-18", "2027-12-18", 610, 150, true, "Scheduled", "2026-11-04", "2027-05-04"),
  K("K-17", "c-hennessy", "Hennessy KNX Remote Support", "Home automation support", "2026-11-20", "2027-11-20", 480, 120, true, "Scheduled", "2026-11-03", "2026-11-20"),
  K("K-18", "c-kmc", "Kerry Medical Emergency Lighting Test", "Emergency lighting test", "2021-05-14", "2027-05-14", 730, 220, true, "Scheduled", "2026-05-14", "2026-11-14"),
];
const SMALL = ["Brosnan's Bar, Sneem", "Courtney's B&B, Waterville", "Skellig View Guesthouse", "Valentia Island Ferry Office", "Ring of Kerry Cafe", "Coomakista Lodge", "Cahersiveen Dental", "Kenmare Bay Hostel", "Murphy's Mini Market", "Waterville Medical Practice", "Sneem Hardware", "Derrynane Camping Park", "Lough Currane Lodge", "Staigue Fort Visitor Centre", "Kilcummin Community Hall", "O'Sullivan's Butchers", "Killorglin Credit Union Office", "Glenbeigh Hotel Annex", "Cappanalea Outdoor Centre", "Ballinskelligs Holiday Cottages", "St. Finian's Church Hall", "Portmagee Marina Office", "Tuosist Parish Hall", "Cloghane Foods", "Reen Pier Cafe", "Kells Bay House"];
const SMALL_TYPE = ["Intruder alarm service", "CCTV service", "Emergency lighting test", "Fire alarm service", "Intruder with cloud", "Testing and PAT"];
SMALL.forEach((name, i) => {
  const billing = 380 + ((i * 137) % 800) - (((i * 137) % 800) % 10);
  const next = addDays(TODAY, 3 + ((i * 5) % 48));
  CONTRACTS.push({ id: "K-" + (19 + i), customer: name, systemIds: [], name: name + " " + SMALL_TYPE[i % 6], type: SMALL_TYPE[i % 6], start: addDays("2026-01-12", i * 9 - 365), renew: addDays("2027-01-12", i * 11), billing, supplierCost: Math.round(billing * (i % 6 === 4 ? 0.55 : 0.3)), auto: i % 3 !== 0, invoice: "Scheduled", lastService: addDays(next, -182), nextService: next, platform: i % 6 === 4 ? "Cloud app subscription" : undefined });
});
export const contractById = (id: string) => CONTRACTS.find((c) => c.id === id)!;
export const RENEW_WINDOW = 60;
export const renewingSoon = () => CONTRACTS.filter((c) => dayDiff(c.renew) <= RENEW_WINDOW && dayDiff(c.renew) >= 0).sort((a, b) => a.renew.localeCompare(b.renew));
export const unbilledRenewals = () => renewingSoon().filter((c) => c.invoice === "Draft ready" || c.invoice === "Not drafted");
export const contractMargin = (c: Contract) => (c.billing - c.supplierCost) / c.billing;
export const contractSummary = () => ({
  active: CONTRACTS.length, arr: sum(CONTRACTS.map((c) => c.billing)), arrMargin: sum(CONTRACTS.map((c) => c.billing - c.supplierCost)),
  renewing: renewingSoon().length, renewalRevenue: sum(renewingSoon().map((c) => c.billing)), unbilled: unbilledRenewals().length,
  unbilledValue: sum(unbilledRenewals().map((c) => c.billing)), atRisk: CONTRACTS.filter((c) => c.risk).length,
  visitsDue: CONTRACTS.filter((c) => dayDiff(c.nextService) <= 30 && dayDiff(c.nextService) >= 0).length, topRenewal: renewingSoon().sort((a, b) => b.billing - a.billing)[0],
});

/* ---------- schedule ---------- */
export type SlotKind = "job" | "leave" | "pending-leave" | "training" | "office" | "service";
export interface Slot { kind: SlotKind; jobId?: string; label: string; detail?: string }
export const WEEKS = [
  { id: "w0", start: "2026-11-09", label: "This week", span: "9 to 13 Nov" },
  { id: "w1", start: "2026-11-16", label: "Next week", span: "16 to 20 Nov" },
  { id: "w2", start: "2026-11-23", label: "Week of 23 Nov", span: "23 to 27 Nov" },
  { id: "w3", start: "2026-11-30", label: "Week of 30 Nov", span: "30 Nov to 4 Dec" },
];
const TOKENS: Record<string, string[]> = {
  /* Mon..Fri for each staff member, per week. "AL" annual leave, "PL" pending leave, "OF" office, "TR:..." training */
  w0: { seamus: "J-2663 J-2658 OF J-2663 OF", caitlin: "OF OF OF OF OF", eoin: "J-2641 J-2641 J-2641 J-2641 J-2641", liam: "J-2652 J-2667 J-2667 J-2674 J-2674", kyle: "J-2641 J-2658 J-2658 AL AL", sean: "J-2674 J-2674 J-2674 J-2663 J-2663", ciara: "J-2667 J-2667 J-2671 J-2671 TR:Inspection and Testing course", darragh: "J-2652 J-2658 J-2658 J-2671 J-2671", jack: "J-2652 J-2641 J-2641 J-2663 TR:Apprentice college block" } as any,
  w1: { seamus: "J-2663 J-2663 OF J-2658 OF", caitlin: "OF OF OF OF OF", eoin: "J-2641 J-2641 J-2641 J-2641 J-2641", liam: "J-2667 J-2667 J-2667 J-2667 J-2667", kyle: "AL AL AL AL AL", sean: "J-2674 PL PL PL J-2674", ciara: "J-2671 J-2671 J-2671 J-2667 J-2667", darragh: "J-2658 J-2658 J-2658 J-2658 J-2671", jack: "J-2641 J-2641 J-2641 J-2641 J-2641" } as any,
  w2: { seamus: "J-2658 OF OF J-2663 OF", caitlin: "OF OF OF OF OF", eoin: "J-2641 J-2641 J-2641 J-2641 J-2641", liam: "AL AL AL AL AL", kyle: "TR:Safe Pass renewal course J-2667 J-2667 J-2667 J-2667", sean: "J-2674 J-2674 J-2674 J-2674 J-2674", ciara: "J-2671 J-2671 J-2671 J-2671 J-2671", darragh: "J-2658 J-2658 J-2671 J-2671 J-2671", jack: "J-2641 J-2641 J-2641 TR:Apprentice college block TR:Apprentice college block" } as any,
  w3: { seamus: "OF J-2658 OF OF OF", caitlin: "OF OF OF OF OF", eoin: "J-2667 J-2667 J-2667 J-2667 J-2667", liam: "J-2674 J-2674 J-2674 J-2674 J-2674", kyle: "J-2667 J-2667 J-2667 J-2667 J-2667", sean: "J-2674 J-2674 J-2674 J-2674 J-2674", ciara: "J-2671 J-2671 J-2671 J-2671 J-2671", darragh: "J-2671 J-2671 J-2671 J-2658 J-2658", jack: "J-2667 J-2667 J-2667 J-2667 J-2667" } as any,
};
const slotFrom = (tok: string): Slot => {
  if (tok === "AL") return { kind: "leave", label: "Annual leave" };
  if (tok === "PL") return { kind: "pending-leave", label: "Leave requested", detail: "Awaiting approval" };
  if (tok === "OF") return { kind: "office", label: "Office / admin" };
  if (tok.startsWith("TR:")) return { kind: "training", label: tok.slice(3) };
  const j = jobById(tok);
  return { kind: "job", jobId: tok, label: j ? j.name : tok };
};
const split = (s: string) => s.replace(/TR:([A-Za-z ]+?)(?= J-| AL| PL| OF| TR:|$)/g, (_, t) => "TR:" + t.replace(/ /g, "_")).split(" ");
export function weekDates(weekId: string) { const w = WEEKS.find((x) => x.id === weekId)!; return [0, 1, 2, 3, 4].map((i) => addDays(w.start, i)); }
export function slotFor(staffId: string, date: string): Slot {
  const wk = WEEKS.find((w) => { const d = dayDiff(date, w.start); return d >= 0 && d <= 4; });
  if (!wk) {
    const lv = LEAVE.find((l) => l.staffId === staffId && l.status !== "Declined" && date >= l.from && date <= l.to);
    return lv ? { kind: lv.status === "Pending" ? "pending-leave" : "leave", label: lv.status === "Pending" ? "Leave requested" : "Annual leave" } : { kind: "office", label: "Not yet planned" };
  }
  const idx = dayDiff(date, wk.start);
  const tok = split((TOKENS as any)[wk.id][staffId])[idx].replace(/_/g, " ");
  return slotFrom(tok);
}

/* ---------- leave ---------- */
export interface Leave { id: string; staffId: string; from: string; to: string; days: number; type: "Annual leave" | "Training"; status: "Approved" | "Pending" | "Declined"; requested: string; note?: string; warning?: string }
export const LEAVE: Leave[] = [
  { id: "L-1", staffId: "kyle", from: "2026-11-12", to: "2026-11-20", days: 7, type: "Annual leave", status: "Approved", requested: "2026-10-02", note: "Family trip" },
  { id: "L-2", staffId: "sean", from: "2026-11-17", to: "2026-11-19", days: 3, type: "Annual leave", status: "Pending", requested: "2026-11-08", note: "Moving house", warning: "Overlaps Kyle Murphy (12 to 20 Nov). Two of eight field staff off, Dunloe EV commissioning and Kerry Medical at risk." },
  { id: "L-3", staffId: "liam", from: "2026-11-23", to: "2026-11-27", days: 5, type: "Annual leave", status: "Approved", requested: "2026-09-14" },
  { id: "L-4", staffId: "ciara", from: "2026-12-07", to: "2026-12-08", days: 2, type: "Annual leave", status: "Approved", requested: "2026-10-20" },
  { id: "L-5", staffId: "eoin", from: "2026-12-21", to: "2026-12-31", days: 7, type: "Annual leave", status: "Approved", requested: "2026-08-30" },
  { id: "L-6", staffId: "seamus", from: "2026-12-28", to: "2027-01-01", days: 3, type: "Annual leave", status: "Approved", requested: "2026-09-30" },
];
export const ALLOWANCE: Record<string, { entitlement: number; taken: number }> = {
  seamus: { entitlement: 22, taken: 12 }, caitlin: { entitlement: 20, taken: 9 }, eoin: { entitlement: 22, taken: 14 }, liam: { entitlement: 22, taken: 10 },
  kyle: { entitlement: 20, taken: 9 }, sean: { entitlement: 20, taken: 11 }, ciara: { entitlement: 20, taken: 6 }, darragh: { entitlement: 21, taken: 13 }, jack: { entitlement: 20, taken: 8 },
};
export const leaveOn = (staffId: string, date: string) => LEAVE.find((l) => l.staffId === staffId && l.status === "Approved" && date >= l.from && date <= l.to);

/* ---------- assignment checks ---------- */
export interface Issue { kind: "leave" | "booked" | "skill" | "cert" | "travel" | "capacity"; level: "block" | "warn"; text: string }
export function assessAssignment(staffId: string, jobId: string, date: string): Issue[] {
  const s = staffById(staffId), j = jobById(jobId), issues: Issue[] = [];
  const lv = leaveOn(staffId, date);
  if (lv) issues.push({ kind: "leave", level: "block", text: "Cannot assign " + s.name + ": annual leave " + lv.from.slice(8) + " to " + lv.to.slice(8) + " Nov" });
  const cur = slotFor(staffId, date);
  if (cur.kind === "job" && cur.jobId !== jobId) issues.push({ kind: "booked", level: "block", text: s.first + " is already on " + cur.label + " that day" });
  if (cur.kind === "training") issues.push({ kind: "booked", level: "block", text: s.first + " is in training: " + cur.label });
  j.requires.forEach((r) => { if (s.skills[r.skill] < r.min) issues.push({ kind: "skill", level: "warn", text: j.name + " needs " + r.skill + " at level " + r.min + "+. " + s.first + " is level " + s.skills[r.skill] }); });
  j.certs.forEach((c) => {
    const rec = CERTS.find((x) => x.staffId === staffId && x.cert === c);
    if (!rec) issues.push({ kind: "cert", level: c === "PSA Licence" ? "warn" : "block", text: s.first + " has no " + c + " on record" });
    else if (rec.expires <= date) issues.push({ kind: "cert", level: "block", text: s.first + "'s " + c + " expires " + rec.expires.slice(8) + "/" + rec.expires.slice(5, 7) + ", before " + date.slice(8) + "/" + date.slice(5, 7) });
    else if (certDays(rec) <= 45) issues.push({ kind: "cert", level: "warn", text: s.first + "'s " + c + " expires in " + certDays(rec) + " days" });
  });
  const prev = slotFor(staffId, addDays(date, -1));
  if (prev.kind === "job" && prev.jobId && prev.jobId !== jobId) {
    const m = driveMins(siteById(jobById(prev.jobId).siteId).town, siteById(j.siteId).town);
    if (m >= 55) issues.push({ kind: "travel", level: "warn", text: "Travel: " + m + " min from " + siteById(jobById(prev.jobId).siteId).town + " the day before" });
  }
  return issues;
}
export interface Conflict { id: string; date: string; title: string; detail: string; staff: string[]; jobId: string }
export const CONFLICTS: Conflict[] = [
  { id: "X-1", date: "2026-11-12", title: "Kerry Medical plant room fit slips to Thursday", jobId: "J-2658", staff: ["darragh", "kyle"],
    detail: "Access constraint moves the panel fit from Wed to Thu 12 Nov. Kyle Murphy is on annual leave (12 to 20 Nov) and Darragh Sheehan is booked at Cahersiveen Nursing Home. Only Darragh, Eoin and Seamus hold Fire Systems level 2+." },
];
export const UNASSIGNED = [
  { id: "U-1", jobId: "J-2658", title: "Kerry Medical: plant room panel fit", date: "2026-11-12", crew: 2, needs: "Fire Systems 2+, Safe Pass", note: "Blocked until landlord's rep returns. Conflict X-1." },
  { id: "U-2", jobId: "", title: "Sneem Pharmacy: annual intruder service (K-07)", date: "2026-11-18", crew: 1, needs: "Intruder 2+, PSA Licence", note: "Contract visit due. Darragh free Tue 17 Nov if not at Kerry Medical." },
  { id: "U-3", jobId: "", title: "Kerry Medical: 6 monthly emergency lighting test (K-18)", date: "2026-11-14", crew: 1, needs: "Emergency Lighting 2+", note: "Ciara Counihan qualifies. Sat 14 Nov, overtime." },
  { id: "U-4", jobId: "J-2674", title: "Dunloe Foods: chargers 3 and 4 commissioning", date: "2026-11-30", crew: 2, needs: "EV Charging 2+", note: "Waiting on ESB Networks connection date." },
];

/* weekly capacity: field staff-days */
export function weekCapacity(weekId: string) {
  const dates = weekDates(weekId);
  let total = 0, leave = 0, pending = 0, training = 0, office = 0, jobs = 0;
  FIELD_STAFF.forEach((s) => dates.forEach((d) => {
    total++;
    const k = slotFor(s.id, d).kind;
    if (k === "leave") leave++; else if (k === "pending-leave") pending++; else if (k === "training") training++; else if (k === "office") office++; else jobs++;
  }));
  const avail = total - leave - training - pending;
  return { total, leave, pending, training, office, jobs, avail, util: jobs / Math.max(1, avail), hours: jobs * 8 };
}
export const weekHours = () => weekCapacity("w0").hours;
export const staffOnSiteToday = (jobId: string) => FIELD_STAFF.filter((s) => { const x = slotFor(s.id, TODAY); return x.kind === "job" && x.jobId === jobId; });

/* ---------- work: tasks, approvals, exceptions, workflows ---------- */
export interface Task { id: string; title: string; owner: string; due: string; priority: "High" | "Medium" | "Low"; status: "Not started" | "In progress" | "Review" | "Done"; link: string; source: string }
export const TASKS: Task[] = [
  { id: "T-1", title: "Approve draft invoice for Murphy Retail Fit-Out (€6,850)", owner: "seamus", due: "Today", priority: "High", status: "Review", link: "Murphy Retail Fit-Out", source: "Invoice Agent" },
  { id: "T-2", title: "Decide on Kerry Medical plant room delay", owner: "seamus", due: "Today", priority: "High", status: "In progress", link: "Kerry Medical Centre Fire Upgrade", source: "Ops Watchdog" },
  { id: "T-3", title: "Book Safe Pass renewal for Kyle Murphy", owner: "caitlin", due: "Fri 13 Nov", priority: "High", status: "In progress", link: "Kyle Murphy", source: "Compliance Agent" },
  { id: "T-4", title: "Approve renewal invoice, Kerry Fire Maintenance (€1,240)", owner: "caitlin", due: "Today", priority: "High", status: "Review", link: "Contract K-01", source: "Contracts Agent" },
  { id: "T-5", title: "Review remaining Park Hotel materials and price the €2,400 variation", owner: "seamus", due: "Thu 12 Nov", priority: "High", status: "Not started", link: "Park Hotel Electrical Upgrade", source: "Job Cost Agent" },
  { id: "T-6", title: "Chase Atlantic Lodge for stage 1 PO number", owner: "caitlin", due: "Wed 11 Nov", priority: "Medium", status: "In progress", link: "INV-4812", source: "Collections Agent" },
  { id: "T-7", title: "Chase landlord's rep for Kerry Medical plant room key", owner: "darragh", due: "Wed 11 Nov", priority: "High", status: "In progress", link: "Kerry Medical Centre", source: "Voice note 08:51" },
  { id: "T-8", title: "Confirm 4 hour outage with Park Hotel for Fri 13 Nov", owner: "eoin", due: "Wed 11 Nov", priority: "Medium", status: "Not started", link: "Park Hotel Electrical Upgrade", source: "Voice note 08:12" },
  { id: "T-9", title: "Chase ESB Networks for Dunloe connection date", owner: "sean", due: "Fri 13 Nov", priority: "Low", status: "Not started", link: "Dunloe Foods", source: "Site update" },
  { id: "T-10", title: "Send final notice, Derrynane Holiday Homes (INV-4641)", owner: "caitlin", due: "Wed 11 Nov", priority: "Medium", status: "Review", link: "Derrynane Holiday Homes", source: "Collections Agent" },
  { id: "T-11", title: "Book Manual Handling renewal for Liam O'Sullivan", owner: "caitlin", due: "Fri 27 Nov", priority: "Medium", status: "Not started", link: "Liam O'Sullivan", source: "Compliance Agent" },
  { id: "T-12", title: "Send Hennessy KNX scene sign-off sheet", owner: "seamus", due: "Fri 13 Nov", priority: "Low", status: "Done", link: "Waterville Residence Automation", source: "Seamus" },
];
export interface Approval { id: string; title: string; kind: "Invoice" | "Renewal" | "Supplier invoice" | "Variation" | "Leave"; amount?: number; from: string; approver: string; raised: string; detail: string; status: "Awaiting" | "Decided"; link: string; page: string }
export const APPROVALS: Approval[] = [
  { id: "A-1", title: "Draft invoice, Murphy Retail Fit-Out", kind: "Invoice", amount: 6850, from: "Invoice Agent", approver: "seamus", raised: "09:14", detail: "Balance of €18,600 contract. Job complete, handover signed. Prepared from quote, timesheets and 4 supplier invoices.", status: "Awaiting", link: "Q-1", page: "Finance" },
  { id: "A-2", title: "Contract renewal, Kerry Fire Maintenance", kind: "Renewal", amount: 1240, from: "Contracts Agent", approver: "caitlin", raised: "08:02", detail: "Annual fire alarm service agreement renews 24 Nov. Same price as last year.", status: "Awaiting", link: "Q-4", page: "Contracts" },
  { id: "A-3", title: "Supplier invoice MCL-90402 unmatched", kind: "Supplier invoice", amount: 3140, from: "Supplier Inbox", approver: "caitlin", raised: "07:21", detail: "Munster Cable & Lighting. Reference 'Kenmare hotel' fits Park Hotel (62%).", status: "Awaiting", link: "SI-Q1", page: "Finance" },
  { id: "A-4", title: "Job variation, Park Hotel level 3 emergency lighting", kind: "Variation", amount: 2400, from: "Job Cost Agent", approver: "seamus", raised: "Yesterday", detail: "Extra fittings requested by Maeve Sheehy. Recovers most of the material overrun. Not yet sent to client.", status: "Awaiting", link: "J-2641", page: "Jobs" },
  { id: "A-5", title: "Leave request, Seán Moriarty 17 to 19 Nov", kind: "Leave", from: "Seán Moriarty", approver: "caitlin", raised: "Sun", detail: "Overlaps Kyle Murphy (12 to 20 Nov). Two of eight field staff out.", status: "Awaiting", link: "L-2", page: "Schedule" },
  { id: "A-6", title: "Supplier invoice KE-28217 possible duplicate", kind: "Supplier invoice", amount: 3960, from: "Supplier Inbox", approver: "caitlin", raised: "06:58", detail: "Matches SI-03 received 15 Oct. Recommend reject.", status: "Awaiting", link: "SI-Q3", page: "Finance" },
  { id: "A-7", title: "Draft invoice, Caherdaniel Bay emergency lighting test", kind: "Invoice", amount: 1590, from: "Invoice Agent", approver: "caitlin", raised: "09:16", detail: "Service job S-0412, completed 30 Oct.", status: "Awaiting", link: "Q-2", page: "Finance" },
  { id: "A-8", title: "Contract renewal, Cahersiveen Intruder Monitoring", kind: "Renewal", amount: 720, from: "Contracts Agent", approver: "caitlin", raised: "Yesterday", detail: "Approved and queued to RedBook.", status: "Decided", link: "Q-5", page: "Contracts" },
];
export interface Exception { id: string; title: string; why: string; owner: string; age: string; severity: "high" | "medium" | "low"; agent: string; action: string; page: string }
export const EXCEPTIONS: Exception[] = [
  { id: "E-1", title: "Kerry Medical plant room access unavailable", why: "Site constraint raised by Darragh at 08:42. Completion may slip one day.", owner: "seamus", age: "1h", severity: "high", agent: "Ops Watchdog", action: "Decide: wait, or reschedule crew", page: "Jobs" },
  { id: "E-2", title: "Supplier invoice MCL-90402 could not be matched", why: "Reference reads 'Kenmare hotel'. Two jobs fit. Confidence 62%.", owner: "caitlin", age: "2h", severity: "medium", agent: "Supplier Inbox", action: "Pick the job", page: "Finance" },
  { id: "E-3", title: "Supplier invoice ACD-7790 has no job reference", why: "No reference in the PDF or email. Best guess 38%.", owner: "caitlin", age: "17h", severity: "medium", agent: "Supplier Inbox", action: "Assign a job", page: "Finance" },
  { id: "E-4", title: "Possible duplicate: KE-28217", why: "Same number and amount as an invoice already on Park Hotel.", owner: "caitlin", age: "3h", severity: "low", agent: "Supplier Inbox", action: "Reject or keep", page: "Finance" },
  { id: "E-5", title: "Atlantic Lodge invoice 52 days overdue", why: "Customer says PO number is coming. Three reminders sent.", owner: "caitlin", age: "52d", severity: "high", agent: "Collections Agent", action: "Call head office", page: "Finance" },
  { id: "E-6", title: "Kerry Medical day clash on Thu 12 Nov", why: "Darragh booked at Cahersiveen. Kyle on leave.", owner: "caitlin", age: "1h", severity: "high", agent: "Ops Watchdog", action: "Rebalance crew", page: "Schedule" },
  { id: "E-7", title: "Kyle Murphy Safe Pass expires in 12 days", why: "Renewal course not yet booked. He is on leave from 12 Nov.", owner: "caitlin", age: "2h", severity: "high", agent: "Compliance Agent", action: "Book renewal", page: "People" },
];
export interface Workflow { id: string; name: string; agent: string; trigger: string; steps: string[]; last: string; result: string; ok: boolean; autoRate: number; runs: number; humanStep: string }
export const WORKFLOWS: Workflow[] = [
  { id: "W-1", name: "Completed job to draft invoice", agent: "Invoice Agent", trigger: "Job reaches 100% or a billing milestone", steps: ["Detect", "Assemble from quote, hours, materials, variations", "Draft invoice", "Approval", "Queue to RedBook", "Monitor payment"], last: "09:14 today", result: "Murphy Retail draft ready", ok: true, autoRate: 0.86, runs: 41, humanStep: "Approval" },
  { id: "W-2", name: "Supplier invoice to job cost", agent: "Job Cost Agent", trigger: "Email arrives at invoices@joecurranelectrical.ie", steps: ["Detect invoice", "Recognise supplier", "Extract job reference", "Categorise cost", "Duplicate check", "Attach and update job"], last: "09:07 today", result: "4 matched, 4 exceptions", ok: true, autoRate: 0.84, runs: 118, humanStep: "Exceptions only" },
  { id: "W-3", name: "Payment follow up", agent: "Collections Agent", trigger: "Invoice passes its due date", steps: ["Day 1 friendly reminder", "Day 7 reminder", "Day 21 call task", "Day 35 final notice for Caitlin"], last: "09:00 today", result: "2 reminders sent", ok: true, autoRate: 0.78, runs: 64, humanStep: "Calls and final notices" },
  { id: "W-4", name: "Contract renewal", agent: "Contracts Agent", trigger: "60 days before renewal date", steps: ["Detect renewals", "Check supplier cost", "Draft renewal invoice", "Approval", "Send", "Monitor"], last: "07:58 today", result: "3 uninvoiced renewals found", ok: true, autoRate: 0.7, runs: 22, humanStep: "Approval" },
  { id: "W-5", name: "Certificate expiry", agent: "Compliance Agent", trigger: "45 days before expiry", steps: ["Detect", "Notify employee", "Create renewal task for Caitlin", "Await booking", "Update record"], last: "08:15 today", result: "Kyle Murphy Safe Pass flagged", ok: true, autoRate: 0.92, runs: 17, humanStep: "Booking" },
  { id: "W-6", name: "Voice update to job update", agent: "Site Knowledge Agent", trigger: "Technician records a voice note", steps: ["Transcribe", "Extract progress, issues, tasks", "Update job", "Notify owner if constraint"], last: "08:51 today", result: "Progress 44% to 48%", ok: true, autoRate: 0.95, runs: 203, humanStep: "None" },
  { id: "W-7", name: "Morning briefing", agent: "Briefing", trigger: "Weekdays 07:00", steps: ["Read the business overnight", "Drop what is handled", "Write the briefing"], last: "07:00 today", result: "Delivered to Seamus and Caitlin", ok: true, autoRate: 1, runs: 190, humanStep: "None" },
  { id: "W-8", name: "RedBook sync", agent: "Ops Watchdog", trigger: "Hourly", steps: ["Find approved invoices", "Post to RedBook", "Reconcile"], last: "09:00 today", result: "Connected, 1 invoice queued", ok: true, autoRate: 0.97, runs: 340, humanStep: "None" },
];

/* ---------- reconciled headline numbers ---------- */
export function headline() {
  const js = jobsSummary();
  const cs = contractSummary();
  return { js, cs };
}
export type { SkillKey, Level };
