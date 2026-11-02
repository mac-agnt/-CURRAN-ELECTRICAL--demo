import { addDays, eur, fmtDate, goTo, setTab, pct, dayDiff, customerById, sum, RENEW_WINDOW, staffById, TODAY } from "../../index";
import { Page, Title, Grid, Card, Head, Kpi, Pill, Btn, Callout, Label, Ic, Progress, HBars } from "../../ui";
import { Sub } from "../finance/shared";
import { useEffSummary, InvPill, effInvoice, invTone, siteLabel, QMAP, MONTHS } from "./shared";

export default function Overview() {
  const s = useEffSummary();
  const top = s.topRenewal;
  const topEff = effInvoice(top, s.f);
  const statuses = ["Paid", "Sent", "Approved", "Draft ready", "Not drafted", "Scheduled"] as const;
  const byStatus = statuses.map((st) => ({ st, list: s.renewing.filter((c) => effInvoice(c, s.f) === st) })).filter((x) => x.list.length);
  return (
    <Page>
      <Title title="Service Contracts" sub="Every recurring alarm, CCTV, fire and maintenance agreement, with its renewal, platform cost and invoice status in one place. Renewals used to slip. The Contracts Agent now watches every date." right={<Pill tone="ok">Contracts Agent active</Pill>} />
      <Grid cols="repeat(6,minmax(0,1fr))" gap={12}>
        <Kpi label="Active contracts" value={s.active} hint="Recurring service agreements" onClick={() => setTab("Contracts", "contracts")} />
        <Kpi label="Annual recurring revenue" value={eur(s.arr)} hint={pct(s.arrMargin / s.arr, 0) + " gross margin after platform cost"} />
        <Kpi label="Renewals, next 60 days" value={eur(s.renewalRevenue)} tone="accent" hint={s.renewing.length + " contracts"} onClick={() => setTab("Contracts", "renewals")} />
        <Kpi label="Contracts at risk" value={s.atRisk} tone="warn" hint="Unbilled or customer queried" onClick={() => setTab("Contracts", "renewals")} />
        <Kpi label="Service visits due" value={s.visitsDue} hint="Next 30 days" onClick={() => setTab("Contracts", "service")} />
        <Kpi label="Unbilled renewals" value={s.unbilledN} tone={s.unbilledN ? "bad" : "ok"} hint={eur(s.unbilledValue) + " not yet invoiced"} onClick={() => setTab("Contracts", "renewals")} />
      </Grid>

      <Grid cols="repeat(3,minmax(0,1fr))" gap={12}>
        <Callout tone="accent" title={s.renewing.length + " contracts renewing in next 60 days"}>{fmtDate(s.renewing[0].renew)} to {fmtDate(s.renewing[s.renewing.length - 1].renew)}</Callout>
        <Callout tone="accent" title={eur(s.renewalRevenue) + " renewal revenue due"}>Of which {eur(s.renewing.filter((c) => ["Paid", "Sent"].indexOf(effInvoice(c, s.f)) > -1).reduce((a, c) => a + c.billing, 0))} already invoiced</Callout>
        <Callout tone={s.unbilledN ? "warn" : "ok"} title={s.unbilledN + " customer renewals not yet invoiced"} right={<Btn small onClick={() => setTab("Contracts", "renewals")}>Review</Btn>}>{eur(s.unbilledValue)} would otherwise slip through</Callout>
      </Grid>

      <Grid cols="minmax(0,1.5fr) minmax(280px,1fr)" gap={16}>
        <Card pad={0} flush>
          <div style={{ padding: "18px 18px 8px" }}><Head title="Renewal timeline" sub="Next 60 days. Each point is a contract renewal, coloured by invoice status." /></div>
          <div style={{ position: "relative", margin: "14px 28px 34px", height: 46 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 22, height: 2, background: "var(--track)", borderRadius: 2 }} />
            {[0, 15, 30, 45, 60].map((d) => <div key={d} style={{ position: "absolute", left: (d / RENEW_WINDOW) * 100 + "%", top: 30, transform: "translateX(-50%)", fontSize: 10.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{d === 0 ? "Today" : fmtDate(addDays(TODAY, d))}</div>)}
            {s.renewing.map((c, i) => {
              const t = invTone(effInvoice(c, s.f), dayDiff(c.renew));
              return (
                <div key={c.id} title={c.name + ", " + eur(c.billing)} onClick={() => goTo("Contracts", "contracts", { contract: c.id })} style={{ position: "absolute", left: (dayDiff(c.renew) / RENEW_WINDOW) * 100 + "%", top: i % 2 ? 4 : 12, transform: "translateX(-50%)", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ width: 14, height: 14, borderRadius: 99, background: t === "neutral" ? "var(--faint)" : `var(--${t === "accent" ? "accent" : t})`, boxShadow: "0 0 0 3px var(--surface)" }} />
                </div>
              );
            })}
          </div>
          {s.renewing.map((c) => (
            <div key={c.id} className="ix11" onClick={() => goTo("Contracts", "contracts", { contract: c.id })} style={{ display: "grid", gridTemplateColumns: "58px minmax(0,1fr) 80px 110px", gap: 12, alignItems: "center", padding: "11px 18px", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--dim)" }}>{fmtDate(c.renew)}</span>
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div><Sub>{c.customer} · {c.type}</Sub></div>
              <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontWeight: 600 }}>{eur(c.billing)}</span>
              <InvPill c={c} f={s.f} />
            </div>
          ))}
          <div style={{ display: "flex", padding: "11px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 12, color: "var(--dim)" }}><span style={{ flex: 1 }}>Total renewing</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{eur(s.renewalRevenue)}</span></div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card style={{ borderColor: "var(--accent-line)" }}>
            <Pill tone="accent">Highest priority renewal</Pill>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--ink)", marginTop: 10, letterSpacing: "-.4px" }}>{top.name}</div>
            <Sub>{top.customer} · {siteLabel(top)}</Sub>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, margin: "14px 0" }}>
              <div><Label>Renews</Label><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 5 }}>{fmtDate(top.renew)}</div><Sub>in {dayDiff(top.renew)} days</Sub></div>
              <div><Label>Billing</Label><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 5 }}>{eur(top.billing)}</div><Sub>manual renew</Sub></div>
              <div><Label>Invoice</Label><div style={{ marginTop: 5 }}><InvPill c={top} f={s.f} /></div></div>
            </div>
            <Sub>Panel replacement at Kerry Medical is live on site, so the renewal is also the moment to confirm the new MxPro panel is covered. The Contracts Agent drafted it at 08:02.</Sub>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Btn small kind="primary" onClick={() => goTo("Finance", "queue", { queue: "Q-4" })}>{topEff === "Draft ready" ? "Review draft" : "Open in queue"}</Btn>
              <Btn small onClick={() => goTo("Contracts", "contracts", { contract: top.id })}>Contract</Btn>
            </div>
          </Card>
          <Card>
            <Head small title="Renewal invoicing status" sub="Next 60 days" />
            <HBars format={eur} rows={byStatus.map((x) => ({ label: x.st + " (" + x.list.length + ")", value: sum(x.list.map((c) => c.billing)), tone: x.st === "Not drafted" ? "bad" : x.st === "Draft ready" ? "warn" : x.st === "Paid" ? "ok" : "accent" }))} />
          </Card>
          <Card>
            <Head small title="Contracts Agent, today" />
            {[["08:02", "Drafted renewal for Kerry Fire Maintenance, " + eur(1240)], ["07:58", "Found 3 renewals with no invoice: K-01, K-03, K-06"], ["07:58", "Checked platform costs on 3 cloud contracts"]].map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, padding: "6px 0", borderTop: i ? "1px solid var(--border)" : undefined, fontSize: 12.5, color: "var(--body)" }}><span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--faint)" }}>{r[0]}</span>{r[1]}</div>
            ))}
          </Card>
        </div>
      </Grid>
    </Page>
  );
}
