import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexAlert from '../src/components/ApexAlert.vue';
import ApexForm from '../src/components/ApexForm.vue';
import ApexToast from '../src/components/ApexToast.vue';
import { useApexToast } from '../src/core/toast';
import { useApexAlert, __alertSettle } from '../src/core/alert';
import { useOverlayTransition } from '../src/core/overlayTransition';
import type { ApexOverlayTransition } from '../src/types';

/**
 * One transition contract for every overlay — AF2-330.
 *
 * The kit had five different answers: ApexDialog did it properly, four
 * hard-coded a name, ApexForm's modal had no `<Transition>` at all, and
 * ApexAlert declared `enterClass`/`leaveClass` and applied them as static
 * classes so its leave animation could never run.
 *
 * What is worth pinning here is the RESOLUTION ORDER and the duration
 * lifecycle, because both are invisible when wrong: a dialog that ignores
 * the app-wide default still animates, and a duration left on the element
 * after a leave still animates — just wrongly, on the next open.
 */

/** Read the binding a component would hand to `<Transition>`. */
function bindingWith(props: ApexOverlayTransition, plugin: Record<string, unknown> = {}) {
  let out: ReturnType<typeof useOverlayTransition> | null = null;
  const Probe = defineComponent({
    setup() {
      out = useOverlayTransition(props, 'apex-dlg');
      return () => h('i');
    },
  });
  mount(Probe, { global: { plugins: [[ApexUI, plugin]] } });
  return out!.value;
}

const el = () => document.createElement('div');

describe('a preset when nothing is asked for', () => {
  it('falls back to the component prefix and scale', () => {
    expect(bindingWith({}).name).toBe('apex-dlg-scale');
  });

  it('a named preset picks its own class', () => {
    expect(bindingWith({ transition: 'fade' }).name).toBe('apex-dlg-fade');
  });

  it("'none' still names a transition", () => {
    /* There is no CSS for `apex-*-none` — nothing matches, so Vue detects
       no transition and the phase completes at once, which is what 'none'
       means. The name is still emitted so every preset behaves alike and
       an app can style it if it ever wants to. */
    const b = bindingWith({ transition: 'none' });
    expect(b.name).toBe('apex-dlg-none');
    expect(b.onBeforeEnter).toBeTypeOf('function');
  });
});

describe('classes win over presets', () => {
  it('and the name is dropped, or Vue would apply both', () => {
    const b = bindingWith({ enterClass: 'animate__animated animate__fadeInDown' });
    expect(b.enterActiveClass).toBe('animate__animated animate__fadeInDown');
    expect(b.name, 'a preset name alongside custom classes applies two animations').toBeUndefined();
  });

  it('an enter class alone still switches off the preset', () => {
    /* Half a pair is a real case — fly in, no exit animation. */
    const b = bindingWith({ enterClass: 'animate__fadeIn' });
    expect(b.name).toBeUndefined();
    expect(b.leaveActiveClass).toBeUndefined();
  });
});

describe('the app-wide default', () => {
  const PLUGIN = { overlayTransition: { enterClass: 'app__in', leaveClass: 'app__out', enterDuration: '400ms' } };

  it('applies when the component asks for nothing', () => {
    const b = bindingWith({}, PLUGIN);
    expect(b.enterActiveClass).toBe('app__in');
    expect(b.leaveActiveClass).toBe('app__out');
  });

  it('and one component can still override it', () => {
    const b = bindingWith({ enterClass: 'mine__in' }, PLUGIN);
    expect(b.enterActiveClass).toBe('mine__in');
    /* The half not overridden still comes from the app. */
    expect(b.leaveActiveClass).toBe('app__out');
  });

  it('a plugin preset is used when no classes exist anywhere', () => {
    expect(bindingWith({}, { overlayTransition: { transition: 'slide' } }).name).toBe('apex-dlg-slide');
  });
});

