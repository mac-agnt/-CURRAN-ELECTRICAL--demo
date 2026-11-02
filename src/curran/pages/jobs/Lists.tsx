import { useState } from "react";
import { JOBS, PIPELINE, COMPLETED, jobFin, customerById, siteById, select, goTo, eur, pct, fmtDate, fmtDateY, pipelineTotal, pipelineWeighted, sum, staffOnSiteToday, JobStatus, STATUS_LABEL } from "../../index";
import { Card, Grid, Head, Kpi, Pill, Table, Progress, AvatarStack, Avatar, Seg, Columns, HBars, Strong, Muted, Ellip, Dot, Btn, Callout, Ic, Tone, Empty } from "../../ui";
import { Access, StatusPill, visibleJobs, costStatus, who, fmtWhen, NameCell } from "./shared";

/* ------------------------------ Active ------------------------------ */
export function Active({ acc }: { acc: Access }) {
  const [f, setF] = useState<"all" | JobStatus>("all");
  const jobs = visibleJobs(acc).filter((j) => f === "all" || j.status === f);
  const showMoney = acc.lvl >= 1, showMargin = acc.lvl === 2;
  const widths = ["minmax(230px,1.7fr)", "minmax(150px,1fr)", "minmax(96px,.7fr)", "minmax(140px,1fr)", "minmax(90px,.7fr)", "minmax(90px,.7fr)", "minmax(120px,.9fr)"];
  const head = ["Job", "Customer", "Site", "Type", "Lead", "Crew", "Progress"];
  if (showMoney) { widths.push("minmax(88px,.7fr)", "minmax(98px,.8fr)"); head.push("Quote", "Actual Cost"); } else { widths.push("minmax(110px,.8fr)"); head.push("Cost status"); }
  if (showMargin) { widths.push("minmax(106px,.8fr)"); head.push("Forecast Margin"); }
  widths.push("minmax(190px,1.4fr)", "minmax(130px,.9fr)"); head.push("Next Milestone", "Status");
  const opts: [any, string][] = [["all", "All"], ["margin-risk", "Margin risk"], ["constraint", "Constraint"], ["invoice-required", "Invoice required"], ["on-track", "On track"]];
  const filterOpts = acc.margins ? opts : opts.filter((o) => o[0] !== "margin-risk");
  return (
    <>
      {acc.lvl === 0 && <Callout tone="neutral" title="Your jobs">You see the jobs you are scheduled on, with progress and site information. Quotes, costs and margins stay with the office.</Callout>}
      <Card flush>
        <div style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}><Head title={jobs.length + (acc.office ? " active jobs" : " jobs")} sub={acc.office ? "Select a job to open its financials, team, costs and updates." : "Select a job for site details and updates."} /></div>
          {acc.office && <Seg options={filterOpts} value={f} onChange={setF} />}
        </div>
        <Table cols={widths.join(" ")} onRow={(i) => select({ job: jobs[i].id })} empty="No jobs match this filter"
          head={head}
          rows={jobs.map((j) => {
            const fin = jobFin(j), cs = costStatus(j);
            return [
              <NameCell title={j.name} sub={j.id} mono />,
              <Ellip>{customerById(j.customerId).name}</Ellip>,
              <Muted>{siteById(j.siteId).town}</Muted>,
              <Ellip style={{ fontSize: 12.5 }}>{j.type}</Ellip>,
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Avatar staffId={j.lead} size={22} /><Muted>{who(j.lead).name.split(" ")[0]}</Muted></span>,
              <AvatarStack ids={j.crew.slice(0, 4)} size={22} />,
              <div style={{ width: "100%", paddingRight: 12 }}><div style={{ fontSize: 12, color: "var(--ink)", marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>{j.progress}%</div><Progress value={j.progress} tone={j.progress === 100 ? "ok" : "accent"} h={5} /></div>,
              ...(showMoney ? [<span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(fin.value)}</span>, <span style={{ fontVariantNumeric: "tabular-nums" }}>{eur(fin.actualCost)}</span>] : [<Pill tone={cs.tone}>{cs.label}</Pill>]),
              ...(showMargin ? [<span style={{ fontVariantNumeric: "tabular-nums", color: fin.atRisk ? "var(--warn)" : "var(--ink)", fontWeight: 500 }}>{pct(fin.fcMargin)}<span style={{ color: "var(--faint)", fontWeight: 400 }}> / {pct(fin.origMargin)}</span></span>] : []),
              <Ellip style={{ fontSize: 12.5, color: "var(--dim)" }}>{j.nextMilestone}</Ellip>,
              <StatusPill status={j.status} />,
            ];
          })}
          foot={showMargin ? "Forecast margin shown against the margin at quote. Amber means 3 or more points below quote." : undefined} />
      </Card>
    </>
  );
}

