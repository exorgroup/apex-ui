import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import { useApexAlert, __alertSettle, __alertState } from '../src/core/alert';

/**
 * The figure is drawn from the tone, not from an icon.
 *
 * This is the part of Pando's alert worth keeping, so it is the part most
 * worth pinning: each tone has its own geometry, the cross's second stroke is
 * deliberately late, and the whole figure is re-keyed per stage so the draw
 * replays instead of appearing already finished.
 */

const alert = useApexAlert();

function mountAlert() {
  return mount(ApexAlert, { global: { plugins: [ApexUI] }, attachTo: document.body });
}

/** The figure lives in a Teleport, so it is read off the document. */
const figure = () => document.querySelector('.apex-alert-figure');
const marks = () => [...document.querySelectorAll('.apex-alert-mark')];
const dots = () => [...document.querySelectorAll('.apex-alert-dot')];

let wrapper: ReturnType<typeof mountAlert>;

beforeEach(() => { wrapper = mountAlert(); });
afterEach(() => { alert.close(); wrapper.unmount(); document.body.innerHTML = ''; });

/* Returned wrapped, not bare. An async function that returns a promise has it
   unwrapped by the await at the call site — so `await show()` would wait for
   the alert to be dismissed, which is the very thing the test has not done
   yet, and every one of these deadlocked. */
async function show(tone: 'success' | 'danger' | 'warn' | 'info') {
  const done = alert.notify({ tone, title: 'Test' });
  await wrapper.vm.$nextTick();
  return { done };
}

describe('the tone figure', () => {
  it('draws a tick for success', async () => {
    const { done } = await show('success');
    expect(marks()).toHaveLength(1);
    expect(marks()[0].getAttribute('d')).toBe('M52 88 L74 110 L118 62');
    expect(dots()).toHaveLength(0);
    __alertSettle('confirm'); await done;
  });

  it('draws a cross for danger, with the second stroke late', async () => {
    const { done } = await show('danger');
    expect(marks()).toHaveLength(2);
    /* The stagger is the whole reason it reads as an X being drawn rather
       than two lines appearing. Losing the delay would still look fine in a
       screenshot, which is why it is asserted rather than eyeballed. */
    expect((marks()[1] as HTMLElement).style.animationDelay).toBe('0.75s');
    __alertSettle('confirm'); await done;
  });

  it('draws a stem and a dot for warn', async () => {
    const { done } = await show('warn');
    expect(marks()).toHaveLength(1);
    expect(dots()).toHaveLength(1);
    __alertSettle('confirm'); await done;
  });

  it('draws an inverted i for info — dot first, then the stem', async () => {
    const { done } = await show('info');
    expect(dots()).toHaveLength(1);
    expect((marks()[0] as HTMLElement).style.animationDelay).toBe('0.7s');
    __alertSettle('confirm'); await done;
  });

  it('gives every path its own draw length', async () => {
    /* --len has to be inline: no stylesheet can know how long an arbitrary
       path is, and a shared value would over- or under-run each stroke. */
    const { done } = await show('success');
    expect((marks()[0] as HTMLElement).style.getPropertyValue('--len')).toBe('100');
    __alertSettle('confirm'); await done;
  });

  it('carries the tone on the panel, which is what colours the ring', async () => {
    const { done } = await show('danger');
    expect(document.querySelector('.apex-alert')?.getAttribute('data-tone')).toBe('danger');
    __alertSettle('confirm'); await done;
  });
});

describe('the progress stage', () => {
  it('shows a spinner instead of a figure, and nothing to press', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({ action: () => held });
    await wrapper.vm.$nextTick();

    expect(document.querySelector('.apex-psp'), 'the spinner is up').toBeTruthy();
    expect(marks(), 'no drawn figure while working').toHaveLength(0);
    expect(document.querySelectorAll('.apex-alert-actions button'), 'nothing to decide').toHaveLength(0);

    release();
    await Promise.resolve(); await Promise.resolve();
    await wrapper.vm.$nextTick();
    __alertSettle('confirm'); await p;
  });

  it('ignores Escape while the work runs', async () => {
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({ action: () => held });
    await wrapper.vm.$nextTick();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await wrapper.vm.$nextTick();
    expect(__alertState.open, 'there is no abort to offer').toBe(true);
    expect(__alertState.stage).toBe('progress');

    release();
    await Promise.resolve(); await Promise.resolve();
    await wrapper.vm.$nextTick();
    __alertSettle('confirm'); await p;
  });
});

describe('the figure replays per stage', () => {
  it('is re-keyed, so a later stage draws rather than arriving finished', async () => {
    /* Without the key the tick is drawn once on first mount and every
       subsequent tone shows a completed figure — the same trap the scroll
       directive hit, and just as invisible in a static render. */
    const first = alert.notify({ tone: 'success', title: 'One' });
    await wrapper.vm.$nextTick();
    const a = figure();
    __alertSettle('confirm'); await first;

    const second = alert.notify({ tone: 'danger', title: 'Two' });
    await wrapper.vm.$nextTick();
    const b = figure();
    __alertSettle('confirm'); await second;

    expect(a, 'both stages rendered a figure').toBeTruthy();
    expect(b).toBeTruthy();
    expect(a, 'a new element, not the same one restyled').not.toBe(b);
  });
});

describe('the changes diff', () => {
  it('lists each field as from → to, as text', async () => {
    const p = alert.confirm({
      title: 'Save?',
      changes: [{ label: 'Capacity', from: 120, to: 180 }],
    });
    await wrapper.vm.$nextTick();

    const li = document.querySelector('.apex-alert-changes li');
    expect(li?.textContent).toContain('Capacity');
    expect(li?.querySelector('.apex-alert-changes__from')?.textContent).toBe('120');
    expect(li?.querySelector('.apex-alert-changes__to')?.textContent).toBe('180');
    __alertSettle('confirm'); await p;
  });

  it('shows an em dash where a value is absent, not "undefined"', async () => {
    const p = alert.confirm({
      title: 'Save?',
      changes: [{ label: 'Notes', to: 'Added' }],
    });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-changes__from')?.textContent).toBe('—');
    __alertSettle('confirm'); await p;
  });
});
