import { ReactNode } from "react";
import { SYSTEMS, JOBS, siteById, staffById, fmtDateY, goTo, type RoleKey } from "../../index";
import { Card, Pill, Btn, Ic, Label, Callout, Muted, type Tone } from "../../ui";
import { DOCS, CAVEAT, KIND_LABEL, type KDoc, type DocKind } from "./docs";

export const isField = (r: RoleKey) => r === "electrician" || r === "apprentice";
/** Apprentices only see items flagged as approved for them. */
export const visibleDocs = (r: RoleKey) => DOCS.filter((d) => r !== "apprentice" || d.apprentice);
export const canSeeDoc = (d: KDoc, r: RoleKey) => r !== "apprentice" || !!d.apprentice;

export const KIND_ICON: Record<DocKind, string> = { Procedure: "check", Guide: "doc", Video: "play", PDF: "doc", "Technical note": "doc", Manufacturer: "doc", "Job example": "wrench", Troubleshooting: "alert" };
export const KIND_TONE: Record<DocKind, Tone> = { Procedure: "accent", Guide: "neutral", Video: "neutral", PDF: "neutral", "Technical note": "neutral", Manufacturer: "neutral", "Job example": "ok", Troubleshooting: "warn" };

export function relatedSystems(d: KDoc) {
  return SYSTEMS.filter((s) => (d.sites ? d.sites.indexOf(s.siteId) > -1 : false) && (!d.kinds || !d.kinds.length || d.kinds.indexOf(s.kind) > -1));
}
export function Thumb({ d, h = 96 }: { d: KDoc; h?: number }) {
  const video = d.kind === "Video";
  return (
    <div style={{ height: h, borderRadius: "var(--r-sm,12px)", background: "linear-gradient(135deg, var(--accent-soft), var(--surface-2) 75%)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "var(--accent)" }}>
      <span style={{ width: 38, height: 38, borderRadius: 99, background: "var(--surface)", border: "1px solid var(--accent-line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n={video ? "play" : KIND_ICON[d.kind]} size={16} /></span>
      {d.duration && <span style={{ position: "absolute", right: 8, bottom: 8, fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "var(--tooltip)", color: "var(--tooltip-ink)" }}>{d.duration}</span>}
      {d.pages && <span style={{ position: "absolute", right: 8, bottom: 8, fontSize: 11, padding: "2px 7px", borderRadius: 99, background: "var(--tooltip)", color: "var(--tooltip-ink)" }}>{d.pages} pages</span>}
    </div>
  );
}
export function DocViewer({ d, onClose, field }: { d: KDoc; onClose?: () => void; field?: boolean }) {
  const sys = relatedSystems(d);
  const jobs = d.jobs || [];
  const sites = (d.sites || []).map(siteById);
  return (
    <Card pad={0} style={{ position: field ? "static" : "sticky", top: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Pill tone={KIND_TONE[d.kind]}>{KIND_LABEL[d.kind]}</Pill>
            <Muted style={{ fontSize: 12 }}>{d.cat}, {d.sub}</Muted>
            {d.apprentice && <Pill tone="ok">Approved for apprentices</Pill>}
          </div>
          <div style={{ fontSize: 19, fontWeight: 600, color: "var(--ink)", letterSpacing: "-.4px", marginTop: 9, lineHeight: 1.25 }}>{d.title}</div>
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 6 }}>Updated {fmtDateY(d.updated)} by {staffById(d.by).name}</div>
        </div>
        {onClose && <button onClick={onClose} className="ixm" style={{ flex: "none", width: 30, height: 30, border: "1px solid var(--border)", borderRadius: 99, background: "none", color: "var(--dim)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n="M6 6l12 12 M18 6 6 18" size={12} sw={2.2} /></button>}
      </div>
      <div style={{ padding: "16px 20px 20px", maxHeight: field ? undefined : "calc(100vh - 230px)", overflowY: "auto", scrollbarWidth: "none" }}>
        {(d.kind === "Video" || d.kind === "PDF" || d.kind === "Manufacturer") && <div style={{ marginBottom: 14 }}><Thumb d={d} h={110} /></div>}
        {d.body.map((p, i) => <p key={i} style={{ margin: "0 0 12px", fontSize: field ? 15 : 13.5, lineHeight: 1.65, color: "var(--body)" }}>{p}</p>)}
        {d.steps && (
          <ol style={{ margin: "6px 0 14px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
            {d.steps.map((s, i) => (
              <li key={i} style={{ display: "flex", gap: 11, fontSize: field ? 14.5 : 13, lineHeight: 1.5, color: "var(--body)" }}>
                <span style={{ flex: "none", width: 22, height: 22, borderRadius: 7, background: "var(--accent-soft)", color: "var(--accent)", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>{s}
              </li>
            ))}
          </ol>
        )}
        {d.caveat && <Callout tone="neutral" title="Safety note">{CAVEAT}</Callout>}
        {d.kind === "Procedure" && d.steps && <div style={{ marginTop: 12 }}><Btn kind="primary" small onClick={() => goTo("Knowledge", "procedures", { doc: d.id })}>Open as checklist</Btn></div>}
        {(sys.length > 0 || jobs.length > 0 || sites.length > 0) && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
            {sys.length > 0 && <><Label style={{ marginBottom: 8 }}>Installed where this applies</Label><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {sys.map((s) => <button key={s.id} className="ixu" onClick={() => goTo("Customers", "systems", { system: s.id })} style={{ height: 28, padding: "0 11px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--body)", fontSize: 12, cursor: "pointer" }}>{siteById(s.siteId).name}, {s.kind}</button>)}
            </div></>}
            {jobs.length > 0 && <><Label style={{ marginBottom: 8 }}>Previous jobs</Label><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {jobs.map((j) => { const live = JOBS.some((x) => x.id === j); return <button key={j} className="ixu" disabled={!live} onClick={() => goTo("Jobs", "active", { job: j })} style={{ height: 28, padding: "0 11px", borderRadius: 99, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--body)", fontSize: 12, cursor: live ? "pointer" : "default" }}>{j}{live ? ", " + JOBS.find((x) => x.id === j)!.name : ", completed"}</button>; })}
            </div></>}
          </div>
        )}
      </div>
    </Card>
  );
}
export const SearchBox = ({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children?: ReactNode }) => (
  <div className="ixi" style={{ display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 14px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", minWidth: 260, flex: 1 }}>
    <Ic n="search" size={15} color="var(--faint)" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ flex: 1, minWidth: 0, background: "none", border: 0, outline: 0, color: "var(--ink)", fontSize: 13.5 }} />
    {children}
  </div>
);
/** Plain keyword search over the library. Every word must appear somewhere in the document. */
export function searchDocs(list: KDoc[], q: string): KDoc[] {
  const t = q.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!t.length) return list;
  return list
    .map((d) => {
      const hay = (d.title + " " + d.sub + " " + d.cat + " " + d.kind + " " + d.keywords.join(" ") + " " + d.body.join(" ") + (d.steps ? " " + d.steps.join(" ") : "")).toLowerCase();
      if (!t.every((w) => hay.indexOf(w) > -1)) return { d, s: 0 };
      return { d, s: t.reduce((a, w) => a + (d.title.toLowerCase().indexOf(w) > -1 ? 5 : 0) + (d.keywords.some((k) => k.indexOf(w) > -1) ? 3 : 0) + 1, 0) };
    })
    .filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.d);
}