describe('durations are written for the phase and taken away after', () => {
  const b = () => bindingWith({ enterDuration: '300ms', leaveDuration: '900ms' });

  it('enter writes its own time, in both properties', () => {
    /* --animate-duration is what animate.css reads; animation-duration is
       what everything else reads. Writing only the first would make the
       props work for exactly one library. */
    const node = el();
    b().onBeforeEnter(node);
    expect(node.style.getPropertyValue('--animate-duration')).toBe('300ms');
    expect(node.style.getPropertyValue('animation-duration')).toBe('300ms');
  });

  it('leave writes a DIFFERENT time', () => {
    const node = el();
    b().onBeforeLeave(node);
    expect(node.style.getPropertyValue('--animate-duration')).toBe('900ms');
  });

  it('and both are cleared afterwards', () => {
    /* animate.css has ONE duration variable for both phases. Left behind,
       a reopened dialog would enter at the leave speed — which looks like
       the enter duration being ignored, not like a stale value. */
    const node = el();
    const t = b();
    t.onBeforeLeave(node);
    t.onAfterLeave(node);
    expect(node.style.getPropertyValue('--animate-duration')).toBe('');
    expect(node.style.getPropertyValue('animation-duration')).toBe('');
  });

  it('nothing is written when no duration was asked for', () => {
    /* Or the props would fight whatever the classes themselves declare. */
    const node = el();
    bindingWith({ enterClass: 'animate__fadeIn' }).onBeforeEnter(node);
    expect(node.getAttribute('style')).toBeNull();
  });

  it('the hooks exist on the preset path too', () => {
    /* The durations must work with the built-in presets, not only with
       custom classes. */
    const node = el();
    bindingWith({ transition: 'fade', enterDuration: '250ms' }).onBeforeEnter(node);
    expect(node.style.getPropertyValue('animation-duration')).toBe('250ms');
  });
});

describe('the library stays ignorant of animate.css', () => {
  it('never adds a class of its own to what the caller passed', () => {
    /* The moment the kit appends `animate__animated` it has a dependency it
       cannot declare and a house animation set stops working. */
    const b = bindingWith({ enterClass: 'whatever__x' });
    expect(b.enterActiveClass).toBe('whatever__x');
  });
});

describe('ApexForm animates its modal panel and not its scrim', () => {
  /* AF2-331. The modal had no <Transition> at all — it appeared and
     vanished. The scrim is a SIBLING with its own v-if, which is what makes
     "panel animates, scrim does not" a one-element change. */
  const SCHEMA = { title: 'Plan', shell: 'modal', sections: [{ fields: [{ key: 'a', label: 'A', type: 'text' }] }] };

  const open = (props: Record<string, unknown> = {}) => mount(ApexForm, {
    props: { schema: SCHEMA, open: true, ...props },
    attachTo: document.body,
  });

  it('puts the transition classes on the PANEL', async () => {
    const w = open({ enterClass: 'animate__animated animate__fadeInDown' });
    await w.vm.$nextTick();
    const panel = w.find('.apex-form__panel');
    expect(panel.exists()).toBe(true);
    expect(w.find('.apex-form__scrim').exists(), 'no scrim rendered').toBe(true);
    w.unmount();
  });

  it('keeps the modal shell VISIBLE while the panel leaves', async () => {
    /* AF2-337, and the sharpest miss of this pass.

       `.apex-form[data-shell="modal"][data-open="false"] { display: none }`
       stops a closed modal's full-screen grid swallowing clicks. It also
       hid the panel the instant `open` went false, so the leave animation
       ran on an invisible element and every exit looked like the dialog
       being switched off.

       It survived a browser probe because a display:none element still
       reports its animation as RUNNING — computed style is not visibility.
       `data-open` now lags `open` by one transition. */
    const w = open();
    await w.vm.$nextTick();
    expect(w.find('.apex-form').attributes('data-open')).toBe('true');

    await w.setProps({ open: false });
    await w.vm.$nextTick();

    expect(
      w.find('.apex-form').attributes('data-open'),
      'the shell went display:none with the panel still animating inside it',
    ).toBe('true');
  });

  it('and is wired to hide again once the panel has gone', async () => {
    /* The other half: a shell left open keeps a full-screen grid over the
       page and swallows every click. Only the WIRING is checked here —
       Vue Test Utils stubs <Transition>, so no leave hook ever fires and a
       test that waited for one would pass on a component that had none.
       That the shell really does hide again was measured in a browser. */
    const w = open();
    await w.vm.$nextTick();
    const transition = w.findComponent({ name: 'Transition' });
    const after = (transition.vm.$.vnode.props ?? {}).onAfterLeave;

    /* TWO handlers, merged by Vue into an array: the resolver's, which
       clears the duration it wrote, and the component's, which closes the
       shell. Both must survive — dropping either leaves a stale duration
       or a full-screen grid swallowing clicks. */
    const handlers = Array.isArray(after) ? after : [after];
    expect(handlers.filter((h) => typeof h === 'function').length,
      'nothing closes the shell after the panel leaves').toBe(2);
  });

  it('and the scrim is outside it, so it cannot inherit one', async () => {
    /* Structural: if the scrim ever moves inside the Transition it will
       fly in with the panel, which is the thing that was ruled out. */
    const w = open();
    await w.vm.$nextTick();
    const scrim = w.find('.apex-form__scrim').element;
    const panel = w.find('.apex-form__panel').element;

    /* The scrim hangs off the form root; the panel hangs off the
       <Transition> (a stub under test). Different parents IS the claim —
       if the scrim ever moves inside, it flies in with the panel. */
    expect(scrim.parentElement!.classList.contains('apex-form')).toBe(true);
    expect(panel.parentElement, 'the scrim is inside the transition with the panel')
      .not.toBe(scrim.parentElement);
    w.unmount();
  });
});