/* ------------------------------ Pipeline ------------------------------ */
const STAGE_TONE: Record<string, Tone> = { "Verbal yes": "ok", "Awaiting decision": "accent", Quoted: "neutral", "Survey booked": "neutral" };
export function Pipeline({ acc }: { acc: Access }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const byMonth = months.map((m, i) => ({ label: m + " 27", value: Math.round(sum(PIPELINE.filter((q) => +q.start.slice(5, 7) === i + 1).map((q) => q.value * q.prob))) }));
  const won = PIPELINE.filter((q) => q.stage === "Verbal yes");
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Kpi label="Open quotes" value={PIPELINE.length} hint="Survey booked to verbal yes" />
        <Kpi label="Pipeline value" value={eur(pipelineTotal())} hint="2027 starts" />
        <Kpi label="Weighted value" value={eur(pipelineWeighted())} hint="Value times probability" tone="accent" />
        <Kpi label="Verbal yes" value={eur(sum(won.map((q) => q.value)))} hint={won.length + " jobs waiting on a start date"} tone="ok" />
      </Grid>
      <Grid cols="minmax(0,1.6fr) minmax(0,1fr)" gap={14}>
        <Card flush>
          <div style={{ padding: "18px 18px 4px" }}><Head title="Quotes in play" sub="Larger jobs first. Probability is Seamus's own read of each customer." /></div>
          <Table cols="minmax(260px,2fr) minmax(150px,1fr) minmax(100px,.7fr) minmax(130px,.9fr) minmax(130px,.9fr) minmax(90px,.7fr)" dense
            head={["Quote", "Customer", "Value", "Stage", "Likely start", "Owner"]}
            rows={[...PIPELINE].sort((a, b) => b.value - a.value).map((q) => [
              <NameCell title={q.name} sub={q.id} mono />,
              <Ellip>{q.customer}</Ellip>,
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(q.value)}</span>,
              <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", paddingRight: 12 }}><Pill tone={STAGE_TONE[q.stage]}>{q.stage}</Pill><Progress value={q.prob * 100} h={4} tone={q.prob >= 0.7 ? "ok" : "accent"} /></div>,
              <Muted>{fmtDateY(q.start)}</Muted>,
              <Avatar staffId={q.owner} size={22} />,
            ])} />
        </Card>
        <Card>
          <Head title="Weighted starts by month" sub="Expected value entering the schedule in early 2027" />
          <Columns data={byMonth} height={200} format={(n) => (n ? "€" + Math.round(n / 1000) + "k" : "0")} />
          <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 14, lineHeight: 1.5 }}>The two verbal yes jobs, Skellig Coast Hotel and Sneem Community Centre, would fill January. Pulse will flag when crew capacity looks short.</div>
          <div style={{ marginTop: 14 }}><Btn small onClick={() => goTo("Schedule", "capacity")}>Check capacity</Btn></div>
        </Card>
      </Grid>
    </>
  );
}

