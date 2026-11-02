import { ReactNode, useEffect, useRef, useState } from "react";
import { TODAY, jobById, staffById, slotFor, weekDates, customerById, siteById, contactById, systemsAt, SYSTEMS, expiringCerts, certDays, driveMins, fmtDate, fmtDow, dow, toast, goTo, dayDiff, addDays, LEVEL_LABEL } from "../index";
import { Ic } from "../ui";
import { SCOPE, VOICE, checklistFor, MATERIALS, ISSUE_KINDS, CONSTRAINT_KINDS, START_TIME, NOW_TIME } from "./fieldData";

interface Mem { started?: string; finished?: string; photos: string[]; checks: boolean[]; notes: string[]; mats: Record<string, number>; sent: number; raised: string[]; progress?: number; constraint?: string }
const MEM: Record<string, Mem> = {};
const first = (n: string) => n.split(" ")[0];

/* ------------ little building blocks (big targets, few words) ------------ */
const BTN: React.CSSProperties = { border: 0, cursor: "pointer", fontFamily: "inherit", transition: "transform .18s var(--ease), background .2s var(--ease)" };
const Big = ({ children, onClick, kind = "primary", disabled }: { children: ReactNode; onClick?: () => void; kind?: "primary" | "ghost" | "quiet"; disabled?: boolean }) => (
  <button disabled={disabled} onClick={onClick} className={kind === "primary" ? "ixp" : "ixz"} style={{ ...BTN, width: "100%", height: 56, borderRadius: 999, fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: disabled ? 0.5 : 1,
    ...(kind === "primary" ? { background: "var(--accent-fill,var(--accent))", color: "var(--on-accent)", boxShadow: "var(--accent-glow,none)" } : { background: kind === "quiet" ? "var(--surface-2)" : "none", color: "var(--ink)", border: kind === "ghost" ? "1px solid var(--border-strong)" : 0 }) }}>{children}</button>
);
const Tile = ({ icon, label, sub, onClick, accent, wide }: { icon: string; label: string; sub?: string; onClick: () => void; accent?: boolean; wide?: boolean }) => (
  <button onClick={onClick} className="ixz" style={{ ...BTN, gridColumn: wide ? "1 / -1" : undefined, minHeight: wide ? 78 : 96, padding: 16, borderRadius: 22, textAlign: "left", display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "center" : "flex-start", justifyContent: wide ? "flex-start" : "space-between", gap: 12, color: accent ? "var(--on-accent)" : "var(--ink)", background: accent ? "var(--accent-fill,var(--accent))" : "var(--surface)", border: accent ? 0 : "1px solid var(--border)", boxShadow: accent ? "var(--accent-glow,none)" : undefined }}>
    <span style={{ width: 38, height: 38, borderRadius: 99, display: "inline-flex", alignItems: "center", justifyContent: "center", background: accent ? "rgba(255,255,255,.22)" : "var(--accent-soft)", color: accent ? "var(--on-accent)" : "var(--accent)", flex: "none" }}><Ic n={icon} size={19} sw={1.9} /></span>
    <span><span style={{ display: "block", fontSize: 15.5, fontWeight: 600 }}>{label}</span>{sub && <span style={{ display: "block", fontSize: 12.5, marginTop: 3, opacity: 0.75, fontWeight: 400 }}>{sub}</span>}</span>
  </button>
);
const Row = ({ icon, label, right, onClick }: { icon: string; label: string; right?: string; onClick: () => void }) => (
  <button onClick={onClick} className="ixz" style={{ ...BTN, width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, color: "var(--ink)", textAlign: "left" }}>
    <Ic n={icon} size={18} color="var(--accent)" /><span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{label}</span>{right && <span style={{ fontSize: 13, color: "var(--dim)" }}>{right}</span>}<Ic n="chevron" size={15} color="var(--faint)" />
  </button>
);
const Card = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 18, ...style }}>{children}</div>;
const Lbl = ({ children }: { children: ReactNode }) => <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase" }}>{children}</div>;

