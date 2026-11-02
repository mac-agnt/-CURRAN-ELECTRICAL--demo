/* Tiny shared store for the Joe Curran Electrical modules: current role, tab per page, and the record each page has open. */
import { useSyncExternalStore } from "react";
import type { RoleKey } from "./core";
import { MODULE_META, ModulePage, isModulePage } from "./modules";

export interface Sel { job?: string; jobTab?: string; siteTab?: string; customer?: string; site?: string; system?: string; staff?: string; contract?: string; doc?: string; supplierInvoice?: string; queue?: string; agent?: string; query?: string }
export interface CurranState { role: RoleKey; tabs: Record<string, string>; sel: Sel; toast: string }

let state: CurranState = {
  role: "md",
  tabs: Object.fromEntries((Object.keys(MODULE_META) as ModulePage[]).map((p) => [p, MODULE_META[p].tabs[0][0]])),
  sel: {}, toast: "",
};
const subs = new Set<() => void>();
let navigator: ((page: string) => void) | null = null;
export const registerNavigator = (fn: (page: string) => void) => { navigator = fn; };
export const subscribe = (fn: () => void) => { subs.add(fn); return () => { subs.delete(fn); }; };
export const getState = () => state;
export const useCurran = () => useSyncExternalStore(subscribe, getState);
const emit = () => subs.forEach((f) => f());
export function patch(p: Partial<CurranState>) { state = { ...state, ...p }; emit(); }
export const setRole = (role: RoleKey) => { patch({ role }); navigator && navigator("Home"); };
export const setTab = (page: string, tab: string) => patch({ tabs: { ...state.tabs, [page]: tab }, sel: {} });
export const select = (s: Sel) => patch({ sel: { ...state.sel, ...s } });
export const clearSel = (...keys: (keyof Sel)[]) => { const s = { ...state.sel }; keys.forEach((k) => delete s[k]); patch({ sel: s }); };
/** Jump to a page, optionally on a tab and with a record open. */
export function goTo(page: string, tab?: string, sel: Sel = {}) {
  const tabs = { ...state.tabs };
  if (tab && isModulePage(page)) tabs[page] = tab;
  state = { ...state, tabs, sel };
  emit();
  navigator && navigator(page);
}
let toastTimer: any;
export function toast(msg: string) { patch({ toast: msg }); clearTimeout(toastTimer); toastTimer = setTimeout(() => patch({ toast: "" }), 2600); }
