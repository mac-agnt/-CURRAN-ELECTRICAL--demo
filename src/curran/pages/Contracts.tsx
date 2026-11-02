import { useCurran } from "../index";
import Overview from "./contracts/Overview";
import List from "./contracts/List";
import Renewals from "./contracts/Renewals";
import Service from "./contracts/Service";
import Revenue from "./contracts/Revenue";

export default function Contracts({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.Contracts;
  if (tab === "contracts") return <List />;
  if (tab === "renewals") return <Renewals />;
  if (tab === "service") return <Service />;
  if (tab === "revenue") return <Revenue />;
  return <Overview />;
}
