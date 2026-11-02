import { useRef, useState } from "react";
import { CERTS, STAFF, expiringCerts, certDays, staffById, fmtDate, fmtDateY, TASKS, goTo, toast, Cert, CertKey } from "../../index";
import { Card, Head, Pill, Btn, Ic, Kpi, Grid, Table, Avatar, Callout, Label, Strong, Muted, Divider, Tone } from "../../ui";
import { certTone, certWhen } from "./TeamTab";

const COLS: CertKey[] = ["Safe Pass", "Manual Handling", "Working at Height", "Electrical Registration", "PSA Licence", "First Aid", "Fire Systems Cert"];
const COL_SHORT: Record<string, string> = { "Safe Pass": "Safe Pass", "Manual Handling": "Manual Handling", "Working at Height": "Work at Height", "Electrical Registration": "RECI", "PSA Licence": "PSA Licence", "First Aid": "First Aid", "Fire Systems Cert": "Fire cert" };
const COURSES: Record<string, string[]> = {
  kyle: ["Wed 11 Nov, Kerry ETB Tralee (before expiry, tomorrow)", "Mon 23 Nov, Kerry ETB Tralee (after expiry, off sites until done)"],
  liam: ["Tue 1 Dec, Kerry ETB Tralee", "Thu 3 Dec, Kerry ETB Tralee"],
};
const k = (c: Cert) => c.staffId + "|" + c.cert;
interface LocalTask { id: string; title: string; due: string }

