import { describe, it, expect } from 'vitest';
import { reactive } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * What the engine and the first mount could not reach: the host boundary.
 *
 * AF2-290 covered the rules, the conditions and the driver's three kinds;
 * AF2-291 covered the layouts, read-only and "it never submits". What is
 * left is the part that only exists when a real host form is bound — server
 * errors and who wins, the Precognition per-field call, and the dirty flag.
 *
 * These matter more than their size suggests: they are the behaviour a
 * migrated Pando form is judged against, and getting them wrong is not a
 * crash, it is a form that quietly disagrees with the server.
 */

const SCHEMA = {
  sections: [{
    fields: [
      { key: 'name', label: 'Name', type: 'text', rules: 'required' },
      { key: 'email', label: 'Email', type: 'text', rules: 'email' },
    ],
  }],
};

/** A minimal Inertia-shaped form: data, errors, no validate(). */
function inertia(data: Record<string, unknown>, errors: Record<string, string[]> = {}) {
  return {
    data,
    errors,
    processing: false,
    post() {},
    clearErrors(path?: string) {
      if (path) delete (this.errors as Record<string, unknown>)[path];
      else this.errors = {};
    },
  };
}

async function bound(form: Record<string, unknown>, props: Record<string, unknown> = {}) {
  const w = mount(ApexForm, { props: { schema: SCHEMA, form, ...props }, attachTo: document.body });
  await flushPromises();
  return w;
}

describe('server errors win', () => {
  it('a server message shows even when the local rules are happy', async () => {
    /* "Ada" passes `required`. The server disagreed anyway — a uniqueness
       check, a policy, something the browser cannot know — and its verdict
       is the one on screen. */
    const form = inertia({ name: 'Ada', email: '' }, { name: ['That name is taken.'] });
    const w = await bound(form);
    expect(w.text()).toContain('That name is taken.');
    w.unmount();
  });

  it('and it wins over a local message on the SAME field', async () => {
    /* The decisive case, and the one the first draft of this file missed:
       every fixture gave a field either a local error or a server one, never
       both, so swapping the merge order left all eight tests green. `name`
       is blank (local: required) AND rejected by the server. One message is
       shown and it is the server's. */
    const form = inertia({ name: '', email: '' }, { name: ['That name is taken.'] });
    const w = await bound(form, { eager: true });

    /* Touch it so the local rule has certainly run. */
    await w.findAll('input')[0].trigger('blur');
    await flushPromises();

    expect(w.text()).toContain('That name is taken.');
    expect(w.text(), 'the local message displaced the server’s').not.toMatch(/is required/i);
    w.unmount();
  });

  it('and it survives a local pass on another field', async () => {
    const form = inertia({ name: 'Ada', email: '' }, { name: ['That name is taken.'] });
    const w = await bound(form, { eager: true });

    const inputs = w.findAll('input');
    await inputs[1].setValue('someone@example.com');
    await flushPromises();

    /* Editing `email` must not clear what the server said about `name`. */
    expect(w.text()).toContain('That name is taken.');
    w.unmount();
  });

  it('editing the field itself is what clears it', async () => {
    /* After a 422 there is no revalidation, so the only way out is to change
       the field — and the driver is asked to forget that key, not the form. */
    const form = inertia({ name: 'Ada', email: '' }, { name: ['That name is taken.'], email: ['Bad.'] });
    const w = await bound(form);

    await w.findAll('input')[0].setValue('Grace');
    await flushPromises();

    expect(w.text()).not.toContain('That name is taken.');
    expect(form.errors.name).toBeUndefined();
    /* The other field's server error is untouched. */
    expect(form.errors.email).toEqual(['Bad.']);
    w.unmount();
  });

  it('and a SLOT clears it the same way, through `update`', async () => {
    /* AF2-365, reported from a real screen. The slug field is rendered by a
       slot with a "regenerate" button, and the button assigned the host
       form's value directly. The new slug appeared, the old slug's error
       stayed under it, and the form looked broken.
     *
     * Writing to the host form behind ApexForm's back skips everything a
     * keystroke gets. `update` IS the keystroke path, which is why the slot
     * is handed it — this is the guarantee a host relies on when it wires a
     * button of its own. */
    const form = inertia({ name: 'Ada', email: '' }, { name: ['That name is taken.'] });
    const w = mount(ApexForm, {
      props: { schema: SCHEMA, form } as never,
      slots: {
        /* The slot REPLACES the control, so displaying the error is the
           host's job too — `error` is handed over for exactly that. A slot
           that ignores it shows no message at all, which is a different bug
           from the one under test. */
        'field-name': `<template #default="{ error, update }">
          <button class="regen" @click="update('a-free-value')">regenerate</button>
          <span class="mine-err">{{ error }}</span>
        </template>`,
      },
      attachTo: document.body,
    });
    await flushPromises();
    expect(w.text()).toContain('That name is taken.');

    await w.find('button.regen').trigger('click');
    await flushPromises();

    expect(form.data.name, 'the slot did not write through to the host form').toBe('a-free-value');
    expect(form.errors.name, 'the server verdict outlived the value it was about').toBeUndefined();
    expect(w.text()).not.toContain('That name is taken.');
    w.unmount();
  });
});

