import { useCurran, setRole } from "./store";
import { ROLES } from "./core";

/** Demo control in the sidebar: view Pulse as each permission group. */
export default function RoleSwitch() {
  const cur = useCurran();
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: ".14em", color: "var(--faint)", marginBottom: 6 }}>VIEW PULSE AS</div>
      <select value={cur.role} onChange={(e) => setRole(e.target.value as any)} className="ixi"
        style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: "var(--r-ctl,999px)", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)", fontSize: 12.5, cursor: "pointer", outline: 0 }}>
        {ROLES.map((r) => <option key={r.key} value={r.key}>{r.who + " · " + r.label}</option>)}
      </select>
    </div>
  );
}
