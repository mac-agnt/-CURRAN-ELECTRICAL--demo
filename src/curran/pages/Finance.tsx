import { useCurran, can } from "../index";
import Overview from "./finance/Overview";
import Queue from "./finance/Queue";
import Debtors from "./finance/Debtors";
import Supplier from "./finance/Supplier";
import Profit from "./finance/Profit";
import Cash from "./finance/Cash";

export default function Finance({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.Finance;
  const margins = can(cur.role, "margins");
  if (tab === "queue") return <Queue />;
  if (tab === "debtors") return <Debtors />;
  if (tab === "supplier") return <Supplier />;
  if (tab === "profit") return <Profit margins={margins} />;
  if (tab === "cash") return <Cash />;
  return <Overview margins={margins} />;
}
