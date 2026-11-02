import { ReactNode } from "react";
import { useCurran, can, roleOf, JOBS, Job, jobFin, JobStatus, slotFor, weekDates, STAFF, dayDiff, fmtDow, TODAY, eur, STATUS_LABEL } from "../../index";
import { Pill, Tone, Avatar, TONE } from "../../ui";

export const STATUS_TONE: Record<JobStatus, Tone> = { "margin-risk": "warn", "invoice-required": "accent", constraint: "warn", "on-track": "ok" };
export const StatusPill = ({ status }: { status: JobStatus }) => <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>;

export interface Access { role: string; staffId: string; lvl: 0 | 1 | 2; margins: boolean; money: boolean; office: boolean }
/** lvl 2 managing director, lvl 1 admin (money, no margins), lvl 0 field roles (no money). */
export function useAccess(): Access {
  const { role } = useCurran();
  const r = roleOf(role);
  return { role, staffId: r.staffId, lvl: role === "md" ? 2 : role === "admin" ? 1 : 0, margins: can(role, "margins"), money: can(role, "finance"), office: role === "md" || role === "admin" };
}
export function jobsScheduledFor(staffId: string): Job[] {
  const dates = weekDates("w0").concat(weekDates("w1"));
  const ids = new Set<string>();
  dates.forEach((d) => { const s = slotFor(staffId, d); if (s.kind === "job" && s.jobId) ids.add(s.jobId); });
  return JOBS.filter((j) => ids.has(j.id) || j.lead === staffId);
}
export const visibleJobs = (a: Access): Job[] => (a.office ? JOBS : jobsScheduledFor(a.staffId));

export function costStatus(j: Job): { label: string; tone: Tone } {
  const f = jobFin(j);
  if (f.fcMargin < f.origMargin - 0.03) return { label: "Over budget", tone: "warn" };
  if (f.matOverPct > 0.05 || f.labOverPct > 0.05) return { label: "Watch costs", tone: "warn" };
  return { label: "Within budget", tone: "ok" };
}
export const who = (id: string) => { const s = STAFF.find((x) => x.id === id); return s ? { name: s.name, staff: s.id } : { name: id === "system" ? "Pulse" : id, staff: undefined as string | undefined }; };
export function fmtWhen(w: string) {
  const d = w.slice(0, 10), t = w.slice(11, 16), n = dayDiff(d);
  return (n === 0 ? "Today" : n === -1 ? "Yesterday" : fmtDow(d)) + (t ? " " + t : "");
}
export const isMoneyText = (s: string) => /margin|€|invoice|overdue|budget|PO\b|price/i.test(s);

export const Facts = ({ items }: { items: [string, ReactNode][] }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
    {items.map(([k, v]) => (
      <div key={k} style={{ padding: "11px 13px", background: "var(--surface-faint)", border: "1px solid var(--border)", borderRadius: "var(--r-sm,12px)", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}>{k}</div>
        <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{v}</div>
      </div>
    ))}
  </div>
);

/** Used against budget, with the pro-rata point for the job's progress marked. */
export function Meter({ label, used, budget, forecast, progress, format = eur, unit }: { label: string; used: number; budget: number; forecast?: number; progress: number; format?: (n: number) => string; unit?: string }) {
  const mx = Math.max(budget, forecast || 0, used) * 1.06;
  const pro = (budget * progress) / 100;
  const over = used > pro * 1.05;
  const tone: Tone = over ? "warn" : "accent";
  const overPct = Math.round((used / pro - 1) * 100);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 12.5, color: "var(--body)", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{format(used)}{unit}</span>
        <span style={{ fontSize: 11.5, color: "var(--faint)" }}>of {format(budget)}{unit}</span>
      </div>
      <div style={{ position: "relative", height: 8, borderRadius: 99, background: "var(--track)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (used / mx) * 100 + "%", borderRadius: 99, background: TONE[tone].fg, transition: "width .6s var(--ease)" }} />
        <div title="Budget pro-rata to progress" style={{ position: "absolute", left: (pro / mx) * 100 + "%", top: -3, bottom: -3, width: 2, background: "var(--ink)", opacity: 0.7, borderRadius: 2 }} />
        <div title="Full budget" style={{ position: "absolute", left: (budget / mx) * 100 + "%", top: -2, bottom: -2, width: 1, background: "var(--faint)" }} />
      </div>
      <div style={{ fontSize: 11.5, color: over ? "var(--warn)" : "var(--faint)", marginTop: 6 }}>
        {over ? overPct + "% over the budget for " + progress + "% complete" : "On pace for " + progress + "% complete"}
      </div>
    </div>
  );
}
export const Who = ({ id, size = 22 }: { id: string; size?: number }) => {
  const w = who(id);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 7, minWidth: 0 }}><Avatar staffId={w.staff} name={w.name} size={size} /><span style={{ fontSize: 12.5, color: "var(--body)", whiteSpace: "nowrap" }}>{w.name.split(" ")[0]}</span></span>;
};
export const TODAY_STR = TODAY;

export const Cut = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, ...style }}>{children}</div>;
export const NameCell = ({ title, sub, mono }: { title: ReactNode; sub?: ReactNode; mono?: boolean }) => (
  <div style={{ minWidth: 0, width: "100%" }}>
    <Cut style={{ color: "var(--ink)", fontWeight: 500 }}>{title}</Cut>
    {sub && <Cut style={{ fontSize: mono ? 10.5 : 11.5, color: "var(--faint)", marginTop: 2, fontFamily: mono ? "var(--mono)" : undefined }}>{sub}</Cut>}
  </div>
);