export default function FieldApp({ staffId, framed, ownToast }: { staffId: string; framed?: boolean; ownToast?: boolean }) {
  const s = staffById(staffId);
  const slot = slotFor(staffId, TODAY);
  const job = slot.kind === "job" && slot.jobId ? jobById(slot.jobId) : null;
  const apprentice = s.roleKey === "apprentice";
  const [view, setView] = useState("home");
  const [, bump] = useState(0);
  useEffect(() => { setView("home"); }, [staffId]);
  const key = staffId;
  if (!MEM[key]) {
    const early = job ? job.updates.find((u) => u.by === staffId && u.when.slice(0, 10) === TODAY) : undefined;
    MEM[key] = { started: early ? "07:42" : undefined, photos: staffId === "kyle" ? ["Ceiling void cabling", "Corridor detectors", "Corridor detectors", "First floor corridor"] : [], checks: [], notes: [], mats: {}, sent: early ? 1 : 0, raised: [] };
  }
  const m = MEM[key];
  const upd = (p: Partial<Mem>) => { Object.assign(m, p); bump((x) => x + 1); };
  const go = (v: string) => { setView(v); };
  const home = () => setView("home");

  let body: ReactNode;
  let title = "Today";
  if (!job) body = <NoJob staffId={staffId} slotLabel={slot.label} />;
  else if (view === "voice") { title = "Voice update"; body = <Voice job={job} staffId={staffId} m={m} onDone={(to) => { upd({ sent: m.sent + 1, progress: to }); toast("Update filed to " + job.name + ". The office has been told."); home(); }} />; }
  else if (view === "photo") { title = "Photos"; body = <Photo job={job} m={m} onAdd={(t) => upd({ photos: [t, ...m.photos] })} />; }
  else if (view === "note") { title = "Add note"; body = <Note job={job} onSave={(t) => { upd({ notes: [t, ...m.notes] }); toast("Note saved to " + job.name); home(); }} />; }
  else if (view === "material") { title = "Log material"; body = <Material job={job} m={m} onLog={(n) => { upd({ mats: {} }); toast(n + " items logged to " + job.name); home(); }} onChange={(k, d) => upd({ mats: { ...m.mats, [k]: Math.max(0, (m.mats[k] || 0) + d) } })} />; }
  else if (view === "issue") { title = "Raise an issue"; body = <Issue job={job} onRaise={(k) => { upd({ raised: [...m.raised, k] }); toast("Issue raised: " + k + ". Seamus has been told."); home(); }} />; }
  else if (view === "constraint") { title = "Mark constraint"; body = <Constraint job={job} onRaise={(k, d) => { upd({ constraint: k, raised: [...m.raised, k] }); toast("Constraint marked: " + k + ". Seamus told, schedule checked."); home(); }} />; }
  else if (view === "checklist") { title = "Checklist"; body = <Checklist job={job} m={m} onTick={(i) => { const c = [...m.checks]; c[i] = !c[i]; upd({ checks: c }); }} />; }
  else if (view === "finish") { title = "Finish job"; body = <Finish job={job} m={m} onDone={(complete) => { upd({ finished: NOW_TIME, ...(complete ? { progress: 100 } : {}) }); toast(complete ? "Marked complete. The office will check what can be billed." : "Finished for today. Hours and updates sent."); home(); }} />; }
  else if (view === "history") { title = "Site history"; body = <History job={job} />; }
  else if (view === "docs") { title = "Documents"; body = <Docs job={job} apprentice={apprentice} />; }
  else body = <Home job={job} staffId={staffId} m={m} apprentice={apprentice} go={go} onStart={() => upd({ started: NOW_TIME })} />;

  const inner = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {job && view !== "home" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 16px 10px" }}>
          <button onClick={home} aria-label="Back" style={{ ...BTN, width: 44, height: 44, borderRadius: 99, background: "var(--surface-2)", color: "var(--ink)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic n="M15 6l-6 6 6 6" size={20} sw={2} /></button>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.4px", color: "var(--ink)" }}>{title}</div>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px 28px" }}>{body}</div>
    </div>
  );
  if (!framed) return <div style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: "14px 0" }}>{inner}</div>;
  return (
    <div style={{ width: 392, height: 800, flex: "none", borderRadius: 50, padding: 10, background: "var(--surface-2)", border: "1px solid var(--border-strong)", boxShadow: "0 30px 70px rgba(0,0,0,.45)", position: "relative" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 40, overflow: "hidden", background: "var(--bg)", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "14px 24px 8px", fontSize: 13, fontWeight: 600, color: "var(--ink)" }}><span style={{ flex: 1 }}>{NOW_TIME}</span><span style={{ width: 84, height: 22, borderRadius: 99, background: "var(--surface-2)" }} /><span style={{ flex: 1, textAlign: "right", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em", color: "var(--accent)" }}>PULSE</span></div>
        <div style={{ flex: 1, minHeight: 0 }}>{inner}</div>
      </div>
    </div>
  );
}

/* ------------------------------ Home ------------------------------ */
function Home({ job, staffId, m, apprentice, go, onStart }: { job: NonNullable<ReturnType<typeof jobById>>; staffId: string; m: Mem; apprentice: boolean; go: (v: string) => void; onStart: () => void }) {
  const s = staffById(staffId), site = siteById(job.siteId), cust = customerById(job.customerId), ct = contactById(site.contactId);
  const cert = expiringCerts().find((c) => c.staffId === staffId);
  const next = slotFor(staffId, addDays(TODAY, 1));
  const done = m.checks.filter(Boolean).length, total = checklistFor(job).length;
  const progress = m.progress ?? job.progress;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ padding: "4px 4px 0" }}>
        <Lbl>{fmtDow(TODAY)}</Lbl>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.9px", color: "var(--ink)", marginTop: 6 }}>Morning, {s.first}</div>
      </div>
      {cert && <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: 16, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13 }}><Ic n="alert" size={16} />Your {cert.cert} expires in {certDays(cert)} days. Caitlin is booking the course.</div>}
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "4px 11px", borderRadius: 99, background: m.finished ? "var(--track)" : m.started ? "var(--ok-soft)" : "var(--accent-soft)", color: m.finished ? "var(--dim)" : m.started ? "var(--ok)" : "var(--accent)", fontWeight: 600 }}>{m.finished ? "Finished " + m.finished : m.started ? "On site since " + m.started : "Start " + START_TIME}</span>
          <span style={{ fontSize: 12, color: "var(--faint)" }}>{progress}% complete</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.5px", color: "var(--ink)", marginTop: 12, lineHeight: 1.2 }}>{job.name}</div>
        <div style={{ fontSize: 14, color: "var(--dim)", marginTop: 6, lineHeight: 1.45 }}>{cust.name}<br />{site.address}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <button onClick={() => toast("Directions opened: " + driveMins("Waterville", site.town) + " min from Waterville")} className="ixz" style={{ ...BTN, height: 48, borderRadius: 99, background: "var(--surface-2)", color: "var(--ink)", fontSize: 14.5, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Ic n="pin" size={16} />Directions</button>
          <button onClick={() => toast("Calling " + ct.name + " on " + ct.phone)} className="ixz" style={{ ...BTN, height: 48, borderRadius: 99, background: "var(--surface-2)", color: "var(--ink)", fontSize: 14.5, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Ic n="phone" size={16} />Call {first(ct.name)}</button>
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "16px 0 12px" }} />
        <Lbl>Today's scope</Lbl>
        <ul style={{ margin: "9px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {(SCOPE[job.id] || [job.summary.split(". ")[0]]).map((t, i) => <li key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, color: "var(--body)", lineHeight: 1.4 }}><span style={{ width: 6, height: 6, borderRadius: 9, background: "var(--accent)", marginTop: 8, flex: "none" }} />{t}</li>)}
        </ul>
      </Card>
      {!m.started && !m.finished && <Big onClick={onStart}><Ic n="play" size={18} />Start job</Big>}
      {m.constraint && <div style={{ padding: "11px 14px", borderRadius: 16, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5 }}>Constraint marked: {m.constraint}</div>}
      {job.constraint && !m.constraint && <div style={{ padding: "11px 14px", borderRadius: 16, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5 }}>{job.constraint.text}. Raised {job.constraint.raisedAt}. Seamus is on it.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Tile wide accent icon="mic" label="Voice update" sub="Talk for 30 seconds, no typing" onClick={() => go("voice")} />
        <Tile icon="camera" label="Add photo" sub={m.photos.length ? m.photos.length + " today" : undefined} onClick={() => go("photo")} />
        <Tile icon="doc" label="Add note" sub={m.notes.length ? m.notes.length + " saved" : undefined} onClick={() => go("note")} />
        {!apprentice && <Tile icon="wrench" label="Log material" onClick={() => go("material")} />}
        <Tile icon="flag" label="Raise issue" onClick={() => go("issue")} />
        {!apprentice && <Tile icon="alert" label="Mark constraint" onClick={() => go("constraint")} />}
        <Tile icon="check" label="Checklist" sub={done + " of " + total} onClick={() => go("checklist")} />
      </div>
      <Row icon="doc" label="Drawings and documents" right={String(job.docs.filter((d) => d.kind !== "Quote" && d.kind !== "Email").length)} onClick={() => go("docs")} />
      <Row icon="qr" label="Site history" right={systemsAt(job.siteId).length + " systems"} onClick={() => go("history")} />
      <Big kind="ghost" onClick={() => go("finish")} disabled={!!m.finished}>{m.finished ? "Finished for today" : "Finish job"}</Big>
      <div style={{ textAlign: "center", fontSize: 13, color: "var(--faint)", paddingTop: 2 }}>Tomorrow: {next.kind === "job" ? next.label : next.label}</div>
      {apprentice && <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)" }}>You are seeing approved site information only.</div>}
    </div>
  );
}

function NoJob({ staffId, slotLabel }: { staffId: string; slotLabel: string }) {
  const s = staffById(staffId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
      <div style={{ padding: "4px 4px 0" }}><Lbl>{fmtDow(TODAY)}</Lbl><div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.9px", color: "var(--ink)", marginTop: 6 }}>Morning, {s.first}</div></div>
      <Card><div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)" }}>No site job today</div><div style={{ fontSize: 14, color: "var(--dim)", marginTop: 6 }}>{slotLabel}</div></Card>
      <Lbl>Your week</Lbl>
      {weekDates("w0").map((d) => { const x = slotFor(staffId, d); return (
        <div key={d} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 18, background: d === TODAY ? "var(--accent-faint)" : "var(--surface)", border: "1px solid " + (d === TODAY ? "var(--accent-line)" : "var(--border)") }}><span style={{ width: 44, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{dow(d)}</span><span style={{ flex: 1, fontSize: 14, color: "var(--body)" }}>{x.label}</span></div>
      ); })}
    </div>
  );
}

/* ------------------------------ Voice update ------------------------------ */
function Voice({ job, staffId, m, onDone }: { job: NonNullable<ReturnType<typeof jobById>>; staffId: string; m: Mem; onDone: (to: number) => void }) {
  const sc = VOICE[job.id] || { transcript: "Work is progressing well on site today.", from: job.progress, to: job.progress, update: "Work progressing as planned." };
  const [phase, setPhase] = useState<"idle" | "rec" | "proc" | "done">("idle");
  const [sec, setSec] = useState(0);
  const t = useRef<any>(null);
  useEffect(() => () => clearInterval(t.current), []);
  const start = () => { setPhase("rec"); setSec(0); clearInterval(t.current); t.current = setInterval(() => setSec((x) => (x >= 30 ? 30 : x + 1)), 110); };
  useEffect(() => { if (phase === "rec" && sec >= 30) stop(); }, [sec, phase]);
  const stop = () => { clearInterval(t.current); setPhase("proc"); setTimeout(() => setPhase("done"), 1400); };
  const s = staffById(staffId);
  const results: { icon: string; label: string; text: string; sub?: string }[] = [
    { icon: "doc", label: "Site update", text: sc.update },
    { icon: "bolt", label: "Progress change", text: sc.from + "% to " + sc.to + "%", sub: job.name },
    sc.task ? { icon: "check", label: "Task created", text: sc.task.text, sub: staffById(sc.task.owner).first + ", due " + sc.task.due } : { icon: "check", label: "Task", text: "Nothing to chase" },
    sc.issue ? { icon: "flag", label: "Issue raised", text: sc.issue.text, sub: "Owner " + staffById(sc.issue.owner).first + ". " + sc.issue.impact } : { icon: "flag", label: "Issue", text: "None raised" },
    { icon: "clock", label: "Activity entry", text: s.first + " added a voice update", sub: "Filed to the job and the " + siteById(job.siteId).town + " site record" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "stretch" }}>
      {phase !== "done" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "10px 0" }}>
          <div style={{ fontSize: 14.5, color: "var(--dim)", textAlign: "center", lineHeight: 1.5, maxWidth: 280 }}>{phase === "idle" ? "Say what you did, what is blocking you and who needs to act. Pulse does the rest." : phase === "rec" ? "Listening" : "Pulse is reading your note"}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, height: 70, width: "100%", justifyContent: "center" }}>
            {Array.from({ length: 34 }).map((_, i) => {
              const h = phase === "rec" ? 10 + 52 * Math.abs(Math.sin((i + sec * 1.7) * 0.62) * Math.cos(i * 0.31 + sec * 0.4)) : phase === "proc" ? 8 + 8 * Math.abs(Math.sin(i * 0.5)) : 6;
              return <span key={i} style={{ width: 4, height: h, borderRadius: 4, background: phase === "idle" ? "var(--track)" : "var(--accent)", transition: "height .1s linear" }} />;
            })}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px", color: "var(--ink)" }}>0:{String(sec).padStart(2, "0")}<span style={{ fontSize: 16, color: "var(--faint)", fontWeight: 400 }}> / 0:30</span></div>
          {phase === "idle" && <button onClick={start} aria-label="Record" className="ixp" style={{ ...BTN, width: 96, height: 96, borderRadius: 99, background: "var(--accent-fill,var(--accent))", color: "var(--on-accent)", boxShadow: "var(--accent-glow,none)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic n="mic" size={38} sw={1.8} /></button>}
          {phase === "rec" && <button onClick={stop} aria-label="Stop" style={{ ...BTN, width: 96, height: 96, borderRadius: 99, background: "var(--bad)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "breathe 1.4s ease-in-out infinite" }}><span style={{ width: 28, height: 28, borderRadius: 7, background: "currentColor" }} /></button>}
          {phase === "proc" && <div style={{ height: 96, display: "flex", alignItems: "center", color: "var(--accent)", fontSize: 14 }}>One moment</div>}
          {phase === "idle" && <div style={{ fontSize: 12.5, color: "var(--faint)" }}>Tap to start. Tap again to stop.</div>}
        </div>
      )}
      {phase === "done" && (
        <>
          <Card style={{ background: "var(--surface-faint)" }}><Lbl>You said</Lbl><div style={{ fontSize: 15, color: "var(--body)", lineHeight: 1.55, marginTop: 8, fontStyle: "italic" }}>"{sc.transcript}"</div></Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontSize: 14, fontWeight: 600, padding: "0 4px" }}><Ic n="sparkle" size={16} />Pulse understood</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "13px 14px", borderRadius: 18, background: "var(--surface)", border: "1px solid var(--border)", animation: "riseIn .45s var(--ease) both", animationDelay: i * 170 + "ms" }}>
                <span style={{ width: 32, height: 32, borderRadius: 99, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--ok-soft)", color: "var(--ok)" }}><Ic n={r.icon} size={15} /></span>
                <div style={{ minWidth: 0 }}><div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".1em", color: "var(--faint)", textTransform: "uppercase" }}>{r.label}</div><div style={{ fontSize: 14.5, color: "var(--ink)", marginTop: 3, lineHeight: 1.4 }}>{r.text}</div>{r.sub && <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3 }}>{r.sub}</div>}</div>
              </div>
            ))}
          </div>
          <Big onClick={() => onDone(sc.to)}>Done</Big>
        </>
      )}
    </div>
  );
}

