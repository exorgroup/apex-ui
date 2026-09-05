import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import { useApexAlert, __alertState } from '../src/core/alert';

/**
 * The surface carried over from ApexConfirmDialog.
 *
 * ApexAlert replaces it, and the agreement was that nothing it exposed would
 * be lost: the icon family, images, custom buttons, the panel options. Those
 * are easy to declare and easy to leave unwired — a prop that is accepted and
 * ignored typechecks perfectly and renders nothing.
 */

const alert = useApexAlert();

function mountAlert(options: Record<string, unknown> = {}, props: Record<string, unknown> = {}) {
  return mount(ApexAlert, {
    props,
    /* Through the plugin, not global.provide: ApexUI.install provides
       APEX_UI_OPTIONS itself, and its empty default would win. */
    global: { plugins: [[ApexUI, options]] },
    attachTo: document.body,
  });
}

const labels = () => [...document.querySelectorAll('.apex-alert-actions button')]
  .map((b) => b.textContent?.trim());

let wrapper: ReturnType<typeof mountAlert>;
afterEach(() => { alert.close(); wrapper?.unmount(); document.body.innerHTML = ''; });

describe('the figure: tone by default, icon or image on request', () => {
  beforeEach(() => { wrapper = mountAlert(); });

  it('draws the tone figure when neither is given', async () => {
    const p = alert.notify({ tone: 'success', title: 'Saved' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-svg'), 'the drawn figure is the default').toBeTruthy();
    alert.close(); await p.catch(() => {});
  });

  it('an icon replaces it, and takes the animation', async () => {
    alert.notify({ title: 'Heads up', icon: 'warning', iconAnimation: 'shake' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-svg'), 'no drawn figure now').toBeFalsy();
    const icon = document.querySelector('.apex-alert-icon');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('data-anim')).toBe('shake');
  });

  it('an image replaces it too, and carries its alt', async () => {
    alert.notify({ title: 'Preview', image: '/poster.jpg', imageAlt: 'The poster' });
    await wrapper.vm.$nextTick();
    const img = document.querySelector('.apex-alert-image');
    expect(img?.getAttribute('src')).toBe('/poster.jpg');
    expect(img?.getAttribute('alt')).toBe('The poster');
    expect(document.querySelector('.apex-alert-svg')).toBeFalsy();
  });

  it('positions the figure where asked', async () => {
    alert.notify({ title: 'Aside', icon: 'info', iconPosition: 'left' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert')?.getAttribute('data-icon-pos')).toBe('left');
  });
});

describe('buttons', () => {
  beforeEach(() => { wrapper = mountAlert(); });

  it('a custom set replaces the default pair entirely', async () => {
    alert.confirm({
      title: 'Pick one',
      cancelText: 'Cancel',
      buttons: [
        { label: 'Surprise me' },
        { label: 'Delete', role: 'accept', severity: 'danger' },
      ],
    });
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Surprise me', 'Delete']);
  });

  it('runs a button\'s own action', async () => {
    let ran = false;
    alert.confirm({ title: 'Go', buttons: [{ label: 'Do it', action: () => { ran = true; } }] });
    await wrapper.vm.$nextTick();
    await (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    await wrapper.vm.$nextTick();
    expect(ran).toBe(true);
  });

  it('close: false leaves the alert standing', async () => {
    alert.confirm({
      title: 'Stay',
      buttons: [{ label: 'More', close: false }, { label: 'OK', role: 'accept' }],
    });
    await wrapper.vm.$nextTick();
    (document.querySelectorAll('.apex-alert-actions button')[0] as HTMLElement).click();
    await wrapper.vm.$nextTick();
    expect(__alertState.open, 'a button that changes the view must not close it').toBe(true);
  });

  it('a roleless button neither accepts nor rejects', async () => {
    /* It runs, it closes, and confirm() reports false — nothing was agreed to.
       Reporting true here would be the dangerous reading. */
    const p = alert.confirm({ title: 'Hmm', buttons: [{ label: 'Elsewhere' }] });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    expect(await p).toBe(false);
  });

  it('an accept button proceeds, a reject aborts', async () => {
    const yes = alert.confirm({ title: 'Q', buttons: [{ label: 'Yes', role: 'accept' }] });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    expect(await yes).toBe(true);

    const no = alert.confirm({ title: 'Q', buttons: [{ label: 'No', role: 'reject' }] });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    expect(await no).toBe(false);
  });

  it('fires accept, reject and onCustom to match', async () => {
    const seen: string[] = [];
    const p = alert.confirm({
      title: 'Q',
      accept: () => seen.push('accept'),
      onCustom: (b) => seen.push(`custom:${b.label}`),
      buttons: [{ label: 'Other' }],
    });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    await p;
    expect(seen).toEqual(['custom:Other']);
  });

  it('honours acceptLabel and rejectLabel on the default pair', async () => {
    alert.confirm({
      title: 'Delete?', cancelText: 'Keep', acceptLabel: 'Delete it',
    });
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Keep', 'Delete it']);
  });
});

describe('permission gating', () => {
  it('hides a button the resolver denies', async () => {
    wrapper = mountAlert({ can: (action: string) => action !== 'delete' });
    alert.confirm({
      title: 'Manage',
      buttons: [
        { label: 'Rename', can: 'update', resource: 'events' },
        { label: 'Delete', can: 'delete', resource: 'events', role: 'accept' },
      ],
    });
    await wrapper.vm.$nextTick();
    /* Hidden, not disabled: a greyed-out Delete still advertises the action.
       And this is presentation — the endpoint must check for itself. */
    expect(labels()).toEqual(['Rename']);
  });

  it('shows everything when no resolver is registered', async () => {
    wrapper = mountAlert();
    alert.confirm({
      title: 'Manage',
      buttons: [{ label: 'Delete', can: 'delete', resource: 'events' }],
    });
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Delete']);
  });

  it('lets visible override the resolver outright', async () => {
    wrapper = mountAlert({ can: () => false });
    alert.confirm({
      title: 'Manage',
      buttons: [{ label: 'Always', can: 'delete', resource: 'events', visible: true }],
    });
    await wrapper.vm.$nextTick();
    expect(labels()).toEqual(['Always']);
  });
});

describe('panel options', () => {
  beforeEach(() => { wrapper = mountAlert(); });

  it('applies width, background and radius to the panel', async () => {
    alert.notify({ title: 'Wide', width: '720px', background: 'rebeccapurple', radius: '4px' });
    await wrapper.vm.$nextTick();
    const el = document.querySelector('.apex-alert') as HTMLElement;
    expect(el.style.maxWidth).toBe('720px');
    expect(el.style.borderRadius).toBe('4px');
  });

  it('shows a close control only when asked', async () => {
    alert.notify({ title: 'Plain' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-close')).toBeFalsy();

    alert.close();
    alert.notify({ title: 'Closable', closable: true });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-close')).toBeTruthy();
  });

  it('renders a footnote under the buttons', async () => {
    alert.notify({ title: 'Note', footnote: 'This cannot be undone.' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-footnote')?.textContent).toBe('This cannot be undone.');
  });

  it('accepts header as the older name for title', async () => {
    alert.notify({ header: 'From the old API' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-title')?.textContent).toBe('From the old API');
  });

  it('ignores a mask click when dismissableMask is off', async () => {
    alert.confirm({ title: 'Sticky', dismissableMask: false });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-overlay') as HTMLElement)
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: false }));
    await wrapper.vm.$nextTick();
    expect(__alertState.open).toBe(true);
  });
});

describe('autoClose', () => {
  beforeEach(() => { wrapper = mountAlert(); });

  it('shows the countdown on a report', async () => {
    alert.notify({ title: 'Done', autoClose: 3000, showTimer: true });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-timer')).toBeTruthy();
  });

  it('never counts down over the work', async () => {
    /* Dismissing a progress stage on a timer would abandon an action in
       flight and leave the reader believing it finished. */
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      confirm: { title: 'Go?', autoClose: 10, showTimer: true },
      action: () => held,
    });
    await wrapper.vm.$nextTick();

    (document.querySelectorAll('.apex-alert-actions button')[0] as HTMLElement).click();
    /* press() awaits the button's action before settling, and run() then
       advances a microtask later. State flips before the DOM does, so the
       markup needs its own flush — asserting on state alone would have passed
       against a panel still showing the previous stage. */
    await Promise.resolve(); await Promise.resolve();
    await wrapper.vm.$nextTick();

    expect(__alertState.stage).toBe('progress');
    expect(document.querySelector('.apex-alert-timer'), 'no countdown while working').toBeFalsy();

    await new Promise((r) => setTimeout(r, 40));
    expect(__alertState.open, 'still up after the interval would have elapsed').toBe(true);

    release();
    await Promise.resolve(); await Promise.resolve();
    await wrapper.vm.$nextTick();
    alert.close(); await p.catch(() => {});
  });
});

describe('run() ignores an anchor', () => {
  it('drops target, because a staged flow cannot follow a popup', async () => {
    wrapper = mountAlert();
    let release!: () => void;
    const held = new Promise<void>((r) => { release = r; });
    const p = alert.run({
      confirm: { title: 'Go?', target: '#somewhere', side: 'top' },
      action: () => held,
    });
    await wrapper.vm.$nextTick();
    expect(__alertState.target, 'anchoring is not carried into run()').toBeUndefined();

    (document.querySelectorAll('.apex-alert-actions button')[0] as HTMLElement).click();
    await Promise.resolve();
    release();
    await Promise.resolve(); await Promise.resolve();
    await wrapper.vm.$nextTick();
    alert.close(); await p.catch(() => {});
  });
});
