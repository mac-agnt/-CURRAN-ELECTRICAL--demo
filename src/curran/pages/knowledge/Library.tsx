import { useState } from "react";
import { useCurran, select, clearSel } from "../../index";
import { Page, Grid, Card, Title, Pill, Muted, Ic, Label } from "../../ui";
import { DOCS, CATS, KIND_LABEL, KIND_ORDER, type KDoc, type DocKind } from "./docs";
import { visibleDocs, searchDocs, DocViewer, SearchBox, Thumb, KIND_ICON, KIND_TONE, isField } from "./common";

const FilterChip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick} className="ixu" style={{ height: 30, padding: "0 13px", borderRadius: 99, border: "1px solid " + (on ? "var(--accent-line)" : "var(--border)"), background: on ? "var(--accent-soft)" : "var(--surface)", color: on ? "var(--accent)" : "var(--dim)", fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap", fontWeight: on ? 600 : 500 }}>{children}</button>
);

function DocCard({ d, on, field, onClick }: { d: KDoc; on: boolean; field: boolean; onClick: () => void }) {
  const video = d.kind === "Video";
  return (
    <div onClick={onClick} className="ix11" style={{ border: "1px solid " + (on ? "var(--accent-line)" : "var(--border)"), background: on ? "var(--accent-faint)" : "var(--surface)", borderRadius: "var(--r-md,16px)", padding: 14, cursor: "pointer", display: "flex", flexDirection: video ? "column" : "row", gap: 12, minWidth: 0 }}>
      {video && <Thumb d={d} h={78} />}
      {!video && <span style={{ flex: "none", width: 34, height: 34, borderRadius: 11, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic n={KIND_ICON[d.kind]} size={16} /></span>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: field ? 15 : 13.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{d.title}</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>{d.body[0]}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginTop: 9 }}>
          <Pill tone={KIND_TONE[d.kind]}>{KIND_LABEL[d.kind]}</Pill>
          <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{d.sub}</span>
        </div>
      </div>
    </div>
  );
}

export default function Library() {
  const cur = useCurran();
  const field = isField(cur.role);
  const raw = cur.sel.query || "";
  const sub = raw.startsWith("sub:") ? raw.slice(4) : "";
  const q = sub ? "" : raw;
  const [cat, setCat] = useState<string>("All");
  const [kind, setKind] = useState<DocKind | "All">("All");
  const all = visibleDocs(cur.role);
  let list = searchDocs(all, q);
  if (sub) list = list.filter((d) => d.sub === sub);
  if (cat !== "All") list = list.filter((d) => d.cat === cat);
  if (kind !== "All") list = list.filter((d) => d.kind === kind);
  const open = DOCS.find((d) => d.id === cur.sel.doc && all.indexOf(d) > -1);
  const body = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <SearchBox value={q} onChange={(v) => select({ query: v })} placeholder="Search guides, procedures, manuals and past jobs">
          {sub && <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, padding: "3px 6px 3px 10px", borderRadius: 99, background: "var(--accent-soft)", color: "var(--accent)" }}>{sub}<button onClick={() => clearSel("query")} style={{ border: 0, background: "none", color: "inherit", cursor: "pointer", padding: 0, display: "flex" }}><Ic n="M6 6l12 12 M18 6 6 18" size={11} sw={2.4} /></button></span>}
        </SearchBox>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <FilterChip on={cat === "All"} onClick={() => setCat("All")}>All areas</FilterChip>
        {CATS.map((c) => <FilterChip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>{c.id}</FilterChip>)}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Label style={{ marginRight: 4 }}>Type</Label>
        <FilterChip on={kind === "All"} onClick={() => setKind("All")}>Everything</FilterChip>
        {KIND_ORDER.map((k) => <FilterChip key={k} on={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k]}</FilterChip>)}
      </div>
      <Muted>{list.length} of {all.length} items{cur.role === "apprentice" ? ", showing only items approved for apprentices" : ""}</Muted>
      <div style={{ display: "grid", gridTemplateColumns: field || open ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {list.map((d) => <DocCard key={d.id} d={d} field={field} on={open?.id === d.id} onClick={() => select({ doc: d.id })} />)}
      </div>
      {!list.length && <Card><div style={{ padding: "26px 8px", textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>Nothing matches</div><Muted>Try fewer words, or ask Pulse in plain English on the Ask Pulse tab.</Muted></div></Card>}
    </div>
  );
  if (field) {
    return (
      <Page>
        <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <Title title="Knowledge" sub="Guides, procedures and manuals for the systems we install and look after." />
          {open ? <><button onClick={() => clearSel("doc")} className="ix2" style={{ alignSelf: "flex-start", height: 32, padding: "0 14px", borderRadius: 99, border: "1px solid var(--border)", background: "none", color: "var(--dim)", cursor: "pointer", fontSize: 13 }}>Back to library</button><DocViewer d={open} field /></> : body}
        </div>
      </Page>
    );
  }
  return (
    <Page>
      <Title title="Library" sub="What the team knows, written down once. Procedures, manuals, troubleshooting notes, videos and the jobs that taught us." />
      <Grid cols={open ? "minmax(0,1fr) 430px" : "1fr"} gap={18} style={{ alignItems: "start" }}>
        {body}
        {open && <DocViewer d={open} onClose={() => clearSel("doc")} />}
      </Grid>
    </Page>
  );
}
