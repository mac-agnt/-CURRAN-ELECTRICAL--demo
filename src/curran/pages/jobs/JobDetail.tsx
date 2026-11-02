import { jobById, jobFin, customerById, siteById, select, clearSel, goTo, toast, useCurran, eur, pct, fmtDate, TODAY } from "../../index";
import { Back, Tabs, Title, Pill, AvatarStack, Btn, Ic, Progress, Muted } from "../../ui";
import { Access, StatusPill, who } from "./shared";
import { OverviewTab, FinancialsTab, ScheduleTab, TeamTab } from "./JobTabsA";
import { UpdatesTab, CostsTab, DocumentsTab, PhotosTab, IssuesTab, ActivityTab } from "./JobTabsB";

const ALL_TABS: [string, string][] = [["overview", "Overview"], ["financials", "Financials"], ["schedule", "Schedule"], ["team", "Team"], ["updates", "Updates"], ["costs", "Costs"], ["documents", "Documents"], ["photos", "Photos"], ["issues", "Issues"], ["activity", "Activity"]];

export default function JobDetail({ id, acc }: { id: string; acc: Access }) {
  const cur = useCurran();
  const j = jobById(id);
  const tabs = ALL_TABS.filter(([t]) => (t !== "financials" && t !== "costs") || acc.lvl >= 1);
  const asked = cur.sel.jobTab || "overview";
  const tab = tabs.some(([t]) => t === asked) ? asked : "overview";
  const cust = customerById(j.customerId), site = siteById(j.siteId), f = jobFin(j);
  return (
    <>
      <Back label="All jobs" onClick={() => clearSel("job", "jobTab")} />
      <Title
        title={<span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>{j.name}<StatusPill status={j.status} /></span>}
        sub={<>{cust.name}, {site.address}. <span style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{j.id}</span></>}
        right={
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ minWidth: 190 }}>
              <div style={{ display: "flex", fontSize: 12, color: "var(--dim)", marginBottom: 6 }}><span style={{ flex: 1 }}>Progress</span><span style={{ color: "var(--ink)", fontWeight: 600 }}>{j.progress}%</span></div>
              <Progress value={j.progress} tone={j.progress === 100 ? "ok" : "accent"} h={7} />
            </div>
            <AvatarStack ids={j.crew} size={28} />
            <Btn small onClick={() => goTo("Customers", "sites", { site: j.siteId })}><Ic n="qr" size={14} />Site record</Btn>
            <Btn small kind="primary" onClick={() => toast("Message sent to " + j.crew.length + " crew members on " + j.name)}><Ic n="send" size={13} />Message crew</Btn>
          </div>
        }
      />
      <Tabs tabs={tabs} value={tab} onChange={(t) => select({ jobTab: t })} />
      {tab === "overview" && <OverviewTab j={j} acc={acc} />}
      {tab === "financials" && <FinancialsTab j={j} acc={acc} />}
      {tab === "schedule" && <ScheduleTab j={j} />}
      {tab === "team" && <TeamTab j={j} acc={acc} />}
      {tab === "updates" && <UpdatesTab j={j} acc={acc} />}
      {tab === "costs" && <CostsTab j={j} acc={acc} />}
      {tab === "documents" && <DocumentsTab j={j} acc={acc} />}
      {tab === "photos" && <PhotosTab j={j} />}
      {tab === "issues" && <IssuesTab j={j} acc={acc} />}
      {tab === "activity" && <ActivityTab j={j} acc={acc} />}
    </>
  );
}