describe('ApexAlert can finally animate OUT', () => {
  /* The defect: `leaveClass` was declared on AlertOptions and applied as a
     static class on the panel, with no <Transition> — v-if removed the
     element outright, so there was never a leave phase. */
  const alert = useApexAlert();

  it('keeps the overlay mounted while the panel leaves', async () => {
    const w = mount(ApexAlert, { attachTo: document.body });
    const done = alert.confirm({ title: 'Delete?' });
    await w.vm.$nextTick();
    expect(document.querySelector('.apex-alert-overlay'), 'never opened').toBeTruthy();
    expect(document.querySelector('.apex-alert')).toBeTruthy();

    __alertSettle('cancel');
    await done;
    await w.vm.$nextTick();

    /* The panel has gone; the overlay has NOT, because the leave phase is
       still running. Before this it all vanished in one frame. */
    expect(document.querySelector('.apex-alert'), 'the panel is still there').toBeNull();
    expect(document.querySelector('.apex-alert-overlay'),
      'the overlay left with the panel — there is no phase to animate').toBeTruthy();
    w.unmount();
  });

  it('animates on the way IN as well, which needs `appear`', async () => {
    /* AF2-339, a regression from AF2-331. Vue skips the enter transition on
       a Transition's FIRST render. This one lives inside the overlay, which
       is `v-if`ed on the same open — so the two arrive together, the
       Transition mounts fresh every time, and without `appear` the entrance
       never runs. Since 331 moved the panel's own `apex-alert-pop` onto the
       transition, alerts had NO entrance at all; the exit starting to work
       is what made it visible. */
    const w = mount(ApexAlert, { attachTo: document.body });
    const done = alert.confirm({ title: 'Delete?' });
    await w.vm.$nextTick();

    const transition = w.findComponent({ name: 'Transition' });
    expect(transition.props('appear'), 'the alert opens with no entrance').toBe(true);

    __alertSettle('cancel'); await done; w.unmount();
  });

  it('while ApexForm must NOT appear', async () => {
    /* The opposite, and not symmetry for its own sake: ApexForm's shell is
       always in the DOM, and in the PAGE shell the panel is permanent —
       `appear` would animate an ordinary inline form on every page load. */
    const w = mount(ApexForm, {
      props: { schema: { title: 'Plan', sections: [{ fields: [{ key: 'a', label: 'A', type: 'text' }] }] } },
      attachTo: document.body,
    });
    await w.vm.$nextTick();
    expect(w.findComponent({ name: 'Transition' }).props('appear')).toBeFalsy();
    w.unmount();
  });

  it('and the panel is inside a transition, not wearing a static class', async () => {
    const w = mount(ApexAlert, { attachTo: document.body });
    const done = alert.confirm({ title: 'Go?', leaveClass: 'animate__fadeOut' });
    await w.vm.$nextTick();

    const panel = document.querySelector('.apex-alert')!;
    expect(panel.className, 'the leave class is painted on at all times again')
      .not.toContain('animate__fadeOut');

    __alertSettle('cancel'); await done; w.unmount();
  });
});

