/* Local, session-only state for Finance and Contracts: approvals, supplier invoice resolutions, rebill drafts. */
import { useSyncExternalStore } from "react";
import type { QueueStage } from "../../index";

export interface FinState {
  stage: Record<string, QueueStage>;
  rejected: Record<string, boolean>;
  si: Record<string, { state: "matched" | "rejected"; jobId?: string; category?: string }>;
  autoRenew: Record<string, boolean>;
  prepared: Record<string, boolean>;
  reminders: Record<string, string[]>;
}
let st: FinState = { stage: {}, rejected: {}, si: {}, autoRenew: {}, prepared: {}, reminders: {} };
const subs = new Set<() => void>();
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const useFin = () => useSyncExternalStore(sub, () => st);
export function finPatch(p: Partial<FinState>) { st = { ...st, ...p }; subs.forEach((f) => f()); }
export const setStage = (id: string, stage: QueueStage) => finPatch({ stage: { ...st.stage, [id]: stage } });
export const getFin = () => st;
