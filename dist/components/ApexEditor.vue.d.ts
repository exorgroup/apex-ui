import type { ApexFieldProps, ApexEditorClasses } from '../types';
import { type CommentAnchor } from '../core/editor/comments';
import { type SuggestionAuthor, type SuggestionRange } from '../core/editor/suggestions';
import { type ExportOptions } from '../core/editor/serialise';
import { type AssistAction, type AssistRequest } from '../core/editor/assist';
import { type InputRuleOptions } from '../core/editor/inputRules';
import { type SlashItem } from '../core/editor/slash';
import { type PasteOptions } from '../core/editor/paste';
import { type UploadHandler } from '../core/editor/media';
export interface EditorDoc {
    type: string;
    content?: unknown[];
    [key: string]: unknown;
}
type __VLS_Props = ApexFieldProps & {
    /** The document, as ProseMirror JSON. v-model:doc. */
    doc?: EditorDoc | null;
    placeholder?: string;
    /** Reading only, but still selectable and copyable. */
    readonly?: boolean;
    /** Not editable and not focusable, the field-level disabled state. */
    disabled?: boolean;
    autofocus?: boolean;
    /** Room the writing area takes; it grows with content beyond this. */
    minHeight?: string | number;
    maxHeight?: string | number;
    /** Draw the border and padding, or sit bare inside a caller's own frame. */
    bordered?: boolean;
    /** Sizes the type scale of the whole document. */
    size?: 'sm' | 'md' | 'lg';
    spellcheck?: boolean;
    ariaLabel?: string;
    /** Markdown shorthands and typographic replacements. See InputRuleOptions. */
    inputRules?: boolean | InputRuleOptions;
    /** The slash menu. Its items name the same commands the toolbars use. */
    slashMenu?: boolean;
    slashItems?: SlashItem[];
    /** Paste handling. See PasteOptions; true is the defaults. */
    paste?: boolean | PasteOptions;
    /** Tables. Off keeps them out of the schema entirely, so a paste cannot
     *  introduce one the document is not meant to hold. */
    tables?: boolean;
    /** Drag column edges to resize. */
    resizableColumns?: boolean;
    /** Images and video embeds. Off keeps them out of the schema. */
    media?: boolean;
    /**
     * Answers a file with a URL. The editor never uploads: it emits the intent and
     * holds a placeholder until this resolves, so endpoints, auth and retries stay
     * with the application that owns the storage.
     */
    onUpload?: UploadHandler;
    /** Turn a pasted video URL into an embed. */
    embedOnPaste?: boolean;
    /**
     * Comment anchors. The document stores a thread id on a range; the thread
     * itself belongs to the application's store, where it can be queried,
     * paginated and permissioned.
     */
    comments?: boolean;
    /** Which thread the reader is looking at, so the editor can paint it. */
    activeThread?: string | null;
    /** Threads the application considers resolved, styled differently. */
    resolvedThreads?: string[];
    /**
     * Track changes. Insertions and deletions both become marks — a deletion has
     * to stay visible until someone accepts it, so nothing is removed until then.
     */
    suggestions?: boolean;
    /** Suggesting is on: edits become suggestions rather than changes. */
    suggesting?: boolean;
    /** Who is suggesting. Carried on the mark, so a reviewer can filter by author. */
    author?: SuggestionAuthor;
    /**
     * AI seams. No provider is bundled: the editor emits a request and the
     * application answers it — endpoints, model, auth, rate limits, cost and
     * prompt wording all belong to whoever owns the account.
     */
    /**
     * An HTML source view, the way TinyMCE's Code button works. Off by default: a
     * document with tables and figures is far easier to break in source than to
     * build, and most authors never want it.
     */
    sourceView?: boolean;
    assist?: boolean;
    onAssist?: (request: AssistRequest) => void;
    /** Class map — §4.3. Every part the template draws takes one key. */
    ui?: ApexEditorClasses;
};
/** Re-measured on demand, for an overlay that has to follow the object. */
declare function objectRect(): DOMRect | null;
/**
 * The editor's own box, for an overlay that must stay inside it.
 *
 * A floating bar clamped only to the window drifts outside a dialog
 * the moment its subject is taller than the dialog - on screen,
 * detached, and pointing at nothing.
 */