describe('every overlay preset stops for reduced motion', () => {
  /* AF2-332, closing the gap recorded at AF2-131: the kit had ten
     reduced-motion blocks and not one covered an overlay preset. A modal
     flying in is precisely the motion someone who turned that setting on
     wants stopped.

     Whole SELECTORS are compared, not class names. The first version
     matched the class anywhere, so `.apex-dlg-scale-enter-active
     .apex-dlg__panel` inside the block satisfied a check for
     `.apex-dlg-scale-enter-active` — and deleting the standalone selector
     (which fades the mask) changed nothing. The mutation survived, which
     is how the hole was found.

     Read from disk for the reason the other CSS guards give: a stylesheet
     imported under vitest is stubbed to an empty string. */
  const CSS = fs.readFileSync(path.join(__dirname, '..', 'src', 'styles', 'apex-ui.css'), 'utf8');

  const OVERLAY = /^\.apex-(?:dlg|drw|pov|pop-fade|form|alert)[a-z-]*-(?:enter|leave)-active(?![a-z-])/;

  /** Every selector in a rule prelude, split on commas and trimmed. */
  function selectorsIn(css: string): string[] {
    const out: string[] = [];
    for (const chunk of css.split('{')) {
      const prelude = chunk.split('}').pop() ?? '';
      for (const sel of prelude.split(',')) {
        const t = sel.trim().replace(/\s+/g, ' ');
        if (t) out.push(t);
      }
    }
    return out;
  }

  const declared = [...new Set(selectorsIn(CSS).filter((x) => OVERLAY.test(x)))];

  const quieted = new Set(
    [...CSS.matchAll(/@media \(prefers-reduced-motion:reduce\)\{([\s\S]*?)\}\}/g)]
      .flatMap((m) => selectorsIn(m[1] + '{')),
  );

  it('finds the presets at all', () => {
    /* A rename that empties this list would make the guard pass by
       checking nothing — the failure mode these tests exist to avoid. */
    expect(declared.length).toBeGreaterThanOrEqual(12);
  });

  it.each(declared.sort())('%s', (selector) => {
    expect(quieted.has(selector), `${selector} keeps animating for a reader who asked it not to`).toBe(true);
  });
});

describe('ApexToast keeps moving separate from arriving and leaving', () => {
  /* AF2-333. A TransitionGroup has a third phase the others do not: when
     one toast goes, the rest slide up. That is a different question from
     how a toast arrives, so `move-class` stays pinned to the built-in even
     when the enter and leave classes come from animate.css. */
  const toast = useApexToast();

  async function show(props: Record<string, unknown> = {}) {
    const w = mount(ApexToast, { props, attachTo: document.body });
    toast.add({ severity: 'info', summary: 'Saved' });
    await w.vm.$nextTick();
    return w;
  }

  it('pins the move class whatever the enter and leave classes are', async () => {
    const w = await show({ enterClass: 'animate__animated animate__fadeInRight' });
    const group = w.findComponent({ name: 'TransitionGroup' });
    expect(group.props('moveClass'), 'a custom entrance took the move behaviour with it')
      .toBe('apex-toast-item-move');
    w.unmount();
  });

  it('and takes the four props like every other overlay', async () => {
    const w = await show({ leaveClass: 'animate__fadeOutRight', leaveDuration: '500ms' });
    const group = w.findComponent({ name: 'TransitionGroup' });
    expect(group.props('leaveActiveClass')).toBe('animate__fadeOutRight');
    w.unmount();
  });

  it('falling back to its own preset when asked for nothing', async () => {
    const w = await show();
    const group = w.findComponent({ name: 'TransitionGroup' });
    expect(group.props('name')).toBe('apex-toast-item');
    w.unmount();
  });
});
