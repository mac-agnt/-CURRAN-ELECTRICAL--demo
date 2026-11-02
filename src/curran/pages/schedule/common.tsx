import { JOBS, siteById, jobById, dow, fmtDate, RoleKey } from "../../index";

export const SHORT: Record<string, string> = {
  "J-2641": "Park Hotel", "J-2652": "Murphy Retail", "J-2658": "Kerry Medical", "J-2663": "Hennessy",
  "J-2667": "Atlantic Lodge", "J-2671": "Cahersiveen NH", "J-2674": "Dunloe Foods",
};
/* One muted tint per job so a lane reads at a glance. Chips are tinted fills, not borders. */
export const JOB_TINT: Record<string, string> = {
  "J-2641": "#1c93e3", "J-2652": "#9bd0b6", "J-2658": "#f0b48c", "J-2663": "#c8b4f0",
  "J-2667": "#e6c78a", "J-2671": "#8fa6ff", "J-2674": "#7fc4f2",
};
export const tint = (c: string, pct = 18) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;
export const canEditRole = (r: RoleKey) => r === "md" || r === "admin";
export const longDay = (d: string) => dow(d) + " " + fmtDate(d);
export const jobShort = (id: string) => SHORT[id] || jobById(id)?.name || id;
export const jobTown = (id: string) => { const j = jobById(id); return j ? siteById(j.siteId).town : ""; };
export const ACTIVE_JOB_IDS = JOBS.map((j) => j.id);
export const HATCH = "repeating-linear-gradient(135deg, var(--track) 0 5px, transparent 5px 10px)";
