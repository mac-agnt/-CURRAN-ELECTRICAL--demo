import { useState } from "react";
import { EXCEPTIONS } from "../logic/curranContent";
import { staffById, goTo, toast, useCurran } from "./index";
import { Avatar, Btn, Card, Grid, Head, Pill, Ic, Label, Progress, TONE } from "./ui";

/* Work > Exceptions: only the things that need a person. Routine work never lands here. */
const SEV: Record<string, "bad" | "warn" | "neutral"> = { high: "bad", medium: "warn", low: "neutral" };
export default function WorkExceptions() {
  const cur = useCurran();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const open = EXCEPTIONS.filter((e) => !done[e.id]);
  const mine = open.filter((e) => cur.role === "md" || e.owner === (cur.role === "admin" ? "caitlin" : "seamus"));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.8fr) minmax(0,1fr)", gap: 14, alignItems: "start" }}>
      <Card flush>
        <div style={{ padding: "18px 20px 12px" }}>
          <Head title="Needs a person" sub={open.length + " exceptions across the company. Everything else Pulse handled without you."} right={<Pill tone="accent">{open.length} open</Pill>} />
        </div>
        {open.map((e) => (
          <div key={e.id} style={{ display: "flex", gap: 14, padding: "14px 20px", borderTop: "1px solid var(--border)", alignItems: "flex-start" }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: TONE[SEV[e.severity]].fg, marginTop: 7, flex: "none" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>{e.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3, lineHeight: 1.5 }}>{e.why}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 9, flexWrap: "wrap" }}>
                <Avatar staffId={e.owner} size={20} /><span style={{ fontSize: 12, color: "var(--body)" }}>{staffById(e.owner).first}</span>
                <Pill>{e.agent}</Pill><span style={{ fontSize: 11.5, color: "var(--faint)" }}>{e.age}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <Btn small onClick={() => goTo(e.page)}>{e.action}</Btn>
              <Btn small onClick={() => { setDone({ ...done, [e.id]: true }); toast("Marked handled"); }}><Ic n="check" size={13} /></Btn>
            </div>
          </div>
        ))}
        {!open.length && <div style={{ padding: "44px 20px", textAlign: "center", color: "var(--dim)", fontSize: 13 }}>Nothing needs a person right now.</div>}
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <Head title="Automation split" sub="Last 30 days, all workflows" small />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-1px", color: "var(--ink)" }}>83%</span><span style={{ fontSize: 12.5, color: "var(--dim)" }}>handled without a person</span></div>
          <div style={{ marginTop: 12 }}><Progress value={83} /></div>
          <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 12, lineHeight: 1.55 }}>Routine: supplier matching, reminders, certificate flags, voice note processing. Exceptions: unclear matches, calls, decisions and anything over an approval limit.</div>
        </Card>
        <Card>
          <Head title="Yours today" sub={cur.role === "md" ? "Seamus sees every exception" : "Filtered to your desk"} small />
          {mine.slice(0, 4).map((e) => <div key={e.id} style={{ display: "flex", gap: 9, padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--body)" }}><Ic n="flag" size={13} color={TONE[SEV[e.severity]].fg} /><span style={{ flex: 1, minWidth: 0 }}>{e.title}</span></div>)}
          {!mine.length && <Label>Clear</Label>}
        </Card>
        <Grid cols="1fr 1fr" gap={10}>
          {[["Caitlin", open.filter((e) => e.owner === "caitlin").length], ["Seamus", open.filter((e) => e.owner === "seamus").length]].map((x) => (
            <Card key={String(x[0])} pad={14}><Label>{x[0]}</Label><div style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", marginTop: 6 }}>{x[1]}</div></Card>
          ))}
        </Grid>
      </div>
    </div>
  );
}
