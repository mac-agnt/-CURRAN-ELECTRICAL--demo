import { CONTRACTS, addDays, dayDiff, eur, fmtDate, fmtDow, goTo, staffById, TODAY, dow } from "../../index";
import { Page, Title, Grid, Card, Head, Pill, Btn, Table, Strong, Avatar, Columns, Kpi } from "../../ui";
import { Sub } from "../finance/shared";
import { siteLabel, systemLabel, techFor } from "./shared";

export default function Service() {
  const visits = CONTRACTS.filter((c) => dayDiff(c.nextService) >= 0 && dayDiff(c.nextService) <= 90).sort((a, b) => a.nextService.localeCompare(b.nextService));
  const due30 = visits.filter((c) => dayDiff(c.nextService) <= 30);
  const wk7 = visits.filter((c) => dayDiff(c.nextService) <= 7);
  const weeks = Array.from({ length: 8 }, (_, w) => ({ label: fmtDate(addDays(TODAY, w * 7)), value: visits.filter((c) => Math.floor(dayDiff(c.nextService) / 7) === w).length }));
  return (
    <Page>
      <Title title="Service Schedule" sub="Every contract has a next service date. The Contracts Agent turns each one into a visit in the planner, matched to the technician with the right skills and certificates." right={<Btn kind="primary" onClick={() => goTo("Schedule", "planner")}>Open planner</Btn>} />
      <Grid cols="repeat(4,minmax(0,1fr))" gap={12}>
        <Kpi label="Visits due, 30 days" value={due30.length} hint="Contract service dates" />
        <Kpi label="Visits this week" value={wk7.length} hint={wk7.length ? "Next: " + wk7[0].customer : "None"} />
        <Kpi label="Next 90 days" value={visits.length} hint="Planned visits" />
        <Kpi label="Billed with visit" value={eur(due30.reduce((a, c) => a + c.billing, 0))} hint="Annual value of contracts visited in 30 days" />
      </Grid>
      <Grid cols="minmax(0,1fr) minmax(0,1.9fr)" gap={16}>
        <Card><Head title="Visits per week" sub="Next eight weeks, all contracts" /><Columns data={weeks} height={170} /></Card>
        <Card flush style={{ alignSelf: "start" }}>
          <Table dense cols="90px minmax(200px,1.6fr) minmax(150px,1.2fr) minmax(160px,1fr)" head={["Due", "Customer and contract", "System", "Suggested technician"]}
            onRow={(i) => goTo("Contracts", "contracts", { contract: visits[i].id })}
            rows={visits.slice(0, 14).map((c) => [<span style={{ fontFamily: "var(--mono)", fontSize: 11.5 }}>{fmtDow(c.nextService)}</span>, <div style={{ minWidth: 0 }}><Strong>{c.customer}</Strong><Sub>{c.type}</Sub></div>, <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{systemLabel(c)}</span>, <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar staffId={techFor(c)} size={22} /><span style={{ fontSize: 12.5 }}>{staffById(techFor(c)).name}</span></div>])}
            foot={"Showing the next 14 of " + visits.length + " visits in the next 90 days."} />
        </Card>
      </Grid>
    </Page>
  );
}
