import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import { useApexAlert, __alertState } from '../src/core/alert';

/**
 * The host's props, and its slots.
 *
 * These exist for a reason the option tests cannot reach: a prop is the app's
 * house style, applied when a call says nothing. Six of them — group, header,
 * message, icon, iconPosition, iconAnimation — were declared and never read,
 * and every existing test passed, because they all set the option instead. A
 * prop that is accepted and ignored typechecks, renders, and is wrong.
 */

const alert = useApexAlert();

const mountAlert = (props: Record<string, unknown> = {}) => mount(ApexAlert, {
  props,
  global: { plugins: [ApexUI] },
  attachTo: document.body,
});

let wrapper: VueWrapper;
afterEach(() => { alert.close(); wrapper?.unmount(); document.body.innerHTML = ''; });

const text = (sel: string) => document.querySelector(sel)?.textContent?.trim();

describe('props are the fallback a call can override', () => {
  it('header supplies a title when the call gives none', async () => {
    wrapper = mountAlert({ header: 'House default' });
    alert.notify({});
    await wrapper.vm.$nextTick();
    expect(text('.apex-alert-title')).toBe('House default');
  });

  it('and a call\'s own title wins', async () => {
    wrapper = mountAlert({ header: 'House default' });
    alert.notify({ title: 'This one' });
    await wrapper.vm.$nextTick();
    expect(text('.apex-alert-title')).toBe('This one');
  });

  it('message does the same', async () => {
    wrapper = mountAlert({ message: 'Standing text' });
    alert.notify({ title: 'T' });
    await wrapper.vm.$nextTick();
    expect(text('.apex-alert-text')).toBe('Standing text');

    alert.close();
    alert.notify({ title: 'T', message: 'Specific text' });
    await wrapper.vm.$nextTick();
    expect(text('.apex-alert-text')).toBe('Specific text');
  });

  it('icon, its position and its animation all come through', async () => {
    wrapper = mountAlert({ icon: 'warning', iconPosition: 'left', iconAnimation: 'bounce' });
    alert.notify({ title: 'T' });
    await wrapper.vm.$nextTick();

    const el = document.querySelector('.apex-alert-icon');
    expect(el, 'the prop icon replaces the tone figure').toBeTruthy();
    expect(el?.getAttribute('data-anim')).toBe('bounce');
    expect(document.querySelector('.apex-alert')?.getAttribute('data-icon-pos')).toBe('left');
  });

  it('keeps the drawn figure when no icon is given anywhere', async () => {
    /* Wiring `icon` must not accidentally make an icon the default: the tone
       figure is the thing worth keeping from Pando. */
    wrapper = mountAlert();
    alert.notify({ title: 'T' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert-svg')).toBeTruthy();
    expect(document.querySelector('.apex-alert-icon')).toBeFalsy();
  });
});

describe('group', () => {
  it('a grouped host answers only its own group', async () => {
    /* Same shape as the target split: with this unread, a per-kind host
       answered every request, and two hosts would both draw the same alert. */
    wrapper = mountAlert({ group: 'billing' });

    alert.notify({ title: 'For billing', group: 'billing' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert'), 'its own group').toBeTruthy();

    alert.close();
    alert.notify({ title: 'For someone else', group: 'shipping' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert'), 'not another group').toBeFalsy();

    alert.close();
    alert.notify({ title: 'Ungrouped' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert'), 'nor an ungrouped one').toBeFalsy();
  });

  it('an ungrouped host answers only ungrouped requests', async () => {
    wrapper = mountAlert();

    alert.notify({ title: 'Plain' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert')).toBeTruthy();

    alert.close();
    alert.notify({ title: 'Grouped', group: 'billing' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.apex-alert'), 'that belongs to a grouped host').toBeFalsy();
  });
});

describe('slots', () => {
  it('container replaces the panel and is handed what it needs', async () => {
    wrapper = mount(ApexAlert, {
      global: { plugins: [ApexUI] },
      attachTo: document.body,
      slots: {
        container: `<template #container="{ state, buttons, press }">
          <div class="mine">
            <b>{{ state.title }}</b>
            <button v-for="(b, i) in buttons" :key="i" class="mine-btn" @click="press(b, i)">{{ b.label }}</button>
          </div>
        </template>`,
      },
    });

    const p = alert.confirm({ title: 'Own chrome', cancelText: 'No' });
    await wrapper.vm.$nextTick();

    expect(document.querySelector('.apex-alert'), 'the default panel steps aside').toBeFalsy();
    expect(document.querySelector('.mine b')?.textContent).toBe('Own chrome');

    /* The slot gets the real press handler, not a copy — a container that
       could render but not settle would look complete and hang the caller. */
    const btns = [...document.querySelectorAll('.mine-btn')];
    (btns[btns.length - 1] as HTMLElement).click();
    expect(await p).toBe(true);
  });

  it('icon replaces the figure', async () => {
    wrapper = mount(ApexAlert, {
      global: { plugins: [ApexUI] },
      attachTo: document.body,
      slots: { icon: '<span class="my-figure">!</span>' },
    });
    alert.notify({ title: 'T' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.my-figure')).toBeTruthy();
    expect(document.querySelector('.apex-alert-svg')).toBeFalsy();
  });

  it('message replaces the body text', async () => {
    wrapper = mount(ApexAlert, {
      global: { plugins: [ApexUI] },
      attachTo: document.body,
      slots: { message: '<p class="my-body">Rich content</p>' },
    });
    alert.notify({ title: 'T', message: 'plain' });
    await wrapper.vm.$nextTick();
    expect(text('.my-body')).toBe('Rich content');
    expect(document.querySelector('.apex-alert-text')).toBeFalsy();
  });

  it('footer replaces the button row', async () => {
    wrapper = mount(ApexAlert, {
      global: { plugins: [ApexUI] },
      attachTo: document.body,
      slots: { footer: '<button class="only-mine">Close</button>' },
    });
    alert.confirm({ title: 'T', cancelText: 'No' });
    await wrapper.vm.$nextTick();
    expect(document.querySelector('.only-mine')).toBeTruthy();
    expect(document.querySelectorAll('.apex-alert-actions .apex-btn')).toHaveLength(0);
  });
});

describe('role semantics inside run()', () => {
  const held = () => {
    let release!: () => void;
    const promise = new Promise<void>((r) => { release = r; });
    return { promise, release };
  };

  it('an accept button proceeds to the work', async () => {
    wrapper = mountAlert();
    const h = held();
    let ran = false;
    const p = alert.run({
      confirm: { title: 'Go?', buttons: [{ label: 'Go', role: 'accept' }] },
      action: () => { ran = true; return h.promise; },
    });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();
    await Promise.resolve(); await Promise.resolve();

    expect(ran, 'accept runs the action').toBe(true);
    expect(__alertState.stage).toBe('progress');

    h.release();
    await Promise.resolve(); await Promise.resolve();
    alert.close(); await p.catch(() => {});
  });

  it('a reject button aborts it', async () => {
    wrapper = mountAlert();
    let ran = false;
    const p = alert.run({
      confirm: { title: 'Go?', buttons: [{ label: 'Stop', role: 'reject' }] },
      action: () => { ran = true; },
    });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();

    expect(await p).toBe(false);
    expect(ran, 'reject must not run the action').toBe(false);
  });

  it('a roleless button runs its own action and stops there', async () => {
    /* The rule we settled: it does its thing and the flow does not proceed.
       Running the work would be the dangerous reading — "Surprise me" would
       delete the record. */
    wrapper = mountAlert();
    let own = false;
    let work = false;
    const p = alert.run({
      confirm: { title: 'Go?', buttons: [{ label: 'Elsewhere', action: () => { own = true; } }] },
      action: () => { work = true; },
    });
    await wrapper.vm.$nextTick();
    (document.querySelector('.apex-alert-actions button') as HTMLElement).click();

    expect(await p).toBe(false);
    expect(own, 'its own action ran').toBe(true);
    expect(work, 'the flow\'s work did not').toBe(false);
  });
});
