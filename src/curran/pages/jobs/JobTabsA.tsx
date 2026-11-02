import { useState } from "react";
import { Job, jobFin, customerById, siteById, staffById, FIELD_STAFF, slotFor, weekDates, WEEKS, staffOnSiteToday, CONTRACTS, contractById, INVOICES, QUEUE, CERTS, certDays, LEVEL_LABEL, SKILLS, select, goTo, toast, eur, pct, fmtDate, fmtDow, dow, dayDiff, TODAY, systemsAt, contactById, sum } from "../../index";
import { Card, Grid, Head, Pill, Progress, AvatarStack, Avatar, Seg, Table, Btn, Callout, Ic, Strong, Muted, Ellip, Dot, Label, Tone, TONE } from "../../ui";
import { Access, StatusPill, Facts, Meter, who, fmtWhen, costStatus, isMoneyText } from "./shared";

const UPD_ICON: Record<string, string> = { voice: "mic", photo: "camera", note: "doc", system: "bolt", issue: "flag" };
export const UpdateRow = ({ u, showEffect = true }: { u: Job["updates"][number]; showEffect?: boolean }) => {
  const w = who(u.by);
  return (
    <div style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
      <span style={{ width: 30, height: 30, borderRadius: 99, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: u.kind === "issue" ? "var(--warn-soft)" : "var(--accent-soft)", color: u.kind === "issue" ? "var(--warn)" : "var(--accent)" }}><Ic n={UPD_ICON[u.kind]} size={14} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{w.name}</span>
          <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtWhen(u.when)}, {u.kind === "voice" ? "voice note" : u.kind === "photo" ? "photos" : u.kind === "issue" ? "issue raised" : u.kind === "system" ? "automatic" : "note"}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--body)", marginTop: 4, lineHeight: 1.5 }}>{u.text}</div>
        {showEffect && u.effect && <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 11.5, color: "var(--accent)" }}><Ic n="sparkle" size={12} />Pulse: {u.effect}</div>}
      </div>
    </div>
  );
};

export function Alerts({ j, acc }: { j: Job; acc: Access }) {
  const f = jobFin(j), out: JSX.Element[] = [];
  const draft = QUEUE.find((q) => q.jobId === j.id && q.ready);
  if (j.constraint) out.push(
    <Callout key="c" tone="warn" title={"Constraint raised at " + j.constraint.raisedAt + " by " + who(j.constraint.by).name.split(" ")[0] + ": " + j.constraint.text}
      right={<div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}><Btn small onClick={() => toast("Calling Ger Teahan, landlord rep, 086 912 0043")}><Ic n="phone" size={13} />Call landlord rep</Btn>{acc.office && <Btn small onClick={() => goTo("Schedule", "planner")}>Rebalance crew</Btn>}{acc.office && <Btn small kind="primary" onClick={() => toast("Delay accepted. Completion moved to 30 Nov and customer notified")}>Accept 1 day delay</Btn>}</div>}>
      Impact: {j.constraint.impact}. Owner: {who(j.constraint.owner).name}. Plant room access needs the landlord's rep, who is off site until Thursday. Completion forecast moves from {fmtDate(j.target)} to {fmtDate(j.forecastEnd)}.
    </Callout>);
  if (draft && acc.money) out.push(
    <Callout key="i" tone="accent" title={"Job complete. " + eur(draft.amount) + " is ready to invoice"}
      right={<Btn small kind="primary" onClick={() => goTo("Finance", "queue", { queue: draft.id })}>Review draft invoice</Btn>}>
      Invoice Agent prepared the draft at 09:14 from the quote, {j.hours.used} logged hours and 4 supplier invoices. Waiting for Seamus to approve. Quote {eur(f.value)}, invoiced {eur(f.invoiced)}, balance {eur(f.unbilled)}.
    </Callout>);
  if (acc.margins && j.id === "J-2641") out.push(
    <Callout key="m" tone="warn" title="Forecast margin has fallen from 24% to 17%"
      right={<div style={{ display: "flex", gap: 8 }}><Btn small onClick={() => goTo("Finance", "supplier")}>Review materials</Btn><Btn small kind="primary" onClick={() => toast("Variation V-02 priced and queued for approval")}>Price variation</Btn></div>}>
      Materials are {Math.round(f.matOverPct * 100)}% over budget at {j.progress}% complete after the cable and containment price rise. A {eur(2400)} variation for extra level 3 emergency lighting is drafted and would bring forecast margin back to {pct((f.value + 2400 - f.forecastCost) / (f.value + 2400), 1)}.
    </Callout>);
  if (acc.margins && j.id === "J-2671") out.push(
    <Callout key="l" tone="warn" title="Labour is running over because of restricted access">Residents' rooms are only accessible 10:00 to 15:00. Labour is {Math.round(f.labOverPct * 100)}% over budget for {j.progress}% complete, pulling forecast margin from 23% to 19%.</Callout>);
  if (acc.money && j.id === "J-2667") out.push(
    <Callout key="p" tone="neutral" title="Stage 1 invoice INV-4812 is 52 days overdue" right={<Btn small onClick={() => goTo("Finance", "debtors")}>Open debtors</Btn>}>Held by the customer pending a PO from head office. Collections Agent has sent three reminders and Caitlin has called once.</Callout>);
  return out.length ? <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{out}</div> : null;
}

