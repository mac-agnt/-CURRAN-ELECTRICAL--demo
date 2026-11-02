import { CONTRACTS, eur, pct, sum, addDays, TODAY } from "../../index";
import { Page, Title, Grid, Card, Head, Kpi, Table, Strong, HBars, Columns, Callout } from "../../ui";
import { Sub } from "../finance/shared";
import { GROUPS, groupOf, marginOf, MONTHS, useEffSummary } from "./shared";

export default function Revenue() {
  const s = useEffSummary();
  const plat = CONTRACTS.filter((c) => c.platform), rest = CONTRACTS.filter((c) => !c.platform);
  const gm = (xs: typeof CONTRACTS) => (sum(xs.map((c) => c.billing)) - sum(xs.map((c) => c.supplierCost))) / sum(xs.map((c) => c.billing));
  const groups = GROUPS.map((g) => { const xs = CONTRACTS.filter((c) => groupOf(c) === g); return { g, n: xs.length, arr: sum(xs.map((c) => c.billing)), cost: sum(xs.map((c) => c.supplierCost)), m: xs.length ? gm(xs) : 0 }; }).filter((x) => x.n).sort((a, b) => b.arr - a.arr);
  const months = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.UTC(2026, 10 + i, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });
  const byMonth = months.map(({ y, m }) => ({ label: MONTHS[m] + (m === 0 ? " " + String(y).slice(2) : ""), value: sum(CONTRACTS.filter((c) => +c.renew.slice(0, 4) === y && +c.renew.slice(5, 7) - 1 === m).map((c) => c.billing)) }));
  return (
    <Page>
      <Title title="Contract Revenue" sub="Recurring revenue is the steadiest income Joe Curran Electrical has. It is also the easiest to lose, because a missed renewal costs nothing visible until the year after." />
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Kpi label="Annual recurring revenue" value={eur(s.arr)} hint={CONTRACTS.length + " contracts"} />
        <Kpi label="Gross margin" value={pct(s.arrMargin / s.arr, 0)} hint={eur(s.arrMargin) + " after supplier and platform cost"} />
        <Kpi label="Platform cost paid out" value={eur(sum(plat.map((c) => c.supplierCost)))} hint={plat.length + " cloud and monitoring contracts"} />
        <Kpi label="Renewals not yet invoiced" value={eur(s.unbilledValue)} tone={s.unbilledN ? "warn" : "ok"} hint={s.unbilledN + " contracts"} />
      </Grid>
      <Grid cols="minmax(0,1fr) minmax(0,1.3fr)" gap={16}>
        <Card><Head title="Annual revenue by contract type" /><HBars format={eur} rows={groups.map((x) => ({ label: x.g, value: x.arr, note: x.n + " contracts", tone: x.g.startsWith("Cloud") ? "warn" : "accent" }))} /></Card>
        <Card flush>
          <div style={{ padding: "18px 18px 6px" }}><Head title="Margin by type" sub={"Platform backed contracts earn " + pct(gm(plat), 0) + " against " + pct(gm(rest), 0) + " for service only, so rebilling on time matters more."} /></div>
          <Table dense cols="minmax(180px,1.4fr) 70px 90px 90px 80px" head={["Type", "Count", "Billing", "Cost", "Margin"]}
            rows={groups.map((x) => [<Strong>{x.g}</Strong>, x.n, eur(x.arr), eur(x.cost), <span style={{ color: x.m < 0.5 ? "var(--warn)" : "var(--body)" }}>{pct(x.m, 0)}</span>])}
            foot={"Total " + eur(s.arr) + " billing, " + eur(sum(CONTRACTS.map((c) => c.supplierCost))) + " cost"} />
        </Card>
      </Grid>
      <Card><Head title="Renewals by month" sub="Contract value coming up for renewal over the next fourteen months. The first two months are the ones to protect." /><Columns data={byMonth.map((d, i) => ({ ...d, tone: i < 3 ? "accent" : undefined }))} height={170} format={(n) => (n ? "€" + (n / 1000).toFixed(1) + "k" : "")} /></Card>
    </Page>
  );
}
