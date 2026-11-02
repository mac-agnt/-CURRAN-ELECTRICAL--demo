import { useEffect, useRef, useState } from "react";
import { SUPPLIERS, SUPPLIER_INVOICES, SupplierInvoice, eur, jobById, jobFin, matchedToday, pct, sum, toast, goTo, supplierById, fmtDate, TODAY, jobsSummary } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Ic, Seg, HBars, Progress } from "../../ui";
import { Sub } from "./shared";
import { useFin, finPatch, getFin } from "./state";

type Tab = "matched" | "review" | "missing" | "duplicate";

const SIM = [
  ["Email arrives", "invoices@joecurranelectrical.ie, 09:06. Attachment KE-28492.pdf (1 page)"],
  ["Invoice detected", "Total EUR 2,184.00 ex VAT, dated 10 Nov 2026"],
  ["Supplier recognised", "Killarney Electrical Wholesale (key supplier, account KE)"],
  ["Job reference extracted", "'Park Hotel Kenmare / J-2641' read from the delivery reference"],
  ["Cost categorised", "Materials: 3 core cable, containment, accessories"],
  ["Attached to job", "Park Hotel Electrical Upgrade, J-2641"],
  ["Job actual cost updated", ""],
  ["Duplicate check completed", "No match on supplier, number or amount in the last 12 months"],
  ["Confidence 99%", "No human needed. Logged to the audit trail at 09:07"],
];

