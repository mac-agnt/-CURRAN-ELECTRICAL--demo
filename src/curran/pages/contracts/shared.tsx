import { CONTRACTS, Contract, InvoiceState, SYSTEMS, QUEUE, siteById, dayDiff, eur, fmtDate, addDays, contractSummary, RENEW_WINDOW, sum, systemById, toast } from "../../index";
import { Pill, Tone } from "../../ui";
import { FinState, setStage, useFin } from "../finance/state";

/* contract id to the Invoice Queue item that carries its draft */
export const QMAP: Record<string, string> = { "K-01": "Q-4", "K-03": "Q-7", "K-04": "Q-5", "K-06": "Q-8" };

export function effInvoice(c: Contract, f: FinState): InvoiceState {
  const q = QMAP[c.id];
  const s = q ? f.stage[q] : undefined;
  if (!s) return c.invoice;
  return s === "Opportunity detected" ? "Not drafted" : s === "Draft prepared" || s === "Awaiting approval" ? "Draft ready" : s === "Approved" ? "Approved" : s === "Sent" ? "Sent" : "Paid";
}
export const invTone = (s: InvoiceState, daysToRenew: number): Tone => s === "Paid" ? "ok" : s === "Sent" || s === "Approved" ? "accent" : s === "Draft ready" ? "warn" : s === "Not drafted" ? (daysToRenew <= 30 ? "bad" : "warn") : "neutral";
export const InvPill = ({ c, f }: { c: Contract; f: FinState }) => { const s = effInvoice(c, f); return <Pill tone={invTone(s, dayDiff(c.renew))}>{s}</Pill>; };
export const siteLabel = (c: Contract) => (c.siteId ? siteById(c.siteId).name : "Site match pending");
export const systemLabel = (c: Contract) => (c.systemIds.length ? systemById(c.systemIds[0]).label + (c.systemIds.length > 1 ? " +" + (c.systemIds.length - 1) : "") : c.type);
export const marginOf = (c: Contract) => (c.billing - c.supplierCost) / c.billing;
export const isCloud = (c: Contract) => !!c.platform;
export const GROUPS = ["Fire and emergency lighting", "Intruder and CCTV", "Cloud and monitoring platforms", "Testing and PAT", "EV charger service", "Home automation support"] as const;
export const groupOf = (c: Contract): (typeof GROUPS)[number] => {
  if (c.platform) return "Cloud and monitoring platforms";
  if (/fire|emergency/i.test(c.type)) return "Fire and emergency lighting";
  if (/intruder|cctv/i.test(c.type)) return "Intruder and CCTV";
  if (/test|pat/i.test(c.type)) return "Testing and PAT";
  if (/ev/i.test(c.type)) return "EV charger service";
  return "Home automation support";
};
export const daysLeft = (c: Contract) => dayDiff(c.renew);
export const renewalStatus = (c: Contract) => { const d = daysLeft(c); return d <= RENEW_WINDOW ? "Renews in " + d + " days" : "Active, renews " + fmtDate(c.renew); };
export const techFor = (c: Contract) => /fire|cctv|intruder|security|cloud|monitor/i.test(c.type) ? "darragh" : /emergency|test/i.test(c.type) ? "ciara" : /ev/i.test(c.type) ? "sean" : "seamus";
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Effective summary, taking any approvals made in this session into account. */
export function useEffSummary() {
  const f = useFin();
  const base = contractSummary();
  const renewing = CONTRACTS.filter((c) => dayDiff(c.renew) <= RENEW_WINDOW && dayDiff(c.renew) >= 0).sort((a, b) => a.renew.localeCompare(b.renew));
  const unbilled = renewing.filter((c) => { const s = effInvoice(c, f); return s === "Draft ready" || s === "Not drafted"; });
  return { ...base, f, renewing, unbilled, unbilledValue: sum(unbilled.map((c) => c.billing)), unbilledN: unbilled.length };
}
export function prepareDraft(c: Contract, f: FinState) {
  const q = QMAP[c.id];
  if (q && (f.stage[q] || QUEUE.find((x) => x.id === q)!.stage) === "Opportunity detected") {
    setStage(q, "Draft prepared");
    toast("Draft prepared for " + c.name + ", " + eur(c.billing) + ". Now in the Invoice Queue");
  } else if (q) toast("A draft already exists in the Invoice Queue");
  else toast("Draft scheduled. Contracts Agent prepares it 30 days before " + fmtDate(c.renew));
}
