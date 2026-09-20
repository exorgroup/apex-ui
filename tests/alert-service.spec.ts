import { describe, it, expect, beforeEach } from 'vitest';
import { watch } from 'vue';
import {
  useApexAlert, setAlertInterpreter, __alertState, __alertSettle,
} from '../src/core/alert';

/**
 * The alert state machine.
 *
 * The point of `run()` is that one alert carries the whole act — confirm,
 * progress, result — without closing in between. That is behaviour no
 * rendering test can see, and it is exactly what would rot first: someone
 * "simplifies" a stage transition into a close-and-reopen and the only
 * symptom is a flicker nobody writes a bug report about.
 */

const alert = useApexAlert();

/** Press a button, the way ApexAlert does. */
const press = (kind: string) => __alertSettle(kind);

beforeEach(() => {
  setAlertInterpreter(null);
  alert.close();
});

describe('confirm()', () => {
  it('resolves true only for the accepting press', async () => {
    const yes = alert.confirm({ title: 'Delete area?' });
    expect(__alertState.open).toBe(true);
    expect(__alertState.stage).toBe('confirm');
    press('confirm');
    expect(await yes).toBe(true);
    expect(__alertState.open, 'closes once answered').toBe(false);

    const no = alert.confirm({ title: 'Delete area?' });
    press('cancel');
    expect(await no).toBe(false);
  });

  it('carries the changes list, so an edit can be read before it is agreed', async () => {
    const p = alert.confirm({
      title: 'Save changes?',
      changes: [{ label: 'Capacity', from: 120, to: 180 }],
    });
    expect(__alertState.changes).toEqual([{ label: 'Capacity', from: 120, to: 180 }]);
    press('confirm');
    await p;
  });
});

describe('notify()', () => {
  it('is one button — a report has nothing to decline', async () => {
    const p = alert.notify({ title: 'Copied', copyText: 'hunter2' });
    expect(__alertState.stage).toBe('result');
    expect(__alertState.cancelText, 'no cancel on a notify').toBeNull();
    expect(__alertState.copyText).toBe('hunter2');
    press('confirm');
    await p;
    expect(__alertState.open).toBe(false);
  });
});

describe('run()', () => {
  it('never closes between stages', async () => {
    /* The whole reason this service exists rather than a confirm plus a toast.
       Sampling `open` at each stage is not enough: a close-and-reopen in
       between is over before the next sample and reads as continuous. The
       first version of this test did exactly that and passed against a
       deliberately broken run(). So watch every write instead — synchronously,
       or Vue coalesces the toggle away and hides it again. */
    const opens: boolean[] = [];
    const stop = watch(() => __alertState.open, (v) => opens.push(v), { flush: 'sync' });

    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });

    const p = alert.run({
      confirm: { title: 'Delete area?' },
      progressTitle: 'Deleting…',
      action: () => held,
    });
    expect(__alertState.stage).toBe('confirm');

    press('confirm');
    await Promise.resolve();
    expect(__alertState.stage).toBe('progress');

    release();
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.stage).toBe('result');

    press('confirm');
    expect(await p).toBe(true);
    stop();

    /* One rise on open, one fall at the very end. Anything more is a flicker. */
    expect(opens, 'open must be written exactly twice: up, then down').toEqual([true, false]);
  });

  it('offers nothing to press while the work is running', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({ confirm: null, action: () => held });

    await Promise.resolve();
    expect(__alertState.stage).toBe('progress');
    /* A Cancel here would promise an abort the caller never wired up. */
    expect(__alertState.cancelText).toBeNull();
    expect(__alertState.confirmText).toBeUndefined();

    release();
    await Promise.resolve(); await Promise.resolve();
    press('confirm');
    await p;
  });

  it('skips straight to progress when there is nothing to confirm', async () => {
    const p = alert.run({ action: () => undefined });
    await Promise.resolve();
    expect(__alertState.stage).not.toBe('confirm');
    press('confirm');
    expect(await p).toBe(true);
  });

  it('returns false and runs nothing when the confirm is declined', async () => {
    let ran = false;
    const p = alert.run({
      confirm: { title: 'Delete?' },
      action: () => { ran = true; },
    });
    press('cancel');
    expect(await p).toBe(false);
    expect(ran, 'the action must not have run').toBe(false);
    expect(__alertState.open).toBe(false);
  });

  it('treats a rejection as a failure, not a success', async () => {
    const p = alert.run({ action: () => Promise.reject(new Error('422')) });
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(__alertState.stage).toBe('result');
    expect(__alertState.tone).toBe('warn');
    press('confirm');
    expect(await p).toBe(false);
  });

  it('believes a completed action that reports failure', async () => {
    /* A request can finish and still have been refused. Resolving is not the
       same as succeeding, and claiming "Done" over a refusal is the specific
       lie this exists to prevent. */
    const p = alert.run({
      action: () => ({ ok: false, message: 'Area is in use' }),
    });
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.tone).toBe('warn');
    expect(__alertState.message).toBe('Area is in use');
    press('confirm');
    expect(await p).toBe(false);
  });

  it('uses a registered interpreter, so call sites need not change', async () => {
    /* This is what lets Pando's 53 call sites migrate as one registration:
       its flash-bag reading becomes an interpreter, and none of them move. */
    setAlertInterpreter(() => ({ ok: false, message: 'from the flash bag' }));

    const p = alert.run({ action: () => undefined });
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.message).toBe('from the flash bag');
    press('confirm');
    expect(await p).toBe(false);
  });

  it('lets one call override the registered interpreter', async () => {
    setAlertInterpreter(() => ({ ok: false, message: 'global' }));
    const p = alert.run({
      action: () => undefined,
      interpret: () => ({ ok: true, message: 'local' }),
    });
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.message).toBe('local');
    press('confirm');
    expect(await p).toBe(true);
  });
});

