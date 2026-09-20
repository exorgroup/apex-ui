import { reactive, readonly } from 'vue';

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

export type AlertSeverity =
  'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast';

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

  /* ── the figure ──────────────────────────────────────────────
     The tone figure is the default. Supplying an icon or an image replaces it,
     at which point iconAnimation applies to that icon instead. So the drawn
     figure is what you get without asking, and the icon path stays available
     for the cases that need a specific glyph. */
  icon?: string;
  iconPosition?: 'top' | 'left' | 'right' | 'bottom';
  /** No `spin` — a confirmation is not loading, and spinning it says otherwise. */
  iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce';
  iconColor?: string;
  image?: string;
  imageAlt?: string;

  /* ── buttons ─────────────────────────────────────────────── */
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

  /* ── panel ───────────────────────────────────────────────── */
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

  /* ── anchored ────────────────────────────────────────────── */
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

interface AlertState extends AlertOptions {
  open: boolean;
  stage: AlertStage;
  /** Bumped per stage so the host can replay its entrance animation. */
  seq: number;
}

/**
 * Everything a stage starts from.
 *
 * One list, spread on every transition, rather than a hand-written reset per
 * field. With forty options a hand-written list is a matter of time before one
 * is forgotten — and a forgotten field is a confirm's Delete button surviving
 * into the success stage, which looks like an offer to delete it again.
 */
const BLANK: AlertOptions = {
  tone: 'info',
  title: undefined,
  header: undefined,
  message: '',
  changes: null,
  confirmText: undefined,
  cancelText: null,
  copyText: null,
  icon: undefined,
  iconPosition: undefined,
  iconAnimation: undefined,
  iconColor: undefined,
  image: undefined,
  imageAlt: undefined,
  buttons: undefined,
  acceptLabel: undefined,
  rejectLabel: undefined,
  acceptIcon: undefined,
  rejectIcon: undefined,
  acceptSeverity: undefined,
  rejectSeverity: undefined,
  footnote: undefined,
  width: undefined,
  padding: undefined,
  background: undefined,
  radius: undefined,
  maskColor: undefined,
  maskBlur: undefined,
  closable: undefined,
  dismissableMask: undefined,
  autoClose: undefined,
  showTimer: undefined,
  ripple: undefined,
  transition: undefined,
  enterDuration: undefined,
  leaveDuration: undefined,
  enterClass: undefined,
  leaveClass: undefined,
  target: undefined,
  side: undefined,
  align: undefined,
  group: undefined,
  accept: undefined,
  reject: undefined,
  onCustom: undefined,
};

const state = reactive<AlertState>({
  ...BLANK,
  open: false,
  stage: 'confirm',
  seq: 0,
});

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
let interpreter: ((raw: AlertRunResult | void) => AlertRunResult) | null = null;

export function setAlertInterpreter(fn: typeof interpreter) {
  interpreter = fn;
}

/* One resolver for the button press the current stage is waiting on. */
let resolver: ((kind: string) => void) | null = null;

function wait(): Promise<string> {
  return new Promise((resolve) => { resolver = resolve; });
}

/** Called by the host when a button is pressed. */
function settle(kind: string) {
  const r = resolver;
  resolver = null;
  if (r) r(kind);
}

function close() {
  state.open = false;
  state.stage = 'confirm';
  /* Settle anyone still waiting rather than dropping the resolver on the
     floor. Closing programmatically — a route change, a teardown — used to
     leave `await confirm()` pending for the life of the page. It reports
     cancel, because nothing was agreed to. */
  const r = resolver;
  resolver = null;
  if (r) r('cancel');
}

/**
 * Move to a new stage, clearing what the last one set.
 *
 * Explicitly resetting rather than merging: a progress stage that inherited the
 * confirm's buttons would offer Cancel over a spinner, and a success stage that
 * kept `changes` would list the edits again under "Done".
 */
function setStage(stage: AlertStage, patch: AlertOptions) {
  Object.assign(state, BLANK, { open: true, stage, seq: state.seq + 1 }, patch);
  /* `header` is the older name for the same thing; settle it here so nothing
     downstream has to know there are two. */
  if (patch.header !== undefined && patch.title === undefined) state.title = patch.header;
}

/** Asks, and resolves true only if the accepting button was pressed. */
function confirm(options: AlertOptions): Promise<boolean> {
  setStage('confirm', { tone: 'warn', cancelText: null, ...options });
  return wait().then((kind) => { close(); return kind === 'confirm'; });
}

/** States an outcome and waits for acknowledgement. */
function notify(options: AlertOptions): Promise<void> {
  setStage('result', { tone: 'success', ...options, cancelText: null });
  return wait().then(() => { close(); });
}

/**
 * Confirm, run, and report — in one alert that never closes in between.
 *
 * Returns whether the action succeeded, so a caller can branch. Declining at
 * the confirm stage returns false too: nothing happened, which for a caller
 * asking "did this go through?" is the same answer.
 */
async function run(options: AlertRunOptions): Promise<boolean> {
  const { confirm: confirmOpts = null, progressTitle, action } = options;

  if (confirmOpts) {
    /* Anchoring is dropped rather than honoured: a staged flow has to stay put
       across three stages, and the element it would anchor to is usually the
       button that has just been pressed. confirm() may anchor; this may not. */
    const { target: _anchored, side: _s, align: _a, ...dialogOnly } = confirmOpts;
    setStage('confirm', { tone: 'warn', ...dialogOnly });
    if (await wait() !== 'confirm') { close(); return false; }
  }

  /* No buttons here: the work is under way and there is nothing to decide.
     Leaving a Cancel would promise an abort the caller never asked for — so
     a caller's `buttons`, `confirmText` and `cancelText` are dropped rather
     than merged, whatever the progress bag says. */
  const { buttons: _b, confirmText: _c, cancelText: _x, ...progressOpts } = options.progress ?? {};
  setStage('progress', {
    tone: 'info',
    ...progressOpts,
    title: progressTitle ?? progressOpts.title,
  });

  let outcome: AlertRunResult;
  try {
    const raw = await action();
    const read = options.interpret ?? interpreter;
    outcome = read ? read(raw) : (raw && typeof raw === 'object' ? raw : {});
    if (outcome.ok === undefined) outcome.ok = true;
  } catch {
    /* A rejection is the transport or validation failing. The message stays
       generic because the specifics belong on the form's own fields, which is
       what the reader sees once this closes. */
    outcome = { ok: false };
  }

  /* The caller's presentation first, the outcome's judgement over it. A
     result bag carrying a title would otherwise silence the one thing the
     action actually learned. */
  const resultOpts = options.result ?? {};
  setStage('result', {
    ...resultOpts,
    tone: outcome.tone ?? (outcome.ok ? 'success' : 'warn'),
    title: outcome.title ?? resultOpts.title,
    message: outcome.message ?? resultOpts.message ?? '',
  });

  await wait();
  close();
  return !!outcome.ok;
}

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
async function press(b: AlertButton, index = 0) {
  await b.action?.();

  if (b.role === 'accept') state.accept?.();
  else if (b.role === 'reject' || b.role === 'cancel') state.reject?.();
  else state.onCustom?.(b, index);

  if (b.close === false) return;
  settle(b.role === 'accept' ? 'confirm' : b.role ? 'cancel' : 'custom');
}

export function useApexAlert() {
  return { state: readonly(state) as AlertState, confirm, notify, run, settle, press, close };
}

/** Internal handles for ApexAlert, which needs to write and to settle. */
export const __alertState = state;
export const __alertSettle = settle;
export const __alertClose = close;