/* ------------------------------ Overview ------------------------------ */
export function OverviewTab({ j, acc }: { j: Job; acc: Access }) {
  const f = jobFin(j), cust = customerById(j.customerId), site = siteById(j.siteId);
  const crewToday = staffOnSiteToday(j.id);
  const next = j.milestones.find((m) => !m.done);
  const contracts = (j.contractIds || []).map(contractById);
  const cs = costStatus(j);
  const hist = j.updates.filter((u) => acc.money || !isMoneyText(u.text));
  const docs = j.docs.filter((d) => acc.money || (d.kind !== "Quote" && d.kind !== "Email"));
  const facts: [string, any][] = [
    ["Customer", cust.name], ["Site", site.town + ", " + site.address.split(",")[0]], ["Job manager", who(j.lead).name], ["Crew", <AvatarStack ids={j.crew} size={24} />],
    ["Start", fmtDate(j.start)], ["Target completion", j.forecastEnd !== j.target ? fmtDate(j.target) + " to " + fmtDate(j.forecastEnd) : fmtDate(j.target)],
    ["Progress", j.progress + "%"],
  ];
  if (acc.money) facts.push(["Quote", eur(f.value) + " (" + j.quoteRef + ")"], ["Invoice status", f.unbilled === 0 ? "Fully invoiced" : eur(f.invoiced) + " of " + eur(f.value) + " invoiced"]);
  if (acc.margins) facts.push(["Forecast final cost", eur(f.forecastCost)], ["Forecast margin", pct(f.origMargin) + " quoted, " + pct(f.fcMargin) + " now"]);
  return (
    <>
      <Alerts j={j} acc={acc} />
      <Grid cols="minmax(0,1.55fr) minmax(0,1fr)" gap={14}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card><Facts items={facts} /></Card>
          <Card style={{ background: "linear-gradient(180deg,var(--accent-faint),var(--surface) 70%)" }}>
            <Head title={<span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><Ic n="sparkle" size={15} color="var(--accent)" />Pulse job summary</span>} sub="Written from site updates, hours, supplier costs and invoices. A manager can read this without calling anyone." />
            <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--body)", maxWidth: 760 }}>{acc.money ? j.summary : j.summary.split(". ").filter((s) => !isMoneyText(s)).join(". ") + "."}</div>
          </Card>
          <Grid cols="minmax(0,.9fr) minmax(0,1.1fr)" gap={14}>
            <Card>
              <Head title="Today's site status" right={<Pill tone={crewToday.length ? "ok" : "neutral"}>{crewToday.length ? crewToday.length + " on site" : "Nobody on site"}</Pill>} />
              {crewToday.length ? crewToday.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                  <Avatar staffId={c.id} size={28} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{c.title}</div></div>
                  <span style={{ fontSize: 11.5, color: "var(--ok)" }}>Started 07:30</span>
                </div>
              )) : <div style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.5 }}>{j.progress === 100 ? "Job complete and handed over." : "Not scheduled today."}</div>}
              {j.constraint && <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--warn)" }}>Work is blocked at the plant room.</div>}
            </Card>
            <Card>
              <Head title="Recent technician updates" right={<span style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }} onClick={() => select({ jobTab: "updates" })}>All updates</span>} />
              {hist.slice(0, 3).map((u, i) => <UpdateRow key={i} u={u} showEffect={false} />)}
            </Card>
          </Grid>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <Card>
            <Head title="Progress and profitability" sub="Progress is operational. Profitability is financial. Pulse connects both." />
            <Grid cols={acc.margins ? "1fr 1fr" : "1fr"} gap={12}>
              <div style={{ padding: 14, borderRadius: "var(--r-md,14px)", background: "var(--surface-faint)", border: "1px solid var(--border)" }}>
                <Label>Operational</Label>
                <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.9px", color: "var(--ink)", marginTop: 8 }}>{j.progress}%</div>
                <div style={{ margin: "8px 0 6px" }}><Progress value={j.progress} tone={j.progress === 100 ? "ok" : "accent"} /></div>
                <div style={{ fontSize: 11.5, color: "var(--faint)" }}>{acc.lvl === 0 && acc.role !== "senior" ? j.hours.used + " hours logged" : j.hours.used + " of " + j.hours.budget + " hours"}</div>
              </div>
              {acc.margins && (
                <div style={{ padding: 14, borderRadius: "var(--r-md,14px)", background: f.atRisk ? "var(--warn-soft)" : "var(--surface-faint)", border: "1px solid var(--border)" }}>
                  <Label>Financial</Label>
                  <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.9px", color: f.atRisk ? "var(--warn)" : "var(--ink)", marginTop: 8 }}>{pct(f.fcMargin)}</div>
                  <div style={{ fontSize: 12.5, color: "var(--dim)", margin: "14px 0 6px" }}>Forecast margin, quoted {pct(f.origMargin)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--faint)" }}>Gross profit to date {eur(f.gpToDate)}</div>
                </div>
              )}
            </Grid>
            {acc.lvl === 0 && acc.role === "senior" && <div style={{ marginTop: 12 }}><Pill tone={cs.tone}>{cs.label}</Pill></div>}
          </Card>
          {acc.lvl >= 1 && (
            <Card>
              <Head title="Used against budget" sub="The marker shows budget pro-rata to progress." />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Meter label="Labour" used={j.actual.labour} budget={j.budget.labour} forecast={j.forecast.labour} progress={j.progress} />
                <Meter label="Materials" used={j.actual.materials} budget={j.budget.materials} forecast={j.forecast.materials} progress={j.progress} />
                <Meter label="Hours" used={j.hours.used} budget={j.hours.budget} progress={j.progress} format={(n) => String(n)} unit=" h" />
              </div>
            </Card>
          )}
          {acc.lvl === 0 && acc.role === "senior" && <Card><Head title="Hours" /><Meter label="Hours used" used={j.hours.used} budget={j.hours.budget} progress={j.progress} format={(n) => String(n)} unit=" h" /></Card>}
          <Card>
            <Head title="Milestones" right={next && <Pill tone="accent">Next: {fmtDate(next.due)}</Pill>} />
            {j.milestones.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", fontSize: 12.5 }}>
                <span style={{ width: 18, height: 18, borderRadius: 99, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: m.done ? "var(--ok-soft)" : "var(--track)", color: m.done ? "var(--ok)" : "var(--faint)" }}>{m.done ? <Ic n="check" size={11} sw={2.4} /> : null}</span>
                <span style={{ flex: 1, color: m.done ? "var(--dim)" : "var(--ink)" }}>{m.name}</span>
                <span style={{ color: "var(--faint)" }}>{fmtDate(m.due)}</span>
              </div>
            ))}
          </Card>
          <Card>
            <Head title="Documents and photos" />
            {docs.slice(0, 3).map((d, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, padding: "6px 0" }}><Ic n="doc" size={14} color="var(--faint)" /><Ellip style={{ flex: 1, color: "var(--body)" }}>{d.name}</Ellip><span style={{ color: "var(--faint)" }}>{d.kind}</span></div>)}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}><Pill tone="neutral">{docs.length} documents</Pill><Pill tone="neutral">{j.photos} photos</Pill></div>
            {acc.lvl >= 1 && contracts.length > 0 && (
              <>
                <div style={{ height: 1, background: "var(--border)", margin: "14px 0 10px" }} />
                <Label style={{ marginBottom: 8 }}>Related service contracts</Label>
                {contracts.map((c) => <div key={c.id} onClick={() => goTo("Contracts", "contracts", { contract: c.id })} className="ix11" style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, padding: "6px 0", cursor: "pointer" }}><Ic n="link" size={14} color="var(--accent)" /><Ellip style={{ flex: 1, color: "var(--body)" }}>{c.name}</Ellip><span style={{ color: "var(--ink)" }}>{eur(c.billing)}</span></div>)}
              </>
            )}
          </Card>
        </div>
      </Grid>
    </>
  );
}