describe('the stage carries nothing stale', () => {
  it('drops the previous stage\'s buttons and changes', async () => {
    const p = alert.run({
      confirm: {
        title: 'Save?',
        changes: [{ label: 'Capacity', from: 1, to: 2 }],
        cancelText: 'No',
      },
      action: () => undefined,
    });
    press('confirm');
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

    expect(__alertState.stage).toBe('result');
    expect(__alertState.changes, 'the diff belonged to the question').toBeNull();
    expect(__alertState.cancelText, 'nothing left to decline').toBeNull();
    press('confirm');
    await p;
  });

  it('bumps seq per stage, so the host can replay its animation', async () => {
    const before = __alertState.seq;
    const p = alert.run({ confirm: { title: 'Go?' }, action: () => undefined });
    press('confirm');
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(__alertState.seq).toBeGreaterThan(before + 1);
    press('confirm');
    await p;
  });
});

describe('the progress and result bags', () => {
  /* Added for the first real CRUD screen (AF2-308). `run()` could set a
     progress TITLE and nothing else, and the result stage took its whole
     shape from the outcome — so a caller could not ask for "gears while it
     saves, and close itself after three seconds", which is the ordinary
     thing every save wants. */

  it('carries the progress bag onto the progress stage', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      progress: { title: 'Saving…', icon: 'settings' },
      action: () => held,
    });

    await Promise.resolve();
    expect(__alertState.stage).toBe('progress');
    expect(__alertState.title).toBe('Saving…');
    expect(__alertState.icon).toBe('settings');

    release();
    await Promise.resolve(); await Promise.resolve();
    press('confirm');
    await p;
  });

  it('still offers nothing to press, whatever the progress bag asks for', async () => {
    /* The one invariant the bag must not be able to break: a Cancel over a
       spinner promises an abort no caller has wired up. */
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      progress: { cancelText: 'Stop', confirmText: 'Now', buttons: [{ label: 'Abort' }] },
      action: () => held,
    });

    await Promise.resolve();
    expect(__alertState.cancelText).toBeNull();
    expect(__alertState.confirmText).toBeUndefined();
    expect(__alertState.buttons).toBeUndefined();

    release();
    await Promise.resolve(); await Promise.resolve();
    press('confirm');
    await p;
  });

  it('progressTitle still wins, because it was the only way to say it', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      progressTitle: 'Old way',
      progress: { title: 'New way' },
      action: () => held,
    });
    await Promise.resolve();
    expect(__alertState.title).toBe('Old way');
    release();
    await Promise.resolve(); await Promise.resolve();
    press('confirm'); await p;
  });

  it('carries the result bag onto the result stage', async () => {
    const p = alert.run({
      result: { autoClose: 3000, showTimer: true, confirmText: 'Dismiss' },
      action: () => ({ ok: true, title: 'Record saved' }),
    });
    await Promise.resolve(); await Promise.resolve();

    expect(__alertState.stage).toBe('result');
    expect(__alertState.autoClose).toBe(3000);
    expect(__alertState.showTimer).toBe(true);
    expect(__alertState.confirmText).toBe('Dismiss');
    press('confirm');
    expect(await p).toBe(true);
  });

  it('the outcome still overrules the bag', async () => {
    /* The bag is presentation; the outcome is the judgement. A result bag
       carrying an optimistic title must not silence a refusal. */
    const p = alert.run({
      result: { title: 'Record saved', tone: 'success', autoClose: 3000 },
      action: () => ({ ok: false, title: 'Not deleted', message: 'Still in use' }),
    });
    await Promise.resolve(); await Promise.resolve();

    expect(__alertState.title).toBe('Not deleted');
    expect(__alertState.message).toBe('Still in use');
    expect(__alertState.tone).toBe('warn');
    /* And the presentation the outcome says nothing about survives. */
    expect(__alertState.autoClose).toBe(3000);
    press('confirm');
    expect(await p).toBe(false);
  });

  it('the bag supplies a title only when the outcome has none', async () => {
    const p = alert.run({
      result: { title: 'Done' },
      action: () => undefined,
    });
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.title).toBe('Done');
    press('confirm'); await p;
  });

  it('neither bag leaks into the other stage', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      progress: { icon: 'settings' },
      result: { autoClose: 3000 },
      action: () => held,
    });

    await Promise.resolve();
    expect(__alertState.autoClose, 'a progress stage that closes itself abandons the work').toBeUndefined();

    release();
    await Promise.resolve(); await Promise.resolve();
    expect(__alertState.icon, 'the gears belonged to the work, which is over').toBeUndefined();
    press('confirm'); await p;
  });
});
