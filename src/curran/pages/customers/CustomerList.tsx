import {
  CUSTOMERS, SITES, CONTACTS, INVOICES, COMPLETED, JOBS, SYSTEMS, STATUS_LABEL, jobFin, eur, fmtDate, fmtDateY, dayDiff, daysOverdue, staffById, goTo, select, clearSel, useCurran,
  customerById, contactById, TODAY,
} from "../../index";
import { Page, Grid, Card, Head, Title, Kpi, Pill, Table, Back, Strong, Muted, Btn, Progress, Avatar, Ic, Label, type Tone } from "../../ui";
import { custStats, showMoney, isFieldRole, openSite, openSystem, KindDot, Chip, DueChip } from "./shared";

export function CustomerTable() {
  const cur = useCurran();
  const money = showMoney(cur.role);
  const rows = CUSTOMERS.map((c) => custStats(c.id));
  const cols = money ? "1.5fr .9fr .55fr .7fr .8fr 1.1fr 1fr" : "1.5fr .9fr .55fr .7fr .8fr 1.1fr";
  return (
    <Page>
      <Title title="Customers" sub="Thirteen key accounts. Open one to see its sites, installed systems, jobs, invoices and contracts in one place." />
      <Card flush>
        <Table cols={cols}
          head={["Customer", "Type", "Sites", "Active jobs", "Systems", "Service contract"].concat(money ? ["Outstanding"] : [])}
          onRow={(i) => select({ customer: rows[i].c.id })}
          rows={rows.map((r) => {
            const k = r.contracts;
            const soon = k.filter((x) => dayDiff(x.renew) <= 60 && dayDiff(x.renew) >= 0).sort((a, b) => a.renew.localeCompare(b.renew))[0];
            const row = [
              <div style={{ minWidth: 0 }}><Strong>{r.c.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>Customer since {r.c.since}, {r.c.terms}</div></div>,
              <Muted>{r.c.kind}</Muted>,
              <Strong>{r.sites}</Strong>,
              <Strong>{r.activeJobs.length}</Strong>,
              <Strong>{r.systems.length}</Strong>,
              k.length ? <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}><Pill tone="ok">Active</Pill>{soon ? <Muted style={{ fontSize: 11.5 }}>renews {fmtDate(soon.renew)}</Muted> : <Muted style={{ fontSize: 11.5 }}>{k.length} contract{k.length > 1 ? "s" : ""}</Muted>}</div> : <Pill>None</Pill>,
            ];
            if (money) row.push(r.outstanding ? <div><Strong>{eur(r.outstanding)}</Strong>{r.overdue > 0 && <div style={{ fontSize: 11.5, color: "var(--warn)" }}>{eur(r.overdue)} overdue</div>}</div> : <Muted>Nil</Muted>);
            return row;
          })} />
      </Card>
    </Page>
  );
}

