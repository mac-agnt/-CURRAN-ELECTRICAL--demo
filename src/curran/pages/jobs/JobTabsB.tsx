import { useState } from "react";
import { Job, jobFin, INVOICES, SUPPLIER_INVOICES, matchedForJob, supplierById, select, goTo, toast, eur, fmtDate, fmtDow, dayDiff, QUEUE, sum, CONTRACTS } from "../../index";
import { Card, Grid, Head, Pill, Table, Btn, Callout, Ic, Strong, Muted, Ellip, Label, Avatar, Tone, Empty, Seg } from "../../ui";
import { Access, who, fmtWhen, isMoneyText } from "./shared";
import { UpdateRow } from "./JobTabsA";

/* ------------------------------ Updates ------------------------------ */
export function UpdatesTab({ j, acc }: { j: Job; acc: Access }) {
  const ups = j.updates.filter((u) => acc.money || !isMoneyText(u.text));
  return (
    <Grid cols="minmax(0,1.6fr) minmax(0,1fr)" gap={14}>
      <Card>
        <Head title="Site updates" sub="Voice notes, photos and notes from the field, newest first." right={<div style={{ display: "flex", gap: 8 }}><Btn small onClick={() => toast("Voice update started. Open the Field app tab to try it")}><Ic n="mic" size={13} />Voice update</Btn><Btn small onClick={() => toast("Note added to " + j.name)}><Ic n="plus" size={13} />Note</Btn></div>} />
        {ups.map((u, i) => <UpdateRow key={i} u={u} />)}
        {!ups.length && <Empty title="No updates yet" />}
      </Card>
      <Card>
        <Head title="What Pulse does with an update" />
        {[["Transcribes the voice note", "mic"], ["Moves job progress when a figure is mentioned", "bolt"], ["Raises an issue or constraint with an owner", "flag"], ["Creates a task for whoever has to act", "check"], ["Writes an activity entry on the job and the site record", "doc"]].map(([t, ic], n) => (
          <div key={n} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 0", borderTop: n ? "1px solid var(--border)" : undefined, fontSize: 13, color: "var(--body)" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic n={ic} size={13} /></span>{t}
          </div>
        ))}
        <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--dim)", lineHeight: 1.5 }}>Technicians never type a report. Seamus and Caitlin see the result here.</div>
      </Card>
    </Grid>
  );
}

