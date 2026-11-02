import { useState } from "react";
import {
  STAFF, FIELD_STAFF, JOBS, WEEKS, CONFLICTS, UNASSIGNED, TODAY, Slot, jobById, siteById, staffById, weekDates, slotFor, assessAssignment, leaveOn,
  driveMins, addDays, dow, fmtDate, useCurran, goTo, toast, LEAVE,
} from "../../index";
import { Card, Head, Pill, Seg, Btn, Ic, Callout, Label, Kpi, Grid, Avatar, Progress, TONE, Tone } from "../../ui";
import { SHORT, JOB_TINT, tint, canEditRole, jobShort, jobTown, longDay, HATCH } from "./common";

type Eff = (staffId: string, date: string) => Slot;
interface Target { jobId?: string; title: string; uid?: string; req?: { skill: string; min: number; psa?: boolean } }
interface Pending { staffId: string; date: string; target: Target | null; from?: { staffId: string; date: string } }
interface Row { kind: string; level: "ok" | "warn" | "block"; label: string; text: string }

const SERVICE_REQ: Record<string, Target["req"]> = {
  "U-2": { skill: "Intruder", min: 2, psa: true }, "U-3": { skill: "Emergency Lighting", min: 2 },
};
const key = (s: string, d: string) => s + "|" + d;

/** Runs assessAssignment and adds the local checks (existing job under local moves, pending leave, capacity). */
export function runCheck(staffId: string, target: Target, date: string, eff: Eff): Row[] {
  const s = staffById(staffId), rows: Row[] = [];
  const central = target.jobId ? assessAssignment(staffId, target.jobId, date) : [];
  const j = target.jobId ? jobById(target.jobId) : undefined;
  const cur = eff(staffId, date);
  const lv = leaveOn(staffId, date);
  // 1. holiday
  const leaveIssue = central.find((i) => i.kind === "leave");
  if (lv) rows.push({ kind: "leave", level: "block", label: "Holiday", text: leaveIssue ? leaveIssue.text : "Cannot assign " + s.name + ": annual leave " + lv.from.slice(8) + " to " + lv.to.slice(8) + " Nov" });
  else if (cur.kind === "pending-leave") {
    const p = LEAVE.find((l) => l.staffId === staffId && l.status === "Pending" && date >= l.from && date <= l.to);
    rows.push({ kind: "leave", level: "warn", label: "Holiday", text: s.first + " has a leave request pending" + (p ? " (" + p.from.slice(8) + " to " + p.to.slice(8) + " Nov)" : "") });
  } else rows.push({ kind: "leave", level: "ok", label: "Holiday", text: "No leave booked" });
  // 2. existing job, from local state
  if (cur.kind === "job" && cur.jobId !== target.jobId) rows.push({ kind: "booked", level: "block", label: "Existing job", text: s.first + " is already on " + (cur.jobId ? jobShort(cur.jobId) : cur.label) + " that day" });
  else if (cur.kind === "training") rows.push({ kind: "booked", level: "block", label: "Existing job", text: s.first + " is in training: " + cur.label });
  else if (cur.kind === "job") rows.push({ kind: "booked", level: "ok", label: "Existing job", text: "Already on this job that day" });
  else rows.push({ kind: "booked", level: "ok", label: "Existing job", text: "Free that day" });
  // 3. skill
  const skillIssues = central.filter((i) => i.kind === "skill");
  if (j) {
    if (skillIssues.length) skillIssues.forEach((i) => rows.push({ kind: "skill", level: "warn", label: "Skill", text: i.text }));
    else rows.push({ kind: "skill", level: "ok", label: "Skill", text: "Meets " + j.requires.map((r) => r.skill + " " + r.min + "+").join(", ") });
  } else if (target.req) {
    const lvl = (s.skills as any)[target.req.skill] ?? 0;
    rows.push(lvl < target.req.min ? { kind: "skill", level: "warn", label: "Skill", text: "Needs " + target.req.skill + " " + target.req.min + "+. " + s.first + " is level " + lvl } : { kind: "skill", level: "ok", label: "Skill", text: "Meets " + target.req.skill + " " + target.req.min + "+ (level " + lvl + ")" });
  } else rows.push({ kind: "skill", level: "ok", label: "Skill", text: "No specific skill needed" });
  // 4. certification
  const certIssues = central.filter((i) => i.kind === "cert");
  if (certIssues.length) certIssues.forEach((i) => rows.push({ kind: "cert", level: i.level, label: "Certification", text: i.text }));
  else if (j) rows.push({ kind: "cert", level: "ok", label: "Certification", text: j.certs.join(" and ") + " valid on the day" });
  else rows.push({ kind: "cert", level: "ok", label: "Certification", text: target.req?.psa ? "PSA licence on record" : "Records valid" });
  if (!j && target.req?.psa) { const hasPsa = !!(staffId === "sean" || staffId === "darragh"); if (!hasPsa) rows[rows.length - 1] = { kind: "cert", level: "warn", label: "Certification", text: s.first + " has no PSA Licence on record" }; }
  // 5. travel
  const trav = central.find((i) => i.kind === "travel");
  rows.push(trav ? { kind: "travel", level: "warn", label: "Travel", text: trav.text } : { kind: "travel", level: "ok", label: "Travel", text: "No long drive from the day before" });
  // 6. capacity
  const free = FIELD_STAFF.filter((x) => x.id !== staffId && eff(x.id, date).kind === "office").length;
  rows.push(free === 0 ? { kind: "capacity", level: "warn", label: "Capacity", text: "No spare field staff left on " + dow(date) + " once " + s.first + " is placed" } : { kind: "capacity", level: "ok", label: "Capacity", text: free + " other field staff still free on " + dow(date) });
  return rows;
}

