import type { ComponentType } from "react";
import Jobs from "./Jobs";
import Schedule from "./Schedule";
import Customers from "./Customers";
import Finance from "./Finance";
import Contracts from "./Contracts";
import People from "./People";
import Knowledge from "./Knowledge";
import { useCurran } from "../store";
import { Toast } from "../ui";

const PAGES: Record<string, ComponentType<{ v: any }>> = { Jobs, Schedule, Customers, Finance, Contracts, People, Knowledge };

/** Renders whichever Joe Curran Electrical module is the current page. */
export default function CurranPage({ v }: { v: any }) {
  const cur = useCurran();
  const C = PAGES[v.modulePage];
  return (
    <>
      {C && <C v={v} />}
      <Toast msg={cur.toast} />
    </>
  );
}
