import { useEffect, useRef, useState } from "react";
import {
  SYSTEMS, JOBS, SITES, systemById, siteById, customerById, staffById, fmtDateY, fmtDate, goTo, useCurran, type InstalledSystem, type RoleKey,
} from "../../index";
import { Page, Grid, Card, Head, Title, Pill, Btn, Ic, Label, Muted, Strong } from "../../ui";
import { DOCS, docById, procedureFor, type KDoc } from "./docs";
import { canSeeDoc, isField } from "./common";

interface Answer {
  text: string[]; steps?: string[]; stepsTitle?: string; sys?: InstalledSystem; docs: KDoc[]; jobs: string[]; facts: [string, string][]; matched: boolean; restricted?: boolean;
}
const SUGGESTED = [
  "How do I reset the panel installed at the Murphy Retail job?",
  "Why does zone 7 keep false alarming at Park Hotel?",
  "Camera 9 at Park Hotel drops out in the rain, what was done last time?",
  "How do I commission the EV chargers at Dunloe Foods?",
  "Where is the emergency lighting test register for Caherdaniel Bay?",
  "Keypad shows a bus fault at the golf links, what should I check?",
];
const has = (s: string, ...w: string[]) => w.some((x) => s.indexOf(x) > -1);

function fromSystem(sys: InstalledSystem, docIds: string[], text: string[], steps?: string[], stepsTitle?: string): Answer {
  const last = "Last serviced " + fmtDateY(sys.lastService) + " by " + staffById(sys.lastBy).name;
  const facts: [string, string][] = [
    ["Installed system", sys.label + " (" + sys.id + ")"],
    ["Make and model", sys.make + " " + sys.model + ", serial " + sys.serial],
    ["Original installation", fmtDateY(sys.installed) + (sys.installJob ? ", job " + sys.installJob : "")],
    ["Service", last],
    ["Known issues", sys.known.length ? sys.known.join(". ") : "None recorded"],
    ["Next maintenance", fmtDateY(sys.nextService)],
  ];
  return { text, steps, stepsTitle, sys, docs: docIds.map((i) => docById(i)).filter(Boolean) as KDoc[], jobs: sys.installJob ? [sys.installJob] : [], facts, matched: true };
}
/** Deterministic matcher: scripted intents for the questions the team asks most, then entity and keyword scoring. */
function answer(q: string, role: RoleKey): Answer {
  const s = q.toLowerCase();
  let a: Answer | null = null;
  if (has(s, "murphy") && has(s, "reset", "panel", "fire alarm", "kentec")) {
    const d = docById("d-kentec-reset")!;
    a = fromSystem(systemById("SYS-2001"), ["d-kentec-reset", "d-kentec-install", "d-comm-proc"],
      ["The panel at the Murphy Retail job is a Kentec Syncro AS, two loop (SYS-2001), at Murphy Retail in Killorglin. It was installed under job J-2652 and commissioned on 6 November 2026. Darragh Sheehan did the commissioning and is the last technician on it.",
        "Our reset procedure is below. Only reset once the cause has been found and made safe. The panel is inside its three month post-commissioning window, so write any event in the logbook."],
      d.steps, "Reset procedure, " + d.title);
  } else if (has(s, "zone 7") || (has(s, "park") && has(s, "false alarm", "kitchen"))) {
    a = fromSystem(systemById("SYS-1001"), ["d-zone7", "d-mxpro-reset", "d-mxpro-hb"],
      ["Zone 7 is the kitchen extract area on the Park Hotel Advanced MxPro 5 panel (SYS-1001). Cooking steam was setting off the optical smoke detector.",
        "On 2 October 2026 Darragh Sheehan replaced the optical detector with a heat detector, which is the right type for a kitchen. There has been no repeat in the event log since. If it returns, check the extract fan and the detector head for grease, then talk to Maeve Sheehy about the detector layout."]);
  } else if (has(s, "camera 9", "drops out", "dropout", "rain") && has(s, "park", "hikvision", "camera", "cctv")) {
    a = fromSystem(systemById("SYS-1003"), ["d-hik-cam9", "d-hik-nvr"],
      ["Camera 9 at the rear car park of Park Hotel (SYS-1003) drops offline in heavy rain. It was fixed once before: on 3 February 2026 Darragh Sheehan found moisture in the RJ45 termination in the junction box, cut back and re-terminated the PoE run.",
        "If it happens again, test the cable with the certifier before replacing the camera, check the switch PoE log for repeated power cycles, and look at the sealed gland and drip loop."]);
  } else if (has(s, "ev ", "charger", "chargers") && has(s, "dunloe", "commission", "ev")) {
    const d = docById("d-ev-comm")!;
    a = fromSystem(systemById("SYS-7002"), ["d-ev-comm", "d-dunloe-ev", "v-ev-load"],
      ["The Dunloe Foods chargers are four 22 kW units (SYS-7002) under job J-2674. Chargers 1 and 2 are mounted. Chargers 3 and 4 cannot be energised until ESB Networks confirms the connection date, and a task is open with Seán Moriarty to chase it.",
        "The commissioning checklist is below. With four units on a limited supply, enable load management before the live test."],
      d.steps, d.title);
  } else if (has(s, "emergency light") || (has(s, "register") && has(s, "caherdaniel", "emergency"))) {
    const d = docById("d-el-inspect")!;
    a = fromSystem(systemById("SYS-9101"), ["d-el-register", "d-el-inspect", "d-el-battery"],
      ["The Caherdaniel Bay Hotel register covers 74 fittings (SYS-9101). The annual test was completed on 30 October 2026 by Ciara Counihan, with four fittings replaced, and the certificate has been issued. The invoice for that visit is drafted and waiting for approval.",
        "It sits under service contract K-08, next visit April 2027. The inspection procedure is below if you are repeating the test."],
      d.steps, d.title);
  } else if (has(s, "keypad", "bus fault", "bus comms") || (has(s, "golf") && has(s, "alarm", "intruder", "fault"))) {
    a = fromSystem(systemById("SYS-8002"), ["d-pyr-bus", "d-pyr-manual"],
      ["The intruder alarm at Waterville Golf Links (SYS-8002) had a keypad bus fault on 3 November 2026. Ciara Counihan found a loose terminal on the keypad bus.",
        "Check voltage at the panel and the keypad first, then re-seat every terminal on the run before swapping parts. Log the callout against contract K-05."]);
  }
  if (!a) a = generic(s, role);
  /* apprentices only get items approved for them */
  if (role === "apprentice") {
    const hidden = a.docs.filter((d) => !canSeeDoc(d, role));
    a.docs = a.docs.filter((d) => canSeeDoc(d, role));
    if (a.steps && hidden.some((d) => d.steps && a.steps === d.steps)) { a.steps = undefined; a.restricted = true; }
    if (a.restricted) a.text = a.text.concat(["The step by step procedure for this is held back for senior staff. Ask Eoin Fitzgerald or Darragh Sheehan before you start."]);
  }
  return a;
}
function generic(s: string, role: RoleKey): Answer {
  const words = s.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && ["the", "how", "what", "where", "does", "for", "with", "and", "that", "this", "can", "you", "are", "was", "has"].indexOf(w) < 0);
  const site = SITES.find((x) => x.name.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 4 && ["hotel", "centre", "retail", "foods", "links", "clubhouse", "nursing", "home", "credit", "union", "holiday", "homes", "motors", "residence"].indexOf(w) < 0).some((w) => s.indexOf(w) > -1));
  const kind = has(s, "fire", "panel", "alarm", "detector") && !has(s, "intruder") ? "Fire alarm" : has(s, "cctv", "camera", "nvr", "hikvision") ? "CCTV" : has(s, "intruder", "pyronix", "burglar") ? "Intruder" : has(s, "emergency", "lighting") ? "Emergency lighting" : has(s, "ev", "charger") ? "EV charging" : has(s, "fibre", "cabling", "cat6", "patch") ? "Structured cabling" : has(s, "wifi", "wi-fi", "unifi") ? "Wi-Fi" : "";
  const sys = SYSTEMS.find((x) => (!site || x.siteId === site.id) && (!kind || x.kind === kind) && (site || kind));
  const scored = DOCS.map((d) => {
    const hay = (d.title + " " + d.sub + " " + d.keywords.join(" ") + " " + d.body.join(" ")).toLowerCase();
    return { d, n: words.reduce((a, w) => a + (hay.indexOf(w) > -1 ? 1 : 0) + (d.title.toLowerCase().indexOf(w) > -1 ? 2 : 0), 0) + (sys && d.kinds && d.kinds.indexOf(sys.kind) > -1 ? 2 : 0) + (site && d.sites && d.sites.indexOf(site.id) > -1 ? 3 : 0) };
  }).filter((x) => x.n >= 3 && canSeeDoc(x.d, role)).sort((a, b) => b.n - a.n).slice(0, 4).map((x) => x.d);
  if (!scored.length) return { text: ["I could not find that in our manuals, procedures or job history. Try naming the site or the system, for example the customer and whether it is the fire alarm, CCTV, intruder or emergency lighting. If it is new, Seamus can add a note after the visit."], docs: [], jobs: [], facts: [], matched: false };
  const top = scored[0];
  const base = sys ? fromSystem(sys, scored.map((d) => d.id), [""]) : { text: [""], docs: scored, jobs: [], facts: [], matched: true } as Answer;
  const jobs = Array.from(new Set(scored.flatMap((d) => d.jobs || [])));
  const text = [(sys ? "The installed system that fits is " + sys.label + " at " + siteById(sys.siteId).name + " (" + sys.id + "). " : "") + "The best match in the library is " + top.title + ". " + top.body[0], scored.length > 1 ? "I also found " + scored.slice(1).map((d) => d.title).join(", ") + "." : ""].filter(Boolean);
  return { ...base, text, jobs, steps: top.steps, stepsTitle: top.steps ? top.title : undefined, docs: scored };
}