export default function Compliance() {
  const exp = expiringCerts();
  const [booked, setBooked] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, string>>({});
  const [msgFor, setMsgFor] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [pickFor, setPickFor] = useState<string | null>(null);
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState("");
  const centralTask = (c: Cert) => TASKS.find((t) => t.link === staffById(c.staffId).name && /renewal|safe pass|manual handling/i.test(t.title));

  const openMsg = (c: Cert) => { const s = staffById(c.staffId); setMsgFor(k(c)); setPickFor(null); setMsg("Hi " + s.first + ", your " + c.cert + " expires on " + fmtDate(c.expires) + ". Caitlin will confirm a renewal date with you today. Please reply if you already have one booked."); };
  const send = (c: Cert) => { toast("Message sent to " + staffById(c.staffId).name); setMsgFor(null); };
  const addTask = (c: Cert) => {
    const title = "Renewal: " + c.cert + ", " + staffById(c.staffId).name;
    setTasks((t) => (t.some((x) => x.title === title) ? t : t.concat({ id: "LT-" + (t.length + 1), title, due: fmtDate(c.expires) })));
    toast("Renewal task created for Caitlin. It is in Work.");
  };
  const book = (c: Cert, opt: string) => { setBooked({ ...booked, [k(c)]: opt }); setPickFor(null); toast("Renewal booked for " + staffById(c.staffId).first + ": " + opt.split(",")[0]); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files && e.target.files[0]; if (f && fileKey) { setFiles({ ...files, [fileKey]: f.name }); toast("Uploaded " + f.name + ". Pulse will read the new expiry date."); } e.target.value = ""; };

  const fine = STAFF.filter((s) => !CERTS.some((c) => c.staffId === s.id && certDays(c) <= 45)).length;
  const card = (c: Cert) => {
    const s = staffById(c.staffId), d = certDays(c), key = k(c), t = centralTask(c);
    const isBooked = !!booked[key], isUp = !!files[key];
    const tone: Tone = isBooked || isUp ? "ok" : certTone(d);
    return (
      <Card key={key} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Avatar staffId={s.id} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{s.name}: {c.cert}</div><div style={{ fontSize: 12, color: "var(--dim)" }}>{c.body}, {c.number}</div></div>
          <Pill tone={tone}>{isBooked ? "Renewal booked" : isUp ? "Replacement uploaded" : certWhen(d)}</Pill>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 12.5, color: "var(--body)", flexWrap: "wrap" }}>
          <span><Label>Issued</Label>{fmtDateY(c.issued)}</span><span><Label>Expires</Label>{fmtDateY(c.expires)}</span>
          <span><Label>Task</Label>{t ? t.id + ", " + t.status.toLowerCase() : "None yet"}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.55, padding: "10px 12px", borderRadius: 12, background: "var(--surface-2)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>Compliance Agent, 08:15.</span> {s.id === "kyle" ? "Flagged the expiry and notified Caitlin. Kyle is on leave 12 to 20 Nov, so Wed 11 Nov is the only working day before it lapses. The planner currently pencils a renewal course on Mon 23 Nov, one day after expiry, and would stop him being assigned to site until it is done." : "On the same run. Liam is on leave 23 to 27 Nov, so the booking should land in the week of 30 Nov, ahead of 11 Dec. Caitlin has been notified."}
          {isBooked && <div style={{ color: "var(--ok)", marginTop: 6 }}>Booked: {booked[key]}</div>}
          {isUp && <div style={{ color: "var(--ok)", marginTop: 6 }}>File: {files[key]}</div>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn small onClick={() => openMsg(c)}><Ic n="mail" size={13} />Message employee</Btn>
          <Btn small onClick={() => addTask(c)}><Ic n="plus" size={13} />Create renewal task</Btn>
          <Btn small onClick={() => { setFileKey(key); fileRef.current?.click(); }}><Ic n="doc" size={13} />Upload replacement</Btn>
          <Btn small kind={isBooked ? "ghost" : "primary"} disabled={isBooked} onClick={() => setPickFor(pickFor === key ? null : key)}><Ic n="check" size={13} />Mark renewal booked</Btn>
          {(t || tasks.some((x) => x.title.indexOf(c.cert) > -1 && x.title.indexOf(s.name) > -1)) && <Btn small onClick={() => goTo("Work")}>Open in Work</Btn>}
        </div>
        {pickFor === key && (
          <div style={{ padding: 12, borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <Label>Which course date</Label>
            {(COURSES[s.id] || []).map((o) => <button key={o} onClick={() => book(c, o)} className="ixz" style={{ textAlign: "left", padding: "9px 12px", borderRadius: 11, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)", fontSize: 12.5, cursor: "pointer" }}>{o}</button>)}
          </div>
        )}
        {msgFor === key && (
          <div style={{ padding: 12, borderRadius: 12, border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <Label>Message to {s.name} by SMS and in the field app</Label>
            <textarea className="ixi" value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} style={{ width: "100%", padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--ink)", fontSize: 13, lineHeight: 1.5, resize: "none", outline: 0 }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn small onClick={() => setMsgFor(null)}>Cancel</Btn><Btn small kind="primary" onClick={() => send(c)}><Ic n="send" size={13} />Send</Btn></div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <>
      <input ref={fileRef} type="file" onChange={onFile} style={{ display: "none" }} />
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Kpi label="Expiring within 45 days" value={exp.length} tone="warn" hint="Kyle Murphy, Liam O'Sullivan" />
        <Kpi label="Expired" value={CERTS.filter((c) => certDays(c) < 0).length} hint="none on record" />
        <Kpi label="Records on file" value={CERTS.length} hint="certificates and licences" />
        <Kpi label="People fully in date" value={fine + " of " + STAFF.length} hint="no record inside 45 days" />
      </Grid>
      <Callout tone="neutral" title="Compliance Agent ran at 08:15, flagged 2 records">Kyle Murphy's Safe Pass expires in 12 days and Liam O'Sullivan's Manual Handling in 31. Caitlin was notified and the renewal tasks are in Work. This replaces the Connecteam expiry warning, and the planner uses the same dates when it checks an assignment.</Callout>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: "4px 0 10px" }}>Compliance expiring soon</div>
        <Grid cols="repeat(auto-fit, minmax(380px, 1fr))" gap={14}>{exp.map(card)}</Grid>
      </div>
      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head title="Register by employee" sub="Expiry dates for every certificate and licence. Amber is inside 45 days, red inside 14." /></div>
        <div style={{ overflowX: "auto" }}>
          <Table cols={"1.5fr " + COLS.map(() => "minmax(96px,1fr)").join(" ")} dense head={["Employee", ...COLS.map((c) => COL_SHORT[c])]}
            rows={STAFF.map((s) => [
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar staffId={s.id} size={24} /><Strong>{s.first}</Strong></span>,
              ...COLS.map((col) => {
                const c = CERTS.find((x) => x.staffId === s.id && x.cert === col);
                if (!c) return <span style={{ color: "var(--faint)" }}>-</span>;
                const d = certDays(c), tn = certTone(d);
                return <span style={{ padding: tn === "neutral" ? 0 : "2px 8px", borderRadius: 99, fontSize: 12, background: tn === "neutral" ? "none" : tn === "bad" ? "var(--bad-soft)" : "var(--warn-soft)", color: tn === "neutral" ? "var(--dim)" : tn === "bad" ? "var(--bad)" : "var(--warn)", fontWeight: tn === "neutral" ? 400 : 600 }}>{fmtDate(c.expires)} {c.expires.slice(2, 4)}</span>;
              }),
            ])} />
        </div>
        <div style={{ padding: "11px 18px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 12, color: "var(--faint)" }}>PPE and training records sit on each employee's page. PSA Licence applies to security installers only: Seán Moriarty and Darragh Sheehan.</div>
      </Card>
      <Card flush>
        <div style={{ padding: "16px 18px 6px" }}><Head small title="Renewal tasks" sub="Created by the Compliance Agent or by Caitlin" /></div>
        <Table cols="2.4fr 1fr 1fr 1fr" dense head={["Task", "Owner", "Due", "State"]}
          rows={TASKS.filter((t) => t.source === "Compliance Agent").map((t) => [<Strong>{t.title}</Strong>, <Muted>{staffById(t.owner).first}</Muted>, t.due, <Pill tone={t.status === "Done" ? "ok" : "neutral"}>{t.status}</Pill>])
            .concat(tasks.map((t) => [<Strong>{t.title}</Strong>, <Muted>Caitlin</Muted>, t.due, <Pill tone="accent">New</Pill>]))}
          foot={<button onClick={() => goTo("Work")} style={{ border: 0, background: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12, padding: 0 }}>Open all tasks in Work</button>} />
      </Card>
    </>
  );
}
