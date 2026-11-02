import { useState } from "react";
import { COMPANY_MEMORY } from "../logic/curranContent";
import { Card, Head, Btn, Ic, Progress, Pill, Label } from "./ui";

/* Settings: the company memory import. Pulse structures existing history instead of starting from zero. */
export default function CompanyMemory() {
  const [ran, setRan] = useState(false);
  return (
    <div style={{ padding: "0 4px 22px" }}>
      <Card>
        <Head title="Company Memory Import" sub="Seven years of Dropbox folders, Excel workbooks and Tradify jobs become structured records. Nothing is retyped and Dropbox stays where it is."
          right={<div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pill tone={ran ? "ok" : "accent"}>{ran ? "Re-indexed just now" : "Last run 6 Nov"}</Pill><Btn small onClick={() => setRan(true)}><Ic n="bolt" size={13} />Re-run import</Btn></div>} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10 }}>
          {COMPANY_MEMORY.map((m) => (
            <div key={m[0] as string} style={{ padding: "12px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md,14px)", display: "flex", flexDirection: "column", gap: 6 }}>
              <Label>{m[0] as string}</Label>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.7px", color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{m[1] as string}</div>
              <div style={{ fontSize: 11.5, color: "var(--dim)" }}>{m[2] as string}</div>
              <Progress value={(m[3] as number) * 100} h={4} tone={(m[3] as number) >= 1 ? "ok" : "accent"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
