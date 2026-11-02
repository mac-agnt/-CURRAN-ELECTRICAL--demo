import { useEffect, useMemo, useState } from "react";
import { QUEUE, QUEUE_STAGES, QueueItem, QueueStage, INVOICES, addDays, customerById, eur, jobById, jobFin, pct, sum, toast, useCurran, can, clearSel, select, fmtDate, dayDiff, staffById, TODAY, goTo, RoleKey } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Ic, Avatar, Label, Progress, Callout, Table, Strong, Tone } from "../../ui";
import { useFin, setStage, finPatch, getFin } from "./state";
import { stageOf, StagePill, Sub, custName, ageLabel, CADENCE } from "./shared";

let prepSeen = false;

const canApprove = (role: RoleKey, q: QueueItem) => role === "md" || (role === "admin" && q.approver !== "seamus");

function Prep({ onDone }: { onDone: () => void }) {
  const steps = ["Reading quote Q-2026-097 and the signed handover", "Pulling 143 timesheet hours from 3 technicians", "Matching 4 supplier invoices to the job", "Checking for variations (none) and customer terms", "Draft invoice assembled for approval"];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= steps.length) { prepSeen = true; const t = setTimeout(onDone, 500); return () => clearTimeout(t); }
    const t = setTimeout(() => setN(n + 1), 520);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <Card style={{ borderColor: "var(--accent-line)", background: "var(--accent-faint)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)", animation: "breathe 1.2s ease-in-out infinite" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Invoice Agent is preparing this draft</span>
      </div>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", fontSize: 12.5, color: i < n ? "var(--body)" : "var(--faint)", opacity: i <= n ? 1 : 0.4, transition: "opacity .3s" }}>
          <span style={{ width: 16, height: 16, flex: "none", borderRadius: 99, border: "1px solid " + (i < n ? "var(--ok)" : "var(--border-strong)"), display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i < n && <Ic n="check" size={10} color="var(--ok)" sw={2.6} />}</span>
          {s}
        </div>
      ))}
    </Card>
  );
}

