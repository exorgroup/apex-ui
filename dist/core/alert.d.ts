/**
 * ApexAlert — one centred alert that says something and waits.
 *
 * Three ways in. `confirm()` asks a yes/no question. `notify()` reports an
 * outcome with a single button. `run()` is the one that earns its keep: it
 * carries a single alert through confirm → progress → result *without closing
 * between stages*, so a delete reads as one continuous act rather than a
 * dialog, a blank pause and then an unrelated toast.
 *
 * A module singleton with one <ApexAlert> rendering it, because two alerts on
 * screen at once is never the answer to "are you sure?" — unlike toasts, which
 * queue. That difference is the whole reason this is not the toast service.
 *
 * Nothing here knows about Inertia, or any transport. Pando's version read
 * `usePage().props.flash` to decide whether the action had really succeeded;
 * a library cannot, so that judgement is injected — see `setAlertInterpreter`.
 */
export type AlertTone = 'success' | 'danger' | 'warn' | 'info';
/** Which part of the flow is on screen. `progress` is the only one that waits. */
export type AlertStage = 'confirm' | 'progress' | 'result';
/** One line of an edit-confirm: "Capacity  120 → 180". */
export interface AlertChange {
    label: string;
    from?: unknown;
    to?: unknown;
}
export type AlertSeverity = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast';
/**
 * One button in the row.
 *
 * A button carries its own action rather than being reported back through a
 * single handler, so "Surprise me" can open a form and Cancel can just close
 * without the caller switching on an index.
 *
 * `role` is what `run()` reads: accept proceeds to the work, reject and cancel
 * abort it, and a button with no role runs its action and stops there. It also
 * decides the keyboard — Enter fires accept, Escape fires reject or cancel —
 * which is why free-form buttons still need one of the three between them.
 */
export interface AlertButton {
    label: string;
    icon?: string;
    severity?: AlertSeverity;
    variant?: 'solid' | 'outlined' | 'text';
    role?: 'accept' | 'reject' | 'cancel';
    /** Whatever it does: a request, a route, another alert, a form. */
    action?: () => void | Promise<void>;
    /** Whether pressing it closes the alert. Default true. */
    close?: boolean;
    /**
     * Hidden when the app's `can` resolver denies this action on this resource.
     * Hidden rather than disabled, matching every other gated control — and it
     * is presentation, not authorisation. The endpoint still has to check.
     */
    can?: string;
    resource?: string;
    /** Explicit visibility, for logic no resolver can express. Wins outright. */
    visible?: boolean;
}
export interface AlertOptions {
    tone?: AlertTone;
    title?: string;
    /** Alias of `title` — the name ApexConfirmDialog used, kept for its callers. */
    header?: string;
    message?: string;
    /** Shows what is about to change, so a confirm can be read rather than trusted. */
    changes?: AlertChange[] | null;
    /** Label for the accepting button. Undefined lets the host translate a default. */
    confirmText?: string;
    /** Omit for a one-button alert; `notify()` never shows one. */
    cancelText?: string | null;
    /** When set, a button copies this to the clipboard — a generated password. */
    copyText?: string | null;
    icon?: string;
    iconPosition?: 'top' | 'left' | 'right' | 'bottom';
    /** No `spin` — a confirmation is not loading, and spinning it says otherwise. */
    iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce';
    iconColor?: string;
    image?: string;
    imageAlt?: string;
    /** Replaces the default row entirely. */
    buttons?: AlertButton[];
    acceptLabel?: string;
    rejectLabel?: string;
    acceptIcon?: string;
    rejectIcon?: string;
    acceptSeverity?: AlertSeverity;
    rejectSeverity?: AlertSeverity;
    /** A note or link under the buttons. */
    footnote?: string;
    width?: string;
    padding?: string;
    background?: string;
    radius?: string;
    maskColor?: string;
    maskBlur?: boolean;
    closable?: boolean;
    dismissableMask?: boolean;
    /** Close after this many milliseconds. Never while the work is running. */
    autoClose?: number;
    /** A bar counting the autoClose down. */
    showTimer?: boolean;
    /**
     * Ripple the answer buttons for THIS request. Follows the same rule as
     * every other option here: the call wins, then the host's prop, then the
     * plugin's app-wide setting, then off. AF2-324.
     */
    ripple?: boolean;
    transition?: 'scale' | 'slide' | 'fade' | 'none';
    /** How long the panel takes to arrive / to leave. Any CSS time. */
    enterDuration?: string;
    leaveDuration?: string;
    enterClass?: string;
    leaveClass?: string;
    /**
     * An element, selector or event. Its presence routes `confirm()` to
     * ApexConfirmPopup instead — one service driving both, without the caller
     * choosing a component.
     *
     * `run()` ignores it: a progress spinner in a popup anchored to the button
     * that has just been pressed reads badly, and the popup would have to
     * survive a re-anchor at every stage.
     */
    target?: unknown;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    /** Marks a request so a headless container can render its own UI per kind. */
    group?: string;
    accept?: () => void;
    reject?: () => void;
    /** Fired for a button that is neither accept nor reject. */
    onCustom?: (button: AlertButton, index: number) => void;
}
/**
 * What `run()` learned from the action, once it finished.
 *
 * A resolved promise is not the same as a successful outcome: a request can
 * complete and still have been refused. Returning `ok: false` puts the alert
 * into its warn stage with your message instead of claiming success.
 */
