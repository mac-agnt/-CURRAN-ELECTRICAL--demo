import { CONTRACTS, Contract, addDays, eur, fmtDate, goTo, pct, sum, toast, dayDiff } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Ic } from "../../ui";
import { Sub } from "../finance/shared";
import { useFin } from "../finance/state";
import { useEffSummary, InvPill, effInvoice, siteLabel, QMAP, prepareDraft, marginOf } from "./shared";

const agentState = (c: Contract, inv: string): { text: string; tone: "ok" | "warn" | "bad" | "accent" | "neutral" } => {
  if (inv === "Paid") return { text: "Closed, payment received", tone: "ok" };
  if (inv === "Sent") return { text: "Monitoring payment", tone: "accent" };
  if (inv === "Approved") return { text: "Posting to RedBook", tone: "accent" };
  if (inv === "Draft ready") return { text: "Waiting for Caitlin to approve", tone: "warn" };
  if (inv === "Not drafted") return { text: "No invoice yet. Draft needed", tone: "bad" };
  return { text: "Drafts on " + fmtDate(addDays(c.renew, -30)), tone: "neutral" };
};

export default function Renewals() {
  const s = useEffSummary();
  const cloud = ["K-03", "K-06", "K-07"].map((id) => CONTRACTS.find((c) => c.id === id)!);
  const cost = sum(cloud.map((c) => c.supplierCost)), bill = sum(cloud.map((c) => c.billing));
  return (
    <Page>
      <Title title="Renewals" sub={"Eight contracts renew in the next 60 days, worth " + eur(s.renewalRevenue) + ". " + (s.unbilledN ? s.unbilledN + " are not yet invoiced." : "All are now invoiced or in hand.")} />
      <Grid cols="minmax(0,1.6fr) minmax(280px,1fr)" gap={16}>
        <Card flush style={{ alignSelf: "start" }}>
          <Table cols="64px minmax(180px,1.6fr) 80px 100px minmax(150px,1.3fr)" head={["Renews", "Contract", "Billing", "Invoice", "Contracts Agent"]}
            onRow={(i) => goTo("Contracts", "contracts", { contract: s.renewing[i].id })}
            rows={s.renewing.map((c) => {
              const inv = effInvoice(c, s.f), a = agentState(c, inv);
              return [<span style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{fmtDate(c.renew)}</span>,
                <div style={{ minWidth: 0 }}><Strong>{c.customer}</Strong><Sub>{c.type}{c.risk ? " · " + c.risk : ""}</Sub></div>,
                <Strong>{eur(c.billing)}</Strong>, <InvPill c={c} f={s.f} />,
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 7, height: 7, borderRadius: 99, flex: "none", background: a.tone === "neutral" ? "var(--faint)" : "var(--" + a.tone + ")" }} /><span style={{ fontSize: 12.5, color: "var(--body)" }}>{a.text}</span></div>];
            })}
            foot={"Renewal revenue " + eur(s.renewalRevenue) + ". Invoiced or paid " + eur(sum(s.renewing.filter((c) => ["Paid", "Sent", "Approved"].indexOf(effInvoice(c, s.f)) > -1).map((c) => c.billing))) + ". Unbilled " + eur(s.unbilledValue) + "."} />
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <Head title="What the Contracts Agent does" sub="Watches every renewal date so nobody has to remember" />
            <Label style={{ marginBottom: 6 }}>On its own</Label>
            {["Finds renewals 60 days out", "Checks the platform or supplier cost behind each one", "Drafts the renewal invoice at the same price", "Sends approved invoices to RedBook", "Chases payment through the Collections Agent", "Raises the next service visit for the planner"].map((t) => <div key={t} style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 12.5, color: "var(--body)" }}><Ic n="check" size={13} color="var(--ok)" sw={2.4} />{t}</div>)}
            <Label style={{ margin: "14px 0 6px" }}>Asks Caitlin</Label>
            {["Approval on every renewal invoice", "Any price change or customer query", "Contracts with no site or system match"].map((t) => <div key={t} style={{ display: "flex", gap: 9, padding: "4px 0", fontSize: 12.5, color: "var(--body)" }}><Ic n="flag" size={13} color="var(--warn)" />{t}</div>)}
          </Card>
        </div>
      </Grid>

      <Card pad={0} flush>
        <div style={{ padding: "18px 18px 10px" }}>
          <Head title="Cloud and platform rebilling" sub="Joe Curran Electrical pays Hikvision cloud storage and 4G failover fees up front, then has to rebill the customer. When the renewal slips, the platform fee comes straight out of margin." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
            {[["Platform cost, 3 contracts", eur(cost)], ["Rebill due", eur(bill)], ["Margin once billed", eur(bill - cost) + " (" + pct((bill - cost) / bill, 0) + ")"], ["Not yet rebilled", String(cloud.filter((c) => ["Draft ready", "Not drafted", "Scheduled"].indexOf(effInvoice(c, s.f)) > -1).length) + " of 3"]].map(([k, v]) => <div key={k} style={{ padding: "11px 13px", borderRadius: "var(--r-sm,12px)", background: "var(--surface-2)", border: "1px solid var(--border)" }}><Label>{k}</Label><div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginTop: 5, fontVariantNumeric: "tabular-nums" }}>{v}</div></div>)}
          </div>
        </div>
        <Table cols="minmax(200px,1.5fr) minmax(170px,1.2fr) 100px 100px 90px 110px 120px 130px" head={["Contract", "Platform", "Cost paid", "Rebill due", "Margin", "Renewal", "Status", ""]}
          rows={cloud.map((c) => {
            const inv = effInvoice(c, s.f), q = QMAP[c.id];
            return [<div style={{ minWidth: 0 }}><Strong>{c.customer}</Strong><Sub>{siteLabel(c)}</Sub></div>, <span style={{ fontSize: 12.5 }}>{c.platform}</span>, eur(c.supplierCost), <Strong>{eur(c.billing)}</Strong>, <span>{pct(marginOf(c), 0)}</span>, fmtDate(c.renew), <InvPill c={c} f={s.f} />,
              inv === "Not drafted" || inv === "Scheduled" ? <Btn small kind="primary" onClick={() => prepareDraft(c, s.f)}>Draft rebill</Btn> : q ? <Btn small onClick={() => goTo("Finance", "queue", { queue: q })}>Open in queue</Btn> : <span />];
          })} />
      </Card>
    </Page>
  );
}
