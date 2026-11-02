import { JOBS, jobFin, jobsSummary, weekHours, readyToInvoice, READY_ITEMS, staffOnSiteToday, customerById, siteById, select, goTo, eur, pct, fmtDate, fmtDow, dayDiff, staffById } from "../../index";
import { Card, Grid, Head, Kpi, Pill, Table, Progress, AvatarStack, Scatter, HBars, Ic, Strong, Muted, Ellip, Dot, Tone } from "../../ui";
import { Access, StatusPill, STATUS_TONE, who, fmtWhen, NameCell } from "./shared";

export default function Overview({ acc }: { acc: Access }) {
  const js = jobsSummary();
  const rows = JOBS.map((j) => ({ j, f: jobFin(j) }));
  const issues = JOBS.flatMap((j) => j.issues.filter((i) => i.open).map((i) => ({ j, i }))).filter(({ i }) => acc.margins || !/margin/i.test(i.title + i.impact));
  const live = JOBS.filter((j) => j.progress < 100).sort((a, b) => a.forecastEnd.localeCompare(b.forecastEnd));
  const constraints = JOBS.filter((j) => j.constraint);
  const cols = acc.margins ? "minmax(190px,1.9fr) minmax(96px,.9fr) minmax(130px,1fr) minmax(112px,.9fr)" : "minmax(220px,1.8fr) minmax(110px,1fr) minmax(112px,.9fr) minmax(190px,1.6fr)";
  return (
    <>
      <Grid cols="repeat(6,minmax(0,1fr))" gap={12}>
        <Kpi label="Active Jobs" value={js.count} hint={rows.filter((r) => r.j.progress < 100).length + " on site, 1 complete"} onClick={() => goTo("Jobs", "active")} />
        <Kpi label="Active Value" value={eur(js.activeValue)} hint="Quoted, incl. approved variations" />
        {acc.margins ? <Kpi label="Average Margin" value={pct(js.avgMargin, 1)} hint="Forecast, value weighted" tone="ok" /> : <Kpi label="Open Issues" value={issues.length} hint={constraints.length + " site constraint"} tone={issues.length ? "warn" : undefined} onClick={() => goTo("Jobs", "issues")} />}
        <Kpi label="Hours This Week" value={weekHours()} hint="Scheduled, 9 to 13 Nov" />
        {acc.margins ? <Kpi label="Jobs At Risk" value={js.atRisk.length} hint="Forecast margin 3+ points below quote" tone="warn" /> : <Kpi label="Jobs With Constraint" value={constraints.length} hint="Kerry Medical Centre" tone="warn" />}
        <Kpi label="Ready To Invoice" value={eur(readyToInvoice())} hint={READY_ITEMS.length + " jobs waiting for approval"} tone="accent" onClick={() => goTo("Finance", "queue")} />
      </Grid>

      <Grid cols={acc.margins ? "minmax(0,1.5fr) minmax(0,1fr)" : "1fr"} gap={14}>
        <Card flush>
          <div style={{ padding: "18px 18px 4px" }}><Head title="Job health board" sub={acc.margins ? "Progress is operational. Profitability is financial. Each row shows both." : "Operational progress and next milestone for every active job."} /></div>
          <Table cols={cols} dense onRow={(i) => select({ job: rows[i].j.id })}
            head={["Job", "Progress", ...(acc.margins ? ["Margin, quote to now"] : []), "Status", ...(acc.margins ? [] : ["Next milestone"])]}
            rows={rows.map(({ j, f }) => [
              <NameCell title={j.name} sub={customerById(j.customerId).name + ", " + siteById(j.siteId).town} />,
              <div style={{ width: "100%", paddingRight: 14 }}><div style={{ fontSize: 12.5, color: "var(--ink)", marginBottom: 5, fontVariantNumeric: "tabular-nums" }}>{j.progress}%</div><Progress value={j.progress} tone={j.progress === 100 ? "ok" : "accent"} /></div>,
              ...(acc.margins ? [<span style={{ fontVariantNumeric: "tabular-nums", color: f.atRisk ? "var(--warn)" : "var(--body)" }}>{pct(f.origMargin)} to <b style={{ color: f.atRisk ? "var(--warn)" : "var(--ink)" }}>{pct(f.fcMargin)}</b></span>] : []),
              <StatusPill status={j.status} />,
              ...(acc.margins ? [] : [<Ellip style={{ fontSize: 12.5, color: "var(--dim)" }}>{j.nextMilestone}</Ellip>]),
            ])} />
        </Card>
        {acc.margins && (
          <Card>
            <Head title="Progress against margin" sub="Each dot is an active job. Below the dashed line is below the 22% target." />
            <Scatter height={290} band={{ y: 22, label: "Target 22%" }} xLabel="Progress" yLabel="Forecast margin"
              points={rows.map(({ j, f }) => ({ id: j.id, label: j.name.split(" ").slice(0, 3).join(" ") + ": " + j.progress + "% / " + pct(f.fcMargin), x: j.progress, y: f.fcMargin * 100, r: 6 + j.value / 7000, tone: STATUS_TONE[j.status] }))} />
          </Card>
        )}
      </Grid>

      <Grid cols="repeat(3,minmax(0,1fr))" gap={14}>
        <Card>
          <Head title="On site today" sub="Who is where, and the last word from site" />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {JOBS.filter((j) => staffOnSiteToday(j.id).length).map((j) => {
              const crew = staffOnSiteToday(j.id), u = j.updates.find((x) => x.when.slice(0, 10) === "2026-11-10") || j.updates[0];
              return (
                <div key={j.id} onClick={() => select({ job: j.id })} className="ix11" style={{ cursor: "pointer", margin: "-6px -8px", padding: "6px 8px", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <AvatarStack ids={crew.map((c) => c.id)} size={24} />
                    <Ellip style={{ flex: 1, fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{j.name}</Ellip>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 5, lineHeight: 1.45 }}>{who(u.by).name.split(" ")[0]}, {fmtWhen(u.when)}: {u.text}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <Head title="Constraints and open issues" right={<Pill tone={issues.length ? "warn" : "ok"}>{issues.length} open</Pill>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {issues.slice(0, 5).map(({ j, i }) => (
              <div key={i.id} onClick={() => select({ job: j.id, jobTab: "issues" })} className="ix11" style={{ cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start", margin: "-5px -8px", padding: "5px 8px", borderRadius: 10 }}>
                <span style={{ marginTop: 5 }}><Dot tone={i.severity === "high" ? "bad" : "warn"} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.35 }}>{i.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 3 }}>{j.name}, owner {who(i.owner).name.split(" ")[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Head title="Upcoming completions" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {live.slice(0, 4).map((j) => {
              const slip = j.forecastEnd !== j.target;
              return (
                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <Ellip style={{ flex: 1, color: "var(--body)" }}>{j.name}</Ellip>
                  <span style={{ color: slip ? "var(--warn)" : "var(--dim)", whiteSpace: "nowrap" }}>{slip ? fmtDate(j.target) + " to " + fmtDate(j.forecastEnd) : fmtDate(j.forecastEnd)}</span>
                </div>
              );
            })}
          </div>
          {acc.money && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "16px 0 14px" }} />
              <Head small title="Invoice ready" right={<span style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }} onClick={() => goTo("Finance", "queue")}>Open queue</span>} />
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {READY_ITEMS.map((q) => (
                  <div key={q.id} style={{ display: "flex", gap: 10, fontSize: 12.5, alignItems: "center" }}>
                    <Ellip style={{ flex: 1, color: "var(--body)" }}>{customerById(q.customerId).name}</Ellip>
                    <span style={{ color: "var(--faint)" }}>{q.ageDays}d</span>
                    <span style={{ color: "var(--ink)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{eur(q.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </Grid>
    </>
  );
}