describe('Precognition', () => {
  it('per-field validation is called on blur, and NOT on every keystroke', async () => {
    /* AF2-347. It used to fire on change as well, which asks the server
       about a half-typed value and then reports its answer: "the slug is
       taken" while the user is three letters into typing a different one. */
    const asked: string[] = [];
    const form = {
      ...inertia({ name: '', email: '' }),
      validating: false,
      validate(field: string) { asked.push(field); },
    };
    const w = await bound(form);

    const input = w.findAll('input')[0];
    await input.setValue('Ada');
    await flushPromises();
    expect(asked, 'the server was asked about a value still being typed').toEqual([]);

    await input.trigger('blur');
    await flushPromises();
    expect(asked, 'blur did not reach the host').toContain('name');
    w.unmount();
  });

  it('the footer says when the server is being asked, and stops when it answers', async () => {
    /* Form-wide, not per field: Precognition keeps one flag for the whole
       form. The note replaces "Unsaved changes" rather than joining it --
       one slot, so the action bar does not jog. */
    const form = reactive({
      ...inertia({ name: '', email: '' }),
      validating: false,
      validate() {},
    });
    const w = await bound(form);

    await w.findAll('input')[0].setValue('Ada');
    await flushPromises();
    expect(w.find('.apex-form__validating').exists(), 'claimed to be validating before any blur').toBe(false);
    expect(w.find('.apex-form__dirty').exists()).toBe(true);

    /* What the host form does when the request goes out. */
    form.validating = true;
    await flushPromises();
    expect(w.find('.apex-form__validating').exists(), 'the footer did not follow the form').toBe(true);
    expect(w.text()).toContain('Checking');
    expect(w.find('.apex-form__dirty').exists(), 'both notes showed at once').toBe(false);

    form.validating = false;
    await flushPromises();
    expect(w.find('.apex-form__validating').exists(), 'the note stayed after the answer').toBe(false);
    expect(w.find('.apex-form__dirty').exists()).toBe(true);
    w.unmount();
  });

  it('a slot-rendered field can reach the server too', async () => {
    /* AF2-347. The default markup wires `@blur` itself; a custom control in
       a `field-{key}` slot cannot, so without a `blur` binding the slot is
       touched by nothing and never validated. That is not a corner case —
       the pilot screen renders its SLUG through this slot, and `unique` on
       the slug is the whole reason Precognition is here. */
    const asked: string[] = [];
    const form = {
      ...inertia({ name: '', email: '' }),
      validating: false,
      validate(field: string) { asked.push(field); },
    };
    const w = mount(ApexForm, {
      props: { schema: SCHEMA, form } as never,
      slots: {
        'field-name': `<template #default="{ blur }"><input class="mine" @blur="blur" /></template>`,
      },
      attachTo: document.body,
    });
    await flushPromises();

    await w.find('input.mine').trigger('blur');
    await flushPromises();
    expect(asked, 'a slot-rendered field was never sent to the server').toContain('name');
    w.unmount();
  });

  it('an Inertia form never shows it, because it never validates', async () => {
    const form = reactive(inertia({ name: '', email: '' }));
    const w = await bound(form);
    await w.findAll('input')[0].setValue('Ada');
    await flushPromises();
    expect(w.find('.apex-form__validating').exists()).toBe(false);
    w.unmount();
  });

  it('an Inertia form is never asked, because it cannot answer', async () => {
    /* Capability detection: no validate() means the local rules are the only
       pre-submit feedback and the server speaks on submit. */
    const form = inertia({ name: '', email: '' });
    const w = await bound(form);
    await w.findAll('input')[0].setValue('Ada');
    await flushPromises();
    expect(w.text()).not.toContain('undefined');
    w.unmount();
  });
});

describe('the dirty flag', () => {
  it('appears only after a change', async () => {
    const form = inertia({ name: 'Ada', email: '' });
    const w = await bound(form);
    expect(w.find('.apex-form__dirty').exists()).toBe(false);

    await w.findAll('input')[0].setValue('Grace');
    await flushPromises();
    expect(w.find('.apex-form__dirty').exists()).toBe(true);
    w.unmount();
  });
});

describe('there is one source of truth', () => {
  it('typing writes into the host form, and ApexForm keeps no copy', async () => {
    const form = inertia({ name: 'Ada', email: '' });
    const w = await bound(form);

    await w.findAll('input')[0].setValue('Grace');
    await flushPromises();

    expect(form.data.name).toBe('Grace');
    /* And with a host form bound, the internal model is never emitted —
       two sources of truth is the defect this design exists to prevent. */
    expect(w.emitted('update:modelValue')).toBeFalsy();
    w.unmount();
  });

  it('with no host form, the internal one is emitted instead', async () => {
    const w = mount(ApexForm, {
      props: { schema: SCHEMA, modelValue: { name: 'Ada', email: '' } },
      attachTo: document.body,
    });
    await flushPromises();

    await w.findAll('input')[0].setValue('Grace');
    await flushPromises();

    expect(w.emitted('update:modelValue')).toBeTruthy();
    w.unmount();
  });
});
