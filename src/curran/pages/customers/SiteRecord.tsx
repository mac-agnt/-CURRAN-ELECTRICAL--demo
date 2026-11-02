import { useEffect, useState, ReactNode } from "react";
import {
  JOBS, COMPLETED, SYSTEMS, STATUS_LABEL, customerById, siteById, contactById, staffById, contractById, systemById, addDays, dayDiff, fmtDate, fmtDateY, eur, toast, goTo,
  clearSel, select, useCurran, type InstalledSystem, type Site,
} from "../../index";
import { Page, Grid, Card, Head, Title, Pill, Btn, Back, Ic, Label, Muted, Strong, Avatar, Progress, Callout, type Tone } from "../../ui";
import { contractFor, QrMark, showMoney, openCustomer, openSite, openSystem, KindDot, Chip, DueChip, dueTone, KIND_TINT } from "./shared";
import { docByTitle, procedureFor } from "../knowledge/docs";

const URL_BASE = "pulse.joecurranelectrical.ie/s/";

interface Ev { date: string; type: "Installed" | "Service" | "Repair" | "Test"; text: string; by: string }
function history(s: InstalledSystem): Ev[] {
  const out: Ev[] = [{ date: s.installed, type: "Installed", text: "Installed and handed over" + (s.installJob ? " under job " + s.installJob : ""), by: s.lastBy }];
  s.repairs.forEach((r) => out.push({ date: r.date, type: "Repair", text: r.note, by: r.by }));
  if (!s.repairs.some((r) => r.date === s.lastService) && s.lastService !== s.installed) out.push({ date: s.lastService, type: "Service", text: "Service visit completed, no further defects", by: s.lastBy });
  [182, 365].forEach((n) => { const d = addDays(s.lastService, -n); if (d > addDays(s.installed, 30) && !out.some((e) => e.date === d)) out.push({ date: d, type: "Service", text: "Scheduled service, tested and signed off", by: s.lastBy }); });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}
const PHOTO_CAP: Record<string, string[]> = {
  "Fire alarm": ["Panel front after commissioning", "Loop and zone schedule", "Panel location and signage", "Battery label and date"],
  "Emergency lighting": ["Distribution board and test key", "Corridor fitting type", "Central test register", "Exit sign over final door"],
  CCTV: ["NVR and rack", "Camera 1 view", "Junction box termination", "Camera schedule label"],
  Intruder: ["Control panel and keypad", "Detector layout plan", "Comms path label", "Siren and external bell box"],
  "Structured cabling": ["Patch panel and switch", "Comms cabinet door label", "Backbone route", "Certifier report"],
  "Wi-Fi": ["Controller dashboard", "Access point, ceiling", "Switch and PoE ports", "Coverage plan"],
  "Home automation": ["KNX distribution board", "Bus line terminations", "Wall keypad", "Scene schedule"],
  "EV charging": ["Charger and signage", "Supply and RCD board", "Earth rod test", "Commissioning screen"],
};
const TINTS = ["var(--accent-soft)", "var(--surface-2)", "var(--accent-faint)", "var(--track)"];

