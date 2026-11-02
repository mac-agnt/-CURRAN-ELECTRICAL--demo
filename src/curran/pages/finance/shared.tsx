import { CSSProperties, ReactNode } from "react";
import { QUEUE, QueueItem, QueueStage, customerById, dayDiff } from "../../index";
import { FinState } from "./state";
import { Pill, Tone } from "../../ui";

export const stageOf = (q: QueueItem, f: FinState): QueueStage => f.stage[q.id] || q.stage;
export const stageTone = (s: QueueStage): Tone => s === "Paid" ? "ok" : s === "Sent" ? "accent" : s === "Approved" ? "accent" : s === "Awaiting approval" ? "warn" : s === "Draft prepared" ? "neutral" : "neutral";
export const custName = (id: string) => customerById(id).name;
export const ageLabel = (n: number) => (n <= 0 ? "today" : n === 1 ? "1 day" : n + " days");
export const queueItems = (f: FinState) => QUEUE.filter((q) => !f.rejected[q.id]);
export const Sub = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <div style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.45, ...style }}>{children}</div>;
export const StagePill = ({ s }: { s: QueueStage }) => <Pill tone={stageTone(s)}>{s}</Pill>;
export const monthLabel = (d: string) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(d.slice(5, 7), 10) - 1];
export { dayDiff };

/* Courtesy reminders the Collections Agent sent at 09:00 today (before the due date). */
export const TODAY_REMINDERS: Record<string, string> = { "INV-4871": "Courtesy reminder sent 09:00, due Fri 13 Nov", "INV-4903": "Courtesy reminder sent 09:00, due Mon 16 Nov" };
export const CADENCE = [
  { day: 1, label: "Friendly reminder", who: "Collections Agent" },
  { day: 7, label: "Second reminder", who: "Collections Agent" },
  { day: 21, label: "Call task", who: "Caitlin" },
  { day: 35, label: "Final notice", who: "Caitlin approves" },
];
