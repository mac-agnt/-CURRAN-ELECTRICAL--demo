import { useState } from "react";
import { CUSTOMERS, JOBS, SYSTEMS, CONTRACTS, INVOICES, SUPPLIER_INVOICES, customerById, siteById, staffById, eur, fmtDate, goTo, matchedForJob, systemsAt } from "./index";
import { Card, Head, Pill, Label, Seg, Ic } from "./ui";

/* Records > Relationships: one customer traced through every record it touches. Static layout, live data. */
type N = { id: string; x: number; y: number; w: number; label: string; value: string; sub?: string; go?: () => void };
const OPTIONS = ["c-park", "c-murphy", "c-kmc"] as const;

export default function RelationshipMap() {
  const [cid, setCid] = useState<string>("c-park");
  const [pick, setPick] = useState<string>("job");
  const cust = customerById(cid);
  const site = siteById(cust.siteIds[0]);
  const job = JOBS.find((j) => j.customerId === cid)!;
  const systems = systemsAt(site.id);
  const contracts = CONTRACTS.filter((c) => c.customerId === cid);
  const invs = INVOICES.filter((i) => i.customerId === cid && i.jobId === job.id);
  const sis = matchedForJob(job.id);
  const lastSvc = systems.map((s) => s.lastService).sort().pop() || "";
  const nodes: N[] = [
    { id: "customer", x: 90, y: 100, w: 150, label: "Customer", value: cust.name, sub: cust.kind + ", since " + cust.since, go: () => goTo("Customers", "customers", { customer: cid }) },
    { id: "site", x: 290, y: 100, w: 150, label: "Site", value: site.town, sub: site.address.split(",")[0], go: () => goTo("Customers", "sites", { site: site.id }) },
    { id: "systems", x: 510, y: 100, w: 170, label: systems.length + " installed systems", value: systems.slice(0, 3).map((s) => s.kind).join(", "), sub: "QR on every panel", go: () => goTo("Customers", "systems", { system: systems[0].id }) },
    { id: "history", x: 730, y: 100, w: 150, label: "Service history", value: systems.reduce((a, s) => a + s.repairs.length, 0) + " repairs", sub: "last visit " + fmtDate(lastSvc) },
    { id: "contract", x: 910, y: 100, w: 150, label: "Service contract", value: contracts[0] ? contracts[0].name.split(" ").slice(0, 3).join(" ") : "None", sub: contracts[0] ? eur(contracts[0].billing) + " a year" : "", go: () => goTo("Contracts", "contracts") },
    { id: "quote", x: 90, y: 290, w: 150, label: "Quote", value: job.quoteRef, sub: eur(job.value), },
    { id: "job", x: 290, y: 290, w: 170, label: "Job", value: job.name.split(" ").slice(0, 4).join(" "), sub: job.progress + "% complete", go: () => goTo("Jobs", "active", { job: job.id }) },
    { id: "invoice", x: 510, y: 290, w: 170, label: "Customer invoices", value: invs.length + " raised, " + eur(invs.reduce((a, i) => a + i.amount, 0)), sub: "RedBook ledger", go: () => goTo("Finance", "debtors") },
    { id: "payment", x: 730, y: 290, w: 150, label: "Payments", value: eur(invs.filter((i) => i.paid).reduce((a, i) => a + i.amount, 0)), sub: invs.filter((i) => i.paid).length + " received" },
    { id: "employee", x: 150, y: 470, w: 180, label: "Employees", value: job.crew.map((c) => staffById(c).first).join(", "), sub: "skills and certificates checked" , go: () => goTo("People", "team") },
    { id: "supplier", x: 400, y: 470, w: 190, label: "Supplier invoices", value: sis.length + " matched, " + eur(sis.reduce((a, s) => a + s.amount, 0)), sub: "become job costs", go: () => goTo("Finance", "supplier") },
    { id: "docs", x: 640, y: 470, w: 160, label: "Documents", value: job.docs.length + " on the job", sub: systems.reduce((a, s) => a + s.manuals.length, 0) + " manuals on systems" },
    { id: "activity", x: 860, y: 470, w: 150, label: "Activity", value: "Everything logged", sub: "agents and people", go: () => goTo("Activity") },
  ];
  const E: [string, string, string][] = [["customer", "site", "has site"], ["site", "systems", "has system"], ["systems", "history", "serviced"], ["history", "contract", "covered by"], ["site", "job", "work at"], ["quote", "job", "becomes"],
    ["job", "invoice", "bills"], ["invoice", "payment", "paid by"], ["employee", "job", "works on"], ["supplier", "job", "costs"], ["contract", "invoice", "renewal bills"], ["docs", "systems", "attached to"], ["docs", "activity", "logged"]];
  const at = (id: string) => nodes.find((n) => n.id === id)!;
  const sel = at(pick);
  return (
    <div style={{ padding: "0 22px 26px", animation: "pageIn .7s var(--ease) both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 0 14px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.7px" }}>One job, every record it touches</div>
          <div style={{ fontSize: 13.5, color: "var(--dim)", marginTop: 5, maxWidth: 700 }}>A customer has a site. A site has systems. A job happens at the site. Staff work it, supplier invoices cost it, invoices bill it. Nothing is typed twice.</div>
        </div>
        <Seg options={OPTIONS.map((c) => [c, customerById(c).name.split(" ").slice(0, 2).join(" ")] as [string, string])} value={cid as any} onChange={(v) => { setCid(v); setPick("job"); }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 14, alignItems: "start" }}>
        <Card pad={0} style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1000 / 560" }}>
            <svg viewBox="0 0 1000 560" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {E.map(([a, b, l], i) => {
                const A = at(a), B = at(b), on = pick === a || pick === b;
                const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
                return (
                  <g key={i}>
                    <path d={`M${A.x} ${A.y} C ${A.x + (B.x - A.x) / 2} ${A.y}, ${A.x + (B.x - A.x) / 2} ${B.y}, ${B.x} ${B.y}`} fill="none" stroke={on ? "var(--accent)" : "var(--border-strong)"} strokeWidth={on ? 1.8 : 1.2} vectorEffect="non-scaling-stroke" strokeDasharray={on ? undefined : "0"} />
                    <text x={mx} y={my - 6} fontSize="11" textAnchor="middle" fill={on ? "var(--accent)" : "var(--faint)"} style={{ paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 4 }}>{l}</text>
                  </g>
                );
              })}
            </svg>
            {nodes.map((n) => (
              <button key={n.id} onClick={() => setPick(n.id)} style={{ position: "absolute", left: n.x / 10 + "%", top: n.y / 5.6 + "%", width: (n.w / 1000) * 100 + "%", transform: "translate(-50%,-50%)", textAlign: "left", padding: "9px 11px", borderRadius: "var(--r-md,14px)", cursor: "pointer", background: pick === n.id ? "var(--surface-2)" : "var(--overlay)", border: "1px solid " + (pick === n.id ? "var(--accent)" : "var(--border)"), boxShadow: pick === n.id ? "0 6px 22px var(--accent-faint)" : "none", transition: "border-color .2s var(--ease), background .2s var(--ease)", minWidth: 0 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".1em", color: "var(--faint)", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.value}</div>
                {n.sub && <div style={{ fontSize: 10.5, color: "var(--dim)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.sub}</div>}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <Label>{sel.label}</Label>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.4px", marginTop: 6, color: "var(--ink)" }}>{sel.value}</div>
          {sel.sub && <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4 }}>{sel.sub}</div>}
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {E.filter((e) => e[0] === pick || e[1] === pick).map((e, i) => {
              const other = at(e[0] === pick ? e[1] : e[0]);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--body)" }}>
                  <Pill tone="accent">{e[2]}</Pill><span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{other.label}</span>
                </div>
              );
            })}
          </div>
          {sel.go && <button onClick={sel.go} className="ixz" style={{ marginTop: 16, height: 34, width: "100%", borderRadius: 999, border: "1px solid var(--border-strong)", background: "none", color: "var(--ink)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>Open record <Ic n="arrow" size={13} /></button>}
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 14, lineHeight: 1.5 }}>This is the company's operating memory. Select any record to see what it connects to.</div>
        </Card>
      </div>
    </div>
  );
}
