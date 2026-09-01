import { reactive } from 'vue';

/**
 * Sidebar registry. Each sidebar registers under an id so a trigger anywhere in
 * the tree can toggle it by name — the reason a shell can put its trigger in a
 * header that is not a descendant of the panel.
 */
export interface SidebarState {
  open: boolean;
  /** icon mode keeps the rail; offcanvas removes the panel entirely. */
  collapsible: 'icon' | 'offcanvas' | 'none';
}

const registry = reactive<Record<string, SidebarState>>({});

export function useApexSidebar(id = 'primary') {
  if (!registry[id]) registry[id] = { open: true, collapsible: 'icon' };
  const state = registry[id];
  return {
    state,
    get open() { return state.open; },
    show() { state.open = true; },
    hide() { state.open = false; },
    toggle() { state.open = !state.open; },
    set(v: boolean) { state.open = v; },
  };
}

/** Internal: registers a panel and returns its live state. */
export function __registerSidebar(id: string, collapsible: SidebarState['collapsible'], open: boolean) {
  if (!registry[id]) registry[id] = { open, collapsible };
  else registry[id].collapsible = collapsible;
  return registry[id];
}
export const __sidebarRegistry = registry;
