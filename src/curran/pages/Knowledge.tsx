import { useCurran } from "../index";
import Library from "./knowledge/Library";
import Ask from "./knowledge/Ask";
import { SystemsTab, ProceduresTab, TrainingTab } from "./knowledge/Sections";

/** Field knowledge base: library, systems, procedures, training and the Site Knowledge Agent. */
export default function Knowledge({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.Knowledge;
  if (tab === "systems") return <SystemsTab />;
  if (tab === "procedures") return <ProceduresTab />;
  if (tab === "training") return <TrainingTab />;
  if (tab === "ask") return <Ask />;
  return <Library />;
}
