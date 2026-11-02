import { WEEKS, weekCapacity, weekDates, FIELD_STAFF, SKILLS, slotFor, PIPELINE, LEAVE, STAFF, staffById, dow, fmtDate, addDays, dayDiff, TODAY, eur, sum, fmtDateY } from "../../index";
import { Card, Head, Grid, Kpi, Progress, Pill, Table, Strong, Muted, Callout, Label, TONE } from "../../ui";
import { longDay, tint } from "./common";

const SEG = [["jobs", "On jobs", "var(--accent)"], ["office", "Office or free", "var(--mid)"], ["training", "Training", "var(--faint)"], ["leave", "Leave", "#1c93e3"], ["pending", "Requested", "var(--warn)"]] as const;

export default function Capacity() {
  const caps = WEEKS.map((w) => ({ w, c: weekCapacity(w.id) }));
  const dates = weekDates("w0");
  const skillRows = SKILLS.filter((k) => ["Fire Systems", "CCTV", "Intruder", "EV Charging", "Emergency Lighting", "Networking"].indexOf(k) > -1).map((k) => {
    const comp = FIELD_STAFF.filter((s) => s.skills[k] >= 2);
    const perDay = dates.map((d) => comp.filter((s) => slotFor(s.id, d).kind === "office"));
    return { k, comp, perDay };
  });
  const upcoming = PIPELINE.filter((q) => dayDiff(q.start) <= 100).sort((a, b) => a.start.localeCompare(b.start));
  const crewDays = (v: number) => Math.round((v * 0.35) / 320);
  const offIn = (start: string) => { const end = addDays(start, 6); return FIELD_STAFF.filter((s) => LEAVE.some((l) => l.staffId === s.id && l.status === "Approved" && l.from <= end && l.to >= start)).map((s) => s.first); };
  const w0 = caps[0].c;
  return (
    <>
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Kpi label="Utilisation this week" value={Math.round(w0.util * 100) + "%"} hint={w0.jobs + " of " + w0.avail + " available staff-days on jobs"} />
        <Kpi label="Field staff-days" value={w0.total} hint="8 field staff x 5 days" />
        <Kpi label="Away or training" value={w0.leave + w0.training + w0.pending} hint="this week" />
        <Kpi label="Tightest week" value="Next week" tone="warn" hint={caps[1].c.leave + caps[1].c.pending + " staff-days out, " + Math.round(caps[1].c.util * 100) + "% used"} />
      </Grid>
      <Grid cols="minmax(0,1.35fr) minmax(0,1fr)" gap={14} style={{ alignItems: "start" }}>
        <Card>
          <Head title="Staff-days by week" sub="Where each field staff-day goes. Same data the planner draws." />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {caps.map(({ w, c }) => (
              <div key={w.id}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <Strong>{w.label}</Strong><Muted>{w.span}</Muted><span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{Math.round(c.util * 100)}% used</span>
                </div>
                <div style={{ display: "flex", height: 16, borderRadius: 8, overflow: "hidden", gap: 2, background: "var(--track)" }}>
                  {SEG.map(([id, , col]) => { const n = (c as any)[id] as number; return n ? <span key={id} title={id + ": " + n} style={{ width: (n / c.total) * 100 + "%", background: col, opacity: id === "leave" ? 0.7 : 1 }} /> : null; })}
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11.5, color: "var(--faint)", flexWrap: "wrap" }}>
                  <span>{c.jobs} on jobs</span><span>{c.office} office or free</span>{c.training > 0 && <span>{c.training} training</span>}{c.leave > 0 && <span>{c.leave} leave</span>}{c.pending > 0 && <span style={{ color: "var(--warn)" }}>{c.pending} requested</span>}<span>{c.hours} site hours</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap", fontSize: 11.5, color: "var(--dim)" }}>
            {SEG.map(([id, l, col]) => <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: col }} />{l}</span>)}
          </div>
        </Card>
        <Card flush>
          <div style={{ padding: "16px 18px 6px" }}><Head small title="Capacity table" /></div>
          <Table cols="1.4fr .6fr .6fr .6fr .6fr" dense head={["Week", "Days", "Out", "Jobs", "Free"]}
            rows={caps.map(({ w, c }) => [<Strong>{fmtDate(w.start)}</Strong>, c.total, c.leave + c.pending + c.training, c.jobs, c.office])} />
          <div style={{ padding: "12px 18px", fontSize: 12, color: "var(--faint)", lineHeight: 1.5 }}>Out is leave, requested leave and training. Free is office or unassigned. Seamus works partly in the office, which lowers site days.</div>
        </Card>
      </Grid>

      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head title="Skills still free this week" sub="Competent (level 2+) staff who are not on a job, in training or on leave. A zero means a job needing that skill cannot be added that day." /></div>
        <div style={{ overflowX: "auto" }}>
          <Table cols="190px repeat(5, minmax(90px,1fr)) 1.3fr" dense head={["Skill", ...dates.map(longDay), "Who holds it"]}
            rows={skillRows.map((r) => [
              <Strong>{r.k}</Strong>,
              ...r.perDay.map((p, i) => <span title={p.map((s) => s.first).join(", ") || "Nobody free"} style={{ padding: "2px 10px", borderRadius: 99, fontWeight: 600, background: p.length === 0 ? "var(--bad-soft)" : "var(--surface-2)", color: p.length === 0 ? "var(--bad)" : "var(--body)" }}>{p.length}</span>),
              <Muted>{r.comp.map((s) => s.first).join(", ")}</Muted>,
            ])} />
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", fontSize: 12.5, color: "var(--body)", lineHeight: 1.55 }}>
          Fire Systems has nobody free on Thu 12 Nov: Seamus is on Hennessy, Eoin on Park Hotel and Darragh on Cahersiveen Nursing Home. That is the clash on the Kerry Medical plant room fit.
        </div>
      </Card>

      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head title="Work coming in" sub="Quotes with a start date in the next 100 days, against who is already off in that week. Crew-days assume 35% of value is labour at a 8 hour day." /></div>
        <Table cols="2.2fr .9fr .9fr .8fr .8fr 1.2fr" dense head={["Quote", "Stage", "Starts", "Value", "Crew-days", "Off that week"]}
          rows={upcoming.map((q) => [
            <Strong>{q.name}</Strong>, <Pill tone={q.stage === "Verbal yes" ? "ok" : "neutral"}>{q.stage}</Pill>, fmtDate(q.start), eur(q.value), "~" + crewDays(q.value),
            <Muted>{offIn(q.start).length ? offIn(q.start).join(", ") : "Nobody booked off"}</Muted>,
          ])} />
      </Card>
    </>
  );
}