/* ------------------------------ Financials ------------------------------ */
export function FinancialsTab({ j, acc }: { j: Job; acc: Access }) {
  const f = jobFin(j), inv = INVOICES.filter((i) => i.jobId === j.id);
  const m = acc.margins;
  const diff = (a: number, b: number) => (a === b ? "-" : (a > b ? "+" : "-") + eur(Math.abs(a - b)));
  const rowsC: [string, number, number, number][] = [["Labour", j.budget.labour, j.actual.labour, j.forecast.labour], ["Materials", j.budget.materials, j.actual.materials, j.forecast.materials], ["Other costs", j.budget.other, j.actual.other, j.forecast.other]];
  const draftVar = j.variations.filter((v) => v.status !== "Approved");
  return (
    <>
      <Alerts j={j} acc={acc} />
      <Grid cols={m ? "repeat(4,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))"} gap={12}>
        <Card pad={14}><Label>Quoted value</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(f.value)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>{eur(f.contract)} contract{f.approvedVar ? " plus " + eur(f.approvedVar) + " variations" : ", no approved variations"}</div></Card>
        <Card pad={14}><Label>Invoiced</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(f.invoiced)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>{eur(f.collected)} collected, {eur(f.unbilled)} unbilled</div></Card>
        <Card pad={14}><Label>Forecast cost at completion</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: "var(--ink)" }}>{eur(f.forecastCost)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>{eur(f.actualCost)} spent so far, {eur(f.costToComplete)} to come</div></Card>
        {m && <Card pad={14}><Label>Forecast gross margin</Label><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", marginTop: 8, color: f.atRisk ? "var(--warn)" : "var(--ok)" }}>{pct(f.fcMargin, 1)}</div><div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 6 }}>Quoted at {pct(f.origMargin, 1)}, gross profit {eur(f.fcGp)}</div></Card>}
      </Grid>
      <Grid cols="minmax(0,1.5fr) minmax(0,1fr)" gap={14}>
        <Card flush>
          <div style={{ padding: "18px 18px 4px" }}><Head title="Budget, actual and forecast" sub="Actual is cost booked to date from timesheets and matched supplier invoices." /></div>
          <Table cols="minmax(130px,1fr) repeat(4,minmax(100px,1fr))" dense head={["", "Budget", "Actual to date", "Forecast", "Forecast vs budget"]}
            rows={[...rowsC.map(([n, b, a, fc]) => [<Strong>{n}</Strong>, eur(b), eur(a), eur(fc), <span style={{ color: fc > b ? "var(--warn)" : "var(--dim)" }}>{diff(fc, b)}</span>]),
              [<Strong>Total cost</Strong>, <Strong>{eur(f.budgetCost)}</Strong>, <Strong>{eur(f.actualCost)}</Strong>, <Strong>{eur(f.forecastCost)}</Strong>, <span style={{ color: f.forecastCost > f.budgetCost ? "var(--warn)" : "var(--dim)", fontWeight: 600 }}>{diff(f.forecastCost, f.budgetCost)}</span>]]} />
          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, borderTop: "1px solid var(--border)" }}>
            <Meter label="Labour" used={j.actual.labour} budget={j.budget.labour} forecast={j.forecast.labour} progress={j.progress} />
            <Meter label="Materials" used={j.actual.materials} budget={j.budget.materials} forecast={j.forecast.materials} progress={j.progress} />
            <Meter label="Hours" used={j.hours.used} budget={j.hours.budget} progress={j.progress} format={(n) => String(n)} unit=" h" />
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Head title="Operational against financial" />
            {[["% complete", j.progress + "%", j.progress, "accent"], ["Hours used", Math.round(f.hoursPct * 100) + "% of budget", f.hoursPct * 100, "accent"], ["Cost spent", Math.round((f.actualCost / f.forecastCost) * 100) + "% of forecast", (f.actualCost / f.forecastCost) * 100, "accent"], ["Invoiced", Math.round((f.invoiced / f.value) * 100) + "% of value", (f.invoiced / f.value) * 100, "ok"]].map(([l, t, v, tn]: any) => (
              <div key={l} style={{ marginBottom: 12 }}><div style={{ display: "flex", fontSize: 12.5, marginBottom: 6 }}><span style={{ flex: 1, color: "var(--body)" }}>{l}</span><span style={{ color: "var(--ink)" }}>{t}</span></div><Progress value={v} tone={tn} h={5} /></div>
            ))}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}><StatusPill status={j.status} />{j.constraint ? <Pill tone="warn">Constraint open</Pill> : <Pill tone="ok">No constraints</Pill>}</div>
          </Card>
          {m && (
            <Card>
              <Head title="What moved the margin" sub={"Quoted " + pct(f.origMargin, 1) + ", forecast " + pct(f.fcMargin, 1)} />
              {rowsC.map(([n, b, , fc]) => (
                <div key={n} style={{ display: "flex", padding: "7px 0", fontSize: 12.5, borderTop: "1px solid var(--border)" }}><span style={{ flex: 1, color: "var(--body)" }}>{n}</span><span style={{ color: fc > b ? "var(--warn)" : "var(--dim)", fontVariantNumeric: "tabular-nums" }}>{fc === b ? "No change" : (fc > b ? "+" : "-") + eur(Math.abs(fc - b)) + " vs budget"}</span></div>
              ))}
              <div style={{ display: "flex", padding: "9px 0 0", fontSize: 13, borderTop: "1px solid var(--border)", fontWeight: 600 }}><span style={{ flex: 1, color: "var(--ink)" }}>Gross profit forecast</span><span style={{ color: "var(--ink)" }}>{eur(f.fcGp)}</span></div>
            </Card>
          )}
        </div>
      </Grid>
      <Grid cols="minmax(0,1fr) minmax(0,1fr)" gap={14}>
        <Card>
          <Head title="Variations" sub="Extra work beyond the quote. Approved variations lift the contract value." />
          {draftVar.length === 0 && <div style={{ fontSize: 13, color: "var(--dim)" }}>No variations on this job.</div>}
          {draftVar.map((v) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{v.id}: {v.desc}</div><div style={{ fontSize: 12, color: "var(--faint)", marginTop: 3 }}>{v.status}{m ? ", forecast margin with this approved: " + pct((f.value + v.amount - f.forecastCost) / (f.value + v.amount), 1) : ""}</div></div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{eur(v.amount)}</span>
              <Btn small kind="primary" onClick={() => toast("Variation " + v.id + " sent to Seamus for approval")}>Send for approval</Btn>
            </div>
          ))}
        </Card>
        <Card flush>
          <div style={{ padding: "18px 18px 4px" }}><Head title="Customer invoices on this job" /></div>
          <Table cols="minmax(90px,.8fr) minmax(190px,2fr) minmax(86px,.8fr) minmax(90px,.8fr)" dense head={["Invoice", "Description", "Amount", "Status"]}
            rows={inv.map((i) => [<span style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{i.id}</span>, <Ellip style={{ fontSize: 12.5 }}>{i.desc}</Ellip>, eur(i.amount), i.paid ? <Pill tone="ok">Paid</Pill> : dayDiff(i.due) < 0 ? <Pill tone="warn">{-dayDiff(i.due)}d overdue</Pill> : <Pill tone="neutral">Due {fmtDate(i.due)}</Pill>])}
            foot={f.unbilled > 0 ? eur(f.unbilled) + " of the quote is not yet invoiced" : "Fully invoiced"} />
        </Card>
      </Grid>
    </>
  );
}

