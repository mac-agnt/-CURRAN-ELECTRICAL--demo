import { useState } from "react";
import {
  CUSTOMERS, SITES, SYSTEMS, CONTRACTS, JOBS, INVOICES, dayDiff, eur, fmtDate, contractSummary, invoiceOutstanding, outstandingTotal, daysOverdue, goTo, setTab, useCurran, staffById,
} from "../../index";
import { Page, Grid, Card, Head, Kpi, Pill, Btn, HBars, Ic, Label, Seg, Table, Strong, Muted, Callout } from "../../ui";
import { custStats, showMoney, openCustomer, openSite, openSystem, Chip, KindDot, DueChip } from "./shared";

const DEMO = ["c-park", "c-murphy", "c-kmc", "c-dunloe"];

function Chain() {
  const [cid, setCid] = useState("c-park");
  const st = custStats(cid);
  const site = SITES.find((s) => s.id === st.c.siteIds[0])!;
  const sys = st.systems;
  const invs = INVOICES.filter((i) => i.customerId === cid);
  const job = st.activeJobs[0];
  const con = st.contracts[0];
  const nodes: { key: string; label: string; n: string; sub: string; go: () => void }[] = [
    { key: "cust", label: "Customer", n: st.c.name, sub: st.c.kind + ", since " + st.c.since, go: () => openCustomer(cid) },
    { key: "site", label: "Site", n: String(st.sites), sub: site.town, go: () => openSite(site.id) },
    { key: "sys", label: "Systems", n: String(sys.length), sub: sys.slice(0, 2).map((s) => s.kind).join(", "), go: () => sys[0] && openSystem(sys[0].id) },
    { key: "job", label: "Jobs", n: String(st.activeJobs.length), sub: job ? job.id : "None active", go: () => job ? goTo("Jobs", "active", { job: job.id }) : setTab("Jobs", "completed") },
    { key: "inv", label: "Invoices", n: String(invs.length), sub: invs.filter((i) => !i.paid).length + " open", go: () => goTo("Finance", "debtors") },
    { key: "con", label: "Contracts", n: String(st.contracts.length), sub: con ? con.id + " renews " + fmtDate(con.renew) : "None", go: () => goTo("Contracts", "contracts", con ? { contract: con.id } : {}) },
  ];
  return (
    <Card>
      <Head title="How one customer connects" sub="Every record hangs off the customer. Click a link to open it." right={<Seg options={DEMO.map((id) => [id, CUSTOMERS.find((c) => c.id === id)!.name.split(" ")[0]] as [string, string])} value={cid} onChange={setCid} />} />
      <div style={{ display: "flex", alignItems: "stretch", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
        {nodes.map((n, i) => (
          <div key={n.key} style={{ display: "flex", alignItems: "center", flex: i === 0 ? "1.3 1 0" : "1 1 0", minWidth: 0 }}>
            <button onClick={n.go} className="ixu" style={{ flex: 1, minWidth: 0, textAlign: "left", padding: "12px 12px", borderRadius: "var(--r-md,14px)", border: "1px solid var(--border)", background: i === 0 ? "var(--accent-faint)" : "var(--surface-2)", cursor: "pointer", color: "var(--ink)" }}>
              <Label>{n.label}</Label>
              <div style={{ fontSize: i === 0 ? 13.5 : 20, fontWeight: 600, marginTop: 5, letterSpacing: "-.4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.n}</div>
              <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.sub}</div>
            </button>
            {i < nodes.length - 1 && <span style={{ width: 18, display: "flex", justifyContent: "center", color: "var(--faint)", flex: "none" }}><Ic n="arrow" size={13} /></span>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
        {sys.map((s) => <Chip key={s.id} onClick={() => openSystem(s.id)}><KindDot kind={s.kind} />{s.label}</Chip>)}
        {!sys.length && <Muted>No installed systems on record.</Muted>}
      </div>
      <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 12, lineHeight: 1.5 }}>
        A customer has sites. A site has systems. A system keeps its service history. Jobs happen at a site, supplier invoices become job cost, jobs raise invoices, and contracts bring recurring work and billing back to the same site.
      </div>
    </Card>
  );
}

export default function Overview() {
  const cur = useCurran();
  const money = showMoney(cur.role);
  const cs = contractSummary();
  const due30 = SYSTEMS.filter((s) => dayDiff(s.nextService) >= 0 && dayDiff(s.nextService) <= 30).sort((a, b) => a.nextService.localeCompare(b.nextService));
  const rows = CUSTOMERS.map((c) => custStats(c.id));
  const byOut = rows.filter((r) => r.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding);
  const byInv = rows.slice().sort((a, b) => b.invoiced - a.invoiced).slice(0, 7);
  const attention = [
    { tone: "bad" as const, title: "Derrynane Holiday Homes", text: "INV-4641 is " + daysOverdue(INVOICES.find((i) => i.id === "INV-4641")!) + " days overdue. Final notice drafted for Caitlin.", go: () => openCustomer("c-derr"), money: true },
    { tone: "warn" as const, title: "Atlantic Lodge Hotel", text: "Stage 1 invoice held for a PO number from head office. 52 days overdue, three reminders sent.", go: () => openCustomer("c-atlantic"), money: true },
    { tone: "warn" as const, title: "Sneem Pharmacy", text: "Asking about a cheaper cloud option. Intruder and cloud contract K-07 renews 3 Jan.", go: () => openCustomer("c-sneem"), money: false },
    { tone: "warn" as const, title: "Murphy Retail Group", text: "CCTV cloud renewal K-03 falls due 1 Dec and has not been invoiced. Cloud cost is already committed.", go: () => openCustomer("c-murphy"), money: false },
  ].filter((a) => money || !a.money);
  return (
    <Page>
      <Grid cols={money ? "repeat(6,1fr)" : "repeat(5,1fr)"} gap={12}>
        <Kpi label="Customers" value={CUSTOMERS.length} hint="Key accounts. 486 historic records matched" />
        <Kpi label="Sites" value={SITES.length} hint="Each with a QR record" />
        <Kpi label="Installed systems" value={SYSTEMS.length} hint="Full service history on each" />
        <Kpi label="Active contracts" value={cs.active} hint={cs.renewing + " renewing in 60 days"} />
        {money && <Kpi label="Outstanding" value={eur(outstandingTotal())} tone="warn" hint={invoiceOutstanding().length + " open invoices"} />}
        <Kpi label="Service due, 30 days" value={due30.length} hint="Installed systems" tone={due30.length > 3 ? "accent" : undefined} />
      </Grid>
      <Grid cols="1.15fr 1fr">
        <Card>
          <Head title={money ? "Invoiced to date by customer" : "Installed systems by customer"} sub={money ? "Open balances shown beside the name" : "Systems on record per customer"} />
          <HBars
            rows={byInv.map((r) => money
              ? { label: r.c.name, value: r.invoiced, note: r.outstanding ? eur(r.outstanding) + " open" : "settled", tone: r.overdue ? ("warn" as const) : ("accent" as const) }
              : { label: r.c.name, value: r.systems.length, tone: "accent" as const })}
            format={(n) => (money ? eur(n) : String(n))} />
          <div style={{ marginTop: 14 }}><Btn small onClick={() => setTab("Customers", "customers")}>Open all customers</Btn></div>
        </Card>
        <Card>
          <Head title="Needs attention" sub="Customer facts the agents have raised" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {attention.map((a) => (
              <div key={a.title} onClick={a.go} className="ix11" style={{ display: "flex", gap: 12, padding: "11px 12px", borderRadius: "var(--r-md,14px)", border: "1px solid var(--border)", cursor: "pointer", background: "var(--surface-faint)" }}>
                <span style={{ marginTop: 4 }}><span style={{ display: "block", width: 8, height: 8, borderRadius: 99, background: a.tone === "bad" ? "var(--bad)" : "var(--warn)" }} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3, lineHeight: 1.45 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Grid>
      <Grid cols="1.5fr 1fr">
        <Chain />
        <Card flush>
          <div style={{ padding: "18px 18px 0" }}><Head title="Systems due for service" sub="Next 30 days, across all sites" /></div>
          <Table cols="1.3fr .9fr" dense
            head={["System", "Next service"]}
            onRow={(i) => openSystem(due30[i].id)}
            rows={due30.slice(0, 7).map((s) => [
              <div style={{ minWidth: 0 }}><Strong>{s.label}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SITES.find((x) => x.id === s.siteId)!.name}</div></div>,
              <DueChip date={s.nextService} />,
            ])}
            empty="No systems due in the next 30 days" />
        </Card>
      </Grid>
      <Callout tone="accent" title="Scan a panel, open its whole history"
        right={<Btn kind="primary" small onClick={() => openSystem("SYS-2001")}><Ic n="qr" size={14} />Open the Murphy Retail panel record</Btn>}>
        Every installed system carries a QR label. A technician on site scans it and lands on the install details, manuals, past repairs, known issues and the next service date.
      </Callout>
    </Page>
  );
}