const LEVEL_TONE: Record<string, Tone> = { ok: "ok", warn: "warn", block: "bad" };

export default function Planner() {
  const cur = useCurran();
  const edit = canEditRole(cur.role);
  const [week, setWeek] = useState("w0");
  const [ov, setOv] = useState<Record<string, Slot>>({});
  const [placed, setPlaced] = useState<string[]>([]);
  const [drag, setDrag] = useState<{ target: Target; from?: { staffId: string; date: string } } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [pend, setPend] = useState<Pending | null>(null);
  const [resolved, setResolved] = useState(false);
  const [proposal, setProposal] = useState(false);

  const wk = WEEKS.find((w) => w.id === week)!;
  const dates = weekDates(week);
  const eff: Eff = (sid, d) => ov[key(sid, d)] || slotFor(sid, d);
  const lanes = STAFF.filter((s) => s.field).concat(STAFF.filter((s) => !s.field));
  const conflicts = CONFLICTS.filter((c) => dates.indexOf(c.date) > -1 && !resolved);
  const trays = UNASSIGNED.filter((u) => placed.indexOf(u.id) < 0 && !(resolved && u.id === "U-1"));

  // week figures from effective slots
  let jobDays = 0, leaveDays = 0, freeDays = 0;
  FIELD_STAFF.forEach((s) => dates.forEach((d) => { const k = eff(s.id, d).kind; if (k === "job" || k === "service") jobDays++; else if (k === "leave" || k === "pending-leave") leaveDays++; else if (k === "office") freeDays++; }));

  const startDrag = (e: React.DragEvent, target: Target, from?: { staffId: string; date: string }) => {
    e.dataTransfer.setData("text/plain", target.title);
    e.dataTransfer.effectAllowed = "move";
    setDrag({ target, from });
  };
  const drop = (staffId: string, date: string) => {
    setOver(null);
    if (!drag || !edit) return;
    if (drag.from && drag.from.staffId === staffId && drag.from.date === date) { setDrag(null); return; }
    setPend({ staffId, date, target: drag.target, from: drag.from });
    setDrag(null);
  };
  const openCell = (staffId: string, date: string) => { if (edit && staffById(staffId).field) setPend({ staffId, date, target: null }); };
  const confirm = () => {
    if (!pend || !pend.target) return;
    const t = pend.target;
    const slot: Slot = t.jobId ? { kind: "job", jobId: t.jobId, label: jobById(t.jobId).name } : { kind: "service", label: t.title };
    const next = { ...ov, [key(pend.staffId, pend.date)]: slot };
    if (pend.from) next[key(pend.from.staffId, pend.from.date)] = { kind: "office", label: "Free day" };
    setOv(next);
    if (t.uid) setPlaced((p) => p.concat(t.uid!));
    toast(staffById(pend.staffId).first + " assigned to " + (t.jobId ? jobShort(t.jobId) : t.title) + " on " + longDay(pend.date));
    setPend(null);
  };
  const applyProposal = () => {
    const d = "2026-11-12", kmc = jobById("J-2658");
    const slot: Slot = { kind: "job", jobId: "J-2658", label: kmc.name };
    setOv((o) => ({ ...o, [key("darragh", d)]: slot, [key("seamus", d)]: slot }));
    setResolved(true); setProposal(false);
    toast("Crew rebalanced: Darragh and Seamus on Kerry Medical, Thu 12 Nov");
  };

  const rows = pend && pend.target ? runCheck(pend.staffId, pend.target, pend.date, eff) : [];
  const blocked = rows.some((r) => r.level === "block");
  const warns = rows.filter((r) => r.level === "warn").length;

  const cell = (s: (typeof STAFF)[number], d: string, idx: number) => {
    const sl = eff(s.id, d);
    const isToday = d === TODAY;
    const k = key(s.id, d);
    const conflict = CONFLICTS.find((c) => c.date === d && c.staff.indexOf(s.id) > -1 && !resolved);
    const droppable = edit && s.field;
    const dropping = over === k && drag;
    const prev = idx > 0 ? eff(s.id, dates[idx - 1]) : null;
    let travel = "";
    if (sl.kind === "job" && sl.jobId && prev && prev.kind === "job" && prev.jobId && prev.jobId !== sl.jobId) {
      const m = driveMins(jobTown(prev.jobId), jobTown(sl.jobId)); if (m >= 45) travel = "Drive " + m + " min from " + jobTown(prev.jobId);
    }
    let body: React.ReactNode;
    if (sl.kind === "job" && sl.jobId) {
      const c = JOB_TINT[sl.jobId] || "var(--accent)";
      body = (
        <div draggable={droppable} onDragStart={(e) => startDrag(e, { jobId: sl.jobId, title: jobShort(sl.jobId!) }, { staffId: s.id, date: d })} onDragEnd={() => { setDrag(null); setOver(null); }}
          style={{ background: tint(c, 20), borderRadius: 11, padding: "6px 8px", cursor: droppable ? "grab" : "default", minHeight: 44, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: c, flex: "none" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{jobShort(sl.jobId)}</span>
            <button title="Open job" onClick={(e) => { e.stopPropagation(); goTo("Jobs", "active", { job: sl.jobId }); }} style={{ border: 0, background: "none", color: "var(--dim)", cursor: "pointer", padding: 0, display: "flex" }}><Ic n="arrow" size={11} /></button>
          </div>
          <div style={{ fontSize: 10.5, color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sl.jobId + " · " + jobTown(sl.jobId)}</div>
          {travel && <div style={{ fontSize: 10, color: "var(--warn)" }}>{travel}</div>}
        </div>
      );
    } else if (sl.kind === "leave") body = <div style={{ background: HATCH, borderRadius: 11, padding: "6px 8px", minHeight: 44, fontSize: 12, color: "var(--dim)", display: "flex", alignItems: "center" }}>Annual leave</div>;
    else if (sl.kind === "pending-leave") body = <div style={{ border: "1px dashed var(--warn)", borderRadius: 11, padding: "6px 8px", minHeight: 44, fontSize: 11.5, color: "var(--warn)", display: "flex", flexDirection: "column", justifyContent: "center" }}><span>Leave requested</span><span style={{ fontSize: 10, color: "var(--dim)" }}>Awaiting approval</span></div>;
    else if (sl.kind === "training") body = <div style={{ background: "var(--surface-2)", borderRadius: 11, padding: "6px 8px", minHeight: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}><span style={{ fontSize: 10, color: "var(--faint)", letterSpacing: ".08em" }}>TRAINING</span><span style={{ fontSize: 11.5, color: "var(--body)", lineHeight: 1.25 }}>{sl.label}</span></div>;
    else if (sl.kind === "service") body = <div style={{ background: "var(--accent-soft)", borderRadius: 11, padding: "6px 8px", minHeight: 44, fontSize: 12, color: "var(--ink)", display: "flex", alignItems: "center" }}>{sl.label}</div>;
    else body = <div style={{ minHeight: 44, display: "flex", alignItems: "center", padding: "0 8px", fontSize: 11.5, color: "var(--faint)" }}>{s.field ? (sl.label === "Free day" ? "Free day" : "Office / admin") : "Office"}</div>;
    return (
      <div key={d} onClick={() => openCell(s.id, d)}
        onDragOver={(e) => { if (droppable && drag) { e.preventDefault(); if (over !== k) setOver(k); } }} onDragLeave={() => over === k && setOver(null)} onDrop={(e) => { e.preventDefault(); drop(s.id, d); }}
        style={{ padding: 5, minWidth: 0, background: dropping ? "var(--accent-soft)" : isToday ? "var(--accent-faint)" : undefined, boxShadow: conflict ? "inset 0 0 0 1.5px var(--warn)" : dropping ? "inset 0 0 0 1.5px var(--accent)" : undefined, borderRadius: 12, cursor: droppable ? "pointer" : "default", position: "relative", transition: "background .15s var(--ease)" }}>
        {body}
        {conflict && <span title={conflict.title} style={{ position: "absolute", top: 7, right: 8, color: "var(--warn)", display: "flex" }}><Ic n="alert" size={13} /></span>}
      </div>
    );
  };

  const COLS = "168px repeat(5, minmax(108px, 1fr))";
  return (
    <>
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Kpi label="On jobs this week" value={jobDays} hint={"field staff-days, " + wk.span} />
        <Kpi label="Free field days" value={freeDays} hint="office or unassigned" />
        <Kpi label="Away" value={leaveDays} hint="leave, including requested" />
        <Kpi label="Conflicts" value={conflicts.length} tone={conflicts.length ? "warn" : "ok"} hint={conflicts.length ? "needs a decision" : "none open"} />
      </Grid>

      {conflicts.map((c) => (
        <Callout key={c.id} tone="warn" title={c.title + " (" + longDay(c.date) + ")"}
          right={edit ? <Btn kind="primary" small onClick={() => setProposal((p) => !p)}>{proposal ? "Hide options" : "Rebalance crew"}</Btn> : undefined}>
          {c.detail}
          {proposal && (
            <div style={{ marginTop: 10, padding: "11px 13px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600, marginBottom: 4 }}>Suggested by Pulse</div>
              <div style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.55 }}>Put Darragh Sheehan and Seamus Curran on Kerry Medical for Thursday 12 Nov. Ciara Counihan is already on Cahersiveen Nursing Home that day and covers it. Seán Moriarty and Jack Riordan stay on Hennessy. Both have Fire Systems level 2+ and valid Safe Pass.</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}><Btn kind="primary" small onClick={applyProposal}>Apply</Btn><Btn small onClick={() => setProposal(false)}>Keep as is</Btn></div>
            </div>
          )}
        </Callout>
      ))}
      {resolved && <Callout tone="ok" title="Kerry Medical Thursday covered">Darragh Sheehan and Seamus Curran are on site Thu 12 Nov. Kyle Murphy remains on leave.</Callout>}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 660px", minWidth: 0 }}>
          <Card flush>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{wk.label}</div>
                <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>{wk.span} · jobs, people, leave and training in one view</div>
              </div>
              <Seg options={WEEKS.map((w) => [w.id, w.id === "w0" ? "This week" : w.id === "w1" ? "Next" : "+" + (Number(w.id.slice(1))) + " wk"] as [string, string])} value={week} onChange={(v) => { setWeek(v); setPend(null); }} />
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 700 }}>
                <div style={{ display: "grid", gridTemplateColumns: COLS, borderTop: "1px solid var(--border)", background: "var(--surface-faint)" }}>
                  <div style={{ padding: "9px 16px", fontSize: 11.5, color: "var(--faint)" }}>Staff</div>
                  {dates.map((d) => (
                    <div key={d} style={{ padding: "9px 8px", fontSize: 12, textAlign: "center", color: d === TODAY ? "var(--accent)" : "var(--dim)", fontWeight: d === TODAY ? 600 : 500 }}>
                      {longDay(d)}{d === TODAY && <span style={{ marginLeft: 6, fontSize: 10, fontFamily: "var(--mono)", letterSpacing: ".1em" }}>TODAY</span>}
                    </div>
                  ))}
                </div>
                {lanes.map((s) => {
                  const days = dates.filter((d) => ["job", "service"].indexOf(eff(s.id, d).kind) > -1).length;
                  return (
                    <div key={s.id} style={{ display: "grid", gridTemplateColumns: COLS, borderTop: "1px solid var(--border)", alignItems: "stretch" }}>
                      <div style={{ padding: "10px 12px 10px 16px", display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                        <Avatar staffId={s.id} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.field ? days + " of 5 on site" : "Office"}</div>
                        </div>
                      </div>
                      {dates.map((d, i) => cell(s, d, i))}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", padding: "11px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 11.5, color: "var(--faint)" }}>
              {JOBS.map((j) => <span key={j.id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: JOB_TINT[j.id] }} />{SHORT[j.id]}</span>)}
              <span style={{ marginLeft: "auto" }}>{edit ? "Drag a job onto a day, or click a cell, to check an assignment" : "Read only"}</span>
            </div>
          </Card>
        </div>

        <div style={{ flex: "1 1 280px", maxWidth: 420, minWidth: 260, display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Head small title="Assignment check" sub={pend ? (staffById(pend.staffId).name + ", " + longDay(pend.date)) : "Holiday, existing job, skill, certification, travel and capacity are checked together."} />
            {!pend && <div style={{ fontSize: 12.5, color: "var(--faint)", lineHeight: 1.55 }}>{edit ? "Drop a job or an unassigned card on a day to see what stops it. Try Kyle Murphy on Thursday." : "Only Seamus and Caitlin can assign work."}</div>}
            {pend && !pend.target && (
              <div>
                <Label style={{ marginBottom: 6 }}>Assign which job</Label>
                <select className="ixi" value="" onChange={(e) => { const v = e.target.value; if (v) setPend({ ...pend, target: { jobId: v, title: jobShort(v) } }); }}
                  style={{ width: "100%", height: 36, padding: "0 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)", fontSize: 13, outline: 0 }}>
                  <option value="">Choose a job</option>
                  {JOBS.filter((j) => j.progress < 100).map((j) => <option key={j.id} value={j.id}>{j.id + " · " + SHORT[j.id]}</option>)}
                </select>
                <div style={{ marginTop: 10 }}><Btn small onClick={() => setPend(null)}>Cancel</Btn></div>
              </div>
            )}
            {pend && pend.target && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  {pend.target.jobId && <span style={{ width: 8, height: 8, borderRadius: 99, background: JOB_TINT[pend.target.jobId] }} />}
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{pend.target.title}</span>
                  {pend.target.jobId && <button onClick={() => setPend({ ...pend, target: null })} style={{ marginLeft: "auto", border: 0, background: "none", color: "var(--dim)", fontSize: 12, cursor: "pointer" }}>Change</button>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {rows.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 10px", borderRadius: 11, background: r.level === "ok" ? "var(--surface-faint)" : TONE[LEVEL_TONE[r.level]].bg }}>
                      <span style={{ color: r.level === "ok" ? "var(--ok)" : TONE[LEVEL_TONE[r.level]].fg, marginTop: 1, display: "flex" }}><Ic n={r.level === "ok" ? "check" : "alert"} size={14} sw={2} /></span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, letterSpacing: ".08em", color: "var(--faint)", fontFamily: "var(--mono)", textTransform: "uppercase" }}>{r.label}</div>
                        <div style={{ fontSize: 12.5, color: r.level === "ok" ? "var(--body)" : "var(--ink)", lineHeight: 1.4 }}>{r.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {blocked ? <Pill tone="bad">Blocked</Pill> : warns ? <Pill tone="warn">{warns + (warns === 1 ? " warning" : " warnings")}</Pill> : <Pill tone="ok">Clear</Pill>}
                  <span style={{ flex: 1 }} />
                  <Btn small onClick={() => setPend(null)}>Cancel</Btn>
                  <Btn kind="primary" small disabled={blocked} onClick={confirm}>{warns ? "Assign anyway" : "Assign"}</Btn>
                </div>
              </div>
            )}
          </Card>

          <Card>
            <Head small title="Unassigned work" sub={trays.length + " items waiting for a crew"} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {trays.map((u) => {
                const target: Target = u.jobId ? { jobId: u.jobId, title: SHORT[u.jobId] + ": " + u.title.split(": ")[1], uid: u.id } : { title: u.title, uid: u.id, req: SERVICE_REQ[u.id] };
                const late = u.id === "U-1";
                return (
                  <div key={u.id} draggable={edit} onDragStart={(e) => startDrag(e, target)} onDragEnd={() => { setDrag(null); setOver(null); }}
                    style={{ padding: "10px 12px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", cursor: edit ? "grab" : "default" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.35 }}>{u.title}</div>
                      {late && <Pill tone="warn">Conflict</Pill>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 4 }}>{longDay(u.date)} · {u.crew} {u.crew === 1 ? "person" : "people"} · {u.needs}</div>
                    <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 3, lineHeight: 1.4 }}>{u.note}</div>
                  </div>
                );
              })}
              {!trays.length && <div style={{ fontSize: 12.5, color: "var(--dim)" }}>Everything is placed.</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