/* ------------------------------ Completed ------------------------------ */
export function Completed({ acc }: { acc: Access }) {
  const tone = (s: string): Tone => (s === "Paid" ? "ok" : s === "Ready to invoice" ? "accent" : "warn");
  const showM = acc.margins;
  const totalV = sum(COMPLETED.map((c) => c.value));
  const wm = sum(COMPLETED.map((c) => c.value * c.margin)) / totalV;
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Kpi label="Completed since June" value={COMPLETED.length} hint="Jobs and service visits" />
        <Kpi label="Value delivered" value={eur(totalV)} />
        {showM ? <Kpi label="Average margin" value={pct(wm, 1)} hint="Value weighted, final" tone="ok" /> : <Kpi label="Awaiting invoice" value={COMPLETED.filter((c) => c.invoiceState === "Ready to invoice").length} hint="Draft invoices prepared" tone="accent" />}
        <Kpi label="Final invoices outstanding" value={COMPLETED.filter((c) => /outstanding/.test(c.invoiceState)).length} hint="Chased by the Collections Agent" tone="warn" onClick={() => goTo("Finance", "debtors")} />
      </Grid>
      <Card flush>
        <div style={{ padding: "18px 18px 4px" }}><Head title="Recently completed" sub="Every completed job is checked for an invoice. Nothing finishes without one." /></div>
        <Table cols={`minmax(280px,2fr) minmax(160px,1fr) minmax(100px,.7fr) ${showM ? "minmax(90px,.6fr)" : ""} minmax(110px,.7fr) minmax(170px,1fr)`} dense
          head={["Job", "Customer", "Value", ...(showM ? ["Margin"] : []), "Finished", "Invoice"]}
          rows={COMPLETED.map((c) => [
            <NameCell title={c.name} sub={c.id} mono />,
            <Ellip>{customerById(c.customerId).name}</Ellip>,
            <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(c.value)}</span>,
            ...(showM ? [<span style={{ fontVariantNumeric: "tabular-nums" }}>{pct(c.margin)}</span>] : []),
            <Muted>{fmtDate(c.finished)}</Muted>,
            <Pill tone={tone(c.invoiceState)}>{c.invoiceState}</Pill>,
          ])} />
      </Card>
    </>
  );
}

/* ------------------------------ Issues ------------------------------ */
export function Issues({ acc }: { acc: Access }) {
  const all = JOBS.flatMap((j) => j.issues.filter((i) => i.open).map((i) => ({ j, i })))
    .filter(({ i }) => acc.lvl === 2 || !/margin/i.test(i.title + i.impact))
    .filter(({ i }) => acc.lvl >= 1 || !/€|invoice|budget|overdue|PO\b/i.test(i.title + i.impact))
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.i.severity] - { high: 0, medium: 1, low: 2 }[b.i.severity]));
  const cnt = (s: string) => all.filter((x) => x.i.severity === s).length;
  const tone = (s: string): Tone => (s === "high" ? "bad" : s === "medium" ? "warn" : "neutral");
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Kpi label="Open issues" value={all.length} />
        <Kpi label="High severity" value={cnt("high")} tone={cnt("high") ? "bad" : undefined} />
        <Kpi label="Medium" value={cnt("medium")} tone={cnt("medium") ? "warn" : undefined} />
        <Kpi label="Site constraints" value={JOBS.filter((j) => j.constraint).length} hint="Raised from site today" tone="warn" />
      </Grid>
      <Grid cols="minmax(0,1.5fr) minmax(0,1fr)" gap={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {all.map(({ j, i }) => (
            <Card key={i.id} onClick={() => select({ job: j.id, jobTab: "issues" })} pad={16}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Pill tone={tone(i.severity)}>{i.severity === "high" ? "High" : i.severity === "medium" ? "Medium" : "Low"}</Pill>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--faint)" }}>{i.id}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: "var(--faint)" }}>Raised {fmtDate(i.raised)} by {who(i.by).name}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 10, letterSpacing: "-.2px" }}>{i.title}</div>
              <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 5, lineHeight: 1.5 }}>{i.impact}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 12.5, color: "var(--body)" }}>
                <Muted>{j.name}</Muted><span style={{ flex: 1 }} /><span style={{ color: "var(--faint)" }}>Owner</span><Avatar staffId={i.owner} size={22} /><span>{who(i.owner).name.split(" ")[0]}</span>
              </div>
            </Card>
          ))}
          {!all.length && <Card><Empty title="No open issues" sub="Site constraints and cost warnings will land here." /></Card>}
        </div>
        <Card>
          <Head title="How issues arrive" sub="Nobody writes a report." />
          {[["mic", "A technician records a voice note on site"], ["bolt", "Pulse extracts the issue, owner and impact"], ["flag", "The right person is notified, the job is flagged"], ["clock", "Ops Watchdog checks the schedule for knock-on delays"]].map(([ic, t], n) => (
            <div key={n} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: n ? "1px solid var(--border)" : undefined }}>
              <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic n={ic} size={14} /></span>
              <span style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </Card>
      </Grid>
    </>
  );
}
