export declare function getPath(obj: unknown, path: string): unknown;
export declare function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown>;
/** Empty for validation: 0 and false are ANSWERS, not absence. */
export declare function isBlank(v: unknown): boolean;
export interface FormRule {
    name: string;
    args: string[];
}
/** `'required|max:255|in:a,b'` → [{ name, args }] */
export declare function parseRuleString(str: string): FormRule[];
export type FormRules = string | Array<string | Record<string, unknown>> | Record<string, unknown>;
export declare function normaliseRules(rules?: FormRules): FormRule[];
export declare const MESSAGES: Record<string, string>;
export interface FormField {
    key?: string;
    label?: string;
    type?: string;
    required?: boolean;
    rules?: FormRules;
    messages?: Record<string, string>;
    options?: unknown;
    props?: Record<string, unknown>;
    /**
     * How many of the SECTION's columns this field takes.
     *
     * Unchanged, and deliberately so: `span: 2` in a two-column section has
     * meant "the whole row" since the first schema was written, and three
     * live screens say it. Reinterpreting it as twelfths would have made
     * every one of them a sixth wide, silently. AF2-393.
     */
    span?: number;
    /**
     * How many TWELFTHS this field takes, ignoring the section's columns.
     *
     * The escape hatch for mixed granularity: a section of halves where one
     * field is a third. Named for what it counts, because `cols` beside
     * `columns` is a name nobody would read correctly twice.
     *
     * Only meaningful where the grid is twelve tracks wide — see
     * `gridTracks()`. A section whose `columns` does not divide 12 keeps its
     * own track count, and this is ignored with a warning rather than
     * quietly laying out wrong.
     */
    span12?: number;
    /**
     * The twelfth this field STARTS at, 1–12.
     *
     * Placement rather than flow: it is what lets a field sit under another
     * one in the same column while the row above is a different shape.
     * Same rule as `span12` — twelve-track sections only.
     */
    start?: number;
    visibleIf?: unknown;
    hiddenIf?: unknown;
    disabled?: boolean;
    disabledIf?: unknown;
    /**
     * The control refuses input but still LOOKS like itself.
     *
     * Distinct from `disabled`, and the difference is legibility, not
     * pedantry: a disabled control is drawn in the muted palette, which is
     * correct for "you may not touch this" and wrong for "this is the record".
     * A whole form of disabled controls is a whole form nobody can read —
     * found on the first screen to render a view dialog this way (AF2-313).
     *
     * Use `disabled` for a control that is inert BECAUSE of something else on
     * the form, and `readonly` for a value that is simply not yours to change.
     */
    readonly?: boolean;
    /**
     * This one field renders as TEXT, the way the form-level `readonly` prop
     * renders all of them. For a field that has no sensible control — an id,
     * a computed total — sitting inside a form that is otherwise editable.
     */
    readonlyText?: boolean;
    /** Rows for an action-split's menu, or an action-dial's actions. */
    items?: unknown[];
    /** An action field's handler; it is given the whole model. */
    onClick?: (model: unknown) => void;
    /** Which property of an object option or item to display. */
    itemLabel?: string;
    [key: string]: unknown;
}
export declare const LOCAL: Record<string, (v: unknown, a: string[], all?: unknown, field?: FormField) => boolean>;
/** True when a rule can only be settled by the server. */
export declare function isServerOnly(rule: FormRule): boolean;
/**
 * One field, checked locally.
 *
 * `required` runs first and stops: a blank field should report that it is
 * required, not that it is not a valid email. Every other rule SKIPS a blank
 * value, because "optional, but an email if given" is the common case and
 * Laravel behaves the same way.
 */
export declare function validateField(field: FormField, value: unknown, all: unknown): string[];
/**
 * `{ custom: true }` means "the field `custom` equals true".
 *
 * The full form is `{ field: 'custom', eq: true }`, and core/conditions has no
 * shorthand — an object of plain keys falls through to its default branch and
 * compares `undefined === undefined`, which is TRUE. So a mis-shaped condition
 * does not error: it silently shows every conditional field and hides every
 * inverse one. That cost a real bug in the mirror, so the shorthand is real here
 * rather than a trap.
 *
 * Several keys are ANDed. Reserved operator keys are left to the real evaluator.
 */
export declare function expandCondition(cond: unknown): unknown;
export declare function isVisible(field: FormField, model: unknown): boolean;
export declare function isDisabled(field: FormField, model: unknown): boolean;
export interface ControlSpec {
    tag: string;
    props?: Record<string, unknown>;
    dataProp?: string;
    valueProp?: string;
}
export declare const CONTROLS: Record<string, ControlSpec>;
/**
 * Types bound directly to `:value`, bypassing ApexField's generic wrapper
 * entirely (label/help/required/disabled/readonly/error/name) -- none of these
 * six declare ApexFieldProps, so that block would fall through as stray DOM
 * attributes exactly like `table`'s `modelvalue="[object Object]"` bug.
 */
export declare const DIRECT_BIND_TYPES: Set<string>;
export declare function isDirectBindType(type?: string): boolean;
/**
 * Schema types that are not fields at all -- an ACTION, not a value.
 *
 * `action-split` and `action-dial` render their control directly with no
 * ApexField wrapper (no label/help/error, because there is no value to be
 * wrong about) and are skipped entirely by validation and by
 * `sectionErrorCount`: a button cannot be "required".
 */
export declare const DISPLAY_TYPES: Set<string>;
export declare function isDisplayType(type?: string): boolean;
/** A table is a real field (its rows are data) but never validated -- "is this
    blank" is not a question a grid answers. */
