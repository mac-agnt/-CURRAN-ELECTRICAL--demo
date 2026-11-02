/* Which pages exist, their top-bar tabs and who may open them. */
import { can } from "./core";
import type { Perm, RoleKey } from "./core";

export const MODULE_PAGES = ["Jobs", "Schedule", "Customers", "Finance", "Contracts", "People", "Knowledge"] as const;
export type ModulePage = (typeof MODULE_PAGES)[number];
export const isModulePage = (p: string): p is ModulePage => (MODULE_PAGES as readonly string[]).indexOf(p) > -1;

export const MODULE_META: Record<ModulePage, { label: string; tabs: [string, string][]; hint: string; search: string }> = {
  Jobs: { label: "Jobs", hint: "JOBS · LIVE FROM SITE", search: "Search jobs, sites and updates",
    tabs: [["overview", "Overview"], ["active", "Active"], ["pipeline", "Pipeline"], ["completed", "Completed"], ["issues", "Issues"], ["sites", "Sites"], ["field", "Field app"]] },
  Schedule: { label: "Schedule", hint: "SCHEDULE · JOBS, STAFF AND LEAVE", search: "Search the planner",
    tabs: [["planner", "Planner"], ["team", "Team"], ["leave", "Leave"], ["capacity", "Capacity"]] },
  Customers: { label: "Customers", hint: "CUSTOMERS · SITES · SYSTEMS", search: "Search customers, sites and systems",
    tabs: [["overview", "Overview"], ["customers", "Customers"], ["sites", "Sites"], ["systems", "Systems"], ["contacts", "Contacts"]] },
  Finance: { label: "Finance", hint: "FINANCE · REDBOOK STAYS THE LEDGER", search: "Search invoices and costs",
    tabs: [["overview", "Overview"], ["queue", "Invoice Queue"], ["debtors", "Debtors"], ["supplier", "Supplier Costs"], ["profit", "Job Profitability"], ["cash", "Cash Outlook"]] },
  Contracts: { label: "Service Contracts", hint: "RECURRING REVENUE", search: "Search contracts",
    tabs: [["overview", "Overview"], ["contracts", "Contracts"], ["renewals", "Renewals"], ["service", "Service Schedule"], ["revenue", "Revenue"]] },
  People: { label: "People", hint: "PEOPLE · COMPLIANCE · SKILLS", search: "Search people and documents",
    tabs: [["team", "Team"], ["compliance", "Compliance"], ["leave", "Leave"], ["skills", "Skills"], ["documents", "Documents"]] },
  Knowledge: { label: "Knowledge", hint: "FIELD KNOWLEDGE BASE", search: "Search the knowledge base",
    tabs: [["library", "Library"], ["systems", "Systems"], ["procedures", "Procedures"], ["training", "Training"], ["ask", "Ask Pulse"]] },
};

/* Rail order. Home and Agents come first (locked by the template); the rest follow the client brief. */
export const NAV_ORDER = ["Home", "Agents", "Jobs", "Schedule", "Customers", "Finance", "Contracts", "People", "Knowledge", "Dashboard", "Work", "Records", "Activity"] as const;
export const PAGE_PERM: Record<string, Perm | "md" | "office" | null> = {
  Home: null, Agents: "office", Jobs: null, Schedule: "schedule", Customers: "customers", Finance: "finance", Contracts: "contracts", People: "people",
  Knowledge: null, Dashboard: "margins", Work: "office", Records: "office", Activity: "office", Settings: "settings",
};

/** Tabs a role may open on a module page. Finance margins stay with the managing director. */
export function tabsFor(page: ModulePage, role: RoleKey): [string, string][] {
  const all = MODULE_META[page].tabs;
  const keep = (ids: string[]) => all.filter((t) => ids.indexOf(t[0]) > -1);
  if (page === "Finance" && !can(role, "margins")) return all.filter((t) => t[0] !== "profit");
  if (page === "Jobs") {
    if (role === "senior") return keep(["active", "issues", "sites", "field"]);
    if (role === "electrician" || role === "apprentice") return keep(["active", "field"]);
  }
  return all;
}