export interface AlertRunResult {
    ok?: boolean;
    title?: string;
    message?: string;
    tone?: AlertTone;
}
export interface AlertRunOptions {
    /** Omit to skip straight to progress — creating a record needs no "are you sure". */
    confirm?: AlertOptions | null;
    /** Shown while the action runs. */
    progressTitle?: string;
    /**
     * The progress stage, for callers who want more than a title — most often
     * `icon`, which replaces the ring with that glyph, spinning.
     *
     * `progressTitle` still works and wins, because it was the only way to set
     * a title and a caller passing both means the shorthand.
     */
    progress?: AlertOptions;
    /**
     * The result stage's settings, UNDERNEATH the outcome.
     *
     * The outcome still decides tone, title and message — that judgement is the
     * whole point of AlertRunResult. This is for the presentation the action
     * cannot know about: `autoClose`, `showTimer`, the label on the button.
     */
    result?: AlertOptions;
    /** The work. Resolve on completion, reject on failure. */
    action: () => Promise<AlertRunResult | void> | AlertRunResult | void;
    /** Reads this call's outcome, overriding any registered interpreter. */
    interpret?: (raw: AlertRunResult | void) => AlertRunResult;
}
export interface AlertState extends AlertOptions {
    open: boolean;
    stage: AlertStage;
    /** Bumped per stage so the host can replay its entrance animation. */
    seq: number;
}
/**
 * How to read an action's outcome, registered once by the app.
 *
 * This is the seam that keeps the library transport-agnostic. An Inertia app
 * registers one that reads the flash bag, and then none of its call sites
 * change — which is what makes migrating Pando's 53 of them a registration
 * rather than 53 edits.
 *
 * It is not on ApexUiOptions like `can` and `iconResolver`, because those are
 * injected and read during setup. `run()` is called from an event handler,
 * where there is no component instance to inject from.
 */
declare let interpreter: ((raw: AlertRunResult | void) => AlertRunResult) | null;
export declare function setAlertInterpreter(fn: typeof interpreter): void;
/** Called by the host when a button is pressed. */
declare function settle(kind: string): void;
declare function close(): void;
/** Asks, and resolves true only if the accepting button was pressed. */
declare function confirm(options: AlertOptions): Promise<boolean>;
/** States an outcome and waits for acknowledgement. */
declare function notify(options: AlertOptions): Promise<void>;
/**
 * Confirm, run, and report — in one alert that never closes in between.
 *
 * Returns whether the action succeeded, so a caller can branch. Declining at
 * the confirm stage returns false too: nothing happened, which for a caller
 * asking "did this go through?" is the same answer.
 */
declare function run(options: AlertRunOptions): Promise<boolean>;
/**
 * Run a button's own action, then do what its role means.
 *
 * Here rather than in ApexAlert because ApexConfirmPopup shows the same
 * buttons for the same request — one service driving two hosts — and two
 * copies of this would drift the moment one of them gained a case.
 *
 * `close: false` leaves the alert standing, for a button that changes what is
 * on screen rather than finishing with it. Everything else settles, and the
 * roleless case settles as neither accept nor reject: `confirm()` reports
 * false and `run()` stops without doing the work, because nothing was agreed
 * to.
 */
declare function press(b: AlertButton, index?: number): Promise<void>;
export declare function useApexAlert(): {
    state: AlertState;
    confirm: typeof confirm;
    notify: typeof notify;
    run: typeof run;
    settle: typeof settle;
    press: typeof press;
    close: typeof close;
};
/** Internal handles for ApexAlert, which needs to write and to settle. */
export declare const __alertState: {
    open: boolean;
    stage: AlertStage;
    seq: number;
    tone?: AlertTone | undefined;
    title?: string | undefined;
    header?: string | undefined;
    message?: string | undefined;
    changes?: {
        label: string;
        from?: unknown;
        to?: unknown;
    }[] | null | undefined;
    confirmText?: string | undefined;
    cancelText?: string | null | undefined;
    copyText?: string | null | undefined;
    icon?: string | undefined;
    iconPosition?: "top" | "left" | "right" | "bottom" | undefined;
    iconAnimation?: "none" | "pulse" | "shake" | "bounce" | undefined;
    iconColor?: string | undefined;
    image?: string | undefined;
    imageAlt?: string | undefined;
    buttons?: {
        label: string;
        icon?: string | undefined;
        severity?: AlertSeverity | undefined;
        variant?: "solid" | "outlined" | "text" | undefined;
        role?: "accept" | "reject" | "cancel" | undefined;
        action?: (() => void | Promise<void>) | undefined;
        close?: boolean | undefined;
        can?: string | undefined;
        resource?: string | undefined;
        visible?: boolean | undefined;
    }[] | undefined;
    acceptLabel?: string | undefined;
    rejectLabel?: string | undefined;
    acceptIcon?: string | undefined;
    rejectIcon?: string | undefined;
    acceptSeverity?: AlertSeverity | undefined;
    rejectSeverity?: AlertSeverity | undefined;
    footnote?: string | undefined;
    width?: string | undefined;
    padding?: string | undefined;
    background?: string | undefined;
    radius?: string | undefined;
    maskColor?: string | undefined;
    maskBlur?: boolean | undefined;
    closable?: boolean | undefined;
    dismissableMask?: boolean | undefined;
    autoClose?: number | undefined;
    showTimer?: boolean | undefined;
    ripple?: boolean | undefined;
    transition?: "scale" | "slide" | "fade" | "none" | undefined;
    enterDuration?: string | undefined;
    leaveDuration?: string | undefined;
    enterClass?: string | undefined;
    leaveClass?: string | undefined;
    target?: unknown;
    side?: "top" | "bottom" | "left" | "right" | undefined;
    align?: "start" | "center" | "end" | undefined;
    group?: string | undefined;
    accept?: (() => void) | undefined;
    reject?: (() => void) | undefined;
    onCustom?: ((button: AlertButton, index: number) => void) | undefined;
};
export declare const __alertSettle: typeof settle;
export declare const __alertClose: typeof close;
export {};
