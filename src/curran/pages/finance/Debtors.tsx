import { useState } from "react";
import { AGE_BUCKETS, Invoice, INVOICES, ageBucket, addDays, customerById, dayDiff, daysOverdue, eur, fmtDate, invoiceOutstanding, outstandingTotal, sum, toast, contactById, siteById, TODAY } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Ic, Progress, Tone } from "../../ui";
import { CADENCE, Sub, TODAY_REMINDERS, custName } from "./shared";
import { useFin, finPatch, getFin } from "./state";

const bucketTone = (b: number): Tone => (b === 0 ? "accent" : b === 1 ? "warn" : "bad");

function nextStep(i: Invoice): { text: string; who: string; date: string } {
  const d = daysOverdue(i);
  const due = i.due;
  if (i.hold) return { text: "Held: " + i.hold.toLowerCase() + ". Agent resumes when the PO arrives", who: "Caitlin", date: "On receipt" };
  if (d === 0) return { text: TODAY_REMINDERS[i.id] ? "Day 1 reminder scheduled" : "Day 1 friendly reminder scheduled", who: "Collections Agent", date: fmtDate(addDays(due, 1)) };
  const nxt = CADENCE.find((c) => c.day > d);
  if (!nxt) return { text: "Final notice drafted and waiting for approval", who: "Caitlin approves", date: "Today" };
  return { text: nxt.label, who: nxt.who, date: fmtDate(addDays(due, nxt.day)) };
}