function Photos({ s }: { s: InstalledSystem }) {
  const caps = PHOTO_CAP[s.kind] || PHOTO_CAP.CCTV;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {caps.map((c, i) => (
        <div key={c} style={{ borderRadius: "var(--r-sm,12px)", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-faint)" }}>
          <div style={{ height: 74, background: "linear-gradient(135deg," + TINTS[i % 4] + ", var(--surface-2))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--faint)" }}><Ic n="camera" size={22} /></div>
          <div style={{ padding: "8px 10px" }}><div style={{ fontSize: 12, color: "var(--body)", lineHeight: 1.35 }}>{c}</div><div style={{ fontSize: 11, color: "var(--faint)", marginTop: 2 }}>{staffById(s.lastBy).first}, {fmtDate(s.lastService)}</div></div>
        </div>
      ))}
    </div>
  );
}
function Docs({ s, site }: { s: InstalledSystem; site: Site }) {
  const jobDraw = JOBS.filter((j) => j.siteId === site.id).flatMap((j) => j.docs.filter((d) => d.kind === "Drawing").map((d) => ({ name: d.name, date: d.added })));
  const sitey = s.manuals.filter((m) => /zone chart|drawings|schedule|certificate|cause and effect|register/i.test(m) && !docByTitle(m));
  const draws = jobDraw.concat(sitey.filter((m) => /zone chart|drawings|cause and effect|schedule/i.test(m)).map((m) => ({ name: m, date: s.installed })));
  if (!draws.length) draws.push({ name: "As-fitted drawings, " + site.name, date: s.installed });
  const manuals = s.manuals.filter((m) => !draws.some((d) => d.name === m));
  const row = (icon: string, name: string, meta: string, onClick?: () => void) => (
    <div key={name} onClick={onClick} className={onClick ? "ix11" : undefined} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px", margin: "0 -8px", borderRadius: 10, cursor: onClick ? "pointer" : "default" }}>
      <span style={{ color: "var(--accent)" }}><Ic n={icon} size={15} /></span>
      <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      <span style={{ fontSize: 11.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{meta}</span>
      {onClick && <span style={{ color: "var(--faint)" }}><Ic n="chevron" size={12} /></span>}
    </div>
  );
  return (
    <>
      <Label style={{ marginBottom: 4 }}>Drawings</Label>
      {draws.map((d) => row("doc", d.name, fmtDate(d.date)))}
      <Label style={{ margin: "12px 0 4px" }}>Manuals and certificates</Label>
      {manuals.map((m) => { const dd = docByTitle(m); return row("doc", m, dd ? "Open in Knowledge" : "On file", dd ? () => goTo("Knowledge", "library", { doc: dd.id }) : undefined); })}
    </>
  );
}
function Facts({ s, site, wide }: { s: InstalledSystem; site: Site; wide?: boolean }) {
  const cust = customerById(site.customerId);
  const f: [string, ReactNode][] = [
    ["Customer", <a onClick={() => openCustomer(cust.id)} style={{ color: "var(--accent)", cursor: "pointer" }}>{cust.name}</a>],
    ["Site", site.name + ", " + site.town],
    ["Installed system", s.label],
    ["Make and model", s.make + " " + s.model],
    ["Serial or reference", <span style={{ fontFamily: "var(--mono)" }}>{s.serial}</span>],
    ["Original installation", fmtDateY(s.installed) + (s.installJob ? ", job " + s.installJob : "")],
    ["Last technician", staffById(s.lastBy).name],
    ["Last service", fmtDateY(s.lastService)],
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? "14px 28px" : 12 }}>
      {f.map(([k, v]) => (
        <div key={k} style={{ minWidth: 0 }}>
          <Label>{k}</Label>
          <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 4, lineHeight: 1.4 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
function History({ s }: { s: InstalledSystem }) {
  const ev = history(s);
  const tone: Record<string, string> = { Installed: "var(--accent)", Service: "var(--ok)", Repair: "var(--warn)", Test: "var(--accent)" };
  return (
    <div>
      {ev.map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: tone[e.type], marginTop: 5 }} />
            {i < ev.length - 1 && <span style={{ flex: 1, width: 1, background: "var(--border-strong)", margin: "4px 0" }} />}
          </div>
          <div style={{ paddingBottom: 14, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)" }}>{e.type}</span><span style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtDateY(e.date)}, {staffById(e.by).first}</span></div>
            <div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 2, lineHeight: 1.45 }}>{e.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
function Issues({ s }: { s: InstalledSystem }) {
  return (
    <>
      <Label style={{ marginBottom: 6 }}>Known issues</Label>
      {s.known.length ? s.known.map((k) => <div key={k} style={{ display: "flex", gap: 9, fontSize: 13, color: "var(--body)", lineHeight: 1.45, marginBottom: 7 }}><span style={{ color: "var(--warn)", marginTop: 2 }}><Ic n="alert" size={14} /></span>{k}</div>) : <Muted>No known issues recorded.</Muted>}
      <Label style={{ margin: "14px 0 6px" }}>Previous repairs</Label>
      {s.repairs.length ? s.repairs.map((r) => <div key={r.date + r.note} style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.45, marginBottom: 7 }}><span style={{ color: "var(--faint)" }}>{fmtDate(r.date)}, {staffById(r.by).first}: </span>{r.note}</div>) : <Muted>No repairs since installation.</Muted>}
    </>
  );
}
function ContractCard({ s, money }: { s: InstalledSystem; money: boolean }) {
  const k = contractFor(s);
  if (!k) return (
    <div><Pill>No service contract</Pill><div style={{ fontSize: 12.5, color: "var(--dim)", margin: "10px 0", lineHeight: 1.45 }}>This system is not on a maintenance agreement. A yearly service offer can be drafted from its service history.</div><Btn small onClick={() => toast("Contract offer drafted for " + siteById(s.siteId).name)}>Draft maintenance offer</Btn></div>
  );
  const d = dayDiff(k.renew);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Pill tone="ok">Active</Pill><Strong mono>{k.id}</Strong></div>
      <div style={{ fontSize: 13, color: "var(--ink)", margin: "8px 0 4px" }}>{k.name}</div>
      <div style={{ fontSize: 12.5, color: "var(--dim)" }}>Renews {fmtDateY(k.renew)}{d >= 0 && d <= 60 ? ", in " + d + " days" : ""}{money ? ", " + eur(k.billing) + " a year" : ""}</div>
      <div style={{ marginTop: 10 }}><Btn small onClick={() => goTo("Contracts", "contracts", { contract: k.id })}>Open contract</Btn></div>
    </div>
  );
}
function RelatedJobs({ site }: { site: Site }) {
  const act = JOBS.filter((j) => j.siteId === site.id);
  const done = COMPLETED.filter((j) => j.customerId === site.customerId);
  if (!act.length && !done.length) return <Muted>No jobs recorded at this site.</Muted>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {act.map((j) => (
        <div key={j.id} onClick={() => goTo("Jobs", "active", { job: j.id })} className="ix11" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", margin: "0 -8px", borderRadius: 10, cursor: "pointer" }}>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)" }}>{j.name}</div><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{j.id}, {j.progress}% complete</div></div>
          <Pill tone={j.status === "on-track" ? "ok" : j.status === "invoice-required" ? "accent" : "warn"}>{STATUS_LABEL[j.status]}</Pill>
        </div>
      ))}
      {done.map((j) => <div key={j.id} style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--dim)", padding: "4px 0" }}><span style={{ flex: 1 }}>{j.name}</span><span>{fmtDate(j.finished)}</span></div>)}
    </div>
  );
}
function ContactCard({ site }: { site: Site }) {
  const c = contactById(site.contactId);
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name={c.name} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{c.name}</div><div style={{ fontSize: 12, color: "var(--dim)" }}>{c.role}</div><div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 2 }}>{c.phone}</div></div>
      <Btn small onClick={() => toast("Calling " + c.name)}><Ic n="phone" size={13} />Call</Btn>
    </div>
  );
}
function QrLabel({ s }: { s: InstalledSystem }) {
  return (
    <div style={{ borderRadius: "var(--card-r,18px)", border: "1px solid var(--accent-line)", background: "linear-gradient(160deg, var(--accent-soft), var(--surface) 70%)", padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
      <QrMark seed={s.id} size={128} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <Label style={{ color: "var(--accent)" }}>QR label on the panel</Label>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 6, letterSpacing: "-.3px" }}>{s.id}</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 3, lineHeight: 1.4 }}>{s.kind}, {siteById(s.siteId).name}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--body)", marginTop: 9, wordBreak: "break-all" }}>{URL_BASE + s.id}</div>
        <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 4 }}>Joe Curran Electrical, Waterville. Scan for site history</div>
        <div style={{ marginTop: 10 }}><Btn small onClick={() => toast("Label " + s.id + " sent to the label printer")}>Print label</Btn></div>
      </div>
    </div>
  );
}

