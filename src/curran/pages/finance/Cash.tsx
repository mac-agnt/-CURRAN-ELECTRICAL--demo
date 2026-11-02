import { INVOICES, QUEUE, jobFin, SUPPLIER_INVOICES, JOBS, CONTRACTS, invoiceOutstanding, ageBucket, daysOverdue, addDays, dayDiff, eur, fmtDate, sum, customerById, goTo, TODAY, READY_ITEMS } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Area, Callout, Columns } from "../../ui";
import { Sub, custName } from "./shared";

const W0 = "2026-11-09", WEEKS = 8, PAYROLL = 7200, OVERHEAD = 1100, SERVICE_RUNRATE = 3200;
const wk = (d: string) => Math.floor(dayDiff(d, W0) / 7);

export function cashModel() {
  const inn = new Array(WEEKS).fill(0), out = new Array(WEEKS).fill(0);
  const add = (a: number[], w: number, v: number) => { if (w >= 0 && w < WEEKS) a[w] += v; };
  invoiceOutstanding().forEach((i) => {
    const b = ageBucket(i);
    if (b === 0) add(inn, Math.max(0, wk(i.due)), i.amount * 0.92);
    else add(inn, [0, 1, 3, 5, 6][b], i.amount * [0, 0.8, 0.6, 0.4, 0.3][b]);
  });
  READY_ITEMS.forEach((q) => add(inn, wk(addDays(TODAY, 30)), q.amount * 0.9));
  CONTRACTS.filter((c) => ["Draft ready", "Not drafted", "Approved"].indexOf(c.invoice) > -1 || (c.invoice === "Scheduled" && dayDiff(c.renew) <= 60)).forEach((c) => add(inn, Math.max(0, wk(c.renew)), c.billing * 0.85));
  JOBS.forEach((j) => {
    const readyAmt = sum(READY_ITEMS.filter((q) => q.jobId === j.id).map((q) => q.amount));
    const left = Math.max(0, jobFin(j).unbilled - readyAmt);
    const endW = Math.max(0, Math.min(wk(j.forecastEnd), WEEKS - 5));
    for (let w = 0; w <= endW; w++) add(inn, w + 4, (left * 0.9) / (endW + 1));
  });
  for (let w = 4; w < WEEKS; w++) add(inn, w, SERVICE_RUNRATE);
  SUPPLIER_INVOICES.filter((s) => s.status !== "duplicate").forEach((s) => add(out, wk(addDays(s.date, 30)), s.amount));
  JOBS.forEach((j) => {
    const remaining = Math.max(0, j.forecast.materials - j.actual.materials);
    const endW = Math.max(1, Math.min(wk(j.forecastEnd), WEEKS - 1));
    for (let w = 0; w <= endW; w++) add(out, w + 4, remaining / (endW + 1));
  });
  for (let w = 0; w < WEEKS; w++) { out[w] += PAYROLL + OVERHEAD; }
  return { inn: inn.map(Math.round), out: out.map(Math.round) };
}

export default function Cash() {
  const { inn, out } = cashModel();
  const labels = Array.from({ length: WEEKS }, (_, w) => fmtDate(addDays(W0, w * 7)));
  let cum = 0;
  const rows = labels.map((l, w) => { const net = inn[w] - out[w]; cum += net; return { l, i: inn[w], o: out[w], net, cum }; });
  const atRisk = invoiceOutstanding().filter((i) => daysOverdue(i) > 30);
  return (
    <Page>
      <Title title="Cash Outlook" sub="Eight weeks of expected cash movement from the invoices already issued, work ready to bill, supplier bills falling due and an estimate of payroll. Opening bank balance is not connected, so Pulse shows net movement." right={<Pill tone="warn">Forward weeks are estimates</Pill>} />
      <Grid cols="minmax(0,1.6fr) minmax(280px,1fr)" gap={16}>
        <Card>
          <Head title="Expected cash in and out, per week" sub="Overdue invoices are weighted by how likely they are to land: 80% at 1 to 30 days, 60% at 31 to 60, 40% at 61 to 90, 30% beyond. Remaining job milestones bill as work completes and are paid 30 days later. Service and call-out billing is an estimated €3,200 a week from week 5." />
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--dim)", marginBottom: 6 }}><span><span style={{ display: "inline-block", width: 10, height: 3, background: "var(--accent)", marginRight: 6, verticalAlign: "middle" }} />Expected in</span><span><span style={{ display: "inline-block", width: 10, height: 3, background: "var(--warn)", marginRight: 6, verticalAlign: "middle" }} />Expected out</span></div>
          <Area labels={labels} height={190} series={[{ name: "In", data: inn, tone: "accent" }, { name: "Out", data: out, tone: "warn", dash: true }]} format={eur} />
        </Card>
        <Card>
          <Head title="Debtors at risk" sub={eur(sum(atRisk.map((i) => i.amount))) + " is more than 30 days overdue"} right={<Btn small onClick={() => goTo("Finance", "debtors")}>Debtors</Btn>} />
          {atRisk.map((i) => (
            <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{custName(i.customerId)}</div><Sub>{daysOverdue(i)} days overdue{i.hold ? " · " + i.hold.toLowerCase() : ""}</Sub></div>
              <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontWeight: 600 }}>{eur(i.amount)}</span>
            </div>
          ))}
          <Sub style={{ marginTop: 10 }}>Chasing these before the end of November is worth {eur(sum(atRisk.map((i) => i.amount)))} to the week 1 to 6 outlook.</Sub>
        </Card>
      </Grid>
      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head title="Week by week" sub="Out includes supplier bills 30 days after invoice date, remaining job materials, payroll at an estimated €7,200 a week and €1,100 of running costs." /></div>
        <Table cols="minmax(120px,1fr) 1fr 1fr 1fr 1fr" head={["Week starting", "Expected in", "Expected out", "Net", "Cumulative net"]}
          rows={rows.map((r, i) => [<Strong>{r.l}{i === 0 ? " (this week)" : ""}</Strong>, eur(r.i), eur(r.o), <span style={{ color: r.net < 0 ? "var(--warn)" : "var(--ok)", fontVariantNumeric: "tabular-nums" }}>{eur(r.net)}</span>, <span style={{ color: "var(--ink)", fontWeight: 500 }}>{eur(r.cum)}</span>])}
          foot={"Eight week net movement " + eur(rows[rows.length - 1].cum) + ". RedBook bank balance can be added to turn this into a closing position."} />
      </Card>
    </Page>
  );
}
