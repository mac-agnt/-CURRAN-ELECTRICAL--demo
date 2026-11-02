/* Shared presentation primitives for the Joe Curran Electrical modules.
   They use Pulse theme tokens only (var(--surface), var(--accent) ...) so every theme and the brand accent apply. */
import { CSSProperties, ReactNode, useState } from "react";
import { staffById } from "./core";

export type Tone = "ok" | "warn" | "bad" | "accent" | "neutral";
export const TONE: Record<Tone, { fg: string; bg: string }> = {
  ok: { fg: "var(--ok)", bg: "var(--ok-soft)" },
  warn: { fg: "var(--warn)", bg: "var(--warn-soft)" },
  bad: { fg: "var(--bad)", bg: "var(--bad-soft)" },
  accent: { fg: "var(--accent)", bg: "var(--accent-soft)" },
  neutral: { fg: "var(--dim)", bg: "var(--track)" },
};
export const MONO_LABEL: CSSProperties = { fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".12em", color: "var(--faint)", textTransform: "uppercase", fontWeight: 500 };

export const Page = ({ children, pad = "22px 28px 40px", gap = 16 }: { children: ReactNode; pad?: string; gap?: number }) => (
  <div style={{ padding: pad, display: "flex", flexDirection: "column", gap, minHeight: "100%" }}>{children}</div>
);
export const Grid = ({ cols, gap = 14, children, style }: { cols: string; gap?: number; children: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: "grid", gridTemplateColumns: cols, gap, alignItems: "stretch", ...style }}>{children}</div>
);
export const Card = ({ children, pad = 18, style, onClick, flush }: { children: ReactNode; pad?: number; style?: CSSProperties; onClick?: () => void; flush?: boolean }) => (
  <div onClick={onClick} className={onClick ? "ix11" : undefined}
    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--card-r,18px)", boxShadow: "var(--card-shadow)", padding: flush ? 0 : pad, minWidth: 0, overflow: flush ? "hidden" : undefined, cursor: onClick ? "pointer" : undefined, transition: "background .2s var(--ease), border-color .2s var(--ease)", ...style }}>
    {children}
  </div>
);
export const Head = ({ title, sub, right, small }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; small?: boolean }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: sub ? 12 : 10 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: small ? 13.5 : 15, fontWeight: 600, letterSpacing: "-.2px", color: "var(--ink)" }}>{title}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3, lineHeight: 1.45 }}>{sub}</div>}
    </div>
    {right}
  </div>
);
export const Title = ({ title, sub, right }: { title: ReactNode; sub?: ReactNode; right?: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
    <div style={{ flex: 1, minWidth: 260 }}>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-.7px", color: "var(--ink)", lineHeight: 1.15 }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, color: "var(--dim)", marginTop: 6, lineHeight: 1.5, maxWidth: 780 }}>{sub}</div>}
    </div>
    {right}
  </div>
);
export const Label = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ ...MONO_LABEL, ...style }}>{children}</div>;

