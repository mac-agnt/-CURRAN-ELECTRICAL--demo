import { useState } from "react";
import { FIELD_STAFF, SKILLS, LEVEL_LABEL, JOBS, TODAY, slotFor, jobById, goTo, SkillKey } from "../../index";
import { Card, Head, Grid, Avatar, Pill, Callout, Label, Strong, Muted } from "../../ui";
import { tint } from "../schedule/common";

const HEAT = [0, 14, 34, 62];
const shortSkill = (k: string) => k.replace("Commercial Electrical", "Commercial").replace("Emergency Lighting", "Em. lighting");

export default function Skills() {
  const [skill, setSkill] = useState<SkillKey>("Fire Systems");
  const coverage = SKILLS.map((k) => ({ k, two: FIELD_STAFF.filter((s) => s.skills[k] >= 2), lead: FIELD_STAFF.filter((s) => s.skills[k] === 3) }));
  const thin = coverage.filter((c) => c.two.length <= 3);
  const sel = coverage.find((c) => c.k === skill)!;
  const needing = JOBS.filter((j) => j.requires.some((r) => r.skill === skill));
  return (
    <>
      <Callout tone="warn" title={"Thin cover: " + thin.map((c) => c.k + " (" + c.two.length + ")").join(", ")}>
        Darragh Sheehan is the only lead for Fire Systems, CCTV and Intruder. When he is booked, those jobs wait. Skills here feed the planner, which warns when a job needs a level nobody free holds.
      </Callout>
      <Grid cols="minmax(0,1.7fr) minmax(300px,1fr)" gap={14} style={{ alignItems: "start" }}>
        <Card flush>
          <div style={{ padding: "16px 18px 8px" }}><Head small title="Skills matrix" sub="Click a skill to see who can cover it and which jobs need it." /></div>
          <div style={{ overflowX: "auto", padding: "0 14px 6px" }}>
            <div style={{ minWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "150px repeat(8, 1fr)", gap: 4, marginBottom: 4 }}>
                <span />
                {SKILLS.map((k) => <button key={k} onClick={() => setSkill(k)} style={{ border: 0, background: skill === k ? "var(--accent-soft)" : "none", color: skill === k ? "var(--accent)" : "var(--dim)", borderRadius: 10, padding: "6px 2px", fontSize: 11, cursor: "pointer", lineHeight: 1.25 }}>{shortSkill(k)}</button>)}
              </div>
              {FIELD_STAFF.map((s) => (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "150px repeat(8, 1fr)", gap: 4, marginBottom: 4, alignItems: "stretch" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink)" }}><Avatar staffId={s.id} size={24} />{s.first}</span>
                  {SKILLS.map((k) => {
                    const l = s.skills[k];
                    return <div key={k} title={s.name + ", " + k + ": " + LEVEL_LABEL[l]} onClick={() => setSkill(k)} style={{ height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: l ? tint("#1c93e3", HEAT[l]) : "var(--surface-faint)", color: l >= 3 ? "var(--ink)" : l ? "var(--body)" : "var(--faint)", fontSize: 11.5, fontWeight: l === 3 ? 600 : 500, cursor: "pointer", outline: skill === k ? "1px solid var(--accent-line)" : undefined }}>{l ? LEVEL_LABEL[l] : "-"}</div>;
                  })}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "150px repeat(8, 1fr)", gap: 4, marginTop: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, color: "var(--faint)", alignSelf: "center" }}>Competent or lead</span>
                {coverage.map((c) => <span key={c.k} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, color: c.two.length <= 2 ? "var(--bad)" : c.two.length <= 3 ? "var(--warn)" : "var(--body)" }}>{c.two.length}</span>)}
              </div>
            </div>
          </div>
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Head small title={skill} sub={sel.two.length + " people at competent or lead"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sel.two.sort((a, b) => b.skills[skill] - a.skills[skill]).map((s) => {
              const t = slotFor(s.id, TODAY);
              return <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}><Avatar staffId={s.id} size={26} /><Strong>{s.first}</Strong><Pill tone={s.skills[skill] === 3 ? "accent" : "neutral"}>{LEVEL_LABEL[s.skills[skill]]}</Pill><span style={{ marginLeft: "auto", color: "var(--dim)" }}>{t.kind === "job" ? "On " + t.label.split(" ").slice(0, 2).join(" ") : t.label}</span></div>;
            })}
          </div>
          <div>
            <Label style={{ marginBottom: 7 }}>Active jobs needing it</Label>
            {needing.length ? needing.map((j) => { const r = j.requires.find((x) => x.skill === skill)!; return <button key={j.id} onClick={() => goTo("Jobs", "active", { job: j.id })} style={{ display: "flex", width: "100%", textAlign: "left", gap: 8, border: 0, background: "none", padding: "5px 0", cursor: "pointer", fontSize: 12.5, color: "var(--body)" }}><span style={{ flex: 1 }}>{j.name}</span><span style={{ color: "var(--faint)" }}>level {r.min}+</span></button>; }) : <Muted>No active job lists this as required, but it is used on site.</Muted>}
          </div>
          {sel.two.length <= 3 && <div style={{ fontSize: 12.5, color: "var(--warn)", lineHeight: 1.5, padding: "10px 12px", background: "var(--warn-soft)", borderRadius: 12 }}>Only {sel.two.length} {sel.two.length === 1 ? "person holds" : "people hold"} this at level 2 or above. {skill === "Fire Systems" ? "Ciara Counihan and Kyle Murphy are the nearest to competent." : "Cross-training one more person would remove the dependency."}</div>}
        </Card>
      </Grid>
    </>
  );
}
