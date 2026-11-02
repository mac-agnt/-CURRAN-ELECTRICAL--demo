import { useCurran, tabsFor } from "../index";
import { Page, Title } from "../ui";
import { useAccess } from "./jobs/shared";
import Overview from "./jobs/Overview";
import { Active, Pipeline, Completed, Issues } from "./jobs/Lists";
import SitesMap from "./jobs/SitesMap";
import JobDetail from "./jobs/JobDetail";
import FieldTab from "../field/FieldTab";

const HEAD: Record<string, [string, string]> = {
  overview: ["Jobs overview", "Where every job stands, what it is earning, and what needs a decision today."],
  active: ["Active jobs", "Every job in progress, with progress, cost and margin side by side."],
  pipeline: ["Pipeline", "Quotes in play for the next six months and what they are worth."],
  completed: ["Completed", "Finished work and whether it has been invoiced."],
  issues: ["Issues and constraints", "What is stopping, slowing or costing the company on site."],
  sites: ["Sites", "Where the crews are and where the systems are installed."],
  field: ["Field app", "What a technician sees on their phone."],
};

export default function Jobs({ v }: { v: any }) {
  const cur = useCurran();
  const acc = useAccess();
  const allowed = tabsFor("Jobs", cur.role).map((t) => t[0]);
  const tab = allowed.indexOf(cur.tabs.Jobs) > -1 ? cur.tabs.Jobs : allowed[0];
  if (cur.sel.job) return <Page><JobDetail id={cur.sel.job} acc={acc} /></Page>;
  const [t, s] = HEAD[tab];
  return (
    <Page>
      <Title title={t} sub={s} />
      {tab === "overview" && <Overview acc={acc} />}
      {tab === "active" && <Active acc={acc} />}
      {tab === "pipeline" && <Pipeline acc={acc} />}
      {tab === "completed" && <Completed acc={acc} />}
      {tab === "issues" && <Issues acc={acc} />}
      {tab === "sites" && <SitesMap acc={acc} />}
      {tab === "field" && <FieldTab acc={acc} />}
    </Page>
  );
}