/* ------------------------------ Costs ------------------------------ */
export function CostsTab({ j, acc }: { j: Job; acc: Access }) {
  const f = jobFin(j), matched = matchedForJob(j.id).sort((a, b) => b.received.localeCompare(a.received));
  const pending = SUPPLIER_INVOICES.filter((s) => s.jobId === j.id && s.status !== "matched");
  const total = sum(matched.map((m) => m.amount));
  return (
    <>
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Card pad={14}><Label>Materials booked</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(total)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>{matched.length} supplier invoices, all matched</div></Card>
        <Card pad={14}><Label>Labour booked</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(j.actual.labour)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>{j.hours.used} hours from site timesheets</div></Card>
        <Card pad={14}><Label>Other costs</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(j.actual.other)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>Plant hire, consumables, travel</div></Card>
        <Card pad={14}><Label>Total cost to date</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(f.actualCost)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>Forecast {eur(f.forecastCost)}</div></Card>
      </Grid>
      <Card flush>
        <div style={{ padding: "18px 18px 4px" }}><Head title="Supplier invoices on this job" sub="Attached automatically from supplier emails. Caitlin only sees exceptions." /></div>
        <Table cols="minmax(110px,.8fr) minmax(200px,1.5fr) minmax(100px,.7fr) minmax(100px,.7fr) minmax(130px,.9fr) minmax(190px,1.2fr)" dense head={["Invoice", "Supplier", "Category", "Amount", "Received", "Match"]}
          rows={matched.map((m) => [
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink)" }}>{m.number}</span>,
            <Ellip>{supplierById(m.supplierId).name}</Ellip>, <Muted>{m.category}</Muted>, <span style={{ color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{eur(m.amount)}</span>,
            <Muted>{fmtWhen(m.received)}</Muted>,
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Pill tone="ok">Auto matched {m.confidence}%</Pill>{m.received.slice(0, 10) === "2026-11-10" && <Pill tone="accent">Today</Pill>}</span>,
          ])} foot={"Total " + eur(total) + (j.id === "J-2641" ? ". KE-28492 arrived at 09:07, was matched to this job and added to materials actual with no manual entry." : "")} />
      </Card>
      {pending.length > 0 && (
        <Callout tone="warn" title={pending.length + " supplier invoice" + (pending.length > 1 ? "s" : "") + " for this job need a decision"} right={<Btn small onClick={() => goTo("Finance", "supplier")}>Open supplier inbox</Btn>}>
          {pending.map((p) => p.number + " (" + eur(p.amount) + ", " + (p.status === "duplicate" ? "possible duplicate" : "needs review") + ")").join(", ")}. They are not counted in job costs until confirmed.
        </Callout>
      )}
    </>
  );
}

/* ------------------------------ Documents ------------------------------ */
export function DocumentsTab({ j, acc }: { j: Job; acc: Access }) {
  const docs = j.docs.filter((d) => acc.money || (d.kind !== "Quote" && d.kind !== "Email"));
  return (
    <Grid cols="minmax(0,1.6fr) minmax(0,1fr)" gap={14}>
      <Card flush>
        <div style={{ padding: "18px 18px 4px" }}><Head title="Job documents" sub="Everything attached to the job record, wherever it came from." right={<Btn small onClick={() => toast("Upload ready. Drop files or forward an email to the job")}><Ic n="plus" size={13} />Upload</Btn>} /></div>
        <Table cols="minmax(260px,2fr) minmax(110px,.8fr) minmax(110px,.8fr) minmax(100px,.7fr)" dense head={["Document", "Type", "Added", "By"]}
          rows={docs.map((d) => [<span style={{ display: "inline-flex", gap: 9, alignItems: "center", minWidth: 0 }}><Ic n="doc" size={15} color="var(--accent)" /><Ellip><Strong>{d.name}</Strong></Ellip></span>, <Pill tone="neutral">{d.kind}</Pill>, <Muted>{fmtDate(d.added)}</Muted>, <Muted>{who(d.by).name.split(" ")[0]}</Muted>])} />
      </Card>
      <Card>
        <Head title="Filed automatically" />
        {[["Quote and PO references", j.quoteRef + (j.poRef ? ", " + j.poRef : "")], ["Supplier invoices", matchedForJob(j.id).length + " matched"], ["Photos from site", j.photos + " photos"], ["Certificates", j.docs.filter((d) => d.kind === "Certificate").length + " on file"]].filter((r) => acc.money || !/Quote|Supplier/.test(r[0])).map(([k, v], n) => (
          <div key={k} style={{ display: "flex", padding: "10px 0", borderTop: n ? "1px solid var(--border)" : undefined, fontSize: 13 }}><span style={{ flex: 1, color: "var(--body)" }}>{k}</span><span style={{ color: "var(--ink)" }}>{v}</span></div>
        ))}
        <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 12, lineHeight: 1.5 }}>Dropbox, email attachments and site photos land here. Nothing is saved to someone's desktop.</div>
      </Card>
    </Grid>
  );
}

