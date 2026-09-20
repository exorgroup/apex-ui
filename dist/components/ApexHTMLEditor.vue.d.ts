import type { ApexFieldProps, ApexHTMLEditorClasses } from '../types';
import { type CellState, type TextStyleState } from '../core/editor/htmlStructure';
import { type HtmlStyle } from '../core/editor/htmlStyles';
import type { EditorView } from 'prosemirror-view';
import type { Schema } from 'prosemirror-model';
export interface HtmlPathEntry {
    depth: number;
    tag: string;
    pos: number;
}
export interface HtmlActiveState {
    blockStyle: string | null;
    characterStyle: string | null;
    /** The element ancestry, for a path bar. */
    path: HtmlPathEntry[];
    /**
     * The text styles in force at the selection, read from the document rather
     * than remembered — so a colour control shows what is under the caret.
     */
    textStyle: TextStyleState;
    /**
     * Where the selection sits in a table, or null outside one — which is what
     * tells a contextual table toolbar to stay hidden.
     */
    cell: CellState | null;
    /**
     * The selected OBJECT and where it is on screen, for the floating object bar,
     * or null when the selection is in ordinary text. The rect is in VIEWPORT
     * coordinates: the writing surface is an iframe, so the frame's own offset is
     * added here where the frame is, rather than by the bar.
     */
    object: {
        kind: 'table' | 'image' | 'embed';
        rect: DOMRect;
    } | null;
    /** View state, so a toolbar toggle can show that it is on. */
    sourceOpen?: boolean;
    showBlocks?: boolean;
    visualAids?: boolean;
    fullscreen?: boolean;
    marks: Record<string, boolean>;
    blockType: string;
    blockAttrs: Record<string, unknown>;
    /** True when a selection spans block kinds, so a control can show mixed. */
    blockMixed: boolean;
}
type __VLS_Props = ApexFieldProps & {
    /**
     * HTML in and out, because HTML is what this component's documents ARE. There
     * is no JSON source of truth here — the markup is the record, which is the
     * whole point of the component.
     */
    html?: string;
    /** The classes the application offers, applied the way Word's styles are. */
    styles?: HtmlStyle[];
    /** Stylesheet URLs loaded into the editing surface, so what you see is the page. */
    stylesheets?: string[];
    /** Extra CSS, for a theme that is not a file. */
    css?: string;
    /** Classes for the surface's body, since a page's look often depends on them. */
    bodyClass?: string;
    minHeight?: string;
    editable?: boolean;
    /**
     * On by DEFAULT here, unlike ApexEditor. In a prose editor the source view is
     * an escape hatch most authors never want; in a page editor it is the reliable
     * way to reach anything the visual surface cannot, so hiding it would withhold
     * the tool this component exists to complement.
     */
    sourceView?: boolean;
    /** Column widths by dragging a cell border, from prosemirror-tables. */
    resizableColumns?: boolean;
    /** Row heights by dragging a row border, which is ours — see rowResizing. */
    resizableRows?: boolean;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexHTMLEditorClasses;
};
declare function getHtml(): string;
declare function setHtml(html: string): boolean;
/** Parsed on EXIT, not per keystroke: half-typed markup is invalid markup. */
declare function toggleSource(): boolean;
export type StructureAction = 'wrap' | 'unwrap' | 'retag' | 'insert' | 'remove' | 'attrs';
declare function structure(action: StructureAction, arg?: unknown): boolean;
/**
 * Asked without dispatching, which is ProseMirror's own applicability test — so
 * a disabled button is disabled because the document said so.
 */
declare function canStructure(action: StructureAction, arg?: unknown): boolean;
/**
 * The object's rect RE-MEASURED, for an overlay that has to follow it.
 *
 * The rect inside `active` is a snapshot from the last selection change; a
 * scroll moves the object without changing it.
 */
declare function objectRect(): DOMRect | null;
declare function insertTable(rows: number, cols: number): boolean;
declare function applyImage(attrs: Record<string, string>): boolean;
declare function wordStats(): {
    doc: null;
    selection: null;
} | {
    doc: {
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    };
    selection: {
        words: number;
        chars: number;
        charsNoSpaces: number;
        blocks: number;
    } | null;
};
/**
 * One registry for every surface, exactly as in ApexEditor: a toolbar button, a
 * keyboard shortcut and a slash command run the same command.
 */
