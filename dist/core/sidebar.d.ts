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
export declare function useApexSidebar(id?: string): {
    state: SidebarState;
    readonly open: boolean;
    show(): void;
    hide(): void;
    toggle(): void;
    set(v: boolean): void;
};
/** Internal: registers a panel and returns its live state. */
export declare function __registerSidebar(id: string, collapsible: SidebarState['collapsible'], open: boolean): SidebarState;
export declare const __sidebarRegistry: Record<string, SidebarState>;
