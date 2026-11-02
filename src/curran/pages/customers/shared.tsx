import { ReactNode } from "react";
import {
  CUSTOMERS, SITES, SYSTEMS, JOBS, CONTRACTS, INVOICES, COMPLETED, TODAY, dayDiff, fmtDate, sum, invoiceOutstanding, daysOverdue,
  customerById, siteById, can, goTo, select, type RoleKey, type Customer, type InstalledSystem, type Contract,
} from "../../index";
import { Pill, type Tone } from "../../ui";

export interface CustStats {
  c: Customer; sites: number; systems: InstalledSystem[]; activeJobs: typeof JOBS; contracts: Contract[]; outstanding: number; invoiced: number; overdue: number; oldest: number;
}
export function custStats(id: string): CustStats {
  const c = customerById(id);
  const systems = SYSTEMS.filter((s) => c.siteIds.indexOf(s.siteId) > -1);
  const open = invoiceOutstanding().filter((i) => i.customerId === id);
  return {
    c, sites: c.siteIds.length, systems, activeJobs: JOBS.filter((j) => j.customerId === id), contracts: CONTRACTS.filter((k) => k.customerId === id),
    outstanding: sum(open.map((i) => i.amount)), invoiced: sum(INVOICES.filter((i) => i.customerId === id).map((i) => i.amount)),
    overdue: sum(open.filter((i) => daysOverdue(i) > 0).map((i) => i.amount)), oldest: Math.max(0, ...open.map(daysOverdue)),
  };
}
export const showMoney = (role: RoleKey) => can(role, "finance");
export const isFieldRole = (role: RoleKey) => role === "electrician" || role === "apprentice";

export const openCustomer = (id: string) => goTo("Customers", "customers", { customer: id });
export const openSite = (id: string) => goTo("Customers", "sites", { site: id });
export const openSystem = (id: string) => goTo("Customers", "systems", { system: id });
export const openSystemSticky = (id: string) => select({ system: id });

export function dueTone(date: string): { tone: Tone; label: string } {
  const n = dayDiff(date);
  if (n < 0) return { tone: "bad", label: "Overdue " + Math.abs(n) + "d" };
  if (n <= 30) return { tone: "warn", label: "Due " + fmtDate(date) };
  return { tone: "neutral", label: fmtDate(date) };
}
export const DueChip = ({ date }: { date: string }) => { const t = dueTone(date); return <Pill tone={t.tone}>{t.label}</Pill>; };

export const KIND_TINT: Record<string, string> = {
  "Fire alarm": "var(--bad)", "Emergency lighting": "var(--warn)", CCTV: "var(--accent)", Intruder: "var(--accent)", "Structured cabling": "var(--dim)", "Wi-Fi": "var(--dim)", "Home automation": "var(--accent)", "EV charging": "var(--ok)",
};
export const KindDot = ({ kind }: { kind: string }) => (
  <span style={{ width: 8, height: 8, borderRadius: 3, background: KIND_TINT[kind] || "var(--dim)", display: "inline-block", flex: "none", opacity: 0.85 }} />
);
export const Chip = ({ children, onClick, tone }: { children: ReactNode; onClick?: () => void; tone?: "accent" }) => (
  <button onClick={onClick} className={onClick ? "ixu" : undefined} disabled={!onClick}
    style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 28, padding: "0 11px", borderRadius: "var(--r-ctl,999px)", border: "1px solid " + (tone ? "var(--accent-line)" : "var(--border)"), background: tone ? "var(--accent-faint)" : "var(--surface-2)", color: tone ? "var(--accent)" : "var(--body)", fontSize: 12, cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap", transition: "border-color .2s var(--ease), color .2s var(--ease)" }}>
    {children}
  </button>
);

/** Deterministic QR-style pattern. Looks like a label, it is not a scannable code. */
export function QrMark({ seed, size = 148 }: { seed: string; size?: number }) {
  const N = 25;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  const cells: ReactNode[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (finder(x, y)) continue;
    if (x > 9 && x < 15 && y > 9 && y < 15) continue;
    if (rnd() > 0.52) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  }
  const eye = (ox: number, oy: number) => (
    <g key={ox + "," + oy}><rect x={ox} y={oy} width="7" height="7" /><rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" /><rect x={ox + 2} y={oy + 2} width="3" height="3" /></g>
  );
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${N + 4} ${N + 4}`} style={{ display: "block", borderRadius: 10, background: "#fff" }} shapeRendering="crispEdges" fill="#0b1217">
      {cells}{eye(0, 0)}{eye(N - 7, 0)}{eye(0, N - 7)}
      <rect x="10" y="10" width="5" height="5" fill="#fff" /><rect x="11" y="11" width="3" height="3" fill="#1c93e3" />
    </svg>
  );
}
/** The contract covering a system: an explicit link, else one for the same customer and type of work. */
const KIND_RX: Record<string, RegExp> = { "Fire alarm": /fire/i, "Emergency lighting": /emergency/i, CCTV: /cctv/i, Intruder: /intruder/i, "EV charging": /ev charger/i, "Structured cabling": /cabling|network/i, "Wi-Fi": /wi-?fi|network/i, "Home automation": /home automation|knx/i };
export function contractFor(s: InstalledSystem): Contract | undefined {
  if (s.contractId) return CONTRACTS.find((k) => k.id === s.contractId);
  const cid = siteById(s.siteId).customerId, rx = KIND_RX[s.kind];
  return rx ? CONTRACTS.find((k) => k.customerId === cid && !k.systemIds.length && (k.siteId === s.siteId) && rx.test(k.type + " " + k.name)) : undefined;
}
export const siteName = (id: string) => siteById(id).name;
export { TODAY, COMPLETED };
