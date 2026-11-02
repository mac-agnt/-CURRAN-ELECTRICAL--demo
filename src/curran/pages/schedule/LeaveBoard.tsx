import { useState } from "react";
import { LEAVE, ALLOWANCE, STAFF, FIELD_STAFF, TODAY, addDays, dow, fmtDate, dayDiff, slotFor, staffById, useCurran, toast, goTo, Leave } from "../../index";
import { Card, Head, Pill, Btn, Kpi, Grid, Table, Avatar, Progress, Callout, Label, Strong, Muted, Tone } from "../../ui";
import { canEditRole, tint, HATCH } from "./common";

/* One component, two views: "schedule" (who is off, when, where it clashes) and "people" (each person's balance and requests). */
const HOLIDAYS: Record<string, string> = { "2026-12-25": "Christmas Day", "2027-01-01": "New Year's Day" };

function strip(): string[] {
  const out: string[] = [];
  for (let w = 0; w < 8; w++) for (let i = 0; i < 5; i++) out.push(addDays("2026-11-09", w * 7 + i));
  return out;
}
const range = (l: Leave) => fmtDate(l.from) + " to " + fmtDate(l.to);

export default function LeaveBoard({ mode }: { mode: "schedule" | "people" }) {
  const cur = useCurran();
  const detail = canEditRole(cur.role);
  const [status, setStatus] = useState<Record<string, Leave["status"]>>({});
  const st = (l: Leave) => status[l.id] || l.status;
  const days = strip();
  const people = STAFF;
  const booked = (id: string) => LEAVE.filter((l) => l.staffId === id && st(l) === "Approved" && l.to >= TODAY).reduce((a, l) => a + l.days, 0);
  const pending = LEAVE.filter((l) => st(l) === "Pending");
  const offOn = (d: string) => FIELD_STAFF.filter((s) => { const k = slotFor(s.id, d).kind; return k === "leave" || k === "pending-leave"; }).length;
  const clashDays = days.filter((d) => offOn(d) >= 2);
  const decide = (l: Leave, v: "Approved" | "Declined") => { setStatus({ ...status, [l.id]: v }); toast(v === "Approved" ? "Leave approved for " + staffById(l.staffId).name + ". Planner and calendar updated." : "Leave declined. " + staffById(l.staffId).first + " has been told."); };
  const tone = (s: Leave["status"]): Tone => (s === "Approved" ? "ok" : s === "Pending" ? "warn" : "neutral");
  const offThisWeek = FIELD_STAFF.filter((s) => ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"].some((d) => slotFor(s.id, d).kind === "leave")).length;

  const stripCard = (
    <Card flush>
      <div style={{ padding: "14px 16px" }}>
        <Head small title="Who is off, next 8 weeks" sub={detail ? "Field staff overlap shows in the bottom row. Two or more off at once is flagged." : "Absence at a glance. Reasons and balances are kept by admin."} />
      </div>
      <div style={{ overflowX: "auto", padding: "0 16px 14px" }}>
        <div style={{ minWidth: 700 }}>
          <div style={{ display: "grid", gridTemplateColumns: "130px repeat(8, 1fr)", marginBottom: 4 }}>
            <span />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((w) => <span key={w} style={{ fontSize: 10.5, color: "var(--faint)" }}>{fmtDate(addDays("2026-11-09", w * 7))}</span>)}
          </div>
          {people.map((s) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", height: 26 }}>
              <span style={{ fontSize: 12, color: "var(--body)", display: "flex", alignItems: "center", gap: 7 }}><Avatar staffId={s.id} size={18} />{s.first}</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(40, 1fr)", gap: 2 }}>
                {days.map((d, i) => {
                  const k = slotFor(s.id, d).kind;
                  const hol = HOLIDAYS[d];
                  const label = k === "leave" ? "Annual leave" : k === "pending-leave" ? "Leave requested" : k === "training" ? "Training" : "";
                  return <span key={d} title={dow(d) + " " + fmtDate(d) + (hol ? ", " + hol : "") + (label ? ": " + label : "")}
                    style={{ height: 18, borderRadius: 5, marginLeft: i % 5 === 0 && i ? 4 : 0, background: hol ? "var(--surface-2)" : k === "leave" ? tint("#1c93e3", 55) : k === "training" ? "var(--surface-2)" : "var(--surface-faint)", border: k === "pending-leave" ? "1px dashed var(--warn)" : undefined, backgroundImage: hol ? HATCH : undefined }} />;
                })}
              </div>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", height: 28, marginTop: 4 }}>
            <span style={{ fontSize: 11.5, color: "var(--faint)" }}>Field staff off</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(40, 1fr)", gap: 2 }}>
              {days.map((d, i) => { const n = offOn(d); return <span key={d} style={{ height: 20, borderRadius: 5, marginLeft: i % 5 === 0 && i ? 4 : 0, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: n >= 2 ? "var(--warn)" : "var(--faint)", background: n >= 2 ? "var(--warn-soft)" : "none", fontWeight: n >= 2 ? 600 : 400 }}>{n || ""}</span>; })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 11.5, color: "var(--faint)", flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 4, background: tint("#1c93e3", 55), verticalAlign: -2, marginRight: 6 }} />Annual leave</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 4, border: "1px dashed var(--warn)", verticalAlign: -2, marginRight: 6 }} />Requested</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 4, background: "var(--surface-2)", verticalAlign: -2, marginRight: 6 }} />Training or public holiday</span>
      </div>
    </Card>
  );

  const requests = (
    <Card flush>
      <div style={{ padding: "14px 16px 4px" }}><Head small title="Leave requests" sub={detail ? "Approvals also appear in Work." : undefined} /></div>
      <Table cols="1.3fr 1.1fr .5fr .8fr 1.2fr" dense head={["Employee", "Dates", "Days", "Status", detail ? "" : ""]}
        rows={LEAVE.filter((l) => detail || st(l) === "Approved").map((l) => [
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar staffId={l.staffId} size={24} /><Strong>{staffById(l.staffId).name}</Strong></span>,
          <span>{range(l)}</span>, <span>{l.days}</span>, <Pill tone={tone(st(l))}>{st(l) === "Pending" ? "Pending" : st(l)}</Pill>,
          detail && st(l) === "Pending" && l.status === "Pending" ? <span style={{ display: "flex", gap: 6 }}><Btn small kind="primary" onClick={() => decide(l, "Approved")}>Approve</Btn><Btn small onClick={() => decide(l, "Declined")}>Decline</Btn></span> : <Muted>{detail ? l.note || "" : ""}</Muted>,
        ])} />
    </Card>
  );

  if (mode === "schedule") {
    return (
      <>
        <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
          <Kpi label="Off this week" value={offThisWeek} hint="field staff on leave" />
          <Kpi label="Requests waiting" value={detail ? pending.length : "-"} tone={detail && pending.length ? "warn" : undefined} hint={detail ? "need a decision" : "admin only"} />
          <Kpi label="Overlap days" value={clashDays.length} tone={clashDays.length ? "warn" : undefined} hint="2+ field staff off" />
          <Kpi label="Next return" value="Mon 23 Nov" hint="Kyle Murphy back after 12 to 20 Nov" />
        </Grid>
        {detail && pending.map((l) => (
          <Callout key={l.id} tone="warn" title={staffById(l.staffId).name + " has asked for " + range(l)} right={<span style={{ display: "flex", gap: 8 }}><Btn kind="primary" small onClick={() => decide(l, "Approved")}>Approve</Btn><Btn small onClick={() => decide(l, "Declined")}>Decline</Btn></span>}>
            {l.warning} Dunloe EV commissioning and Kerry Medical depend on the people left.
          </Callout>
        ))}
        {stripCard}
        {detail ? requests : <Callout tone="neutral" title="Leave details are visible to admin">You can see who is away so you can plan crews. Requests and balances are managed by Caitlin and Seamus.</Callout>}
      </>
    );
  }

  return (
    <>
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Kpi label="Requests waiting" value={pending.length} tone={pending.length ? "warn" : undefined} hint="need a decision" />
        <Kpi label="Booked ahead" value={LEAVE.filter((l) => st(l) === "Approved" && l.to >= TODAY).reduce((a, l) => a + l.days, 0)} hint="approved days, all staff" />
        <Kpi label="Overlap days" value={clashDays.length} tone={clashDays.length ? "warn" : undefined} hint="2+ field staff off" />
        <Kpi label="Days left, all staff" value={people.reduce((a, s) => a + ALLOWANCE[s.id].entitlement - ALLOWANCE[s.id].taken - booked(s.id), 0)} hint="after approved leave" />
      </Grid>
      <Grid cols="repeat(auto-fill, minmax(260px, 1fr))" gap={12}>
        {people.map((s) => {
          const a = ALLOWANCE[s.id], b = booked(s.id), rem = a.entitlement - a.taken - b;
          const next = LEAVE.filter((l) => l.staffId === s.id && l.to >= TODAY && st(l) !== "Declined").sort((x, y) => x.from.localeCompare(y.from))[0];
          return (
            <Card key={s.id} pad={14} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar staffId={s.id} size={30} /><div style={{ minWidth: 0 }}><Strong>{s.name}</Strong><div style={{ fontSize: 11.5, color: "var(--faint)" }}>{rem} of {a.entitlement} days left</div></div></div>
              <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", background: "var(--track)" }}>
                <span style={{ width: (a.taken / a.entitlement) * 100 + "%", background: "var(--mid)" }} />
                <span style={{ width: (b / a.entitlement) * 100 + "%", background: "var(--accent)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--dim)" }}><span>Taken {a.taken}</span><span>Booked {b}</span><span>Left {rem}</span></div>
              <div style={{ fontSize: 12, color: next ? "var(--body)" : "var(--faint)" }}>{next ? "Next: " + range(next) + (st(next) === "Pending" ? " (requested)" : "") : "Nothing booked"}</div>
            </Card>
          );
        })}
      </Grid>
      {pending.map((l) => (
        <Callout key={l.id} tone="warn" title={staffById(l.staffId).name + ": " + range(l) + " (" + st(l).toLowerCase() + ")"} right={st(l) === "Pending" ? <span style={{ display: "flex", gap: 8 }}><Btn kind="primary" small onClick={() => decide(l, "Approved")}>Approve</Btn><Btn small onClick={() => decide(l, "Declined")}>Decline</Btn></span> : undefined}>{l.warning}</Callout>
      ))}
      {requests}
      <div style={{ fontSize: 12.5, color: "var(--dim)" }}>The planner and this view read the same leave records, so a request that clashes shows in both. <button onClick={() => goTo("Schedule", "leave")} style={{ border: 0, background: "none", color: "var(--accent)", cursor: "pointer", fontSize: 12.5, padding: 0 }}>Open the leave calendar</button></div>
    </>
  );
}
