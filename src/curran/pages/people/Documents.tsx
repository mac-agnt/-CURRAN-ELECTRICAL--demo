import { useRef, useState } from "react";
import { STAFF, staffById, certDays, fmtDate, fmtDateY, toast, TODAY } from "../../index";
import { Card, Head, Pill, Btn, Ic, Table, Avatar, Strong, Muted, Grid, Kpi, Tone } from "../../ui";
import { DOCS, Doc, DocCategory } from "./docs";
import { certTone } from "./TeamTab";

const CATS: ("All" | DocCategory)[] = ["All", "Contract", "Certificates", "Licences", "Emergency", "PPE", "Site clearance", "Vehicle"];

export default function Documents() {
  const [q, setQ] = useState("");
  const [emp, setEmp] = useState("all");
  const [cat, setCat] = useState<string>("All");
  const [extra, setExtra] = useState<Doc[]>([]);
  const [target, setTarget] = useState("kyle");
  const ref = useRef<HTMLInputElement>(null);
  const all = extra.concat(DOCS);
  const rows = all.filter((d) => (emp === "all" || d.staffId === emp) && (cat === "All" || d.category === cat) && (!q || (d.name + " " + staffById(d.staffId).name).toLowerCase().indexOf(q.toLowerCase()) > -1));
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) { setExtra((x) => [{ id: "U-" + (x.length + 1), staffId: target, name: f.name, category: "Certificates" as DocCategory, added: TODAY, size: (f.size / 1048576).toFixed(1) + " MB", by: "caitlin" }].concat(x)); toast(f.name + " added to " + staffById(target).name + "'s folder"); }
    e.target.value = "";
  };
  const state = (d: Doc): [string, Tone] => { if (!d.expires) return ["No expiry", "neutral"]; const n = certDays({ expires: d.expires } as any); return n < 0 ? ["Expired", "bad"] : n <= 45 ? ["Expires in " + n + "d", certTone(n)] : ["Valid to " + fmtDate(d.expires) + " " + d.expires.slice(2, 4), "neutral"]; };
  const sel: React.CSSProperties = { height: 34, padding: "0 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)", fontSize: 13, outline: 0 };
  return (
    <>
      <input ref={ref} type="file" onChange={onFile} style={{ display: "none" }} />
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Kpi label="Documents" value={all.length} hint="across 9 employee folders" />
        <Kpi label="With an expiry date" value={all.filter((d) => d.expires).length} hint="tracked by the Compliance Agent" />
        <Kpi label="Expiring within 45 days" value={all.filter((d) => d.expires && certDays({ expires: d.expires } as any) <= 45).length} tone="warn" hint="Safe Pass, Manual Handling" />
        <Kpi label="Folders complete" value="9 of 9" hint="contract and emergency form on file" />
      </Grid>
      <Card flush>
        <div style={{ display: "flex", gap: 10, padding: "14px 16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: 9, color: "var(--faint)" }}><Ic n="search" size={15} /></span>
            <input className="ixi" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents or people" style={{ ...sel, width: "100%", paddingLeft: 34 }} />
          </div>
          <select className="ixi" value={emp} onChange={(e) => setEmp(e.target.value)} style={sel}><option value="all">Everyone</option>{STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select className="ixi" value={cat} onChange={(e) => setCat(e.target.value)} style={sel}>{CATS.map((c) => <option key={c} value={c}>{c === "All" ? "All types" : c}</option>)}</select>
          <span style={{ flex: "0 0 1px", height: 20, background: "var(--border)" }} />
          <select className="ixi" value={target} onChange={(e) => setTarget(e.target.value)} style={sel} title="Folder to upload into">{STAFF.map((s) => <option key={s.id} value={s.id}>{"Into " + s.first}</option>)}</select>
          <Btn kind="primary" small onClick={() => ref.current?.click()}><Ic n="plus" size={13} />Upload</Btn>
        </div>
        <Table cols="2.4fr 1.2fr 1fr .9fr 1.3fr .6fr" dense empty="No documents match" head={["Document", "Employee", "Type", "Added", "State", "Size"]}
          onRow={(i) => toast("Opening " + rows[i].name)}
          rows={rows.map((d) => { const [t, tone] = state(d); return [
            <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}><span style={{ color: "var(--dim)", display: "flex" }}><Ic n="doc" size={15} /></span><Strong>{d.name}</Strong></span>,
            <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Avatar staffId={d.staffId} size={22} /><Muted>{staffById(d.staffId).first}</Muted></span>,
            <Muted>{d.category}</Muted>, <Muted>{fmtDateY(d.added).replace(/ 20/, " ")}</Muted>,
            tone === "neutral" ? <Muted>{t}</Muted> : <Pill tone={tone}>{t}</Pill>, <Muted>{d.size}</Muted>]; })}
          foot={rows.length + " of " + all.length + " documents. Same folder-per-employee structure as before, now tied to the expiry watch and the planner."} />
      </Card>
    </>
  );
}
