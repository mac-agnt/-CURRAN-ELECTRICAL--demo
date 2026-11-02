import { useState } from "react";
import { JOBS, SITES, staffOnSiteToday, customerById, select, goTo, systemsAt, driveMins } from "../../index";
import { Card, Grid, Head, Pill, Btn, AvatarStack, Ic, Muted } from "../../ui";
import { Access, StatusPill, STATUS_TONE, visibleJobs, who } from "./shared";

const LON0 = -10.42, LON1 = -9.45, LAT0 = 52.14, LAT1 = 51.72, W = 700, H = 520;
const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * W;
const py = (lat: number) => ((LAT0 - lat) / (LAT0 - LAT1)) * H;
const path = (pts: [number, number][]) => pts.map((p, i) => (i ? "L" : "M") + px(p[0]).toFixed(1) + " " + py(p[1]).toFixed(1)).join(" ") + " Z";
/* Stylised coast of the Iveragh peninsula: Dingle Bay to the north, the Atlantic to the west, the Kenmare River to the south. */
const SEA = path([[-9.78, 52.1], [-9.92, 52.065], [-10.02, 52.03], [-10.13, 51.99], [-10.22, 51.96], [-10.3, 51.935], [-10.38, 51.89], [-10.4, 51.84], [-10.34, 51.805], [-10.24, 51.8], [-10.16, 51.795], [-10.1, 51.76], [-10.04, 51.745], [-9.98, 51.77], [-9.92, 51.805], [-9.82, 51.82], [-9.7, 51.84], [-9.6, 51.865], [-9.56, 51.88], [-9.62, 51.84], [-9.72, 51.78], [-9.86, 51.74], [-9.92, 51.72], [-10.42, 51.72], [-10.42, 52.14], [-10.1, 52.14], [-9.9, 52.12]]);
const BEARA = path([[-9.45, 51.72], [-9.45, 51.83], [-9.56, 51.85], [-9.72, 51.8], [-9.85, 51.76], [-9.95, 51.72]]);

export default function SitesMap({ acc }: { acc: Access }) {
  const mine = visibleJobs(acc);
  const [sel, setSel] = useState<string>(mine[0] ? mine[0].siteId : SITES[0].id);
  const siteJobs = (sid: string) => mine.filter((j) => j.siteId === sid);
  const cur = SITES.find((s) => s.id === sel)!;
  const curJobs = siteJobs(cur.id);
  const crew = curJobs.flatMap((j) => staffOnSiteToday(j.id));
  const base = SITES.find((s) => s.id === "s-golf")!;
  return (
    <Grid cols="minmax(0,1.7fr) minmax(0,1fr)" gap={14}>
      <Card flush style={{ position: "relative" }}>
        <div style={{ padding: "18px 18px 0" }}><Head title="Where the work is" sub="Active job sites across the Ring of Kerry. Pulsing pins have a crew on site right now." /></div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
          <rect width={W} height={H} fill="var(--surface-faint)" />
          {[0.2, 0.4, 0.6, 0.8].map((g) => <g key={g}><line x1={g * W} x2={g * W} y1="0" y2={H} stroke="var(--border)" /><line y1={g * H} y2={g * H} x1="0" x2={W} stroke="var(--border)" /></g>)}
          <path d={BEARA} fill="var(--surface)" stroke="var(--border-strong)" />
          <path d={SEA} fill="var(--accent-faint)" stroke="var(--border-strong)" strokeWidth="1.2" />
          <text x="60" y="170" fontSize="11" fill="var(--faint)" letterSpacing="3">ATLANTIC</text>
          <text x="236" y="102" fontSize="10" fill="var(--faint)" letterSpacing="2">DINGLE BAY</text>
          <text x="420" y="448" fontSize="10" fill="var(--faint)" letterSpacing="2">KENMARE RIVER</text>
          {SITES.map((s) => {
            const js = siteJobs(s.id), on = js.flatMap((j) => staffOnSiteToday(j.id)).length > 0, active = sel === s.id;
            const col = js.length ? "var(--" + (js[0].status === "on-track" ? "ok" : js[0].status === "invoice-required" ? "accent" : "warn") + ")" : "var(--faint)";
            return (
              <g key={s.id} onClick={() => setSel(s.id)} style={{ cursor: "pointer" }}>
                {on && <circle cx={px(s.lon)} cy={py(s.lat)} r="14" fill={col} opacity=".18"><animate attributeName="r" values="8;20;8" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" values=".3;0;.3" dur="2.4s" repeatCount="indefinite" /></circle>}
                <circle cx={px(s.lon)} cy={py(s.lat)} r={js.length ? 7 : 4} fill={js.length ? col : "var(--surface-2)"} stroke={active ? "var(--ink)" : "var(--border-strong)"} strokeWidth={active ? 2 : 1} />
                <text x={px(s.lon) + 11} y={py(s.lat) + 4} fontSize="10.5" fill={js.length || active ? "var(--ink)" : "var(--dim)"}>{s.town + (js.length ? "" : "")}</text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", gap: 16, padding: "12px 18px 16px", fontSize: 12, color: "var(--dim)", flexWrap: "wrap" }}>
          {[["ok", "On track"], ["warn", "Margin risk or constraint"], ["accent", "Invoice required"]].map(([t, l]) => <span key={t} style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><span style={{ width: 9, height: 9, borderRadius: 9, background: "var(--" + t + ")" }} />{l}</span>)}
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><span style={{ width: 9, height: 9, borderRadius: 9, background: "var(--surface-2)", border: "1px solid var(--border-strong)" }} />Customer site, no active job</span>
        </div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-.3px", color: "var(--ink)" }}>{cur.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 4 }}>{cur.address}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Pill tone="neutral">{customerById(cur.customerId).name}</Pill>
            <Pill tone="neutral">{driveMins(base.town, cur.town)} min from Waterville</Pill>
            <Pill tone="neutral">{systemsAt(cur.id).length} installed systems</Pill>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 14, lineHeight: 1.5 }}><span style={{ color: "var(--faint)" }}>Access: </span>{cur.access}</div>
          {curJobs.map((j) => (
            <div key={j.id} style={{ marginTop: 14, padding: 12, borderRadius: "var(--r-sm,12px)", background: "var(--surface-faint)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ flex: 1, fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>{j.name}</span><StatusPill status={j.status} /></div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>{j.progress}% complete, next: {j.nextMilestone}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                {crew.length ? <><AvatarStack ids={crew.map((c) => c.id)} size={24} /><Muted>{crew.map((c) => c.first).join(", ")} on site</Muted></> : <Muted>Nobody on site today</Muted>}
                <span style={{ flex: 1 }} /><Btn small onClick={() => select({ job: j.id })}>Open job</Btn>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, display: "flex" }}><Btn small onClick={() => goTo("Customers", "sites", { site: cur.id })}><Ic n="qr" size={14} />Site record and QR</Btn></div>
        </Card>
        <Card>
          <Head small title="On site today" />
          {mine.filter((j) => staffOnSiteToday(j.id).length).map((j) => (
            <div key={j.id} onClick={() => setSel(j.siteId)} className="ix11" style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", cursor: "pointer", borderTop: "1px solid var(--border)" }}>
              <AvatarStack ids={staffOnSiteToday(j.id).map((c) => c.id)} size={22} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.name}</span>
            </div>
          ))}
        </Card>
      </div>
    </Grid>
  );
}
