import { useState } from "react";
import { STAFF, CERTS, SKILLS, LEVEL_LABEL, ROLES, roleOf, certDays, fmtDate, fmtDateY, Staff } from "../../index";
import { Card, Head, Pill, Table, Avatar, Strong, Muted, Callout, Label, Grid, Divider, Tone } from "../../ui";
import { docCount } from "./docs";

export function certTone(days: number): Tone { return days <= 14 ? "bad" : days <= 45 ? "warn" : "neutral"; }
export const certWhen = (days: number) => (days < 0 ? "Expired" : days === 0 ? "Expires today" : "Expires in " + days + " days");

export default function TeamTab() {
  const [sel, setSel] = useState("kyle");
  const s: Staff = STAFF.find((x) => x.id === sel)!;
  const certs = CERTS.filter((c) => c.staffId === s.id);
  const role = roleOf(s.roleKey);
  return (
    <>
      <Callout tone="accent" title="Company transition">Caitlin Curran is taking on more of the administration as the founder steps back from day to day work. Her access covers scheduling, invoicing, customers, contracts and compliance. Seamus keeps margins and settings.</Callout>
      <Grid cols="minmax(0,1.6fr) minmax(320px,1fr)" gap={14} style={{ alignItems: "start" }}>
        <Card flush>
          <div style={{ padding: "16px 18px 6px" }}><Head small title="Nine people" sub="Seamus and Caitlin plus a seven person field team" /></div>
          <Table cols="1.9fr .6fr 1.3fr .6fr 1fr" dense onRow={(i) => setSel(STAFF[i].id)} activeRow={STAFF.findIndex((x) => x.id === sel)}
            head={["Employee", "Since", "Permission group", "Files", "Records"]}
            rows={STAFF.map((p) => {
              const cs = CERTS.filter((c) => c.staffId === p.id), exp = cs.filter((c) => certDays(c) <= 45);
              return [
                <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}><Avatar staffId={p.id} size={28} /><span style={{ minWidth: 0 }}><Strong>{p.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div></span></span>,
                p.since, <Muted>{roleOf(p.roleKey).label}</Muted>, docCount(p.id),
                p.roleKey === "admin" ? <Muted>Admin</Muted> : exp.length ? <Pill tone={certTone(Math.min(...exp.map(certDays)))}>{exp.length + " expiring"}</Pill> : <Muted>{cs.length} valid</Muted>,
              ];
            })} />
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar staffId={s.id} size={46} />
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.3px" }}>{s.name}</div><div style={{ fontSize: 12.5, color: "var(--dim)" }}>{s.title}, since {s.since}</div></div>
          </div>
          <Grid cols="1fr 1fr" gap={10}>
            {[["Phone", s.phone], ["Email", s.email.split("@")[0] + "@..."], ["Based", s.base], ["Vehicle", s.van || "None"]].map(([k, v]) => <div key={k}><Label>{k}</Label><div style={{ fontSize: 13, color: "var(--body)", marginTop: 3 }}>{v}</div></div>)}
          </Grid>
          <Divider />
          <div><Label style={{ marginBottom: 5 }}>Emergency contact</Label><div style={{ fontSize: 13, color: "var(--body)" }}>{s.emergency.name}, {s.emergency.relation.toLowerCase()}</div><div style={{ fontSize: 12.5, color: "var(--dim)" }}>{s.emergency.phone}</div></div>
          <div><Label style={{ marginBottom: 6 }}>Permission group</Label><div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{role.label}</div><div style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5, marginTop: 2 }}>{role.blurb}</div></div>
          {certs.length > 0 && <div><Label style={{ marginBottom: 7 }}>Certificates</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {certs.map((c) => { const d = certDays(c); return <div key={c.cert} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}><span style={{ flex: 1, color: "var(--body)" }}>{c.cert}</span><span style={{ color: "var(--faint)" }}>{fmtDate(c.expires)} {c.expires.slice(0, 4)}</span>{d <= 45 ? <Pill tone={certTone(d)}>{d + "d"}</Pill> : null}</div>; })}
            </div></div>}
          {s.field && <div><Label style={{ marginBottom: 7 }}>Skills at competent or lead</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SKILLS.filter((k) => s.skills[k] >= 2).map((k) => <span key={k} style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 99, background: s.skills[k] === 3 ? "var(--accent-soft)" : "var(--surface-2)", color: s.skills[k] === 3 ? "var(--accent)" : "var(--body)" }}>{k + (s.skills[k] === 3 ? ", " + LEVEL_LABEL[3].toLowerCase() : "")}</span>)}</div></div>}
          {s.ppe.length > 0 && <div><Label style={{ marginBottom: 7 }}>PPE issued</Label><div style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.6 }}>{s.ppe.map((p) => p.item).join(", ")}. Issued {fmtDateY(s.ppe[0].issued)}.</div></div>}
          <div style={{ fontSize: 12, color: "var(--faint)" }}>{docCount(s.id)} documents on file</div>
        </Card>
      </Grid>
    </>
  );
}