export default function Debtors() {
  const fin = useFin();
  const open = invoiceOutstanding();
  const total = outstandingTotal();
  const [bucket, setBucket] = useState<number | null>(null);
  const [selCust, setSelCust] = useState<string | null>("c-atlantic");
  const buckets = AGE_BUCKETS.map((_, b) => ({ amount: sum(open.filter((i) => ageBucket(i) === b).map((i) => i.amount)), n: open.filter((i) => ageBucket(i) === b).length }));
  const byCust = Object.values(open.reduce((m: Record<string, Invoice[]>, i) => { (m[i.customerId] = m[i.customerId] || []).push(i); return m; }, {}))
    .map((xs) => ({ id: xs[0].customerId, xs, amount: sum(xs.map((x) => x.amount)), worst: Math.max(...xs.map((x) => daysOverdue(x))), bucket: Math.max(...xs.map((x) => ageBucket(x))) }))
    .filter((r) => bucket === null || r.xs.some((x) => ageBucket(x) === bucket))
    .sort((a, b) => b.worst - a.worst || b.amount - a.amount);
  const sel = byCust.find((r) => r.id === selCust) || byCust[0];
  const chasesToday = (id: string) => (fin.reminders[id] || []);

  return (
    <Page>
      <Title title="Debtors" sub={"Every unpaid invoice read back from RedBook, with the Collections Agent's follow up status beside it. " + eur(total) + " outstanding across " + open.length + " invoices."} />
      <Grid cols="repeat(5,minmax(0,1fr))" gap={10}>
        {AGE_BUCKETS.map((l, b) => (
          <button key={l} onClick={() => setBucket(bucket === b ? null : b)} style={{ textAlign: "left", cursor: "pointer", padding: "13px 14px", borderRadius: "var(--r-md,16px)", background: bucket === b ? "var(--accent-soft)" : "var(--surface)", border: "1px solid " + (bucket === b ? "var(--accent-line)" : "var(--border)"), color: "var(--ink)" }}>
            <Label style={{ color: b > 1 ? "var(--bad)" : b === 1 ? "var(--warn)" : "var(--faint)" }}>{l}</Label>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{eur(buckets[b].amount)}</div>
            <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 3 }}>{buckets[b].n} {buckets[b].n === 1 ? "invoice" : "invoices"}</div>
            <div style={{ marginTop: 9 }}><Progress value={(buckets[b].amount / total) * 100} tone={bucketTone(b)} h={4} /></div>
          </button>
        ))}
      </Grid>

      <Grid cols="minmax(0,1.5fr) minmax(300px,1fr)" gap={16}>
        <Card flush style={{ alignSelf: "start" }}>
          <Table cols="minmax(150px,1.3fr) 90px 110px minmax(160px,1.6fr)" head={["Customer", "Owed", "Overdue", "Collections Agent"]} activeRow={byCust.findIndex((r) => r.id === sel?.id)}
            onRow={(i) => setSelCust(byCust[i].id)}
            rows={byCust.map((r) => {
              const worstInv = r.xs.slice().sort((a, b) => daysOverdue(b) - daysOverdue(a))[0];
              const ns = nextStep(worstInv);
              const hold = r.xs.find((x) => x.hold);
              return [
                <div style={{ minWidth: 0 }}><Strong>{custName(r.id)}</Strong><Sub>{r.xs.length} {r.xs.length === 1 ? "invoice" : "invoices"}{hold ? " · on hold" : ""}</Sub></div>,
                <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontWeight: 500 }}>{eur(r.amount)}</span>,
                r.worst > 0 ? <Pill tone={bucketTone(r.bucket)}>{r.worst} days</Pill> : <Pill tone="accent">Not due</Pill>,
                <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, color: "var(--body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ns.text}</div><Sub>{ns.who} · {ns.date}</Sub></div>,
              ];
            })}
            foot={"Showing " + byCust.length + " customers. Total outstanding " + eur(total) + (bucket !== null ? " (filtered: " + AGE_BUCKETS[bucket] + ")" : "")} />
        </Card>

        {sel && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <Card>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px" }}>{custName(sel.id)}</div>
                  <Sub>{(() => { const c = customerById(sel.id), ct = contactById(siteById(c.siteIds[0]).contactId); return ct.name + ", " + ct.role + " · " + ct.phone; })()}</Sub>
                </div>
                <div style={{ textAlign: "right" }}><Label>Owed</Label><div style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.6px" }}>{eur(sel.amount)}</div></div>
              </div>
              {sel.xs.map((inv) => {
                const ns = nextStep(inv);
                const all = inv.chases.map((c) => ({ ...c })).concat((fin.reminders[inv.id] || []).map((t) => ({ date: TODAY, by: "Caitlin" as any, channel: "Call" as any, note: t })));
                return (
                  <div key={inv.id} style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <Strong mono>{inv.id}</Strong><span style={{ color: "var(--ink)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{eur(inv.amount)}</span>
                      <Pill tone={bucketTone(ageBucket(inv))}>{daysOverdue(inv) ? daysOverdue(inv) + " days overdue" : "Due " + fmtDate(inv.due)}</Pill>
                      {inv.hold && <Pill tone="warn">{inv.hold}</Pill>}
                    </div>
                    <Sub style={{ marginTop: 4 }}>{inv.desc} · issued {fmtDate(inv.issued)}</Sub>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 0 }}>
                      {all.map((c, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c.by === "Caitlin" ? "var(--warn)" : "var(--accent)", marginTop: 4 }} /><span style={{ flex: 1, width: 1, background: "var(--border)" }} /></div>
                          <div style={{ paddingBottom: 10 }}><div style={{ fontSize: 12.5, color: "var(--body)" }}>{c.note}</div><Sub>{fmtDate(c.date)} · {c.channel} · {c.by}</Sub></div>
                        </div>
                      ))}
                      {TODAY_REMINDERS[inv.id] && <div style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--accent)", marginTop: 4 }} /><div style={{ paddingBottom: 10 }}><div style={{ fontSize: 12.5, color: "var(--body)" }}>{TODAY_REMINDERS[inv.id]}</div><Sub>Today · Email · Collections Agent</Sub></div></div>}
                      <div style={{ display: "grid", gridTemplateColumns: "16px 1fr", gap: 10 }}><span style={{ width: 8, height: 8, borderRadius: 99, border: "1px dashed var(--faint)", marginTop: 4 }} /><div><div style={{ fontSize: 12.5, color: "var(--dim)" }}>Next: {ns.text}</div><Sub>{ns.who} · {ns.date}</Sub></div></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <Btn small onClick={() => toast("Reminder emailed to " + custName(inv.customerId))}>Send reminder now</Btn>
                      <Btn small onClick={() => { finPatch({ reminders: { ...getFin().reminders, [inv.id]: [...(getFin().reminders[inv.id] || []), "Call task created for Caitlin"] } }); toast("Call task created for Caitlin"); }}>Create call task</Btn>
                    </div>
                  </div>
                );
              })}
            </Card>
            <Card>
              <Head small title="How follow up works" />
              {CADENCE.map((c) => <div key={c.day} style={{ display: "flex", gap: 10, padding: "6px 0", fontSize: 12.5, borderTop: c.day > 1 ? "1px solid var(--border)" : undefined }}><span style={{ width: 54, color: "var(--faint)", fontFamily: "var(--mono)", fontSize: 11 }}>Day {c.day}</span><span style={{ flex: 1, color: "var(--body)" }}>{c.label}</span><span style={{ color: "var(--dim)" }}>{c.who}</span></div>)}
              <Sub style={{ marginTop: 8 }}>Days count from the due date. Caitlin sees only the exceptions.</Sub>
            </Card>
          </div>
        )}
      </Grid>
    </Page>
  );
}