declare function editorBounds(): DOMRect | null;
/**
 * One CSS declaration onto the selected cells.
 *
 * The table bar writes alignment as a style, because the page editor it
 * was built for stores real CSS on the cell. A prose document does not:
 * it keeps an `align` ATTRIBUTE, which the stylesheet reads and the
 * sanitiser allows, where a `style` attribute would be stripped on save.
 * So the one declaration the bar sends is translated to the command
 * that already exists, and anything else is refused rather than written
 * somewhere it would not survive.
 */
declare function setCellStyle(prop: string, value: string | null): boolean;
/**
 * A table of a CHOSEN size.
 *
 * The registry's `table_insert` makes a fixed 3x3, which is the right
 * default for a keystroke and the wrong one for a toolbar: a table's shape
 * is the first thing an author decides, and a command that guesses it is a
 * command they have to undo. `ApexEditorTableGrid` picks the size and calls
 * this - the arrangement `ApexHTMLEditor` already has, mirrored here so the
 * two editors' `#table` slots take the same control.
 *
 * Built through the shared `createTable`, so a picked size and the
 * registry's default produce the same structure, header row included.
 */
declare function insertTable(rows: number, cols: number): boolean;
declare function applyLink(attrs: {
    href: string;
    target?: string | null;
}): boolean;
declare function removeLink(): boolean;
/**
 * Loading from an HTML column.
 *
 * Cleaned on the way in through the same path a paste takes, since stored HTML is
 * no more trustworthy than clipboard HTML — it may predate the current schema or
 * come from another editor entirely.
 *
 * With one difference: blank lines are KEPT. On a paste an empty paragraph is
 * Word's spacer and worth dropping; in a record being reopened it is spacing the
 * author typed, and removing it closed up their document behind their back.
 */
declare function setHtml(html: string): boolean;
/** Parsed on EXIT, not per keystroke: half-typed markup is invalid markup. */
declare function toggleSource(): boolean;
/**
 * One entry point for every action, so a toolbar button, a slash command and a
 * keyboard shortcut all produce the same request and the same landing.
 */