export function CustomerDetail({ id }: { id: string }) {
  const cur = useCurran();
  const money = showMoney(cur.role);
  const field = isFieldRole(cur.role);
  const st = custStats(id);
  const sites = SITES.filter((s) => st.c.siteIds.indexOf(s.id) > -1);
  const contacts = CONTACTS.filter((c) => c.customerId === id);
  const invs = INVOICES.filter((i) => i.customerId === id).sort((a, b) => b.issued.localeCompare(a.issued));
  const done = COMPLETED.filter((j) => j.customerId === id);
  /* timeline built from records we already hold */
  const tl: { date: string; text: string; tone?: Tone }[] = [];
  invs.forEach((i) => {
    if (money) { tl.push({ date: i.issued, text: i.id + " issued, " + eur(i.amount) + ": " + i.desc }); if (i.paid) tl.push({ date: i.paid, text: i.id + " paid, " + eur(i.amount), tone: "ok" }); }
  });
  st.systems.forEach((s) => { s.repairs.forEach((r) => tl.push({ date: r.date, text: s.label + ": " + r.note + " (" + staffById(r.by).first + ")" })); tl.push({ date: s.lastService, text: s.label + " serviced by " + staffById(s.lastBy).first }); });
  st.activeJobs.forEach((j) => j.updates.filter((u) => u.by !== "system").slice(0, 2).forEach((u) => tl.push({ date: u.when.slice(0, 10), text: j.id + " update: " + u.text })));
  done.forEach((j) => tl.push({ date: j.finished, text: j.name + " completed", tone: "ok" }));
  tl.sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set<string>();
  const timeline = tl.filter((t) => { const k = t.date + t.text; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 9);
  return (
    <Page>
      <Back label="All customers" onClick={() => clearSel("customer")} />
      <Title title={st.c.name}
        sub={st.c.note}
        right={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Pill tone="accent">{st.c.kind}</Pill><Pill>Since {st.c.since}</Pill>{money && <Pill>{st.c.terms}</Pill>}{money && <Pill>RedBook {st.c.accountsRef}</Pill>}</div>} />
      <Grid cols={money ? "repeat(6,1fr)" : "repeat(4,1fr)"} gap={12}>
        <Kpi label="Sites" value={st.sites} />
        <Kpi label="Active jobs" value={st.activeJobs.length} />
        <Kpi label="Installed systems" value={st.systems.length} />
        <Kpi label="Service contract" value={st.contracts.length ? "Active" : "None"} tone={st.contracts.length ? "ok" : undefined} hint={st.contracts.length + " on record"} />
        {money && <Kpi label="Outstanding" value={eur(st.outstanding)} tone={st.overdue ? "warn" : undefined} hint={st.overdue ? eur(st.overdue) + " overdue" : "Nothing overdue"} />}
        {money && <Kpi label="Invoiced to date" value={eur(st.invoiced)} />}
      </Grid>
      <Grid cols="1.5fr 1fr">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          {sites.map((s) => {
            const sys = st.systems.filter((x) => x.siteId === s.id);
            return (
              <Card key={s.id} flush>
                <div style={{ padding: "16px 18px 12px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ marginTop: 2, color: "var(--accent)" }}><Ic n="pin" size={16} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3 }}>{s.address}</div>
                    <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 5 }}>Access: {s.access}</div>
                  </div>
                  <Btn small onClick={() => openSite(s.id)}>Site record</Btn>
                </div>
                <Table cols="1.4fr 1fr .8fr .8fr" dense head={["Installed system", "Make and model", "Last service", "Next"]} onRow={(i) => openSystem(sys[i].id)}
                  rows={sys.map((x) => [<div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}><KindDot kind={x.kind} /><Strong>{x.kind}</Strong></div>, <Muted>{x.make} {x.model}</Muted>, <Muted>{fmtDate(x.lastService)}</Muted>, <DueChip date={x.nextService} />])}
                  empty="No systems on record yet" />
              </Card>
            );
          })}
          <Card flush>
            <div style={{ padding: "16px 18px 0" }}><Head title="Jobs" sub="Active work and recent completed jobs at this customer" /></div>
            <Table cols={field ? "2fr .6fr .9fr" : "2fr .6fr .9fr .9fr"} dense
              head={["Job", "Progress", "Status"].concat(field ? [] : ["Value"])}
              onRow={(i) => { if (i < st.activeJobs.length) goTo("Jobs", "active", { job: st.activeJobs[i].id }); }}
              rows={st.activeJobs.map((j) => {
                const r = [<div style={{ minWidth: 0 }}><Strong>{j.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{j.id}, lead {staffById(j.lead).first}</div></div>, <div style={{ width: 70 }}><div style={{ fontSize: 12, marginBottom: 4 }}>{j.progress}%</div><Progress value={j.progress} h={4} /></div>, <Pill tone={j.status === "on-track" ? "ok" : j.status === "invoice-required" ? "accent" : "warn"}>{STATUS_LABEL[j.status]}</Pill>];
                if (!field) r.push(<Strong>{money ? eur(jobFin(j).value) : "Assigned"}</Strong>);
                return r;
              }).concat(done.map((j) => {
                const r = [<div style={{ minWidth: 0 }}><Strong>{j.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{j.id}, finished {fmtDate(j.finished)}</div></div>, <Muted>100%</Muted>, <Pill>{j.invoiceState === "Paid" ? "Paid" : j.invoiceState}</Pill>];
                if (!field) r.push(<Muted>{money ? eur(j.value) : ""}</Muted>);
                return r;
              }))}
              empty="No jobs on record" />
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <Head title="Contacts" small />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contacts.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 11, alignItems: "center" }}>
                  <Avatar name={c.name} size={32} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>{c.name}{c.primary && <span style={{ marginLeft: 8 }}><Pill tone="accent">Primary</Pill></span>}</div>
                    <div style={{ fontSize: 12, color: "var(--dim)" }}>{c.role}, {c.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {!field && (
            <Card flush>
              <div style={{ padding: "16px 18px 0" }}><Head title="Service contracts" small /></div>
              <Table cols="1.5fr .8fr" dense head={["Contract", "Renews"]} onRow={(i) => goTo("Contracts", "contracts", { contract: st.contracts[i].id })}
                rows={st.contracts.map((k) => [<div style={{ minWidth: 0 }}><Strong>{k.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{k.id}{money ? ", " + eur(k.billing) + " a year" : ""}</div></div>, <DueChip date={k.renew} />])}
                empty="No service contract. A maintenance offer could be drafted." />
            </Card>
          )}
          {money && invs.length > 0 && (
            <Card flush>
              <div style={{ padding: "16px 18px 0" }}><Head title="Invoices" small /></div>
              <Table cols="1fr .8fr .8fr" dense head={["Invoice", "Amount", "State"]} onRow={() => goTo("Finance", "debtors")}
                rows={invs.slice(0, 6).map((i) => [<div><Strong mono>{i.id}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtDate(i.issued)}</div></div>, <Strong>{eur(i.amount)}</Strong>, i.paid ? <Pill tone="ok">Paid</Pill> : daysOverdue(i) > 0 ? <Pill tone="bad">{daysOverdue(i)}d overdue</Pill> : <Pill>Due {fmtDate(i.due)}</Pill>])} />
            </Card>
          )}
          <Card>
            <Head title="Timeline" small />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {timeline.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, marginTop: 5, background: t.tone === "ok" ? "var(--ok)" : "var(--accent)" }} />
                    {i < timeline.length - 1 && <span style={{ flex: 1, width: 1, background: "var(--border-strong)", marginTop: 4 }} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtDateY(t.date)}</div>
                    <div style={{ fontSize: 12.5, color: "var(--body)", lineHeight: 1.45 }}>{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Grid>
    </Page>
  );
}
