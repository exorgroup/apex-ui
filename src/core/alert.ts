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

export interface AlertOptions {
  tone?: AlertTone;
  title?: string;
  message?: string;
  /** Shows what is about to change, so a confirm can be read rather than trusted. */
  changes?: AlertChange[] | null;
  /** Label for the accepting button. Undefined lets the host translate a default. */
  confirmText?: string;
  /** Omit for a one-button alert; `notify()` never shows one. */
  cancelText?: string | null;
  /** When set, a button copies this to the clipboard — a generated password. */
  copyText?: string | null;
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

const state = reactive<AlertState>({
  open: false,
  stage: 'confirm',
  tone: 'info',
  title: '',
  message: '',
  changes: null,
  confirmText: undefined,
  cancelText: null,
  copyText: null,
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
  resolver = null;
}

/**
 * Move to a new stage, clearing what the last one set.
 *
 * Explicitly resetting rather than merging: a progress stage that inherited the
 * confirm's buttons would offer Cancel over a spinner, and a success stage that
 * kept `changes` would list the edits again under "Done".
 */
function setStage(stage: AlertStage, patch: AlertOptions) {
  Object.assign(state, {
    open: true,
    stage,
    changes: null,
    cancelText: null,
    copyText: null,
    confirmText: undefined,
    message: '',
    seq: state.seq + 1,
  }, patch);
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
    setStage('confirm', { tone: 'warn', ...confirmOpts });
    if (await wait() !== 'confirm') { close(); return false; }
  }

  /* No buttons here: the work is under way and there is nothing to decide.
     Leaving a Cancel would promise an abort the caller never asked for. */
  setStage('progress', { tone: 'info', title: progressTitle });

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

  setStage('result', {
    tone: outcome.tone ?? (outcome.ok ? 'success' : 'warn'),
    title: outcome.title,
    message: outcome.message ?? '',
  });

  await wait();
  close();
  return !!outcome.ok;
}

export function useApexAlert() {
  return { state: readonly(state) as AlertState, confirm, notify, run, settle, close };
}

/** Internal handles for ApexAlert, which needs to write and to settle. */
export const __alertState = state;
export const __alertSettle = settle;
export const __alertClose = close;