/* --- the technician view after a scan --- */
function PhoneRecord({ s }: { s: InstalledSystem }) {
  const site = siteById(s.siteId), cust = customerById(site.customerId), contact = contactById(site.contactId), proc = procedureFor(s.id, s.kind, s.make);
  const nx = dueTone(s.nextService);
  const k = contractFor(s);
  const sec = (t: string, b: ReactNode) => <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 14 }}><Label style={{ marginBottom: 8 }}>{t}</Label>{b}</div>;
  const line = (a: string, b: ReactNode) => <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid var(--border)" }}><span style={{ color: "var(--dim)" }}>{a}</span><span style={{ color: "var(--ink)", textAlign: "right" }}>{b}</span></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12 }}>
      <div style={{ padding: "6px 4px 2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 22, height: 22, borderRadius: 7, background: "var(--accent)", color: "var(--on-accent)", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>JC</span><Label>Site record</Label></div>
        <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.4px", marginTop: 8, lineHeight: 1.2 }}>{s.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 4 }}>{site.name}, {cust.name}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Btn kind="primary" onClick={() => toast("Visit started at " + site.name)} style={{ justifyContent: "center", height: 44 }}>Start visit</Btn>
        <Btn onClick={() => toast("Calling " + contact.name)} style={{ justifyContent: "center", height: 44 }}><Ic n="phone" size={14} />Call contact</Btn>
        {proc && <Btn onClick={() => goTo("Knowledge", "procedures", { doc: proc.id })} style={{ justifyContent: "center", height: 44, gridColumn: "1 / 3" }}><Ic n="doc" size={14} />{s.kind === "Fire alarm" ? "How to reset this panel" : "Open service procedure"}</Btn>}
      </div>
      {s.known.length > 0 && <div style={{ background: "var(--warn-soft)", borderRadius: 16, padding: 14 }}><Label style={{ color: "var(--warn)", marginBottom: 6 }}>Known issues</Label>{s.known.map((x) => <div key={x} style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.45, marginBottom: 4 }}>{x}</div>)}</div>}
      {sec("System", <>{line("Make and model", s.make + " " + s.model)}{line("Serial", <span style={{ fontFamily: "var(--mono)" }}>{s.serial}</span>)}{line("Installed", fmtDate(s.installed) + " " + s.installed.slice(0, 4))}{line("Original job", s.installJob || "Before Pulse")}{line("Last service", fmtDate(s.lastService) + ", " + staffById(s.lastBy).first)}{line("Next service", <Pill tone={nx.tone}>{nx.label}</Pill>)}</>)}
      {sec("Service history", <div style={{ marginTop: 4 }}><History s={s} /></div>)}
      {sec("Manuals and drawings", s.manuals.map((m) => <div key={m} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink)", padding: "6px 0" }}><span style={{ color: "var(--accent)" }}><Ic n="doc" size={14} /></span>{m}</div>))}
      {sec("Contract", k ? <div style={{ fontSize: 12.5, color: "var(--body)" }}>{k.id}, renews {fmtDate(k.renew)}</div> : <div style={{ fontSize: 12.5, color: "var(--dim)" }}>No service contract</div>)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <Btn small onClick={() => toast("Camera opened. Photo will attach to " + s.id)} style={{ justifyContent: "center" }}><Ic n="camera" size={13} />Photo</Btn>
        <Btn small onClick={() => toast("Recording voice update")} style={{ justifyContent: "center" }}><Ic n="mic" size={13} />Voice</Btn>
        <Btn small onClick={() => toast("Issue raised against " + s.id)} style={{ justifyContent: "center" }}><Ic n="flag" size={13} />Issue</Btn>
      </div>
    </div>
  );
}
function ScanPreview({ s, onClose }: { s: InstalledSystem; onClose: () => void }) {
  const [scanning, setScanning] = useState(true);
  useEffect(() => { const t = setTimeout(() => setScanning(false), 1500); return () => clearTimeout(t); }, [s.id]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 90, background: "var(--scrim)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 36, alignItems: "center" }}>
        <div style={{ width: 300 }}>
          <Label style={{ color: "var(--accent)" }}>What happens on site</Label>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.6px", color: "var(--ink)", marginTop: 8, lineHeight: 1.2 }}>Scan the label on the panel. The whole history opens.</div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 10, lineHeight: 1.55 }}>No folders to search and nobody to phone. The technician sees the install details, manuals, repairs, known issues and the contact before touching anything.</div>
          <div style={{ marginTop: 16 }}><Btn onClick={onClose}>Close preview</Btn></div>
        </div>
        <div style={{ width: 360, height: "min(740px, 86vh)", borderRadius: 42, border: "8px solid #05080b", background: "var(--bg)", boxShadow: "0 40px 100px rgba(0,0,0,.6), 0 0 0 1px var(--border-strong)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 30, flex: "none", display: "flex", justifyContent: "center", alignItems: "center" }}><span style={{ width: 90, height: 18, borderRadius: 99, background: "#05080b" }} /></div>
          {scanning ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, background: "#05080b" }}>
              <div style={{ position: "relative", width: 190, height: 190, border: "2px solid var(--accent)", borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QrMark seed={s.id} size={130} />
                <span style={{ position: "absolute", left: 6, right: 6, height: 2, background: "var(--accent)", boxShadow: "0 0 14px var(--accent)", animation: "scanLine 1.2s ease-in-out infinite alternate" }} />
              </div>
              <div style={{ fontSize: 13, color: "var(--dim)" }}>Reading {s.id}</div>
              <style>{"@keyframes scanLine{from{top:12px}to{top:176px}}"}</style>
            </div>
          ) : <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", animation: "riseIn .35s var(--ease) both" }}><PhoneRecord s={s} /></div>}
        </div>
      </div>
    </div>
  );
}

export function SystemRecord({ id }: { id: string }) {
  const cur = useCurran();
  const money = showMoney(cur.role);
  const s = systemById(id);
  const [scan, setScan] = useState(false);
  if (!s) return <Page><Back label="Systems" onClick={() => clearSel("system")} /><Title title="System not found" /></Page>;
  const site = siteById(s.siteId), cust = customerById(site.customerId), proc = procedureFor(s.id, s.kind, s.make);
  const nx = dueTone(s.nextService);
  const isReset = s.kind === "Fire alarm";
  return (
    <Page>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Back label="All systems" onClick={() => clearSel("system")} />
        <Chip onClick={() => openCustomer(cust.id)}>{cust.name}</Chip><span style={{ color: "var(--faint)" }}><Ic n="chevron" size={12} /></span>
        <Chip onClick={() => openSite(site.id)}>{site.name}</Chip><span style={{ color: "var(--faint)" }}><Ic n="chevron" size={12} /></span>
        <Chip tone="accent"><KindDot kind={s.kind} />{s.kind}</Chip>
      </div>
      <Title title={s.label}
        sub={s.make + " " + s.model + ", serial " + s.serial + ". " + site.address}
        right={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind="primary" onClick={() => setScan(true)}><Ic n="qr" size={15} />Simulate scan</Btn>
          {proc && <Btn onClick={() => goTo("Knowledge", "procedures", { doc: proc.id })}><Ic n="doc" size={14} />{isReset ? "Reset the panel" : "Service procedure"}</Btn>}
          <Btn onClick={() => toast("Visit logged against " + s.id)}>Log a visit</Btn>
        </div>} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: -4 }}>
        <Pill tone={nx.tone}>Next service {fmtDate(s.nextService)}</Pill>
        {contractFor(s) ? <Pill tone="ok">Under contract {contractFor(s)!.id}</Pill> : <Pill>No contract</Pill>}
        {s.known.length > 0 && <Pill tone="warn">{s.known.length} known issue{s.known.length > 1 ? "s" : ""}</Pill>}
        {s.installJob && <Pill tone="accent">Installed under {s.installJob}</Pill>}
      </div>
      <Grid cols="1.55fr 1fr">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card><Head title="System details" sub="Everything a technician needs before opening the panel" /><Facts s={s} site={site} wide /></Card>
          <Grid cols="1fr 1fr">
            <Card><Head title="Service history" small /><History s={s} /></Card>
            <Card><Head title="Issues and repairs" small /><Issues s={s} /></Card>
          </Grid>
          <Card><Head title="Related jobs" sub="Work done or in progress at this site" small /><RelatedJobs site={site} /></Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <QrLabel s={s} />
          <Card><Head title="Photos" small right={<Muted style={{ fontSize: 11.5 }}>from site visits</Muted>} /><Photos s={s} /></Card>
          <Card><Head title="Drawings and manuals" small /><Docs s={s} site={site} /></Card>
          <Card><Head title="Contract and maintenance" small /><ContractCard s={s} money={money} /></Card>
          <Card><Head title="Site contact" small /><ContactCard site={site} /><div style={{ fontSize: 12, color: "var(--faint)", marginTop: 12, lineHeight: 1.45 }}>Access: {site.access}</div></Card>
        </div>
      </Grid>
      {scan && <ScanPreview s={s} onClose={() => setScan(false)} />}
    </Page>
  );
}

export function SiteRecord({ id }: { id: string }) {
  const site = siteById(id), cust = customerById(site.customerId), sys = SYSTEMS.filter((x) => x.siteId === id);
  const cur = useCurran();
  const money = showMoney(cur.role);
  const all = sys.flatMap((x) => history(x).map((e) => ({ ...e, sys: x }))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const tone: Record<string, Tone> = { Installed: "accent", Service: "ok", Repair: "warn", Test: "accent" };
  return (
    <Page>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Back label="All sites" onClick={() => clearSel("site")} />
        <Chip onClick={() => openCustomer(cust.id)}>{cust.name}</Chip>
      </div>
      <Title title={site.name} sub={site.address + ". Access: " + site.access} right={<Btn onClick={() => toast("Site label sent to the printer")}><Ic n="qr" size={14} />Print site label</Btn>} />
      <Grid cols="1.55fr 1fr">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <Head title="Installed systems" sub={sys.length + " on record. Open one to see its QR record."} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {sys.map((x) => { const nx = dueTone(x.nextService); return (
                <div key={x.id} onClick={() => openSystem(x.id)} className="ix11" style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", padding: 14, cursor: "pointer", background: "var(--surface-faint)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><KindDot kind={x.kind} /><Strong>{x.kind}</Strong><span style={{ marginLeft: "auto" }}><Pill tone={nx.tone}>{nx.label}</Pill></span></div>
                  <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 6 }}>{x.make} {x.model}</div>
                  <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 3, fontFamily: "var(--mono)" }}>{x.serial}</div>
                </div>
              ); })}
              {!sys.length && <Muted>No systems recorded at this site yet.</Muted>}
            </div>
          </Card>
          <Card>
            <Head title="Recent activity at this site" small />
            {all.map((e, i) => <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderTop: i ? "1px solid var(--border)" : undefined, fontSize: 12.5 }}><Pill tone={tone[e.type]}>{e.type}</Pill><span style={{ flex: 1, color: "var(--body)", minWidth: 0 }}>{e.sys.kind}: {e.text}</span><span style={{ color: "var(--faint)", whiteSpace: "nowrap" }}>{fmtDate(e.date)}</span></div>)}
            {!all.length && <Muted>Nothing recorded yet.</Muted>}
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div style={{ borderRadius: "var(--card-r,18px)", border: "1px solid var(--accent-line)", background: "linear-gradient(160deg, var(--accent-soft), var(--surface) 70%)", padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
            <QrMark seed={site.id} size={110} />
            <div><Label style={{ color: "var(--accent)" }}>Site QR</Label><div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--body)", marginTop: 8, wordBreak: "break-all" }}>{URL_BASE + site.id}</div></div>
          </div>
          <Card><Head title="Site contact" small /><ContactCard site={site} /></Card>
          <Card><Head title="Related jobs" small /><RelatedJobs site={site} /></Card>
          {money && <Card><Head title="Contracts at this site" small />{(() => { const ks = Array.from(new Set(sys.map((x) => contractFor(x)?.id).filter(Boolean))) as string[]; return ks.length ? ks.map((k) => <div key={k} style={{ fontSize: 12.5, color: "var(--body)", padding: "4px 0" }}><Strong mono>{k}</Strong> {contractById(k).name}, renews {fmtDate(contractById(k).renew)}</div>) : <Muted>No service contract at this site.</Muted>; })()}</Card>}
        </div>
      </Grid>
    </Page>
  );
}
export { select, Progress, Callout, KIND_TINT };
