import { useState } from "react";
import {
  SYSTEMS, JOBS, STAFF, CERTS, certDays, expiringCerts, staffById, roleOf, siteById, fmtDate, goTo, select, toast, useCurran,
} from "../../index";
import { Page, Grid, Card, Head, Title, Pill, Progress, Btn, Ic, Label, Muted, Strong, Seg, Avatar, Callout, Table } from "../../ui";
import { CATS, DOCS, PROCEDURES, VIDEOS, docById, type KDoc } from "./docs";
import { canSeeDoc, isField, relatedSystems, DocViewer, Thumb, visibleDocs } from "./common";

/* ---------------- Systems: browse the knowledge by system ---------------- */
function base(sub: string): { n: number; label: string } {
  const kind = (k: string) => SYSTEMS.filter((s) => s.kind === k).length;
  switch (sub) {
    case "Hikvision": return { n: SYSTEMS.filter((s) => s.make === "Hikvision").length, label: "Hikvision systems installed" };
    case "Intruder systems": return { n: kind("Intruder"), label: "intruder systems installed" };
    case "CCTV": return { n: kind("CCTV"), label: "CCTV systems installed" };
    case "Fire alarm panels": return { n: kind("Fire alarm"), label: "panels installed" };
    case "Commissioning": return { n: SYSTEMS.filter((s) => s.kind === "Fire alarm" && s.installJob).length, label: "commissioned on current jobs" };
    case "Maintenance": return { n: SYSTEMS.filter((s) => s.kind === "Fire alarm" && s.contractId).length, label: "panels under contract" };
    case "Distribution": return { n: JOBS.filter((j) => /electrical/i.test(j.type)).length, label: "active electrical jobs" };
    case "Emergency lighting": return { n: kind("Emergency lighting"), label: "systems installed" };
    case "EV charging": return { n: kind("EV charging"), label: "charger sites installed" };
    case "Home automation": return { n: kind("Home automation"), label: "systems installed" };
    case "Handover": return { n: JOBS.length, label: "active jobs heading for handover" };
    case "Fibre": return { n: kind("Structured cabling"), label: "cabling systems with fibre or copper" };
    case "Structured cabling": return { n: kind("Structured cabling"), label: "systems installed" };
    case "Wi-Fi": return { n: kind("Wi-Fi"), label: "systems installed" };
    default: return { n: 0, label: "" };
  }
}
export function SystemsTab() {
  const cur = useCurran();
  const docs = visibleDocs(cur.role);
  return (
    <Page>
      <Title title="Systems" sub="Browse by the system you are standing in front of. Each shows what we have written down and how many of them we have installed." />
      <Grid cols="1fr 1fr" gap={14}>
        {CATS.map((c) => {
          const inCat = docs.filter((d) => d.cat === c.id);
          const count = (k: string) => inCat.filter((d) => d.kind === k).length;
          return (
            <Card key={c.id} flush>
              <div style={{ padding: "18px 20px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px" }}>{c.id}</span>
                  <Pill>{inCat.length} items</Pill>
                </div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>{count("Procedure")} procedures, {count("Video")} videos, {count("Manufacturer") + count("PDF")} PDFs and manuals, {count("Technical note")} technical notes, {count("Troubleshooting")} troubleshooting notes, {count("Job example")} job examples</div>
              </div>
              {c.subs.map((s) => {
                const n = inCat.filter((d) => d.sub === s).length, b = base(s);
                return (
                  <div key={s} onClick={() => goTo("Knowledge", "library", { query: "sub:" + s })} className="ix11" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>{s}</div>
                      <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>{b.n} {b.label}</div>
                    </div>
                    <Pill tone={n ? "accent" : "neutral"}>{n} doc{n === 1 ? "" : "s"}</Pill>
                    <span style={{ color: "var(--faint)" }}><Ic n="chevron" size={13} /></span>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </Grid>
    </Page>
  );
}

/* ---------------- Procedures: step by step, with tick state ---------------- */
const TICKS: Record<string, boolean[]> = {};
const tickFor = (d: KDoc) => (TICKS[d.id] = TICKS[d.id] || (d.steps || []).map(() => false));
export function ProceduresTab() {
  const cur = useCurran();
  const field = isField(cur.role);
  const [, bump] = useState(0);
  const list = PROCEDURES.filter((d) => canSeeDoc(d, cur.role));
  const open = list.find((d) => d.id === cur.sel.doc) || list[0];
  const ticks = open ? tickFor(open) : [];
  const done = ticks.filter(Boolean).length;
  const sys = open ? relatedSystems(open) : [];
  const toggle = (i: number) => { ticks[i] = !ticks[i]; bump((n) => n + 1); };
  const pct = (d: KDoc) => { const t = tickFor(d); return Math.round((t.filter(Boolean).length / Math.max(1, t.length)) * 100); };
  return (
    <Page>
      <Title title="Procedures" sub="Tick through the steps on site. The checklist is a record of what was done, and the Site Knowledge Agent can attach it to the visit." />
      <Grid cols={field ? "1fr" : "320px minmax(0,1fr)"} gap={16} style={{ alignItems: "start" }}>
        <Card flush>
          {list.map((d, i) => (
            <div key={d.id} onClick={() => select({ doc: d.id })} className="ix11" style={{ padding: "12px 16px", borderTop: i ? "1px solid var(--border)" : undefined, cursor: "pointer", background: open?.id === d.id ? "var(--accent-faint)" : undefined, boxShadow: open?.id === d.id ? "inset 2px 0 0 var(--accent)" : undefined }}>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>{d.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                <span style={{ fontSize: 11.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{d.sub}, {d.steps!.length} steps</span>
                <div style={{ flex: 1 }}><Progress value={pct(d)} h={4} /></div>
              </div>
            </div>
          ))}
        </Card>
        {open && (
          <Card pad={0}>
            <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><Pill tone="accent">Procedure</Pill><Muted style={{ fontSize: 12 }}>{open.cat}, {open.sub}</Muted></div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.5px", marginTop: 8 }}>{open.title}</div>
              <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 6, lineHeight: 1.5 }}>{open.body[0]}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <div style={{ flex: 1 }}><Progress value={(done / Math.max(1, ticks.length)) * 100} tone={done === ticks.length ? "ok" : "accent"} /></div>
                <span style={{ fontSize: 12, color: "var(--dim)", whiteSpace: "nowrap" }}>{done} of {ticks.length} done</span>
              </div>
            </div>
            <div style={{ padding: "8px 22px 6px" }}>
              {open.steps!.map((s, i) => (
                <div key={i} onClick={() => toggle(i)} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: field ? "15px 0" : "11px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                  <span style={{ flex: "none", width: 24, height: 24, borderRadius: 8, marginTop: 1, border: "1.5px solid " + (ticks[i] ? "var(--ok)" : "var(--border-strong)"), background: ticks[i] ? "var(--ok-soft)" : "none", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s var(--ease)" }}>{ticks[i] && <Ic n="check" size={14} sw={2.4} />}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: field ? 15 : 13.5, lineHeight: 1.5, color: ticks[i] ? "var(--faint)" : "var(--ink)", textDecoration: ticks[i] ? "line-through" : "none" }}>{s}</div>
                    <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>Step {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 22px 18px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Btn kind="primary" disabled={done < ticks.length} onClick={() => toast("Checklist logged to the visit record")}>Complete and log</Btn>
              <Btn onClick={() => { TICKS[open.id] = open.steps!.map(() => false); bump((n) => n + 1); }}>Reset checklist</Btn>
              {open.caveat && <span style={{ fontSize: 12, color: "var(--faint)", flex: 1, minWidth: 220 }}>Follow the manufacturer's documentation. This is how we do the job, it does not replace it.</span>}
            </div>
            {sys.length > 0 && (
              <div style={{ padding: "14px 22px 18px", borderTop: "1px solid var(--border)" }}>
                <Label style={{ marginBottom: 8 }}>Applies to these installed systems</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sys.map((s) => <button key={s.id} className="ixu" onClick={() => goTo("Customers", "systems", { system: s.id })} style={{ height: 28, padding: "0 12px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--body)", fontSize: 12, cursor: "pointer" }}>{siteById(s.siteId).name}</button>)}
                </div>
              </div>
            )}
          </Card>
        )}
      </Grid>
    </Page>
  );
}

/* ---------------- Training ---------------- */
interface Course { t: string; dur: string; doc?: string }
const PATHS: { id: string; title: string; who: string; courses: Course[] }[] = [
  { id: "apprentice", title: "Apprentice, Year 3", who: "For apprentices", courses: [{ t: "Safe isolation and lock off", dur: "45 min" }, { t: "Structured cabling standards", dur: "30 min", doc: "d-cab-std" }, { t: "Site handover checklist", dur: "20 min", doc: "d-handover" }, { t: "Fire panel walkthrough", dur: "14 min", doc: "v-panel-walk" }, { t: "Fusion splicing basics", dur: "18 min", doc: "v-fibre" }, { t: "Inspection and testing preparation", dur: "40 min", doc: "d-ir-testing" }] },
  { id: "technician", title: "Electrician to technician", who: "For electricians and technicians", courses: [{ t: "Distribution board changeover method", dur: "35 min", doc: "d-db-changeover" }, { t: "Emergency lighting inspection", dur: "30 min", doc: "d-el-inspect" }, { t: "EV charger commissioning checklist", dur: "30 min", doc: "d-ev-comm" }, { t: "Load management for multiple chargers", dur: "11 min", doc: "v-ev-load" }, { t: "Inspection and testing, certificates", dur: "40 min", doc: "d-ir-testing" }, { t: "KNX ETS project file", dur: "25 min", doc: "d-knx" }] },
  { id: "fire", title: "Fire systems competence", who: "Fire and security technicians", courses: [{ t: "Fire panel walkthrough", dur: "14 min", doc: "v-panel-walk" }, { t: "Fire panel service procedure", dur: "40 min", doc: "d-panel-service" }, { t: "Resetting an Advanced MxPro 5 panel", dur: "20 min", doc: "d-mxpro-reset" }, { t: "Resetting a Kentec Syncro AS panel", dur: "20 min", doc: "d-kentec-reset" }, { t: "Fire alarm commissioning and certification", dur: "50 min", doc: "d-comm-proc" }, { t: "Fire alarm logbook entries", dur: "15 min", doc: "d-fire-log" }] },
  { id: "security", title: "CCTV and intruder", who: "Security technicians", courses: [{ t: "Hikvision CCTV setup guide", dur: "30 min", doc: "d-hik-setup" }, { t: "Aiming and focusing a bullet camera", dur: "10 min", doc: "v-hik-cam" }, { t: "Hik-Connect cloud setup", dur: "20 min", doc: "d-hik-cloud" }, { t: "Intruder alarm annual service procedure", dur: "35 min", doc: "d-intr-service" }, { t: "Programming zones and user codes", dur: "12 min", doc: "v-intr-zone" }, { t: "Keypad bus fault finding", dur: "20 min", doc: "d-pyr-bus" }] },
];
const DONE: Record<string, Record<string, number>> = {
  jack: { apprentice: 4, fire: 1, security: 0 }, kyle: { technician: 3, fire: 2, security: 2 }, ciara: { technician: 5, fire: 3, security: 1 },
  sean: { technician: 4, security: 4, fire: 0 }, liam: { technician: 6, fire: 3, security: 0 }, eoin: { technician: 6, fire: 6, security: 1 },
  darragh: { technician: 4, fire: 6, security: 6 }, seamus: { technician: 6, fire: 4, security: 3 },
};
export function TrainingTab() {
  const cur = useCurran();
  const field = isField(cur.role);
  const me = roleOf(cur.role).staffId;
  const people = field ? [me] : Object.keys(DONE);
  const [pid, setPid] = useState(field ? me : "kyle");
  const [path, setPath] = useState(field && cur.role === "apprentice" ? "apprentice" : "technician");
  const pth = PATHS.find((p) => p.id === path)!;
  const nDone = (DONE[pid] && DONE[pid][path]) || 0;
  const myCerts = CERTS.filter((c) => c.staffId === pid);
  const soon = field ? myCerts.filter((c) => certDays(c) <= 45) : expiringCerts();
  const videos = VIDEOS.filter((v) => canSeeDoc(v, cur.role));
  return (
    <Page>
      <Title title="Training" sub="Learning paths built from our own procedures and videos. Progress sits next to each person's certificates so renewals and skills are planned together." />
      <Grid cols={field ? "1fr" : "1.25fr 1fr"} style={{ alignItems: "start" }}>
        <Card>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <Seg options={PATHS.map((p) => [p.id, p.title] as [string, string])} value={path} onChange={setPath} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{pth.title}</div><Muted style={{ fontSize: 12 }}>{pth.who}</Muted></div>
            {!field && <select value={pid} onChange={(e) => setPid(e.target.value)} className="ixi" style={{ height: 32, padding: "0 10px", borderRadius: 99, background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--border)", fontSize: 12.5 }}>{people.map((id) => <option key={id} value={id}>{staffById(id).name}</option>)}</select>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0 8px" }}><div style={{ flex: 1 }}><Progress value={(nDone / pth.courses.length) * 100} tone={nDone === pth.courses.length ? "ok" : "accent"} /></div><span style={{ fontSize: 12, color: "var(--dim)" }}>{nDone} of {pth.courses.length} complete</span></div>
          {pth.courses.map((c, i) => {
            const ok = i < nDone, d = c.doc ? docById(c.doc) : undefined, allowed = !d || canSeeDoc(d, cur.role);
            return (
              <div key={c.t} onClick={() => d && allowed && goTo("Knowledge", "library", { doc: d.id })} className={d ? "ix11" : undefined} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 8px", margin: "0 -8px", borderTop: "1px solid var(--border)", cursor: d && allowed ? "pointer" : "default", opacity: allowed ? 1 : 0.5 }}>
                <span style={{ width: 22, height: 22, borderRadius: 99, flex: "none", border: "1.5px solid " + (ok ? "var(--ok)" : "var(--border-strong)"), background: ok ? "var(--ok-soft)" : "none", color: "var(--ok)", display: "flex", alignItems: "center", justifyContent: "center" }}>{ok && <Ic n="check" size={12} sw={2.5} />}</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: ok ? "var(--dim)" : "var(--ink)" }}>{c.t}</div>
                <span style={{ fontSize: 12, color: "var(--faint)" }}>{allowed ? c.dur : "Senior staff only"}</span>
              </div>
            );
          })}
        </Card>
        {!field && (
          <Card flush>
            <div style={{ padding: "18px 18px 0" }}><Head title="Progress by person" sub="Courses complete on each path" /></div>
            <Table cols="1.2fr repeat(4,.7fr)" dense head={["Person", "Apprentice", "Technician", "Fire", "Security"]}
              rows={Object.keys(DONE).map((id) => [
                <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Avatar staffId={id} size={24} /><Strong>{staffById(id).first}</Strong></div>,
                ...PATHS.map((p) => { const n = DONE[id][p.id]; return n === undefined || (p.id === "apprentice" && id !== "jack") ? <Muted>None</Muted> : <span style={{ fontSize: 12.5, color: n === 6 ? "var(--ok)" : "var(--body)" }}>{n} of 6</span>; }),
              ])} />
          </Card>
        )}
      </Grid>
      <Card>
        <Head title="Training videos" sub="Short walkthroughs recorded on our own jobs" />
        <div style={{ display: "grid", gridTemplateColumns: field ? "1fr 1fr" : "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
          {videos.map((v) => (
            <div key={v.id} onClick={() => goTo("Knowledge", "library", { doc: v.id })} className="ix11" style={{ cursor: "pointer", borderRadius: 14, padding: 8, margin: -8 }}>
              <Thumb d={v} h={92} />
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", margin: "9px 2px 0", lineHeight: 1.3 }}>{v.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", margin: "3px 2px 0" }}>{v.sub}</div>
            </div>
          ))}
        </div>
      </Card>
      {soon.length > 0 && (
        <Callout tone="warn" title={field ? "A certificate of yours is due for renewal" : "Training and certificates, side by side"}
          right={!field ? <Btn small onClick={() => goTo("People", "compliance")}>Open compliance</Btn> : undefined}>
          {soon.map((c) => staffById(c.staffId).name + ", " + c.cert + " expires in " + certDays(c) + " days").join(". ") + ". Renewal courses are tracked under People, Compliance."}
        </Callout>
      )}
    </Page>
  );
}
export { DOCS, STAFF, fmtDate, DocViewer };
