import { useState } from "react";
import { CONTRACTS, Contract, SYSTEMS, addDays, dayDiff, eur, fmtDate, fmtDateY, goTo, pct, select, staffById, systemById, toast, useCurran, clearSel, customerById } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Label, Table, Strong, Seg, Avatar, Ic, Muted } from "../../ui";
import { Sub } from "../finance/shared";
import { useFin, finPatch, getFin } from "../finance/state";
import { InvPill, effInvoice, siteLabel, systemLabel, marginOf, renewalStatus, prepareDraft, QMAP, techFor } from "./shared";

type F = "all" | "renewing" | "unbilled" | "risk" | "cloud";

function Detail({ c, onClose }: { c: Contract; onClose: () => void }) {
  const fin = useFin();
  const auto = fin.autoRenew[c.id] !== undefined ? fin.autoRenew[c.id] : c.auto;
  const systems = c.systemIds.map(systemById);
  const hist = systems.flatMap((s) => [{ date: s.lastService, note: s.kind + " service", by: s.lastBy }, ...s.repairs.map((r) => ({ date: r.date, note: r.note, by: r.by }))]).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const inv = effInvoice(c, fin);
  const q = QMAP[c.id];
  return (
    <Card style={{ borderColor: "var(--accent-line)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Pill>{c.id}</Pill><Pill>{c.type}</Pill><InvPill c={c} f={fin} />{c.risk && <Pill tone="warn">{c.risk}</Pill>}</div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", marginTop: 10, letterSpacing: "-.4px" }}>{c.name}</div>
          <Sub>{c.customer} · {siteLabel(c)}{c.platform ? " · " + c.platform : ""}</Sub>
        </div>
        <Btn small onClick={onClose}>Close</Btn>
      </div>
      <Grid cols="repeat(3,minmax(0,1fr))" gap={16} style={{ marginTop: 16 }}>
        <div>
          <Label>Commercials</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {[["Customer billing", eur(c.billing)], ["Supplier or platform cost", eur(c.supplierCost)], ["Gross margin", eur(c.billing - c.supplierCost) + " (" + pct(marginOf(c), 0) + ")"], ["Started", fmtDateY(c.start)]].map(([k, v]) => <div key={k}><Sub>{k}</Sub><div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 3 }}>{v}</div></div>)}
          </div>
        </div>
        <div>
          <Label>Renewal</Label>
          <div style={{ marginTop: 8, fontSize: 14, color: "var(--ink)", fontWeight: 600 }}>{fmtDateY(c.renew)}</div>
          <Sub>{renewalStatus(c)}</Sub>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <button onClick={() => { finPatch({ autoRenew: { ...getFin().autoRenew, [c.id]: !auto } }); toast(c.name + " set to " + (!auto ? "auto-renew" : "manual renew")); }} style={{ width: 38, height: 22, borderRadius: 99, border: 0, cursor: "pointer", background: auto ? "var(--accent)" : "var(--track)", position: "relative", padding: 0, transition: "background .2s" }}><span style={{ position: "absolute", top: 3, left: auto ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: auto ? "var(--on-accent)" : "var(--dim)", transition: "left .2s" }} /></button>
            <span style={{ fontSize: 12.5, color: "var(--body)" }}>{auto ? "Auto-renew: invoice sent automatically after approval" : "Manual renew: customer confirms each year"}</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {(inv === "Not drafted" || (!q && inv === "Scheduled")) && <Btn small kind="primary" onClick={() => prepareDraft(c, fin)}>Draft renewal invoice</Btn>}
            {q && <Btn small onClick={() => goTo("Finance", "queue", { queue: q })}>Open in invoice queue</Btn>}
          </div>
        </div>
        <div>
          <Label>Service</Label>
          <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><Sub>Last service</Sub><div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 3 }}>{fmtDate(c.lastService)}</div></div>
            <div><Sub>Next service</Sub><div style={{ fontSize: 14, color: "var(--ink)", fontWeight: 600, marginTop: 3 }}>{fmtDate(c.nextService)}</div></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}><Avatar staffId={techFor(c)} size={22} /><Sub>Suggested: {staffById(techFor(c)).name}</Sub></div>
          <Btn small style={{ marginTop: 10 }} onClick={() => goTo("Schedule", "planner")}>Open planner</Btn>
        </div>
      </Grid>
      {(systems.length > 0) && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
          <div>
            <Label>Covered systems</Label>
            {systems.map((s) => <button key={s.id} onClick={() => goTo("Customers", "systems", { system: s.id })} style={{ display: "flex", width: "100%", gap: 10, alignItems: "center", padding: "9px 0", border: 0, borderBottom: "1px solid var(--border)", background: "none", textAlign: "left", cursor: "pointer", color: "var(--body)", fontSize: 13 }}><Ic n="qr" size={15} color="var(--accent)" /><span style={{ flex: 1, minWidth: 0 }}><span style={{ color: "var(--ink)", fontWeight: 500 }}>{s.label}</span><br /><span style={{ fontSize: 11.5, color: "var(--faint)" }}>{s.make} {s.model} · {s.id}</span></span><Ic n="chevron" size={13} /></button>)}
          </div>
          <div>
            <Label>Service history</Label>
            {hist.map((h, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12.5, color: "var(--body)" }}><span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--faint)" }}>{fmtDate(h.date)}</span><span>{h.note}<span style={{ color: "var(--faint)" }}> · {staffById(h.by).first}</span></span></div>)}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function List() {
  const cur = useCurran();
  const fin = useFin();
  const [f, setF] = useState<F>("all");
  const [q, setQ] = useState("");
  const rows = CONTRACTS.filter((c) => {
    const d = dayDiff(c.renew), inv = effInvoice(c, fin);
    if (f === "renewing" && !(d <= 60 && d >= 0)) return false;
    if (f === "unbilled" && !(d <= 60 && (inv === "Draft ready" || inv === "Not drafted"))) return false;
    if (f === "risk" && !c.risk) return false;
    if (f === "cloud" && !c.platform) return false;
    const t = (c.name + " " + c.customer + " " + c.type).toLowerCase();
    return !q || t.indexOf(q.toLowerCase()) > -1;
  });
  const sel = cur.sel.contract ? CONTRACTS.find((c) => c.id === cur.sel.contract) : undefined;
  return (
    <Page>
      <Title title="Contracts" sub={"All " + CONTRACTS.length + " recurring agreements. Margin is billing less supplier or platform cost, so a cloud subscription that is not rebilled shows up here as a loss."} right={<input className="ixi" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer or contract" style={{ height: 36, width: 240, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, outline: 0 }} />} />
      {sel && <Detail c={sel} onClose={() => clearSel("contract")} />}
      <div><Seg<F> value={f} onChange={setF} options={[["all", "All " + CONTRACTS.length], ["renewing", "Renewing in 60 days"], ["unbilled", "Unbilled"], ["risk", "At risk"], ["cloud", "Cloud and platform"]]} /></div>
      <Card flush>
        <Table activeRow={sel ? rows.findIndex((c) => c.id === sel.id) : undefined} onRow={(i) => select({ contract: rows[i].id })} dense
          cols="minmax(250px,1.6fr) 180px 200px 150px 80px 80px 100px 90px 80px 140px 84px 84px 110px 100px"
          head={["Customer and contract", "Site", "System", "Contract type", "Start", "Renewal", "Platform cost", "Billing", "Margin", "Renewal status", "Last service", "Next service", "Invoice status", "Renew mode"]}
          rows={rows.map((c) => {
            const auto = fin.autoRenew[c.id] !== undefined ? fin.autoRenew[c.id] : c.auto;
            return [
              <div style={{ minWidth: 0 }}><Strong>{c.customer}</Strong><Sub>{c.name}</Sub></div>,
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: c.siteId ? "var(--body)" : "var(--faint)" }}>{siteLabel(c)}</span>,
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{systemLabel(c)}</span>,
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.type}</span>,
              fmtDate(c.start), <Strong>{fmtDate(c.renew)}</Strong>,
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{eur(c.supplierCost)}</span>, <Strong>{eur(c.billing)}</Strong>,
              <span style={{ color: marginOf(c) < 0.4 ? "var(--warn)" : "var(--body)" }}>{pct(marginOf(c), 0)}</span>,
              <span style={{ color: dayDiff(c.renew) <= 60 ? "var(--ink)" : "var(--dim)" }}>{renewalStatus(c).replace("Active, renews ", "Active to ")}</span>,
              fmtDate(c.lastService), fmtDate(c.nextService), <InvPill c={c} f={fin} />,
              <Pill tone={auto ? "neutral" : "warn"}>{auto ? "Auto-renew" : "Manual"}</Pill>,
            ];
          })}
          empty="No contracts match that filter"
          foot={rows.length + " contracts. Billing " + eur(rows.reduce((a, c) => a + c.billing, 0)) + ", platform and supplier cost " + eur(rows.reduce((a, c) => a + c.supplierCost, 0)) + "."} />
      </Card>
    </Page>
  );
}