function Simulation() {
  const j = jobById("J-2641");
  const f = jobFin(j);
  const [n, setN] = useState(SIM.length);
  const timer = useRef<any>(null);
  const run = () => { clearInterval(timer.current); setN(0); timer.current = setInterval(() => setN((x) => { if (x >= SIM.length) { clearInterval(timer.current); return x; } return x + 1; }), 650); };
  useEffect(() => () => clearInterval(timer.current), []);
  return (
    <Card pad={0} flush>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Supplier Invoice Inbox</div>
          <Sub>Supplier email in, cost on the job, margin updated. Caitlin does not file or type any of it.</Sub>
        </div>
        <Btn kind="primary" onClick={run}><Ic n="play" size={13} />Simulate arrival</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,0.8fr) minmax(0,1.6fr)" }}>
        <div style={{ padding: 18, borderRight: "1px solid var(--border)", background: "var(--surface-faint)" }}>
          <Label>Incoming email</Label>
          <div style={{ marginTop: 10, padding: 14, borderRadius: "var(--r-md,14px)", background: "var(--surface-2)", border: "1px solid var(--border)", opacity: n > 0 ? 1 : 0.25, transform: n > 0 ? "none" : "translateY(8px)", transition: "all .4s var(--ease)" }}>
            <div style={{ fontSize: 12, color: "var(--faint)" }}>From accounts@killarneyelectrical.example</div>
            <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500, margin: "6px 0 10px" }}>Invoice KE-28492, ref Park Hotel Kenmare / J-2641</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 10, background: "var(--track)", fontSize: 12, color: "var(--body)" }}><Ic n="doc" size={14} />KE-28492.pdf</div>
          </div>
          <Sub style={{ marginTop: 14 }}>Replay to watch each step. Four of the last eight supplier invoices ran this way. Four went to Caitlin.</Sub>
        </div>
        <div style={{ padding: "14px 18px" }}>
          {SIM.map((s, i) => {
            const done = i < n, active = i === n;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 190px minmax(0,1fr)", gap: 10, alignItems: "center", padding: "7px 0", opacity: done || active ? 1 : 0.3, transition: "opacity .3s" }}>
                <span style={{ width: 18, height: 18, borderRadius: 99, border: "1px solid " + (done ? "var(--ok)" : active ? "var(--accent)" : "var(--border-strong)"), display: "inline-flex", alignItems: "center", justifyContent: "center", background: done ? "var(--ok-soft)" : undefined }}>{done && <Ic n="check" size={10} color="var(--ok)" sw={2.6} />}</span>
                <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{s[0]}</span>
                <span style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.4 }}>{i === 6 ? "Materials actual " + eur(f.actualCost - j.actual.labour - j.actual.other) + ", forecast margin holds at " + pct(f.fcMargin, 1) + ", GP to date " + eur(f.gpToDate) : s[1]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default function Supplier() {
  const fin = useFin();
  const [tab, setTab] = useState<Tab>("review");
  const all = SUPPLIER_INVOICES;
  const eff = (s: SupplierInvoice): "matched" | "review" | "missing" | "duplicate" | "rejected" => {
    const r = fin.si[s.id];
    return r ? (r.state === "rejected" ? "rejected" : "matched") : s.status;
  };
  const exceptionsOpen = all.filter((s) => ["review", "missing", "duplicate"].indexOf(eff(s)) > -1);
  const counts: Record<Tab, number> = { matched: all.filter((s) => eff(s) === "matched" && s.received.slice(0, 10) >= "2026-10-25").length, review: all.filter((s) => eff(s) === "review").length, missing: all.filter((s) => eff(s) === "missing").length, duplicate: all.filter((s) => eff(s) === "duplicate").length };
  const list = all.filter((s) => (tab === "matched" ? eff(s) === "matched" && s.received.slice(0, 10) >= "2026-10-25" : eff(s) === tab))
    .sort((a, b) => b.received.localeCompare(a.received));
  const spendBy = SUPPLIERS.map((s) => ({ s, v: sum(all.filter((x) => x.supplierId === s.id && x.status === "matched").map((x) => x.amount)) })).sort((a, b) => b.v - a.v);
  const keyShare = sum(spendBy.filter((x) => x.s.key).map((x) => x.v)) / sum(spendBy.map((x) => x.v));
  const resolve = (s: SupplierInvoice, jobId: string | undefined, category?: string) => {
    finPatch({ si: { ...getFin().si, [s.id]: { state: "matched", jobId, category } } });
    toast(s.number + " attached to " + (jobId ? jobById(jobId).name : "job") + ". Job actual cost updated");
  };
  const reject = (s: SupplierInvoice) => { finPatch({ si: { ...getFin().si, [s.id]: { state: "rejected" } } }); toast(s.number + " rejected as a duplicate. Supplier notified"); };
  const autoRate = all.filter((s) => s.auto).length / all.length;

  return (
    <Page>
      <Title title="Supplier Costs" sub="Four key suppliers send most invoices. Pulse reads each one, finds the job and updates its cost. Caitlin manages the exceptions instead of performing data entry." right={<Pill tone="ok">{pct(autoRate, 0)} handled automatically</Pill>} />
      <Simulation />

      <Grid cols="minmax(0,1.7fr) minmax(280px,1fr)" gap={16}>
        <Card flush style={{ alignSelf: "start" }}>
          <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>Supplier invoice queue</div>
              <Sub>{exceptionsOpen.length ? exceptionsOpen.length + " need a person. Everything else is already on a job." : "Nothing needs you. All matched."}</Sub>
            </div>
            <Seg<Tab> value={tab} onChange={setTab} options={[["matched", "Matched " + counts.matched], ["review", "Needs review " + counts.review], ["missing", "Missing job " + counts.missing], ["duplicate", "Duplicate " + counts.duplicate]]} />
          </div>
          {list.length === 0 && <div style={{ padding: "34px 18px", textAlign: "center", color: "var(--dim)", fontSize: 13, borderTop: "1px solid var(--border)" }}>Nothing in this queue. Pulse will tell Caitlin if something arrives.</div>}
          {list.map((s) => {
            const sup = supplierById(s.supplierId);
            const j = s.jobId ? jobById(s.jobId) : undefined;
            const isEx = tab !== "matched";
            return (
              <div key={s.id} style={{ padding: "13px 18px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 90px 96px", gap: 12, alignItems: "center" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Strong mono>{s.number}</Strong><span style={{ fontSize: 12.5, color: "var(--dim)" }}>{sup.short}</span>{!sup.key && <Pill>Occasional</Pill>}</div>
                    <Sub style={{ marginTop: 3 }}>{s.received.slice(0, 10) === TODAY ? "Today " + s.received.slice(11) : fmtDate(s.received.slice(0, 10)) + " " + s.received.slice(11)} · {j ? j.name : "No job yet"} · {s.category}</Sub>
                  </div>
                  <span style={{ textAlign: "right", fontWeight: 600, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{eur(s.amount)}</span>
                  <div><Progress value={s.confidence} tone={s.confidence >= 90 ? "ok" : s.confidence >= 60 ? "warn" : "bad"} h={5} /><div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4, textAlign: "right" }}>{s.confidence}% confident</div></div>
                </div>
                {isEx && s.note && <div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 8, lineHeight: 1.45 }}>{s.note}</div>}
                {isEx && (tab === "review" || tab === "missing") && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--faint)" }}>Attach to</span>
                    {(s.candidates || []).map((c) => <Btn small key={c.jobId} onClick={() => resolve(s, c.jobId, s.category)}>{jobById(c.jobId).name.split(" ").slice(0, 2).join(" ")} ({c.score}%)</Btn>)}
                    {s.category === "Plant hire" && <Pill tone="warn">Category: plant hire, not materials</Pill>}
                  </div>
                )}
                {isEx && tab === "duplicate" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Btn small kind="danger" onClick={() => reject(s)}>Reject duplicate</Btn>
                    <Btn small onClick={() => resolve(s, s.jobId, s.category)}>Keep as separate invoice</Btn>
                  </div>
                )}
                {!isEx && j && <div style={{ marginTop: 6 }}><button onClick={() => goTo("Jobs", "active", { job: j.id, jobTab: "costs" })} style={{ background: "none", border: 0, color: "var(--accent)", fontSize: 12, cursor: "pointer", padding: 0 }}>View in job costs</button></div>}
              </div>
            );
          })}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <Head title="Spend by supplier" sub={pct(keyShare, 0) + " of matched spend comes from the four key suppliers"} />
            <HBars rows={spendBy.map((x) => ({ label: x.s.short, value: x.v, tone: x.s.key ? "accent" : "neutral", note: x.s.key ? undefined : "occasional" }))} format={eur} />
          </Card>
          <Card>
            <Head small title="What the inbox does" />
            {["Watches invoices@joecurranelectrical.ie", "Recognises supplier by sender, prefix and VAT number", "Reads the job reference and cost type", "Checks for duplicates before anything posts", "Only asks a person when confidence drops below 90%"].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, padding: "5px 0", fontSize: 12.5, color: "var(--body)" }}><Ic n="check" size={13} color="var(--ok)" sw={2.4} />{t}</div>
            ))}
          </Card>
        </div>
      </Grid>
    </Page>
  );
}
