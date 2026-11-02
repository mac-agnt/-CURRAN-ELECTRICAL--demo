import { STAFF, SKILLS, LEVEL_LABEL, TODAY, weekDates, slotFor, staffById, certDays, CERTS, jobById, siteById, goTo, dow } from "../../index";
import { Card, Pill, Grid, Avatar, Label, Ic } from "../../ui";
import { JOB_TINT, tint, jobShort, jobTown, HATCH } from "./common";

const SHORT_SKILL: Record<string, string> = { "Commercial Electrical": "Commercial", "Fire Systems": "Fire", CCTV: "CCTV", Intruder: "Intruder", Networking: "Network", "EV Charging": "EV", Testing: "Testing", "Emergency Lighting": "Em. lighting" };

export default function TeamTab() {
  const dates = weekDates("w0");
  return (
    <Grid cols="repeat(auto-fill, minmax(330px, 1fr))" gap={14}>
      {STAFF.map((s) => {
        const today = slotFor(s.id, TODAY);
        const site = today.kind === "job" && today.jobId ? siteById(jobById(today.jobId).siteId) : null;
        const strong = SKILLS.filter((k) => s.skills[k] >= 2).sort((a, b) => s.skills[b] - s.skills[a]);
        const exp = CERTS.filter((c) => c.staffId === s.id && certDays(c) <= 45);
        return (
          <Card key={s.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <Avatar staffId={s.id} size={40} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--dim)" }}>{s.title}</div>
              </div>
              {exp.length > 0 && <Pill tone="warn">{exp.length === 1 ? "1 record expiring" : exp.length + " expiring"}</Pill>}
            </div>
            <div style={{ padding: "9px 11px", borderRadius: 12, background: "var(--surface-2)" }}>
              <Label style={{ marginBottom: 4 }}>Today, {dow(TODAY)} 10 Nov</Label>
              {today.kind === "job" && today.jobId ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: JOB_TINT[today.jobId] }} />
                  <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500, flex: 1 }}>{jobShort(today.jobId)}</span>
                  <span style={{ fontSize: 12, color: "var(--dim)" }}>{site?.town}</span>
                  <button onClick={() => goTo("Jobs", "active", { job: today.jobId })} style={{ border: 0, background: "none", color: "var(--accent)", cursor: "pointer", display: "flex" }}><Ic n="arrow" size={13} /></button>
                </div>
              ) : <span style={{ fontSize: 13, color: "var(--body)" }}>{today.label}</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5 }}>
              {dates.map((d) => {
                const sl = slotFor(s.id, d);
                const bg = sl.kind === "job" && sl.jobId ? tint(JOB_TINT[sl.jobId], 24) : undefined;
                return (
                  <div key={d} title={sl.kind === "job" && sl.jobId ? jobShort(sl.jobId) : sl.label} style={{ borderRadius: 9, padding: "6px 4px", textAlign: "center", background: bg || "var(--surface-faint)", backgroundImage: sl.kind === "leave" ? HATCH : undefined, border: sl.kind === "pending-leave" ? "1px dashed var(--warn)" : undefined, outline: d === TODAY ? "1.5px solid var(--accent)" : undefined, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "var(--faint)" }}>{dow(d)}</div>
                    <div style={{ fontSize: 10.5, color: "var(--body)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sl.kind === "job" && sl.jobId ? jobTown(sl.jobId).slice(0, 7) : sl.kind === "leave" ? "Leave" : sl.kind === "training" ? "Course" : "Office"}</div>
                  </div>
                );
              })}
            </div>
            {s.field && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {strong.slice(0, 5).map((k) => <span key={k} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: s.skills[k] === 3 ? "var(--accent-soft)" : "var(--surface-2)", color: s.skills[k] === 3 ? "var(--accent)" : "var(--body)" }}>{SHORT_SKILL[k] + (s.skills[k] === 3 ? " " + LEVEL_LABEL[3] : "")}</span>)}
              </div>
            )}
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--dim)", flexWrap: "wrap" }}>
              <span>Based in {s.base}</span>
              {s.van && <span>{s.van}</span>}
              <span>{staffById(s.id).phone}</span>
            </div>
          </Card>
        );
      })}
    </Grid>
  );
}