function Monitoring({ issued, termsDays, paid }: { issued: string; termsDays: number; paid?: string }) {
  const due = addDays(issued, termsDays);
  return (
    <Card>
      <Head title="Payment monitoring" sub={paid ? "Paid " + fmtDate(paid) + ". Collections Agent has stood down." : "Issued " + fmtDate(issued) + ", due " + fmtDate(due) + ". The Collections Agent follows up on this cadence."} right={paid ? <Pill tone="ok">Paid</Pill> : <Pill tone="accent">Monitoring</Pill>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
        {CADENCE.map((c) => {
          const d = addDays(due, c.day);
          return (
            <div key={c.day} style={{ padding: "10px 11px", borderRadius: "var(--r-sm,12px)", background: "var(--surface-2)", border: "1px solid var(--border)", opacity: paid ? 0.5 : 1 }}>
              <Label>Day {c.day}</Label>
              <div style={{ fontSize: 12.5, color: "var(--ink)", marginTop: 5, fontWeight: 500 }}>{c.label}</div>
              <Sub style={{ marginTop: 3 }}>{fmtDate(d)} · {c.who}</Sub>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function Queue() {
  const cur = useCurran();
  const fin = useFin();
  const [filter, setFilter] = useState<QueueStage | null>(null);
  const [edit, setEdit] = useState(false);
  const [lineEdits, setLineEdits] = useState<Record<string, number[]>>({});
  const [prepping, setPrepping] = useState(false);
  const items = useMemo(() => QUEUE.filter((q) => !fin.rejected[q.id]), [fin.rejected]);
  const selId = cur.sel.queue && items.some((q) => q.id === cur.sel.queue) ? cur.sel.queue : items.find((q) => q.id === "Q-1") ? "Q-1" : items[0]?.id;
  const sel = items.find((q) => q.id === selId);
  const stage = sel ? stageOf(sel, fin) : "Paid";
  useEffect(() => { if (selId === "Q-1" && !prepSeen) setPrepping(true); else setPrepping(false); setEdit(false); }, [selId]);

  const byStage = (s: QueueStage) => items.filter((q) => stageOf(q, fin) === s);
  const approve = (q: QueueItem) => {
    setStage(q.id, "Approved");
    toast("Queued for RedBook: " + q.title);
    setTimeout(() => setStage(q.id, "Sent"), 1400);
  };
  const reject = (q: QueueItem) => {
    finPatch({ rejected: { ...getFin().rejected, [q.id]: true } });
    toast("Draft discarded. The Invoice Agent will re-check tomorrow");
    select({ queue: items.find((x) => x.id !== q.id)?.id });
  };
  const lines = sel ? (lineEdits[sel.id] || sel.lines.map((l) => l.amount)) : [];
  const total = sum(lines);
  const job = sel?.jobId ? (() => { try { return jobById(sel.jobId!); } catch { return undefined; } })() : undefined;
  const jf = job ? jobFin(job) : undefined;
  const terms = sel ? parseInt(customerById(sel.customerId).terms, 10) || 30 : 30;
  const inv = sel?.invoiceId ? INVOICES.find((i) => i.id === sel.invoiceId) : undefined;
  const readyTone: Tone = sel && sel.ageDays > 5 ? "warn" : "ok";

  return (
    <Page>
      <Title title="Invoice Queue" sub="The Invoice Readiness Engine finds completed work and billing milestones, prepares the invoice from the quote, hours, materials and variations, then asks for approval. Nothing waits for admin time." />
      <Grid cols="repeat(6,minmax(0,1fr))" gap={8}>
        {QUEUE_STAGES.map((s, i) => {
          const xs = byStage(s), on = filter === s;
          return (
            <button key={s} onClick={() => setFilter(on ? null : s)} style={{ textAlign: "left", padding: "12px 13px", borderRadius: "var(--r-md,16px)", cursor: "pointer", background: on ? "var(--accent-soft)" : "var(--surface)", border: "1px solid " + (on ? "var(--accent-line)" : "var(--border)"), color: "var(--ink)", transition: "background .2s var(--ease), border-color .2s var(--ease)", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--faint)" }}>{i + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: on ? "var(--accent)" : "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.6px", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{eur(sum(xs.map((q) => q.amount)))}</div>
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{xs.length} {xs.length === 1 ? "item" : "items"}</div>
            </button>
          );
        })}
      </Grid>

      <Grid cols="minmax(300px,0.85fr) minmax(0,1.35fr)" gap={16}>
        <Card pad={0} flush style={{ alignSelf: "start" }}>
          {QUEUE_STAGES.filter((s) => !filter || s === filter).map((s) => {
            const xs = byStage(s);
            if (!xs.length) return null;
            return (
              <div key={s}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--surface-faint)", borderBottom: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
                  <StagePill s={s} /><span style={{ flex: 1 }} /><span style={{ fontSize: 12, color: "var(--faint)" }}>{eur(sum(xs.map((q) => q.amount)))}</span>
                </div>
                {xs.map((q) => (
                  <div key={q.id} className="ix11" onClick={() => select({ queue: q.id })} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer", background: q.id === selId ? "var(--accent-faint)" : undefined, boxShadow: q.id === selId ? "inset 2px 0 0 var(--accent)" : undefined }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.title}</div>
                      <Sub>{q.kind} · {s === "Sent" || s === "Paid" || s === "Opportunity detected" ? q.trigger : "unbilled " + ageLabel(q.ageDays)}</Sub>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(q.amount)}</div>
                      {q.approver && <div style={{ marginTop: 3, display: "flex", justifyContent: "flex-end" }}><Avatar staffId={q.approver} size={18} /></div>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>

        {sel && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            {prepping && sel.id === "Q-1" ? <Prep onDone={() => setPrepping(false)} /> : (
              <>
                <Card style={sel.id === "Q-1" ? { borderColor: "var(--accent-line)" } : undefined}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StagePill s={stage} /><Pill>{sel.kind}</Pill>{sel.jobId && <Pill>{sel.jobId}</Pill>}{sel.contractId && <Pill>{sel.contractId}</Pill>}</div>
                      <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.5px", color: "var(--ink)", marginTop: 10, lineHeight: 1.2 }}>{sel.title}</div>
                      <Sub style={{ marginTop: 4 }}>{custName(sel.customerId)}</Sub>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Label>{sel.stage === "Opportunity detected" && stage === sel.stage ? "Forecast value" : "Invoice value, ex VAT"}</Label>
                      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-1px", color: "var(--ink)", fontVariantNumeric: "tabular-nums", marginTop: 4 }}>{eur(sel.lines.length ? total : sel.amount)}</div>
                    </div>
                  </div>
                </Card>

                <Grid cols="minmax(0,1fr) minmax(0,1fr)" gap={14}>
                  <Card>
                    <Head small title="Why Pulse raised it" />
                    <div style={{ fontSize: 13, color: "var(--body)", lineHeight: 1.5 }}>{sel.trigger}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      <Pill tone={readyTone}>{sel.ready ? "Unbilled " + ageLabel(sel.ageDays) : "Not yet billable"}</Pill>
                      {sel.approver && <Pill tone="neutral">Approver: {staffById(sel.approver).first}</Pill>}
                    </div>
                    {sel.note && <Sub style={{ marginTop: 10 }}>{sel.note}</Sub>}
                  </Card>
                  <Card>
                    <Head small title="Assembled from" />
                    {sel.sources.length ? sel.sources.map((s) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0", fontSize: 12.5, color: "var(--body)" }}><Ic n="check" size={13} color="var(--ok)" sw={2.4} />{s}</div>
                    )) : <Sub>Issued invoice {sel.invoiceId}. Source documents are attached to the job record.</Sub>}
                  </Card>
                </Grid>

                {sel.lines.length > 0 && (
                  <Card flush>
                    <div style={{ padding: "16px 18px 4px" }}><Head small title="Invoice lines" right={<Btn small onClick={() => setEdit(!edit)} disabled={stage === "Sent" || stage === "Paid" || stage === "Approved"}>{edit ? "Done" : "Edit"}</Btn>} /></div>
                    <Table cols="minmax(0,1fr) 130px" head={["Description", "Amount"]}
                      rows={sel.lines.map((l, i) => [
                        <span style={{ color: "var(--ink)" }}>{l.desc}</span>,
                        edit ? <input className="ixi" type="number" value={lines[i]} onChange={(e) => { const x = [...lines]; x[i] = Math.max(0, +e.target.value || 0); setLineEdits({ ...lineEdits, [sel.id]: x }); }} style={{ width: 100, height: 30, padding: "0 10px", borderRadius: 10, border: "1px solid var(--border-strong)", background: "var(--surface-2)", color: "var(--ink)", textAlign: "right", outline: 0 }} />
                          : <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{eur(lines[i])}</span>,
                      ])}
                      foot={<div style={{ display: "flex" }}><span style={{ flex: 1 }}>Total ex VAT</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{eur(total)}</span></div>} />
                  </Card>
                )}

                {jf && job && (
                  <Card>
                    <Head small title={"Job position, " + job.name} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
                      {[["Contract", eur(jf.value)], ["Invoiced to date", eur(jf.invoiced)], ["This invoice", eur(sel.amount)], ["Unbilled after", eur(Math.max(0, jf.unbilled - (stage === "Opportunity detected" ? 0 : sel.amount)))]].map(([k, v]) => (
                        <div key={k}><Label>{k}</Label><div style={{ fontSize: 16, fontWeight: 600, marginTop: 5, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{v}</div></div>
                      ))}
                    </div>
                    <div style={{ marginTop: 12 }}><Progress value={(jf.invoiced / jf.value) * 100} h={6} /></div>
                    {can(cur.role, "margins") && <Sub style={{ marginTop: 8 }}>Forecast margin {pct(jf.fcMargin, 0)}. No variations outstanding on this job.</Sub>}
                  </Card>
                )}

                {(stage === "Sent" || stage === "Paid") && (
                  <Monitoring issued={inv ? inv.issued : TODAY} termsDays={inv ? Math.max(1, -dayDiff(inv.due, inv.issued)) : terms} paid={inv?.paid || (stage === "Paid" ? sel.since : undefined)} />
                )}

                <Card style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
                      {stage === "Awaiting approval" ? "Waiting for " + (sel.approver ? staffById(sel.approver).first : "approval") : stage === "Approved" ? "Posting to RedBook" : stage === "Sent" ? "Sent to customer" : stage === "Paid" ? "Payment received" : stage === "Draft prepared" ? "Draft ready to route" : "Pulse is watching this"}
                    </div>
                    <Sub>{stage === "Awaiting approval" && !canApprove(cur.role, sel) ? "Only " + staffById(sel.approver || "seamus").first + " can approve this one." : "RedBook stays the ledger. Pulse queues the invoice and reads the payment back."}</Sub>
                  </div>
                  {stage === "Opportunity detected" && <Btn kind="primary" disabled={!sel.ready && sel.id === "Q-6"} onClick={() => { setStage(sel.id, "Draft prepared"); toast("Draft prepared by the Invoice Agent"); }}>{sel.id === "Q-6" ? "Not billable yet" : "Prepare draft"}</Btn>}
                  {stage === "Draft prepared" && <Btn kind="primary" onClick={() => { setStage(sel.id, "Awaiting approval"); toast("Sent to " + staffById(sel.approver || "caitlin").first + " for approval"); }}>Route for approval</Btn>}
                  {stage === "Awaiting approval" && (
                    <>
                      <Btn kind="danger" onClick={() => reject(sel)}>Reject</Btn>
                      <Btn kind="primary" disabled={!canApprove(cur.role, sel)} onClick={() => approve(sel)}><Ic n="check" size={14} sw={2.2} />Approve {eur(total)}</Btn>
                    </>
                  )}
                  {stage === "Approved" && <Pill tone="accent">Syncing</Pill>}
                </Card>
              </>
            )}
          </div>
        )}
      </Grid>
    </Page>
  );
}