export const Pill = ({ tone = "neutral", children, style }: { tone?: Tone; children: ReactNode; style?: CSSProperties }) => (
  <span style={{ display: "inline-flex", alignItems: "center", height: 22, padding: "0 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 500, whiteSpace: "nowrap", background: TONE[tone].bg, color: TONE[tone].fg, ...style }}>{children}</span>
);
export const Dot = ({ tone = "accent", size = 7 }: { tone?: Tone; size?: number }) => <span style={{ width: size, height: size, borderRadius: 99, background: TONE[tone].fg, flex: "none", display: "inline-block" }} />;

export const Btn = ({ children, kind = "ghost", onClick, small, disabled, style }: { children: ReactNode; kind?: "primary" | "ghost" | "danger"; onClick?: () => void; small?: boolean; disabled?: boolean; style?: CSSProperties }) => (
  <button disabled={disabled} onClick={onClick} className={kind === "primary" ? "ixp" : "ixz"}
    style={{ height: small ? 30 : 36, padding: small ? "0 13px" : "0 18px", borderRadius: "var(--cta-r,999px)", fontSize: small ? 12 : 13, fontWeight: 500, cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 7, transition: "background .2s var(--ease), transform .18s var(--ease), border-color .2s var(--ease)",
      ...(kind === "primary" ? { border: 0, background: "var(--accent-fill,var(--accent))", color: "var(--on-accent)", boxShadow: "var(--accent-glow,none)" } : kind === "danger" ? { border: "1px solid var(--bad)", background: "none", color: "var(--bad)" } : { border: "1px solid var(--border-strong)", background: "none", color: "var(--ink)" }), ...style }}>
    {children}
  </button>
);

export const Kpi = ({ label, value, hint, tone, delta, onClick, big }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone; delta?: string; onClick?: () => void; big?: boolean }) => (
  <Card pad={14} onClick={onClick} style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 84, justifyContent: "space-between" }}>
    <Label>{label}</Label>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: big ? 28 : 22, fontWeight: 600, letterSpacing: "-.8px", fontVariantNumeric: "tabular-nums", color: tone ? TONE[tone].fg : "var(--ink)", lineHeight: 1 }}>{value}</span>
      {delta && <span style={{ fontSize: 11.5, color: "var(--dim)" }}>{delta}</span>}
    </div>
    {hint && <div style={{ fontSize: 11.5, color: "var(--faint)", lineHeight: 1.35 }}>{hint}</div>}
  </Card>
);

export const Progress = ({ value, tone = "accent", h = 6, track = true }: { value: number; tone?: Tone; h?: number; track?: boolean }) => (
  <div style={{ height: h, borderRadius: 99, background: track ? "var(--track)" : "none", overflow: "hidden", width: "100%" }}>
    <div style={{ width: Math.max(0, Math.min(100, value)) + "%", height: "100%", borderRadius: 99, background: TONE[tone].fg, transition: "width .6s var(--ease)" }} />
  </div>
);

export const Avatar = ({ staffId, name, size = 28, tint }: { staffId?: string; name?: string; size?: number; tint?: string }) => {
  const s = staffId ? staffById(staffId) : undefined;
  const initials = s ? s.initials : (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <span title={s ? s.name : name} style={{ width: size, height: size, borderRadius: 99, background: tint || (s ? s.tint : "var(--accent-soft)"), color: "#08141c", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.36), fontWeight: 600, flex: "none" }}>{initials}</span>
  );
};
export const AvatarStack = ({ ids, size = 24 }: { ids: string[]; size?: number }) => (
  <span style={{ display: "inline-flex" }}>{ids.map((id, i) => <span key={id} style={{ marginLeft: i ? -7 : 0, boxShadow: "0 0 0 2px var(--surface)", borderRadius: 99 }}><Avatar staffId={id} size={size} /></span>)}</span>
);

