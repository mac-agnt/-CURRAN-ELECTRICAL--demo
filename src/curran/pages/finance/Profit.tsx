import { JOBS, jobFin, eur, pct, sum, goTo, customerById, toast, STATUS_LABEL } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Ic, Scatter, Callout, Progress, Tone } from "../../ui";
import { Sub } from "./shared";

export default function Profit({ margins }: { margins: boolean }) {
  if (!margins) {
    return (
      <Page>
        <Title title="Job Profitability" sub="Margins are restricted to the Managing Director." />
        <Card><div style={{ padding: 24, textAlign: "center", color: "var(--dim)", fontSize: 13 }}><Ic n="lock" size={22} /><div style={{ marginTop: 10 }}>Your permission group sees job cost status on each job, not company margins.</div></div></Card>
      </Page>
    );
  }
  const rows = JOBS.map((j) => ({ j, f: jobFin(j) }));
  const park = rows.find((r) => r.j.id === "J-2641")!;
  const pj = park.j;
  const tone = (r: typeof rows[0]): Tone => (r.f.atRisk ? "bad" : r.f.marginDrift < -0.005 ? "warn" : "ok");
  const totVal = sum(rows.map((r) => r.f.value)), totGp = sum(rows.map((r) => r.f.fcGp));
  const varCost = 1200; // estimate of extra fittings cost
  const withVar = (park.f.value + 2400 - (park.f.forecastCost + varCost)) / (park.f.value + 2400);
  const catRows: [string, number, number, number][] = [["Labour", pj.budget.labour, pj.actual.labour, pj.forecast.labour], ["Materials", pj.budget.materials, pj.actual.materials, pj.forecast.materials], ["Other", pj.budget.other, pj.actual.other, pj.forecast.other]];
  return (
    <Page>
      <Title title="Job Profitability" sub={"Progress is operational. Profitability is financial. Pulse reads both from the same job record, so a job that is 72% complete can also be shown as losing 7 points of margin. Active jobs forecast " + eur(totGp) + " gross profit on " + eur(totVal) + " of work (" + pct(totGp / totVal, 1) + ")."} />
      <Grid cols="minmax(0,1.1fr) minmax(0,1fr)" gap={16}>
        <Card>
          <Head title="Progress against forecast margin" sub="Each dot is an active job. Below the line is a job to look at." />
          <Scatter band={{ y: 20, label: "20% watch line" }} xLabel="Progress complete" yLabel="Forecast margin" height={236}
            points={rows.map((r) => ({ id: r.j.id, label: r.j.name.split(" ").slice(0, 3).join(" ") + ": " + pct(r.f.fcMargin, 0) + " at " + r.j.progress + "%", x: r.j.progress, y: Math.max(1, r.f.fcMargin * 100), r: 4 + r.j.value / 9000, tone: tone(r) }))} />
        </Card>
        <Card style={{ borderColor: "color-mix(in srgb, var(--bad) 30%, transparent)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Pill tone="bad">Margin risk</Pill>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginTop: 9, letterSpacing: "-.3px" }}>{pj.name}</div>
              <Sub>72% complete. Margin planned {pct(pj.origMargin, 0)}, now forecast {pct(park.f.fcMargin, 0)}. Cause: material cost increase, cable and containment {pct(park.f.matOverPct, 0)} over budget to date.</Sub>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-1px", color: "var(--bad)" }}>{pct(park.f.fcMargin, 0)}</div><Sub>from {pct(pj.origMargin, 0)}</Sub></div>
          </div>
          <Table dense cols="90px 1fr 1fr 1fr 1fr" head={["", "Budget", "Actual", "Forecast", "Over"]}
            rows={catRows.map(([n, b, a, f]) => [<Strong>{n}</Strong>, eur(b), eur(a), eur(f), <span style={{ color: f - b > 0 ? "var(--warn)" : "var(--dim)" }}>{f - b > 0 ? "+" + eur(f - b) : eur(f - b)}</span>])}
            foot={"Total forecast " + eur(park.f.forecastCost) + " against budget " + eur(park.f.budgetCost)} />
          <div style={{ marginTop: 12, padding: "11px 13px", borderRadius: "var(--r-sm,12px)", background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12.5, color: "var(--body)", lineHeight: 1.5 }}>
            <Strong>Variation opportunity:</Strong> V-02, extra level 3 emergency lighting, {eur(2400)}, drafted and not yet sent. If approved at an estimated {eur(varCost)} of extra cost, forecast margin moves to about {pct(withVar, 1)} (estimate).
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn small kind="primary" onClick={() => goTo("Jobs", "active", { job: "J-2641", jobTab: "financials" })}>Review remaining materials</Btn>
            <Btn small onClick={() => toast("Variation V-02 sent to Seamus for approval")}>Price the variation</Btn>
          </div>
        </Card>
      </Grid>

      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head title="Active jobs" sub="Click a job to open its financials. Costs are actual to date from timesheets and matched supplier invoices." /></div>
        <Table cols="minmax(210px,1.6fr) 88px 96px 92px 92px 100px 92px 100px 100px 140px 120px"
          head={["Job", "Quote", "Variations", "Invoiced", "Collected", "Budget cost", "Actual cost", "Forecast cost", "GP to date", "Forecast margin", "Flag"]}
          onRow={(i) => goTo("Jobs", "active", { job: rows[i].j.id, jobTab: "financials" })}
          rows={rows.map((r) => {
            const pend = sum(r.j.variations.filter((v) => v.status !== "Approved").map((v) => v.amount));
            return [
              <div style={{ minWidth: 0 }}><Strong>{r.j.name}</Strong><Sub>{customerById(r.j.customerId).name} · {r.j.progress}% complete</Sub></div>,
              eur(r.f.value), pend ? <span style={{ color: "var(--dim)" }}>{eur(pend)} draft</span> : <span style={{ color: "var(--faint)" }}>None</span>,
              eur(r.f.invoiced), eur(r.f.collected), eur(r.f.budgetCost), eur(r.f.actualCost), eur(r.f.forecastCost),
              <span style={{ color: r.f.gpToDate < 0 ? "var(--bad)" : "var(--ink)" }}>{eur(r.f.gpToDate)}</span>,
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><Strong>{pct(r.f.fcMargin, 0)}</Strong><span style={{ fontSize: 11.5, color: r.f.marginDrift < -0.005 ? "var(--warn)" : "var(--faint)" }}>{r.f.marginDrift < -0.005 ? "from " + pct(r.j.origMargin, 0) : "plan " + pct(r.j.origMargin, 0)}</span></div>,
              <Pill tone={r.j.status === "invoice-required" ? "warn" : tone(r)}>{r.j.status === "invoice-required" ? "Invoice due" : r.f.atRisk ? "Margin risk" : r.j.status === "constraint" ? "Constraint" : "On plan"}</Pill>,
            ];
          })}
          foot={"Total quote value " + eur(totVal) + ". Unbilled across active jobs " + eur(sum(rows.map((r) => r.f.unbilled))) + "."} />
      </Card>
    </Page>
  );
}