declare function run(name: string | ((...a: never[]) => boolean), value?: unknown): boolean;
declare function canRun(name: string): boolean;
declare function setLink(attrs: {
    href: string;
    target?: string | null;
}): boolean;
declare function unsetLink(): boolean;
/** The href under the caret, so the editor opens on the existing link. */
declare function getLinkContext(): {
    href: string;
    target: string | null;
};
/** Value-per-property, so a colour change does not clear the font size. */
declare function setTextStyle(kind: string, value: string | null): boolean;
/** Value-per-property, so setting a fill does not clear the border. */
declare function setCellStyle(prop: string, value: string | null): boolean;
declare function insertImage(attrs: Record<string, unknown>): boolean;
/** One call for both kinds, routed by the style's own scope. */
declare function applyStyle(style: HtmlStyle | null): boolean;
declare function clearStyle(scope: 'block' | 'character'): boolean;
declare function selectPath(entry: HtmlPathEntry): void;
declare var __VLS_5: {
    message: string;
}, __VLS_7: {
    styles: HtmlStyle[];
    blockStyles: HtmlStyle[];
    characterStyles: HtmlStyle[];
    active: {
        blockStyle: string | null;
        characterStyle: string | null;
        path: {
            depth: number;
            tag: string;
            pos: number;
        }[];
        textStyle: {
            color: string | null;
            fontFamily: string | null;
            fontSize: string | null;
            mixed: boolean;
        };
        cell: {
            cellPos: number;
            tablePos: number;
            isHeader: boolean;
            colspan: number;
            rowspan: number;
            rows: number;
            selectedCells: number;
            style: Record<string, string>;
            border: {
                width: string | null;
                color: string | null;
            };
        } | null;
        object: {
            kind: "table" | "image" | "embed";
            rect: {
                height: number;
                width: number;
                x: number;
                y: number;
                readonly bottom: number;
                readonly left: number;
                readonly right: number;
                readonly top: number;
                toJSON: () => any;
            };
        } | null;
        sourceOpen?: boolean | undefined;
        showBlocks?: boolean | undefined;
        visualAids?: boolean | undefined;
        fullscreen?: boolean | undefined;
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    };
    apply: typeof applyStyle;
    clear: typeof clearStyle;
    structure: typeof structure;
    can: typeof canStructure;
    containers: {
        value: string;
        label: string;
    }[];
    sourceOpen: boolean;
    toggleSource: typeof toggleSource;
    run: typeof run;
    canRun: typeof canRun;
    commands: Record<string, boolean>;
    objectRect: typeof objectRect;
    linkRequest: number;
    imageRequest: number;
    imageAttrs: Record<string, string> | null;
    applyImage: typeof applyImage;
    tableRequest: number;
    insertTable: typeof insertTable;
    countRequest: number;
    wordStats: typeof wordStats;
    setLink: typeof setLink;
    unsetLink: typeof unsetLink;
    linkContext: typeof getLinkContext;
    setTextStyle: typeof setTextStyle;
    insertImage: typeof insertImage;
    cell: {
        cellPos: number;
        tablePos: number;
        isHeader: boolean;
        colspan: number;
        rowspan: number;
        rows: number;
        selectedCells: number;
        style: Record<string, string>;
        border: {
            width: string | null;
            color: string | null;
        };
    } | null;
    setCellStyle: typeof setCellStyle;
}, __VLS_9: {
    text: string;
    setText: (v: string) => void;
    error: string;
}, __VLS_11: {}, __VLS_13: {
    path: {
        depth: number;
        tag: string;
        pos: number;
    }[];
    words: number;
    selectPath: typeof selectPath;
    sourceOpen: boolean;
};
type __VLS_Slots = {} & {
    error?: (props: typeof __VLS_5) => any;
} & {
    toolbar?: (props: typeof __VLS_7) => any;
} & {
    'source-view'?: (props: typeof __VLS_9) => any;
} & {
    loading?: (props: typeof __VLS_11) => any;
} & {
    status?: (props: typeof __VLS_13) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    getView: () => EditorView | null;
    getSchema: () => Schema<any, any> | null;
    getHtml: typeof getHtml;
    setHtml: typeof setHtml;
    getActive: () => {
        blockStyle: string | null;
        characterStyle: string | null;
        path: {
            depth: number;
            tag: string;
            pos: number;
        }[];
        textStyle: {
            color: string | null;
            fontFamily: string | null;
            fontSize: string | null;
            mixed: boolean;
        };
        cell: {
            cellPos: number;
            tablePos: number;
            isHeader: boolean;
            colspan: number;
            rowspan: number;
            rows: number;
            selectedCells: number;
            style: Record<string, string>;
            border: {
                width: string | null;
                color: string | null;
            };
        } | null;
        object: {
            kind: "table" | "image" | "embed";
            rect: {
                height: number;
                width: number;
                x: number;
                y: number;
                readonly bottom: number;
                readonly left: number;
                readonly right: number;
                readonly top: number;
                toJSON: () => any;
            };
        } | null;
        sourceOpen?: boolean | undefined;
        showBlocks?: boolean | undefined;
        visualAids?: boolean | undefined;
        fullscreen?: boolean | undefined;
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    };
    applyStyle: typeof applyStyle;
    clearStyle: typeof clearStyle;
    selectPath: typeof selectPath;
    run: typeof run;
    canRun: typeof canRun;
    setLink: typeof setLink;
    unsetLink: typeof unsetLink;
    getLinkContext: typeof getLinkContext;
    setTextStyle: typeof setTextStyle;
    setCellStyle: typeof setCellStyle;
    insertImage: typeof insertImage;
    getCommands: () => Record<string, boolean>;
    structure: typeof structure;
    canStructure: typeof canStructure;
    toggleSource: typeof toggleSource;
    isSourceOpen: () => boolean;
    focus: () => void | undefined;
    isReady: () => boolean;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    error: (reason: unknown) => any;
    "selection-change": (payload: HtmlActiveState) => any;
    "source-error": (payload: {
        reason: unknown;
        html: string;
    }) => any;
    ready: () => any;
    "update:html": (html: string) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onError?: ((reason: unknown) => any) | undefined;
    "onSelection-change"?: ((payload: HtmlActiveState) => any) | undefined;
    "onSource-error"?: ((payload: {
        reason: unknown;
        html: string;
    }) => any) | undefined;
    onReady?: (() => any) | undefined;
    "onUpdate:html"?: ((html: string) => any) | undefined;
}>, {
    html: string;
    resizableColumns: boolean;
    editable: boolean;
    minHeight: string;
    sourceView: boolean;
    resizableRows: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
