import { AGE_BUCKETS, ageBucket, daysOverdue, eur, exceptionInvoices, invoiceOutstanding, jobsSummary, matchedToday, outstandingTotal, overdueTotal, collectedThisMonth, readyToInvoice, supplierSpendMonth, READY_ITEMS, supplierById, sum, setTab, goTo, pct, customerById, INVOICES, SUPPLIER_INVOICES } from "../../index";
import { Page, Title, Grid, Card, Head, Kpi, Pill, HBars, Label, Btn, Ic, Callout, Progress } from "../../ui";
import { Sub, custName } from "./shared";

export default function Overview({ margins }: { margins: boolean }) {
  const js = jobsSummary();
  const ready = readyToInvoice();
  const out = outstandingTotal();
  const overdue = overdueTotal();
  const buckets = AGE_BUCKETS.map((_, b) => sum(invoiceOutstanding().filter((i) => ageBucket(i) === b).map((i) => i.amount)));
  const byCust: Record<string, number> = {};
  invoiceOutstanding().forEach((i) => { byCust[i.customerId] = (byCust[i.customerId] || 0) + i.amount; });
  const custRows = Object.entries(byCust).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ label: custName(id), value: n, tone: (invoiceOutstanding().some((i) => i.customerId === id && daysOverdue(i) > 30) ? "bad" : invoiceOutstanding().some((i) => i.customerId === id && daysOverdue(i) > 0) ? "warn" : "accent") as any }));
  const exc = exceptionInvoices();
  const recvd = SUPPLIER_INVOICES.filter((s) => s.received.slice(0, 10) >= "2026-11-09").length;
  const oldest = Math.max(...READY_ITEMS.map((q) => q.ageDays));
  return (
    <Page>
      <Title title="Finance" sub="Pulse is the intelligence and workflow layer. RedBook stays the ledger: approved invoices are queued to it and payments are read back." right={<Pill tone="ok">RedBook connected, last sync 09:00</Pill>} />
      <Grid cols={margins ? "repeat(6,minmax(0,1fr))" : "repeat(5,minmax(0,1fr))"} gap={12}>
        <Kpi label="Ready to invoice" value={eur(ready)} tone="warn" hint={READY_ITEMS.length + " jobs, oldest " + oldest + " days"} onClick={() => setTab("Finance", "queue")} />
        <Kpi label="Outstanding" value={eur(out)} hint={invoiceOutstanding().length + " open invoices"} onClick={() => setTab("Finance", "debtors")} />
        <Kpi label="Overdue" value={eur(overdue)} tone="bad" hint={pct(overdue / out) + " of outstanding"} onClick={() => setTab("Finance", "debtors")} />
        <Kpi label="Collected this month" value={eur(collectedThisMonth())} tone="ok" hint="1 to 10 Nov, 4 payments" />
        <Kpi label="Supplier spend" value={eur(supplierSpendMonth())} hint="Matched to jobs, Nov" onClick={() => setTab("Finance", "supplier")} />
        {margins && <Kpi label="Forecast gross margin" value={pct(js.avgMargin, 1)} hint={js.atRisk.length + " jobs below plan"} onClick={() => setTab("Finance", "profit")} />}
      </Grid>

      <Grid cols="minmax(0,1.25fr) minmax(0,1fr)">
        <Card pad={0} flush>
          <div style={{ padding: "18px 18px 6px" }}>
            <Head title="Revenue waiting to be invoiced" sub={"Seamus used to find time for the biggest invoice first. The Invoice Agent now ranks every billable job by age, so " + eur(ready) + " does not sit behind a larger one."} right={<Btn small kind="primary" onClick={() => setTab("Finance", "queue")}>Open invoice queue</Btn>} />
          </div>
          {READY_ITEMS.map((q) => (
            <div key={q.id} className="ix11" onClick={() => goTo("Finance", "queue", { queue: q.id })} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 120px 130px", gap: 14, alignItems: "center", padding: "13px 18px", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</div>
                <Sub>{q.kind} · approver {q.approver === "seamus" ? "Seamus" : "Caitlin"} · {q.stage.toLowerCase()}</Sub>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 5 }}>{q.ageDays <= 1 ? "Billable since yesterday" : "Unbilled " + q.ageDays + " days"}</div>
                <Progress value={Math.min(100, q.ageDays * 9)} tone={q.ageDays > 5 ? "warn" : "ok"} h={5} />
              </div>
              <div style={{ textAlign: "right", fontSize: 17, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(q.amount)}</div>
            </div>
          ))}
          <div style={{ display: "flex", padding: "11px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 12, color: "var(--dim)" }}>
            <span style={{ flex: 1 }}>Total ready to invoice</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{eur(ready)}</span>
          </div>
        </Card>

        <Card>
          <Head title="Debtor ageing" sub={eur(out) + " outstanding, " + eur(overdue) + " past due"} right={<Btn small onClick={() => setTab("Finance", "debtors")}>Debtors</Btn>} />
          <div style={{ display: "flex", height: 12, borderRadius: 99, overflow: "hidden", gap: 2, marginBottom: 14 }}>
            {buckets.map((b, i) => <div key={i} title={AGE_BUCKETS[i] + " " + eur(b)} style={{ width: (b / out) * 100 + "%", background: i === 0 ? "var(--accent)" : i === 1 ? "var(--warn)" : "var(--bad)", opacity: i < 2 ? 1 : 0.55 + i * 0.12 }} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {AGE_BUCKETS.map((l, i) => (
              <div key={l}><Label>{l}</Label><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 5, fontVariantNumeric: "tabular-nums" }}>{eur(buckets[i])}</div></div>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--border)", margin: "16px 0 14px" }} />
          <Label style={{ marginBottom: 10 }}>Where cash is waiting</Label>
          <HBars rows={custRows} format={eur} />
        </Card>
      </Grid>

      <Grid cols="repeat(3,minmax(0,1fr))">
        <Card>
          <Head title="Agents working Finance" sub="What ran this morning without anyone asking" />
          {[
            ["09:14", "Invoice Agent", "Prepared a " + eur(6850) + " invoice for Murphy Retail Fit-Out"],
            ["09:07", "Job Cost Agent", "Matched KE-28492 (" + eur(2184) + ") to Park Hotel Electrical Upgrade"],
            ["09:00", "Collections Agent", "Sent 2 courtesy reminders: Waterville Golf Links, Hennessy Residence"],
            ["08:02", "Contracts Agent", "Drafted the Kerry Fire Maintenance renewal, " + eur(1240)],
          ].map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--border)" : undefined }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--faint)", paddingTop: 2 }}>{r[0]}</span>
              <div><div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 500 }}>{r[1]}</div><div style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.4, marginTop: 2 }}>{r[2]}</div></div>
            </div>
          ))}
        </Card>
        <Card>
          <Head title="Supplier inbox" sub={recvd + " supplier invoices in the last 24 hours"} right={<Btn small onClick={() => setTab("Finance", "supplier")}>Open</Btn>} />
          <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
            <div><div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.8px", color: "var(--ink)" }}>{matchedToday().length}</div><Sub>matched to jobs, no typing</Sub></div>
            <div><div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.8px", color: exc.length ? "var(--warn)" : "var(--ink)" }}>{exc.length}</div><Sub>need Caitlin</Sub></div>
          </div>
          {exc.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border)", fontSize: 12.5 }}>
              <span style={{ flex: 1, minWidth: 0, color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.number} · {supplierById(s.supplierId).short}</span>
              <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{eur(s.amount)}</span>
              <Pill tone={s.status === "duplicate" ? "neutral" : "warn"}>{s.status === "review" ? "Review" : s.status === "missing" ? "No job" : "Duplicate"}</Pill>
            </div>
          ))}
        </Card>
        <Card>
          <Head title="Needs a person" sub="Everything else is handled. These are not." />
          {[
            ["Atlantic Lodge, 52 days overdue", eur(11200), "bad", "Call head office for the PO"],
            ["Murphy Retail draft invoice", eur(6850), "warn", "Seamus to approve"],
            ["Renewals not yet invoiced", "3", "warn", eur(2740) + " of renewals"],
            ["Park Hotel variation draft", eur(2400), "neutral", "Not yet sent to client"],
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--border)" : undefined }}>
              <Ic n="flag" size={14} color={r[2] === "bad" ? "var(--bad)" : r[2] === "warn" ? "var(--warn)" : "var(--faint)"} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)" }}>{r[0]}</div><Sub>{r[3]}</Sub></div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{r[1]}</span>
            </div>
          ))}
        </Card>
      </Grid>
    </Page>
  );
}