const PHASES = ["Reading installed systems", "Matching the site and system", "Searching " + DOCS.length + " documents and manuals", "Checking job history"];

export default function Ask() {
  const cur = useCurran();
  const field = isField(cur.role);
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [phase, setPhase] = useState(-1); // -1 idle, 0..n thinking, n+ streaming/done
  const [shown, setShown] = useState(0);
  const [ans, setAns] = useState<Answer | null>(null);
  const timers = useRef<number[]>([]);
  const clear = () => { timers.current.forEach((t) => clearTimeout(t)); timers.current.forEach((t) => clearInterval(t)); timers.current = []; };
  useEffect(() => clear, []);
  const full = ans ? ans.text.join("\n\n") : "";
  const streaming = ans !== null && phase >= PHASES.length && shown < full.length;
  const finished = ans !== null && phase >= PHASES.length && shown >= full.length;
  const ask = (text: string) => {
    const t = text.trim();
    if (!t) return;
    clear();
    setQ(t); setAsked(t); setAns(null); setShown(0); setPhase(0);
    const a = answer(t, cur.role);
    PHASES.forEach((_, i) => timers.current.push(window.setTimeout(() => setPhase(i + 1), 420 * (i + 1))));
    timers.current.push(window.setTimeout(() => {
      setAns(a);
      const text2 = a.text.join("\n\n");
      const iv = window.setInterval(() => setShown((n) => { if (n + 4 >= text2.length) { clearInterval(iv); return text2.length; } return n + 4; }), 16);
      timers.current.push(iv);
    }, 420 * PHASES.length + 250));
  };
  const thinking = phase >= 0 && phase < PHASES.length || (phase >= PHASES.length && !ans);
  const show = (n: number) => (full ? full.slice(0, n) : "");
  return (
    <Page>
      <div style={{ maxWidth: field ? 760 : undefined, margin: field ? "0 auto" : undefined, width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
        <Title title="Ask Pulse" sub="Ask in plain English. The Site Knowledge Agent finds the installed system, the right documents and the jobs that taught us, then answers from our own records." />
        <div className="ixi" style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px 8px 20px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border-strong)" }}>
          <Ic n="sparkle" size={17} color="var(--accent)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)} placeholder="How do I reset the panel installed at the Murphy Retail job?" style={{ flex: 1, minWidth: 0, background: "none", border: 0, outline: 0, color: "var(--ink)", fontSize: 15, height: 40 }} />
          <Btn kind="primary" onClick={() => ask(q)}>Ask</Btn>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTED.map((s) => <button key={s} onClick={() => ask(s)} className="ixu" style={{ height: 30, padding: "0 13px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--dim)", fontSize: 12.5, cursor: "pointer" }}>{s}</button>)}
        </div>
        <Grid cols={field ? "1fr" : "minmax(0,1.6fr) minmax(0,1fr)"} gap={16} style={{ alignItems: "start" }}>
          <Card pad={22} style={{ minHeight: 240 }}>
            {phase < 0 && (
              <div style={{ padding: "24px 6px", color: "var(--dim)", fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>A technician is standing in front of a panel and needs the right page.</div>
                Pick a question above or type your own. Pulse looks at what is installed at the site, then the manuals and procedures that apply, then what was done on previous jobs.
              </div>
            )}
            {phase >= 0 && (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}><span style={{ flex: "none", width: 26, height: 26, borderRadius: 99, background: "var(--track)", color: "var(--dim)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="user" size={13} /></span><div style={{ fontSize: 14.5, color: "var(--ink)", lineHeight: 1.5, paddingTop: 2 }}>{asked}</div></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: ans ? 14 : 0 }}>
                  {PHASES.map((p, i) => i <= Math.min(phase, PHASES.length - 1) && (
                    <div key={p} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: phase > i ? "var(--dim)" : "var(--ink)", animation: "riseIn .3s var(--ease) both" }}>
                      {phase > i ? <Ic n="check" size={13} color="var(--ok)" sw={2.4} /> : <span style={{ width: 13, height: 13, borderRadius: 99, border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spin .8s linear infinite" }} />}{p}
                    </div>
                  ))}
                  <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
                </div>
              </>
            )}
            {ans && (
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ flex: "none", width: 26, height: 26, borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="sparkle" size={13} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: field ? 15 : 14, lineHeight: 1.65, color: "var(--body)", whiteSpace: "pre-wrap" }}>{show(shown)}{streaming && <span style={{ display: "inline-block", width: 7, height: 15, background: "var(--accent)", marginLeft: 2, verticalAlign: "-2px", animation: "breathe 1s ease-in-out infinite" }} />}</div>
                  {finished && ans.steps && (
                    <div style={{ marginTop: 16, animation: "riseIn .4s var(--ease) both" }}>
                      <Label style={{ marginBottom: 8 }}>{ans.stepsTitle}</Label>
                      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {ans.steps.map((st, i) => <li key={i} style={{ display: "flex", gap: 11, fontSize: 13.5, lineHeight: 1.5, color: "var(--body)" }}><span style={{ flex: "none", width: 22, height: 22, borderRadius: 7, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>{st}</li>)}
                      </ol>
                      <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 12 }}>Follow the manufacturer's documentation. This is how we do the job, it does not replace it.</div>
                    </div>
                  )}
                  {finished && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16, animation: "riseIn .4s var(--ease) both" }}>
                      {ans.sys && <Btn kind="primary" small onClick={() => goTo("Customers", "systems", { system: ans.sys!.id })}><Ic n="qr" size={13} />Open site record</Btn>}
                      {ans.steps && ans.docs[0] && ans.docs[0].kind === "Procedure" && <Btn small onClick={() => goTo("Knowledge", "procedures", { doc: ans.docs[0].id })}>Open as checklist</Btn>}
                      {ans.docs[0] && <Btn small onClick={() => goTo("Knowledge", "library", { doc: ans.docs[0].id })}>Open {ans.docs[0].kind === "Manufacturer" ? "manual" : "document"}</Btn>}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
          {finished && ans && ans.matched && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "riseIn .4s var(--ease) both" }}>
              <Card>
                <Head title="Found in" small />
                {ans.sys && <TrailRow icon="qr" label="Installed system" onClick={() => goTo("Customers", "systems", { system: ans.sys!.id })}><Strong>{ans.sys.label}</Strong><Muted style={{ display: "block", fontSize: 11.5 }}>{ans.sys.id}, {ans.sys.make} {ans.sys.model}</Muted></TrailRow>}
                {ans.sys && <TrailRow icon="pin" label="Site" onClick={() => goTo("Customers", "sites", { site: ans.sys!.siteId })}><Strong>{siteById(ans.sys.siteId).name}</Strong><Muted style={{ display: "block", fontSize: 11.5 }}>{customerById(siteById(ans.sys.siteId).customerId).name}</Muted></TrailRow>}
                {ans.docs.map((d) => <TrailRow key={d.id} icon="doc" label={d.kind === "Manufacturer" ? "Manual" : d.kind === "Procedure" ? "Procedure" : "Document"} onClick={() => goTo("Knowledge", "library", { doc: d.id })}><Strong>{d.title}</Strong></TrailRow>)}
                {ans.jobs.map((j) => { const job = JOBS.find((x) => x.id === j); return <TrailRow key={j} icon="wrench" label="Previous job" onClick={job ? () => goTo("Jobs", "active", { job: j }) : undefined}><Strong>{job ? job.name : j}</Strong><Muted style={{ display: "block", fontSize: 11.5 }}>{j}</Muted></TrailRow>; })}
              </Card>
              {ans.facts.length > 0 && (
                <Card>
                  <Head title="From the site record" small />
                  {ans.facts.map(([k, v]) => <div key={k} style={{ padding: "7px 0", borderTop: "1px solid var(--border)" }}><Label>{k}</Label><div style={{ fontSize: 12.5, color: "var(--ink)", marginTop: 3, lineHeight: 1.4 }}>{v}</div></div>)}
                </Card>
              )}
            </div>
          )}
          {finished && ans && !ans.matched && <Card><Head title="No match" small /><Muted>Nothing in the library or the site records answers that yet.</Muted></Card>}
        </Grid>
      </div>
    </Page>
  );
}
function TrailRow({ icon, label, children, onClick }: { icon: string; label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={onClick ? "ix11" : undefined} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 8px", margin: "0 -8px", borderRadius: 10, cursor: onClick ? "pointer" : "default" }}>
      <span style={{ flex: "none", width: 28, height: 28, borderRadius: 9, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n={icon} size={14} /></span>
      <div style={{ minWidth: 0, flex: 1 }}><Label style={{ fontSize: 9, marginBottom: 2 }}>{label}</Label><div style={{ fontSize: 13, lineHeight: 1.3 }}>{children}</div></div>
    </div>
  );
}
export { Pill, fmtDate };
