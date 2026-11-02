import { useCurran } from "../store";
import { Page, Title, Callout, Ic } from "../ui";
import TeamTab from "./people/TeamTab";
import Compliance from "./people/Compliance";
import LeaveBoard from "./schedule/LeaveBoard";
import Skills from "./people/Skills";
import Documents from "./people/Documents";

const COPY: Record<string, [string, string]> = {
  team: ["Team", "Nine people, one record each: role, contact, emergency details, permissions, skills and files."],
  compliance: ["Compliance", "Safe Pass, Manual Handling, licences and training, watched for expiry so Caitlin handles renewals, not searches."],
  leave: ["Leave", "Balances and requests by person, on the same records the planner checks."],
  skills: ["Skills", "Who can do what, so scheduling matches work to competence."],
  documents: ["Documents", "Employee folders: contracts, cards, licences, training certificates and emergency forms."],
};

export default function People({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.People;
  if (cur.role !== "md" && cur.role !== "admin") {
    return <Page><Title title="People" /><Callout tone="neutral" title="People is restricted to Seamus and Caitlin">Staff records, leave balances and compliance documents are kept private. Your own certificates and schedule are in the field app.</Callout></Page>;
  }
  const [title, sub] = COPY[tab] || COPY.team;
  return (
    <Page>
      <Title title={title} sub={sub} />
      {tab === "team" && <TeamTab />}
      {tab === "compliance" && <Compliance />}
      {tab === "leave" && <LeaveBoard mode="people" />}
      {tab === "skills" && <Skills />}
      {tab === "documents" && <Documents />}
    </Page>
  );
}