/* ------------------------------ Schedule ------------------------------ */
export function ScheduleTab({ j }: { j: Job }) {
  const [wk, setWk] = useState("w0");
  const dates = weekDates(wk);
  const people = FIELD_STAFF.filter((s) => j.crew.indexOf(s.id) > -1 || WEEKS.some((w) => weekDates(w.id).some((d) => { const x = slotFor(s.id, d); return x.kind === "job" && x.jobId === j.id; })));
  const cell = (sid: string, d: string) => {
    const s = slotFor(sid, d);
    const mine = s.kind === "job" && s.jobId === j.id;
    const t: Tone = mine ? "accent" : s.kind === "leave" ? "warn" : s.kind === "pending-leave" ? "warn" : "neutral";
    const label = mine ? "On this job" : s.kind === "job" ? (s.label.split(" ").slice(0, 2).join(" ")) : s.label;
    return <div title={s.label} style={{ width: "100%", padding: "8px 8px", borderRadius: 9, fontSize: 11.5, textAlign: "center", background: mine ? "var(--accent-soft)" : s.kind === "leave" ? "var(--warn-soft)" : "var(--surface-faint)", color: mine ? "var(--accent)" : t === "warn" ? "var(--warn)" : "var(--faint)", border: "1px solid " + (mine ? "var(--accent-line)" : "var(--border)"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: mine ? 600 : 400 }}>{label}</div>;
  };
  return (
    <>
      <Card flush>
        <div style={{ padding: "18px 18px 12px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}><Head title="Crew on this job" sub="Combined from the planner, leave and training. Click through to move people." /></div>
          <Seg options={WEEKS.slice(0, 3).map((w) => [w.id, w.label] as [string, string])} value={wk} onChange={setWk} />
          <Btn small onClick={() => goTo("Schedule", "planner")}>Open planner</Btn>
        </div>
        <Table cols={"minmax(190px,1.4fr) repeat(5,minmax(104px,1fr))"} head={["", ...dates.map((d) => dow(d) + " " + fmtDate(d))]}
          rows={people.map((s) => [<span style={{ display: "inline-flex", gap: 9, alignItems: "center" }}><Avatar staffId={s.id} size={26} /><span><Strong>{s.name}</Strong>{s.id === j.lead && <span style={{ fontSize: 11, color: "var(--accent)", marginLeft: 6 }}>Lead</span>}</span></span>, ...dates.map((d) => cell(s.id, d))])} />
      </Card>
      {j.constraint && <Callout tone="warn" title="Schedule knock-on from the plant room constraint">Panel fit moves to Thursday 12 Nov. Kyle Murphy is on annual leave from that day and Darragh Sheehan is booked at Cahersiveen Nursing Home. See conflict X-1 in the planner.</Callout>}
    </>
  );
}

/* ------------------------------ Team ------------------------------ */
export function TeamTab({ j, acc }: { j: Job; acc: Access }) {
  const ids = Array.from(new Set([j.lead, ...j.crew]));
  return (
    <Grid cols="repeat(auto-fill,minmax(310px,1fr))" gap={14}>
      {ids.map((id) => {
        const s = staffById(id), slot = slotFor(id, TODAY);
        const cert = CERTS.filter((c) => c.staffId === id && j.certs.indexOf(c.cert) > -1);
        return (
          <Card key={id}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Avatar staffId={id} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div><div style={{ fontSize: 12.5, color: "var(--dim)" }}>{s.title}{id === j.lead ? ", job lead" : ""}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <Pill tone={slot.kind === "job" && slot.jobId === j.id ? "ok" : "neutral"}>{slot.kind === "job" && slot.jobId === j.id ? "On this job today" : "Today: " + slot.label.split(" ").slice(0, 3).join(" ")}</Pill>
              {acc.money && <Pill tone="neutral">{s.base}</Pill>}
            </div>
            <Label style={{ margin: "16px 0 8px" }}>Skills this job needs</Label>
            {j.requires.map((r) => { const lv = s.skills[r.skill]; return <div key={r.skill} style={{ display: "flex", fontSize: 12.5, padding: "5px 0" }}><span style={{ flex: 1, color: "var(--body)" }}>{r.skill}</span><span style={{ color: lv >= r.min ? "var(--ok)" : "var(--warn)" }}>{LEVEL_LABEL[lv]}</span></div>; })}
            <Label style={{ margin: "14px 0 8px" }}>Certification</Label>
            {cert.map((c) => { const d = certDays(c); return <div key={c.cert} style={{ display: "flex", fontSize: 12.5, padding: "5px 0" }}><span style={{ flex: 1, color: "var(--body)" }}>{c.cert}</span><span style={{ color: d <= 45 ? "var(--warn)" : "var(--dim)" }}>{d <= 45 ? "Expires in " + d + " days" : "Valid to " + fmtDate(c.expires)}</span></div>; })}
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}><Btn small onClick={() => toast("Calling " + s.name + " on " + s.phone)}><Ic n="phone" size={13} />Call</Btn>{acc.office && <Btn small onClick={() => goTo("People", "team", { staff: id })}>Profile</Btn>}</div>
          </Card>
        );
      })}
    </Grid>
  );
}
