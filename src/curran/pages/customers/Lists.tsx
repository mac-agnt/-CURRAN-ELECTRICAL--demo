import { useState } from "react";
import { SITES, SYSTEMS, CONTACTS, JOBS, customerById, siteById, staffById, driveMins, fmtDate, toast, select, goTo, contractById } from "../../index";
import { Page, Grid, Card, Title, Pill, Table, Seg, Strong, Muted, Btn, Avatar, Ic, Label } from "../../ui";
import { contractFor, openCustomer, openSite, openSystem, KindDot, Chip, DueChip } from "./shared";

export function SitesTab() {
  return (
    <Page>
      <Title title="Sites" sub="Every site Joe Curran Electrical looks after. Each has a record a technician can open from a QR label." right={<Btn small onClick={() => toast("13 site labels queued for printing")}><Ic n="qr" size={14} />Print site labels</Btn>} />
      <Grid cols="repeat(3,1fr)">
        {SITES.map((s) => {
          const c = customerById(s.customerId), sys = SYSTEMS.filter((x) => x.siteId === s.id), jobs = JOBS.filter((j) => j.siteId === s.id), ct = CONTACTS.find((x) => x.id === s.contactId)!;
          const mins = driveMins(s.town, "Waterville");
          return (
            <Card key={s.id} onClick={() => openSite(s.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 2 }}>{c.name}</div>
                </div>
                {jobs.length > 0 && <Pill tone="accent">{jobs.length} active job{jobs.length > 1 ? "s" : ""}</Pill>}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.45 }}>{s.address}</div>
              <div style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.45 }}>Access: {s.access}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sys.map((x) => <span key={x.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--dim)", padding: "3px 9px", borderRadius: 99, background: "var(--surface-2)" }}><KindDot kind={x.kind} />{x.kind}</span>)}
                {!sys.length && <Muted style={{ fontSize: 11.5 }}>No systems on record</Muted>}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--dim)" }}>
                <span>{ct.name}</span><span>{mins} min from base</span>
              </div>
            </Card>
          );
        })}
      </Grid>
    </Page>
  );
}

export function SystemsTab() {
  const kinds = ["All"].concat(Array.from(new Set(SYSTEMS.map((s) => s.kind))));
  const [k, setK] = useState("All");
  const list = SYSTEMS.filter((s) => k === "All" || s.kind === k);
  return (
    <Page>
      <Title title="Installed systems" sub="Every system we have fitted or look after, with serial, service history and the next visit. Open one to see what a QR scan shows." right={<Btn small onClick={() => toast(list.length + " QR labels queued for printing")}><Ic n="qr" size={14} />Print QR labels</Btn>} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {kinds.map((x) => <Chip key={x} tone={k === x ? "accent" : undefined} onClick={() => setK(x)}>{x}{x !== "All" && <span style={{ color: "var(--faint)" }}>{SYSTEMS.filter((s) => s.kind === x).length}</span>}</Chip>)}
      </div>
      <Card flush>
        <Table cols="1.5fr 1.15fr 1.15fr .95fr .9fr .9fr .75fr" dense
          head={["System", "Site", "Make and model", "Serial", "Last service", "Next service", "Contract"]}
          onRow={(i) => openSystem(list[i].id)}
          rows={list.map((s) => {
            const site = siteById(s.siteId);
            return [
              <div style={{ display: "flex", gap: 9, alignItems: "center", minWidth: 0 }}><KindDot kind={s.kind} /><div style={{ minWidth: 0 }}><Strong>{s.kind}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.id}, installed {s.installed.slice(0, 4)}</div></div></div>,
              <div style={{ minWidth: 0 }}><Strong>{site.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{site.town}</div></div>,
              <Muted>{s.make} {s.model}</Muted>,
              <span style={{ fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--dim)" }}>{s.serial}</span>,
              <div><div style={{ fontSize: 12.5 }}>{fmtDate(s.lastService)}</div><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{staffById(s.lastBy).first}</div></div>,
              <DueChip date={s.nextService} />,
              contractFor(s) ? <Pill tone="ok">{contractFor(s)!.id}</Pill> : <Pill>None</Pill>,
            ];
          })} />
      </Card>
    </Page>
  );
}

export function ContactsTab() {
  return (
    <Page>
      <Title title="Contacts" sub="The people who let us in, sign things off and pay the invoices." />
      <Card flush>
        <Table cols="1.4fr 1.1fr 1.3fr 1fr 1.5fr .9fr"
          head={["Name", "Role", "Customer", "Phone", "Email", ""]}
          onRow={(i) => openCustomer(CONTACTS[i].customerId)}
          rows={CONTACTS.map((c) => [
            <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}><Avatar name={c.name} size={28} /><Strong>{c.name}</Strong>{c.primary && <Pill tone="accent">Primary</Pill>}</div>,
            <Muted>{c.role}</Muted>,
            <Muted>{customerById(c.customerId).name}</Muted>,
            <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>{c.phone}</span>,
            <Muted style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</Muted>,
            <span onClick={(e) => e.stopPropagation()}><Btn small onClick={() => toast("Calling " + c.name)}><Ic n="phone" size={13} />Call</Btn></span>,
          ])} />
      </Card>
    </Page>
  );
}
export { select, goTo, contractById, Label };
