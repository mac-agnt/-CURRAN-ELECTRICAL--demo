import { useState } from "react";
import { ROLES, staffById, slotFor, jobById, TODAY } from "../index";
import { Card, Grid, Head, Seg, Pill, Ic, Label } from "../ui";
import FieldApp from "./FieldApp";

const WHO: [string, string][] = [["kyle", "Kyle, electrician"], ["jack", "Jack, apprentice"], ["eoin", "Eoin, senior"], ["darragh", "Darragh, fire tech"]];
const STEPS: [string, string, string][] = [
  ["mic", "Talk for 30 seconds", "Press the big button and say what happened. No forms, no typing."],
  ["sparkle", "Pulse sorts it out", "Progress, tasks, issues and the site record update from what was said."],
  ["check", "The office sees a result", "Seamus gets the constraint, Caitlin gets the task, the job gets its update."],
];
const ACCESS: [string, string, string][] = [
  ["Seamus Curran", "Everything", "Margins, invoices, supplier costs, all jobs"],
  ["Caitlin Curran", "Office and money", "Invoicing, contracts, people. No job margins"],
  ["Senior electrician", "Their jobs", "Progress, crew and site documents. No revenue or margins"],
  ["Electrician", "Today's job", "Scope, documents, history, updates. No money"],
  ["Apprentice", "Approved information", "Assigned job and approved drawings only"],
];

export default function FieldTab({ acc }: { acc: any }) {
  const [who, setWho] = useState("kyle");
  const s = staffById(who), slot = slotFor(who, TODAY), job = slot.kind === "job" && slot.jobId ? jobById(slot.jobId) : null;
  return (
    <Grid cols="minmax(0,1fr) auto" gap={28} style={{ alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        <Card>
          <Head title="Built for a van, not a desk" sub="Tradify adoption failed because technicians found it clunky. This is the opposite: one screen, big buttons, and the fewest words possible." />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map(([ic, t, d], i) => (
              <div key={t} style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--border)" : undefined }}>
                <span style={{ width: 36, height: 36, borderRadius: 99, flex: "none", background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic n={ic} size={17} /></span>
                <div><div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{t}</div><div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4, lineHeight: 1.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Head title="Try it as" sub="Pick a technician and press Voice update. Today is Tuesday 10 November." />
          <Seg options={WHO} value={who} onChange={setWho} />
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill tone="neutral">{s.title}</Pill>{job && <Pill tone="accent">{job.name}</Pill>}
          </div>
        </Card>
        <Card>
          <Head title="What each person can see" sub="Finance never reaches the field. Permissions follow the role, not the screen." />
          {ACCESS.map(([r, t, d], i) => (
            <div key={r} style={{ display: "flex", gap: 14, padding: "11px 0", borderTop: i ? "1px solid var(--border)" : undefined, alignItems: "baseline" }}>
              <span style={{ width: 150, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{r}</span>
              <Pill tone={i === 0 ? "accent" : i < 2 ? "neutral" : "ok"}>{t}</Pill>
              <span style={{ flex: 1, fontSize: 12.5, color: "var(--dim)" }}>{d}</span>
            </div>
          ))}
          <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 10 }}>Use "View Pulse as" in the sidebar to see the whole app through each role.</div>
        </Card>
      </div>
      <FieldApp staffId={who} framed />
    </Grid>
  );
}