/* ------------------------------ Photos ------------------------------ */
const CAPTIONS: Record<string, string[]> = {
  "J-2641": ["Level 3 corridor luminaires", "Distribution board, before", "Containment run, level 2", "Plant room cabling", "Emergency light fitting 14", "Riser fire stopping", "Level 3 second fix", "Board labelling", "Atrium feed, cable tray", "Test results sheet"],
  "J-2652": ["Kentec panel, front", "Call point layout, unit 1", "Sounder in sales area", "Panel wiring, loop 1", "Emergency lighting, stockroom", "Handover sheet signed", "Loop 2 devices", "Final snag list"],
  "J-2658": ["Ceiling void cabling, first floor", "Corridor detectors fitted", "Plant room door, locked", "Existing Gent panel", "Zone chart on wall", "New panel delivered", "Device test log", "First floor corridor"],
};
export function PhotosTab({ j }: { j: Job }) {
  const caps = CAPTIONS[j.id] || ["Cabling route", "Panel, before", "Panel, after", "Containment", "Device fitted", "Test result", "Site access", "Completed run"];
  const crew = j.crew;
  const tiles = caps.map((c, i) => ({ c, by: crew[i % crew.length], when: i < 3 ? "Today" : i < 5 ? "Yesterday" : fmtDate(j.start) }));
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Card>
      <Head title={j.photos + " photos on this job"} sub="Filed from phones as they are taken. Showing the latest." right={<Btn small onClick={() => toast("Ask the crew to add photos from the Field app")}><Ic n="camera" size={13} />Request photos</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
        {tiles.map((t, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{ cursor: "pointer" }}>
            <div style={{ aspectRatio: "4/3", borderRadius: "var(--r-md,14px)", border: "1px solid " + (open === i ? "var(--accent-line)" : "var(--border)"), background: "linear-gradient(" + (130 + i * 23) + "deg,var(--surface-2)," + (i % 3 === 0 ? "var(--accent-soft)" : i % 3 === 1 ? "var(--track)" : "var(--accent-faint)") + ")", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 10, transition: "border-color .2s var(--ease)" }}>
              <Ic n="camera" size={16} color="var(--faint)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--faint)" }}>IMG {4100 + i * 7}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink)", marginTop: 7 }}>{t.c}</div>
            <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{who(t.by).name.split(" ")[0]}, {t.when}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------ Issues ------------------------------ */
export function IssuesTab({ j, acc }: { j: Job; acc: Access }) {
  const list = j.issues.filter((i) => acc.lvl === 2 || !/margin/i.test(i.title + i.impact)).filter((i) => acc.lvl >= 1 || !isMoneyText(i.title + " " + i.impact));
  const tone = (s: string): Tone => (s === "high" ? "bad" : s === "medium" ? "warn" : "neutral");
  return (
    <>
      {j.constraint && (
        <Card style={{ borderColor: "var(--warn)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><Pill tone="warn">Site constraint</Pill><span style={{ fontSize: 12, color: "var(--faint)" }}>Raised {j.constraint.raisedAt} today by {who(j.constraint.by).name}</span></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginTop: 10 }}>{j.constraint.text}</div>
          <div style={{ fontSize: 13, color: "var(--body)", marginTop: 6, lineHeight: 1.5 }}>{j.constraint.impact}. Landlord's rep is off site until Thursday. Owner: {who(j.constraint.owner).name}.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            <Btn small onClick={() => toast("Calling Ger Teahan, landlord rep, 086 912 0043")}><Ic n="phone" size={13} />Call landlord rep</Btn>
            <Btn small onClick={() => toast("Task created: book plant room access for Thursday morning")}>Book Thursday access</Btn>
            {acc.office && <Btn small onClick={() => goTo("Schedule", "planner")}>Rebalance crew</Btn>}
            {acc.office && <Btn small kind="primary" onClick={() => toast("Delay accepted. Customer notified of 30 Nov completion")}>Accept 1 day delay</Btn>}
          </div>
        </Card>
      )}
      {list.map((i) => (
        <Card key={i.id}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Pill tone={tone(i.severity)}>{i.severity === "high" ? "High" : i.severity === "medium" ? "Medium" : "Low"}</Pill><span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--faint)" }}>{i.id}</span><span style={{ flex: 1 }} /><span style={{ fontSize: 12, color: "var(--faint)" }}>Raised {fmtDate(i.raised)} by {who(i.by).name}</span></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginTop: 10 }}>{i.title}</div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 5 }}>{i.impact}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}><Avatar staffId={i.owner} size={22} /><Muted>Owner {who(i.owner).name}</Muted><span style={{ flex: 1 }} /><Btn small onClick={() => toast("Marked resolved: " + i.title)}>Resolve</Btn></div>
        </Card>
      ))}
      {!list.length && !j.constraint && <Card><Empty title="No open issues on this job" sub="Constraints and cost warnings raised from site will appear here." /></Card>}
    </>
  );
}

/* ------------------------------ Activity ------------------------------ */
export function ActivityTab({ j, acc }: { j: Job; acc: Access }) {
  const ev: { t: string; icon: string; text: string; tone?: Tone }[] = [];
  j.updates.forEach((u) => ev.push({ t: u.when, icon: "mic", text: who(u.by).name + ": " + u.text + (u.effect ? " Pulse: " + u.effect + "." : "") }));
  j.milestones.filter((m) => m.done).forEach((m) => ev.push({ t: m.due + " 12:00", icon: "check", text: "Milestone complete: " + m.name }));
  if (acc.money) {
    INVOICES.filter((i) => i.jobId === j.id).forEach((i) => { ev.push({ t: i.issued + " 10:00", icon: "doc", text: "Invoice " + i.id + " issued for " + eur(i.amount) }); if (i.paid) ev.push({ t: i.paid + " 11:00", icon: "check", text: "Payment received for " + i.id + ", " + eur(i.amount) }); });
    SUPPLIER_INVOICES.filter((s) => s.jobId === j.id && s.status === "matched").forEach((s) => ev.push({ t: s.received, icon: "bolt", text: "Supplier invoice " + s.number + " matched, " + eur(s.amount) + " added to materials" }));
    QUEUE.filter((q) => q.jobId === j.id && q.ready).forEach((q) => ev.push({ t: q.since, icon: "sparkle", text: "Invoice Agent prepared a draft invoice for " + eur(q.amount) + ", awaiting approval" }));
  }
  ev.sort((a, b) => b.t.localeCompare(a.t));
  return (
    <Card>
      <Head title="Activity on this job" sub="Everything that touched this record, from people and from agents." />
      {ev.slice(0, 24).map((e, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : undefined, alignItems: "flex-start" }}>
          <span style={{ width: 26, height: 26, borderRadius: 99, flex: "none", background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Ic n={e.icon} size={13} /></span>
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--body)", lineHeight: 1.5 }}>{e.text}</div>
          <span style={{ fontSize: 11.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{fmtWhen(e.t.length > 10 ? e.t : e.t + " 12:00")}</span>
        </div>
      ))}
    </Card>
  );
}
