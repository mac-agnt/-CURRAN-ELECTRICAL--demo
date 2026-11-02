import { useCurran } from "../store";
import { Page, Title, Pill } from "../ui";
import { MODULE_META } from "../modules";
import Planner from "./schedule/Planner";
import TeamTab from "./schedule/TeamTab";
import LeaveBoard from "./schedule/LeaveBoard";
import Capacity from "./schedule/Capacity";

const COPY: Record<string, [string, string]> = {
  planner: ["Planner", "Jobs, people, leave, training and certification in one week view. Every assignment is checked before it lands."],
  team: ["Team", "Who is where today, this week's plan, vehicles and what each person is competent to do."],
  leave: ["Leave", "Absence made obvious, and checked against the jobs it would leave short."],
  capacity: ["Capacity", "Staff-days, skills still free and incoming work, so Seamus stops holding the rota in his head."],
};

export default function Schedule({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.Schedule;
  const [title, sub] = COPY[tab] || COPY.planner;
  return (
    <Page>
      <Title title={title} sub={sub} right={cur.role === "senior" ? <Pill>Read only</Pill> : undefined} />
      {tab === "planner" && <Planner />}
      {tab === "team" && <TeamTab />}
      {tab === "leave" && <LeaveBoard mode="schedule" />}
      {tab === "capacity" && <Capacity />}
    </Page>
  );
}
