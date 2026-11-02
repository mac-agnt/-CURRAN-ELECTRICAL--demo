import { useCurran, can } from "../index";
import { Page, Title, Empty } from "../ui";
import Overview from "./customers/Overview";
import { CustomerTable, CustomerDetail } from "./customers/CustomerList";
import { SitesTab, SystemsTab, ContactsTab } from "./customers/Lists";
import { SystemRecord, SiteRecord } from "./customers/SiteRecord";

/** Customers, sites, installed systems and the QR site record. */
export default function Customers({ v }: { v: any }) {
  const cur = useCurran();
  const tab = cur.tabs.Customers;
  if (!can(cur.role, "customers")) return <Page><Title title="Customers" /><Empty title="Not available for your role" sub="Ask Caitlin or Seamus for customer details." /></Page>;
  /* a record opened from anywhere (QR scan, Knowledge, Jobs) takes over the page */
  if (cur.sel.system) return <SystemRecord id={cur.sel.system} />;
  if (cur.sel.site) return <SiteRecord id={cur.sel.site} />;
  if (cur.sel.customer) return <CustomerDetail id={cur.sel.customer} />;
  if (tab === "customers") return <CustomerTable />;
  if (tab === "sites") return <SitesTab />;
  if (tab === "systems") return <SystemsTab />;
  if (tab === "contacts") return <ContactsTab />;
  return <Overview />;
}