declare function runAssist(action: AssistAction, options?: Record<string, unknown>): boolean;
declare function runCommand(nameOrFn: string | import('prosemirror-state').Command, dispatchOrValue?: boolean | string | null): boolean;
declare var __VLS_5: {
    active: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    } | null;
    run: typeof runCommand;
    can: Record<string, boolean>;
    link: {
        href: string | null;
        target: string | null;
    };
    setLink: typeof applyLink;
    unsetLink: typeof removeLink;
    insertTable: typeof insertTable;
    view: import("prosemirror-view").EditorView | null;
}, __VLS_7: {}, __VLS_9: {
    placeholder: string;
}, __VLS_11: {
    anchors: {
        threadId: string;
        from: number;
        to: number;
        text: string;
        top: number;
        height: number;
    }[];
    activeThread: string | null | undefined;
}, __VLS_13: {
    active: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    } | null;
    run: typeof runCommand;
    can: Record<string, boolean>;
    link: {
        href: string | null;
        target: string | null;
    };
    setLink: typeof applyLink;
    unsetLink: typeof removeLink;
    view: import("prosemirror-view").EditorView | null;
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
    measure: typeof objectRect;
    bounds: typeof editorBounds;
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
    image: Record<string, unknown> | null;
    setCellStyle: typeof setCellStyle;
}, __VLS_25: {
    item: SlashItem;
    selected: boolean;
    group: string;
    index: number;
}, __VLS_27: {
    message: string;
}, __VLS_29: {
    active: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    } | null;
    run: typeof runCommand;
    can: Record<string, boolean>;
};
type __VLS_Slots = {} & {
    toolbar?: (props: typeof __VLS_5) => any;
} & {
    loading?: (props: typeof __VLS_7) => any;
} & {
    empty?: (props: typeof __VLS_9) => any;
} & {
    gutter?: (props: typeof __VLS_11) => any;
} & {
    overlay?: (props: typeof __VLS_13) => any;
} & {
    'slash-item'?: (props: typeof __VLS_25) => any;
} & {
    error?: (props: typeof __VLS_27) => any;
} & {
    footer?: (props: typeof __VLS_29) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    /** The live view, for a caller that needs to reach past these props. */
    getView: () => import("prosemirror-view").EditorView | null;
    getSchema: () => import("prosemirror-model").Schema<any, any> | null;
    focus: () => void | undefined;
    blur: () => void | undefined;
    getJSON: () => any;
    getText: () => string;
    isEmpty: () => boolean;
    getActive: () => {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    } | null;
    getLinkContext: () => {
        href: string | null;
        target: string | null;
    };
    getAnchors: () => {
        threadId: string;
        from: number;
        to: number;
        text: string;
        top: number;
        height: number;
    }[];
    addComment: (threadId: string) => boolean;
    removeComment: (threadId: string) => boolean;
    threadsAtSelection: () => string[];
    getSuggestions: () => {
        kind: "insertion" | "deletion";
        authorId: string;
        authorName: string | null;
        at: string | null;
        from: number;
        to: number;
        text: string;
    }[];
    toHtml: (options?: ExportOptions) => string;
    toMarkdown: (options?: ExportOptions) => string;
    toText: (options?: ExportOptions) => string;
    wordCount: (options?: ExportOptions) => number;
    setHtml: typeof setHtml;
    toggleSource: typeof toggleSource;
    isSourceOpen: () => boolean;
    runAssist: typeof runAssist;
    isAssistBusy: () => boolean;
    resolveSuggestion: (range: SuggestionRange, verb: "accept" | "reject") => boolean;
    resolveAll: (verb: "accept" | "reject", authorId?: string) => boolean;
    run: typeof runCommand;
    can: (name: string) => boolean;
    commands: () => string[];
    setLink: (attrs: {
        href: string;
        title?: string | null;
        target?: string | null;
    }) => boolean;
    unsetLink: () => boolean;
    insertTable: typeof insertTable;
    undo: () => boolean;
    redo: () => boolean;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:doc": (doc: EditorDoc) => void;
    paste: (payload: {
        kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
        length: number;
    }) => void;
    "upload-error": (payload: {
        file: File;
        reason: unknown;
    }) => void;
    "anchors-change": (payload: CommentAnchor[]) => void;
    "thread-click": (payload: {
        threadId: string;
    }) => void;
    "suggestions-change": (payload: SuggestionRange[]) => void;
    "assist-request": (payload: AssistRequest) => void;
    "assist-error": (payload: {
        action: AssistAction;
        reason: unknown;
    }) => void;
    "source-error": (payload: {
        reason: unknown;
        html: string;
    }) => void;
    "clipboard-error": (payload: {
        action: "paste";
        reason: unknown;
    }) => void;
    change: (payload: {
        doc: EditorDoc;
        text: string;
    }) => void;
    "selection-change": (payload: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    }) => void;
    blur: () => void;
    focus: () => void;
    ready: () => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onBlur?: (() => any) | undefined;
    onChange?: ((payload: {
        doc: EditorDoc;
        text: string;
    }) => any) | undefined;
    onFocus?: (() => any) | undefined;
    onPaste?: ((payload: {
        kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
        length: number;
    }) => any) | undefined;
    "onSelection-change"?: ((payload: {
        marks: Record<string, boolean>;
        blockType: string;
        blockAttrs: Record<string, unknown>;
        blockMixed: boolean;
    }) => any) | undefined;
    "onUpdate:doc"?: ((doc: EditorDoc) => any) | undefined;
    "onUpload-error"?: ((payload: {
        file: File;
        reason: unknown;
    }) => any) | undefined;
    "onAnchors-change"?: ((payload: CommentAnchor[]) => any) | undefined;
    "onThread-click"?: ((payload: {
        threadId: string;
    }) => any) | undefined;
    "onSuggestions-change"?: ((payload: SuggestionRange[]) => any) | undefined;
    "onAssist-request"?: ((payload: AssistRequest) => any) | undefined;
    "onAssist-error"?: ((payload: {
        action: AssistAction;
        reason: unknown;
    }) => any) | undefined;
    "onSource-error"?: ((payload: {
        reason: unknown;
        html: string;
    }) => any) | undefined;
    "onClipboard-error"?: ((payload: {
        action: "paste";
        reason: unknown;
    }) => any) | undefined;
    onReady?: (() => any) | undefined;
}>, {
    size: "sm" | "md" | "lg";
    paste: boolean | PasteOptions;
    placeholder: string;
    suggestions: boolean;
    spellcheck: boolean;
    bordered: boolean;
    resizableColumns: boolean;
    media: boolean;
    tables: boolean;
    minHeight: string | number;
    inputRules: boolean | InputRuleOptions;
    slashMenu: boolean;
    embedOnPaste: boolean;
    comments: boolean;
    suggesting: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