/* ------------------------------ other views ------------------------------ */
function Photo({ job, m, onAdd }: { job: any; m: Mem; onAdd: (t: string) => void }) {
  const tags = ["Panel", "Cabling", "Before", "After", "Fault"];
  const [tag, setTag] = useState("Cabling");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Big onClick={() => onAdd(tag)}><Ic n="camera" size={20} />Take photo</Big>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{tags.map((t) => <button key={t} onClick={() => setTag(t)} style={{ ...BTN, height: 40, padding: "0 16px", borderRadius: 99, fontSize: 14, background: tag === t ? "var(--accent-soft)" : "var(--surface)", color: tag === t ? "var(--accent)" : "var(--dim)", border: "1px solid " + (tag === t ? "var(--accent-line)" : "var(--border)") }}>{t}</button>)}</div>
      <div style={{ fontSize: 13, color: "var(--dim)" }}>{m.photos.length} photo{m.photos.length === 1 ? "" : "s"} today. They file to {job.name} automatically.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {m.photos.map((p, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 18, border: "1px solid var(--border)", background: "linear-gradient(" + (140 + i * 31) + "deg,var(--surface-2),var(--accent-soft))", display: "flex", alignItems: "flex-end", padding: 10, fontSize: 12.5, color: "var(--body)" }}>{p}</div>)}
      </div>
    </div>
  );
}
function Note({ job, onSave }: { job: any; onSave: (t: string) => void }) {
  const [txt, setTxt] = useState("");
  const quick = ["Customer on site", "Waiting on materials", "Need second person", "Tests passed"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{quick.map((q) => <button key={q} onClick={() => setTxt((x) => (x ? x + ". " : "") + q)} style={{ ...BTN, height: 40, padding: "0 14px", borderRadius: 99, fontSize: 13.5, background: "var(--surface)", color: "var(--body)", border: "1px solid var(--border)" }}>{q}</button>)}</div>
      <textarea className="ixi" value={txt} onChange={(e) => setTxt(e.target.value)} rows={5} placeholder="Or tap the mic on your keyboard" style={{ width: "100%", padding: 16, borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)", fontSize: 16, lineHeight: 1.5, outline: 0, resize: "none", fontFamily: "inherit" }} />
      <Big disabled={!txt.trim()} onClick={() => onSave(txt.trim())}>Save note</Big>
    </div>
  );
}
function Material({ job, m, onLog, onChange }: { job: any; m: Mem; onLog: (n: number) => void; onChange: (k: string, d: number) => void }) {
  const n = Object.values(m.mats).reduce((a, b) => a + b, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13.5, color: "var(--dim)", marginBottom: 2 }}>Tap to add what you used from the van. Prices are filled in by the office.</div>
      {MATERIALS.map((k) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px 10px 16px", borderRadius: 18, background: "var(--surface)", border: "1px solid var(--border)" }}>
          <span style={{ flex: 1, fontSize: 14.5, color: "var(--ink)" }}>{k}</span>
          <button onClick={() => onChange(k, -1)} style={{ ...BTN, width: 40, height: 40, borderRadius: 99, background: "var(--surface-2)", color: "var(--ink)", fontSize: 20 }}>-</button>
          <span style={{ width: 22, textAlign: "center", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{m.mats[k] || 0}</span>
          <button onClick={() => onChange(k, 1)} style={{ ...BTN, width: 40, height: 40, borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 20 }}>+</button>
        </div>
      ))}
      <div style={{ marginTop: 6 }}><Big disabled={!n} onClick={() => onLog(n)}>Log {n || ""} item{n === 1 ? "" : "s"}</Big></div>
    </div>
  );
}
function Pick({ items, value, onPick }: { items: string[]; value: string; onPick: (v: string) => void }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.map((k) => <button key={k} onClick={() => onPick(k)} style={{ ...BTN, minHeight: 56, padding: "0 18px", borderRadius: 18, textAlign: "left", fontSize: 15.5, fontWeight: 500, background: value === k ? "var(--accent-soft)" : "var(--surface)", color: value === k ? "var(--accent)" : "var(--ink)", border: "1px solid " + (value === k ? "var(--accent-line)" : "var(--border)") }}>{k}</button>)}</div>;
}
function Issue({ job, onRaise }: { job: any; onRaise: (k: string) => void }) {
  const [k, setK] = useState("");
  return <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ fontSize: 14, color: "var(--dim)" }}>What kind of issue is it?</div><Pick items={ISSUE_KINDS} value={k} onPick={setK} /><Big disabled={!k} onClick={() => onRaise(k)}>Raise issue</Big><div style={{ fontSize: 12.5, color: "var(--faint)", textAlign: "center" }}>Add a photo or voice note afterwards if it helps.</div></div>;
}
function Constraint({ job, onRaise }: { job: any; onRaise: (k: string, d: string) => void }) {
  const [k, setK] = useState(""), [d, setD] = useState("1 day");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {job.constraint && <div style={{ padding: "11px 14px", borderRadius: 16, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5 }}>Already raised at {job.constraint.raisedAt}: {job.constraint.text}</div>}
      <div style={{ fontSize: 14, color: "var(--dim)" }}>What is stopping the work?</div>
      <Pick items={CONSTRAINT_KINDS} value={k} onPick={setK} />
      <div style={{ fontSize: 14, color: "var(--dim)" }}>How long might it cost?</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>{["Half a day", "1 day", "2 days or more"].map((x) => <button key={x} onClick={() => setD(x)} style={{ ...BTN, height: 52, borderRadius: 16, fontSize: 14, background: d === x ? "var(--accent-soft)" : "var(--surface)", color: d === x ? "var(--accent)" : "var(--ink)", border: "1px solid " + (d === x ? "var(--accent-line)" : "var(--border)") }}>{x}</button>)}</div>
      <Big disabled={!k} onClick={() => onRaise(k, d)}>Mark constraint</Big>
    </div>
  );
}
function Checklist({ job, m, onTick }: { job: any; m: Mem; onTick: (i: number) => void }) {
  const items = checklistFor(job);
  const n = m.checks.filter(Boolean).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, color: "var(--dim)" }}>{n} of {items.length} done</div>
      {items.map((t, i) => (
        <button key={t} onClick={() => onTick(i)} style={{ ...BTN, display: "flex", alignItems: "center", gap: 14, minHeight: 60, padding: "0 16px", borderRadius: 18, textAlign: "left", background: m.checks[i] ? "var(--ok-soft)" : "var(--surface)", border: "1px solid " + (m.checks[i] ? "transparent" : "var(--border)"), color: "var(--ink)" }}>
          <span style={{ width: 28, height: 28, borderRadius: 99, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: m.checks[i] ? "var(--ok)" : "var(--track)", color: "var(--on-accent)" }}>{m.checks[i] && <Ic n="check" size={15} sw={2.8} />}</span>
          <span style={{ fontSize: 15.5, fontWeight: 500 }}>{t}</span>
        </button>
      ))}
    </div>
  );
}
function Finish({ job, m, onDone }: { job: any; m: Mem; onDone: (complete: boolean) => void }) {
  const total = checklistFor(job).length, done = m.checks.filter(Boolean).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card>
        {[["Checklist", done + " of " + total], ["Photos today", String(m.photos.length)], ["Updates sent", String(m.sent)], ["On site since", m.started || "Not started"]].map(([k, v], i) => (
          <div key={k} style={{ display: "flex", padding: "11px 0", borderTop: i ? "1px solid var(--border)" : undefined, fontSize: 15 }}><span style={{ flex: 1, color: "var(--dim)" }}>{k}</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{v}</span></div>
        ))}
      </Card>
      {done < total && <div style={{ padding: "11px 14px", borderRadius: 16, background: "var(--warn-soft)", color: "var(--warn)", fontSize: 13.5 }}>{total - done} checklist item{total - done === 1 ? " is" : "s are"} still open.</div>}
      <Big onClick={() => onDone(false)}>Finish for today</Big>
      <Big kind="ghost" onClick={() => onDone(true)}>The whole job is complete</Big>
    </div>
  );
}
function History({ job }: { job: any }) {
  const sys = systemsAt(job.siteId);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 14, color: "var(--dim)" }}>{siteById(job.siteId).name}. Everything installed here and what has been done to it.</div>
      {sys.map((x) => (
        <Card key={x.id}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{x.label}</div>
          <div style={{ fontSize: 13.5, color: "var(--dim)", marginTop: 4 }}>{x.make} {x.model}</div>
          <div style={{ fontSize: 13, color: "var(--body)", marginTop: 10 }}>Last service {fmtDate(x.lastService)} by {staffById(x.lastBy).first}</div>
          {x.known.map((k, i) => <div key={i} style={{ fontSize: 13, color: "var(--warn)", marginTop: 6, lineHeight: 1.4 }}>{k}</div>)}
          {x.repairs[0] && <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 6, lineHeight: 1.4 }}>Last repair {fmtDate(x.repairs[0].date)}: {x.repairs[0].note}</div>}
          <button onClick={() => goTo("Customers", "systems", { system: x.id })} className="ixz" style={{ ...BTN, marginTop: 12, height: 44, padding: "0 16px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}><Ic n="qr" size={16} />Open system record</button>
        </Card>
      ))}
      <Lbl>Recent notes from this job</Lbl>
      {job.updates.filter((u: any) => u.by !== "system").slice(0, 3).map((u: any, i: number) => <div key={i} style={{ fontSize: 14, color: "var(--body)", lineHeight: 1.5, padding: "10px 0", borderTop: "1px solid var(--border)" }}><b style={{ color: "var(--ink)" }}>{(staffById(u.by) || { first: u.by }).first}:</b> {u.text}</div>)}
    </div>
  );
}
function Docs({ job, apprentice }: { job: any; apprentice: boolean }) {
  const kinds = apprentice ? ["Drawing", "RAMS"] : ["Drawing", "Spec", "RAMS", "Certificate", "Handover"];
  const docs = job.docs.filter((d: any) => kinds.indexOf(d.kind) > -1);
  const manuals = systemsAt(job.siteId).flatMap((x) => x.manuals).filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {docs.map((d: any) => <button key={d.name} onClick={() => toast("Opening " + d.name)} className="ixz" style={{ ...BTN, display: "flex", gap: 12, alignItems: "center", padding: "15px 16px", borderRadius: 18, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "left", color: "var(--ink)" }}><Ic n="doc" size={20} color="var(--accent)" /><span style={{ flex: 1 }}><span style={{ display: "block", fontSize: 15, fontWeight: 500 }}>{d.name}</span><span style={{ display: "block", fontSize: 12.5, color: "var(--faint)", marginTop: 2 }}>{d.kind}</span></span></button>)}
      <Lbl>Manuals for the systems here</Lbl>
      {manuals.map((n) => <button key={n} onClick={() => goTo("Knowledge", "library")} className="ixz" style={{ ...BTN, display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 18, background: "var(--surface)", border: "1px solid var(--border)", textAlign: "left", color: "var(--ink)", fontSize: 14.5 }}><Ic n="doc" size={18} color="var(--faint)" />{n}</button>)}
    </div>
  );
}