export const Seg = <T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) => (
  <div style={{ display: "inline-flex", padding: 3, borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", gap: 2 }}>
    {options.map(([id, label]) => (
      <button key={id} onClick={() => onChange(id)} style={{ height: 28, padding: "0 13px", border: 0, borderRadius: 999, cursor: "pointer", fontSize: 12.5, whiteSpace: "nowrap", background: value === id ? "var(--pill-bg)" : "none", color: value === id ? "var(--pill-ink)" : "var(--dim)", fontWeight: value === id ? 600 : 500, transition: "background .2s var(--ease), color .2s var(--ease)" }}>{label}</button>
    ))}
  </div>
);

/** Row-based table on a CSS grid. `cols` is a grid-template-columns string, each row is an array of cells. */
export function Table({ cols, head, rows, onRow, dense, empty, foot, activeRow }: { cols: string; head: ReactNode[]; rows: ReactNode[][]; onRow?: (i: number) => void; dense?: boolean; empty?: string; foot?: ReactNode; activeRow?: number }) {
  const pad = dense ? "9px 14px" : "13px 16px";
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "fit-content" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, background: "var(--surface-faint)", borderBottom: "1px solid var(--border)" }}>
          {head.map((h, i) => <div key={i} style={{ padding: "10px 16px", fontSize: 11.5, fontWeight: 500, color: "var(--faint)", whiteSpace: "nowrap" }}>{h}</div>)}
        </div>
        {rows.map((r, ri) => (
          <div key={ri} className={onRow ? "ix11" : undefined} onClick={onRow ? () => onRow(ri) : undefined}
            style={{ display: "grid", gridTemplateColumns: cols, borderTop: ri ? "1px solid var(--border)" : undefined, cursor: onRow ? "pointer" : undefined, background: activeRow === ri ? "var(--accent-faint)" : undefined, transition: "background .2s var(--ease)" }}>
            {r.map((c, ci) => <div key={ci} style={{ padding: pad, display: "flex", alignItems: "center", minWidth: 0, fontSize: 13, color: "var(--body)" }}>{c}</div>)}
          </div>
        ))}
        {!rows.length && <div style={{ padding: "36px 16px", textAlign: "center", color: "var(--dim)", fontSize: 13 }}>{empty || "Nothing here"}</div>}
        {foot && <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", background: "var(--surface-faint)", fontSize: 12, color: "var(--faint)" }}>{foot}</div>}
      </div>
    </div>
  );
}
export const Strong = ({ children, mono }: { children: ReactNode; mono?: boolean }) => <span style={{ color: "var(--ink)", fontWeight: 500, fontFamily: mono ? "var(--mono)" : undefined, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</span>;
export const Muted = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <span style={{ color: "var(--dim)", fontSize: 12.5, ...style }}>{children}</span>;
export const Ellip = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...style }}>{children}</span>;
export const Back = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button onClick={onClick} className="ix2" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7, height: 30, padding: "0 12px 0 8px", border: "1px solid var(--border)", borderRadius: 999, background: "none", color: "var(--dim)", fontSize: 12.5, cursor: "pointer" }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 6-6 6 6 6" /></svg>{label}
  </button>
);
export const Tabs = ({ tabs, value, onChange }: { tabs: [string, string][]; value: string; onChange: (id: string) => void }) => (
  <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
    {tabs.map(([id, label]) => (
      <button key={id} onClick={() => onChange(id)} style={{ height: 38, padding: "0 14px", border: 0, background: "none", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", color: value === id ? "var(--ink)" : "var(--dim)", fontWeight: value === id ? 600 : 500, borderBottom: "2px solid " + (value === id ? "var(--accent)" : "transparent"), marginBottom: -1, transition: "color .2s var(--ease)" }}>{label}</button>
    ))}
  </div>
);
export const Callout = ({ tone = "accent", title, children, right }: { tone?: Tone; title: ReactNode; children?: ReactNode; right?: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: "var(--r-md,14px)", background: TONE[tone].bg, border: "1px solid " + (tone === "neutral" ? "var(--border)" : "color-mix(in srgb," + TONE[tone].fg + " 28%, transparent)") }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
      {children && <div style={{ fontSize: 12.5, color: "var(--body)", marginTop: 3, lineHeight: 1.5 }}>{children}</div>}
    </div>
    {right}
  </div>
);

/* ---------- small icons ---------- */
const P: Record<string, string> = {
  check: "M5 12.5l4.2 4.2L19 7", alert: "M12 4 2.8 19.5h18.4L12 4Z M12 10v4.5 M12 17.2h.01", clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2",
  camera: "M4 8h3l1.6-2.4h6.8L17 8h3v11H4V8Z M12 16.5a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6Z", mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z M6 11.5a6 6 0 0 0 12 0 M12 17.5V21",
  doc: "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4", pin: "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  phone: "M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A14.5 14.5 0 0 1 4.5 6a2 2 0 0 1 2-2Z", plus: "M12 5v14 M5 12h14",
  arrow: "M5 12h14 M13 6l6 6-6 6", chevron: "m9 6 6 6-6 6", search: "m21 21-4.3-4.3 M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0", bolt: "M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z",
  qr: "M4 4h6v6H4V4Z M14 4h6v6h-6V4Z M4 14h6v6H4v-6Z M14 14h2.5v2.5H14V14Z M17.5 17.5H20V20h-2.5v-2.5Z M14 18.5V20 M20 14v1.5", send: "M3.5 12 20.5 4 16 20l-3.4-6.6L3.5 12Z",
  play: "M8 5.5v13l11-6.5-11-6.5Z", sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z", user: "M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  lock: "M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3", wrench: "M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5Z",
  flag: "M5 21V4 M5 5h12l-2 4 2 4H5", mail: "M4 7.2 12 13l8-5.8 M4 7.2v10.6h16V7.2H4Z", link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
};
export const Ic = ({ n, size = 15, color, sw = 1.7 }: { n: keyof typeof P | string; size?: number; color?: string; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d={P[n] || n} /></svg>
);

/* ---------- charts (SVG, token coloured) ---------- */
export function Spark({ data, w = 90, h = 28, tone = "accent", fill = true }: { data: number[]; w?: number; h?: number; tone?: Tone; fill?: boolean }) {
  if (data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - 3 - ((d - mn) / rg) * (h - 6)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flex: "none", overflow: "visible" }}>
      {fill && <path d={line + ` L${w} ${h} L0 ${h} Z`} fill={TONE[tone].fg} opacity=".12" />}
      <path d={line} fill="none" stroke={TONE[tone].fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Columns({ data, height = 150, format = (n: number) => String(n), highlight }: { data: { label: string; value: number; tone?: Tone; note?: string }[]; height?: number; format?: (n: number) => string; highlight?: number }) {
  const [hov, setHov] = useState<number | null>(null);
  const mx = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height, paddingTop: 20 }}>
      {data.map((d, i) => {
        const on = hov === i || highlight === i;
        return (
          <div key={i} onPointerEnter={() => setHov(i)} onPointerLeave={() => setHov(null)} style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6, position: "relative" }}>
            <span style={{ fontSize: 11, color: on ? "var(--ink)" : "var(--faint)", fontVariantNumeric: "tabular-nums", transition: "color .2s" }}>{format(d.value)}</span>
            <div style={{ width: "100%", maxWidth: 36, height: Math.max(3, (d.value / mx) * (height - 46)), borderRadius: "7px 7px 3px 3px", background: d.tone ? TONE[d.tone].fg : "var(--accent)", opacity: on || hov === null ? 1 : 0.45, transition: "opacity .2s var(--ease), height .5s var(--ease)" }} />
            <span style={{ fontSize: 10.5, color: "var(--faint)", whiteSpace: "nowrap" }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
export function Area({ series, labels, height = 150, format = (n: number) => String(n) }: { series: { name: string; data: number[]; tone?: Tone; dash?: boolean }[]; labels: string[]; height?: number; format?: (n: number) => string }) {
  const W = 600, H = height, pl = 8, pr = 8, pt = 12, pb = 22;
  const all = series.flatMap((s) => s.data), mn = Math.min(0, ...all), mx = Math.max(...all) * 1.08 || 1;
  const x = (i: number) => pl + (i / Math.max(1, labels.length - 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={pl} x2={W - pr} y1={pt + g * (H - pt - pb)} y2={pt + g * (H - pt - pb)} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
      {series.map((s, si) => {
        const d = s.data.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
        return (
          <g key={si}>
            {si === 0 && !s.dash && <path d={d + ` L${x(s.data.length - 1)} ${H - pb} L${x(0)} ${H - pb} Z`} fill={TONE[s.tone || "accent"].fg} opacity=".1" />}
            <path d={d} fill="none" stroke={TONE[s.tone || "accent"].fg} strokeWidth="2" strokeDasharray={s.dash ? "5 5" : undefined} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </g>
        );
      })}
      {labels.map((l, i) => (i % Math.ceil(labels.length / 7) === 0 || i === labels.length - 1) && <text key={i} x={x(i)} y={H - 5} textAnchor="middle" fontSize="10" fill="var(--faint)">{l}</text>)}
      <text x={W - pr} y={pt - 2} textAnchor="end" fontSize="10" fill="var(--faint)">{format(Math.round(mx))}</text>
    </svg>
  );
}
export function HBars({ rows, format = (n: number) => String(n), max }: { rows: { label: ReactNode; value: number; tone?: Tone; note?: ReactNode }[]; format?: (n: number) => string; max?: number }) {
  const mx = max || Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 12.5, marginBottom: 5 }}>
            <span style={{ flex: 1, minWidth: 0, color: "var(--body)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
            {r.note && <span style={{ color: "var(--faint)", fontSize: 11.5 }}>{r.note}</span>}
            <span style={{ color: "var(--ink)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{format(r.value)}</span>
          </div>
          <Progress value={(r.value / mx) * 100} tone={r.tone || "accent"} h={6} />
        </div>
      ))}
    </div>
  );
}
/** Scatter: x and y are 0-100 percentages, used for progress against margin. */
export function Scatter({ points, xLabel, yLabel, height = 220, band }: { points: { id: string; label: string; x: number; y: number; r?: number; tone?: Tone }[]; xLabel: string; yLabel: string; height?: number; band?: { y: number; label: string } }) {
  const [hov, setHov] = useState<string | null>(null);
  const W = 520, H = height, pl = 40, pr = 14, pt = 12, pb = 30;
  const xs = (v: number) => pl + (v / 100) * (W - pl - pr), ys = (v: number) => pt + (1 - v / 40) * (H - pt - pb);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 10, 20, 30, 40].map((g) => <g key={g}><line x1={pl} x2={W - pr} y1={ys(g)} y2={ys(g)} stroke="var(--border)" /><text x={pl - 6} y={ys(g) + 3} fontSize="10" textAnchor="end" fill="var(--faint)">{g}%</text></g>)}
      {[0, 25, 50, 75, 100].map((g) => <text key={g} x={xs(g)} y={H - 10} fontSize="10" textAnchor="middle" fill="var(--faint)">{g}%</text>)}
      {band && <g><line x1={pl} x2={W - pr} y1={ys(band.y)} y2={ys(band.y)} stroke="var(--warn)" strokeDasharray="4 4" opacity=".7" /><text x={W - pr} y={ys(band.y) - 5} fontSize="10" textAnchor="end" fill="var(--warn)">{band.label}</text></g>}
      <text x={(W + pl) / 2} y={H - 0} fontSize="10" textAnchor="middle" fill="var(--faint)" dy="-1">{xLabel}</text>
      <text transform={`translate(10 ${H / 2}) rotate(-90)`} fontSize="10" textAnchor="middle" fill="var(--faint)">{yLabel}</text>
      {points.map((p) => (
        <g key={p.id} onPointerEnter={() => setHov(p.id)} onPointerLeave={() => setHov(null)} style={{ cursor: "default" }}>
          <circle cx={xs(p.x)} cy={ys(p.y)} r={(p.r || 8) + (hov === p.id ? 2 : 0)} fill={TONE[p.tone || "accent"].fg} opacity={hov && hov !== p.id ? 0.35 : 0.85} style={{ transition: "r .2s, opacity .2s" }} />
          {hov === p.id && <g><rect x={Math.min(xs(p.x) + 12, W - 190)} y={ys(p.y) - 30} width="178" height="22" rx="7" fill="var(--tooltip)" stroke="var(--border)" /><text x={Math.min(xs(p.x) + 21, W - 181)} y={ys(p.y) - 15} fontSize="11" fill="var(--tooltip-ink)">{p.label}</text></g>}
        </g>
      ))}
    </svg>
  );
}
export const Divider = () => <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />;
export const Empty = ({ title, sub }: { title: string; sub?: string }) => (
  <div style={{ padding: "44px 20px", textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{title}</div>{sub && <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 6 }}>{sub}</div>}</div>
);
export const Toast = ({ msg }: { msg: string }) => !msg ? null : (
  <div style={{ position: "fixed", left: "50%", bottom: 28, transform: "translateX(-50%)", zIndex: 120, padding: "11px 18px", borderRadius: 999, background: "var(--tooltip)", color: "var(--tooltip-ink)", border: "1px solid var(--border-strong)", fontSize: 13, boxShadow: "0 16px 40px rgba(0,0,0,.45)", display: "flex", alignItems: "center", gap: 9, animation: "riseIn .3s var(--ease) both" }}>
    <Ic n="check" color="var(--ok)" size={14} sw={2.2} />{msg}
  </div>
);