export declare function isUnvalidatedType(type?: string): boolean;
export declare function knownProps(tag: string, props: Record<string, unknown>, field: FormField, declaredProps?: Record<string, unknown>): Record<string, unknown>;
/** The control tag and props for one schema field, BEFORE the known-props filter
    (the caller supplies the declared-prop set, since only it knows the registry). */
export declare function controlFor(field: FormField): {
    tag: string;
    valueProp: string;
    props: Record<string, unknown>;
};
export interface FormSection {
    id: string;
    title?: string;
    subtitle?: string;
    icon?: string;
    columns: number;
    fields: FormField[];
    fieldset?: boolean;
    legend?: string;
    toggleable?: boolean;
    /**
     * The space between this section's fields — one CSS gap value, or a
     * number read as pixels. Overrides the app-wide `formGap` option;
     * unset, the stylesheet's `18px 20px` stands. AF2-394.
     */
    gap?: string | number;
    /**
     * A class on THIS section's element, for a host that needs to style one
     * group and not the others.
     *
     * Declared rather than left to the index signature below, for the same
     * reason `items` is: the renderer reads it, and through
     * `[key: string]: unknown` it arrives as `unknown`. The `ui` map cannot
     * do this job — it is form-wide, so `ui.cell` is every cell in the form.
     */
    class?: string;
    [key: string]: unknown;
}
export interface NormalisedSchema {
    title?: string;
    subtitle?: string;
    icon?: string;
    shell: 'page' | 'modal';
    layout: 'long' | 'tabs' | 'sidebar';
    submitLabel: string;
    cancelLabel: string;
    sections: FormSection[];
    rules: unknown[];
}
export interface FormSchema {
    title?: string;
    subtitle?: string;
    icon?: string;
    shell?: string;
    layout?: string;
    submitLabel?: string;
    cancelLabel?: string;
    sections?: Array<Partial<FormSection>>;
    fields?: FormField[];
    columns?: number;
    rules?: unknown[];
}
/**
 * How many tracks a section's grid actually has — AF2-393.
 *
 * TWELVE whenever the section's column count divides into it, which is
 * every count a form has ever used (1, 2, 3, 4, 6, 12). Twelve tracks with
 * every field spanning `12 / columns` lays out identically to `columns`
 * tracks spanning one — same fractions, same gaps — and it is what makes
 * `span12` and `start` possible: a section of halves can hold a field that
 * is a third, which two tracks cannot express at all.
 *
 * A count that does NOT divide 12 keeps its own tracks. Scaling would need
 * a fractional span, and a grid cannot have one; `columns: 5` renders as
 * five tracks exactly as before, and the twelfths keys are refused there
 * rather than being applied to a grid they do not describe.
 */
export declare function gridTracks(columns: number): number;
/**
 * One field's placement, in the tracks `gridTracks()` decided.
 *
 * Returns the span and, when asked for, the starting track. The caller
 * writes them as CUSTOM PROPERTIES rather than as `grid-column`, so the
 * stylesheet can override the whole lot when the container is too narrow
 * to be a grid at all — an inline `grid-column` cannot be beaten by a
 * media query, which is why a narrow form used to grow an implicit column
 * instead of stacking.
 */
export declare function cellPlacement(field: FormField, section: Pick<FormSection, 'columns'>, warn?: (message: string) => void): {
    span: number;
    start?: number;
};
/**
 * The space between a section's fields — AF2-394.
 *
 * Resolved the way every other look-and-feel default in the kit is: the
 * section wins, then the app-wide option, then nothing — and nothing means
 * the stylesheet's own `18px 20px`, so a form that says neither is
 * unchanged.
 *
 * A bare number is read as pixels, because `gap: 8` is what everyone
 * writes first.
 *
 * VALIDATED, and that is not fussiness: the value lands in a custom
 * property, and an invalid custom property makes the whole `gap`
 * declaration invalid at computed-value time — so `'8x'` would not fall
 * back to the default, it would collapse every field in the form onto its
 * neighbour. A typo should not flatten a form silently.
 */
export declare function gridGap(section: Pick<FormSection, 'gap'>, option?: string | number, warn?: (message: string) => void): string | undefined;
export declare function normalise(schema?: FormSchema): NormalisedSchema;
/** Every field in the schema, flat — for validation and for a summary. */
export declare function allFields(schema: NormalisedSchema): FormField[];
/**
 * The whole form, checked locally.
 *
 * Invisible fields are SKIPPED. Blocking a submit on a field the author cannot
 * see is the worst failure a conditional form has, and it is silent: the summary
 * names a field that is not on screen.
 */
export declare function validate(schema: NormalisedSchema, model: unknown): {
    errors: Record<string, string[]>;
    ok: boolean;
};
/** Fields whose rules cannot be settled in the browser — for honest reporting. */
export declare function serverOnlyFields(schema: NormalisedSchema): (string | undefined)[];
export interface FormDriver {
    kind: 'precognition' | 'inertia' | 'internal';
    get(path: string): unknown;
    set(path: string, v: unknown): void;
    values?(): unknown;
    serverErrors(): Record<string, string[]>;
    clearError(path?: string): void;
    validateField: ((path: string) => void) | null;
    validating(): boolean;
    processing(): boolean;
}
/**
 * The object a host form keeps its values in.
 *
 * A plain `data` object when the host has one; the form itself when `data` is
 * a method, which is what both Inertia and Precognition ship.
 */
export declare function bag(f: any): Record<string, unknown>;
export declare function makeDriver(form: unknown, initial?: unknown): FormDriver;
