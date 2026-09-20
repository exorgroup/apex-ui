import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * The editing session ends when the form stops being editable — J/013.
 *
 * ApexForm keeps two kinds of error. `localErrors` is what the BROWSER
 * decided about what the user typed, alongside `touched`, `submitted` and
 * `dirty`; server errors belong to the host's form. Only the first kind
 * describes a visit, and only the first kind is cleared here.
 *
 * A modal already had a boundary — it resets when it opens (AF2-306). A
 * PAGE never opens, so it had none at all: the message from a value the
 * user abandoned stayed on screen for the life of the page. Found on the
 * settings screen by typing an invalid email and pressing Cancel.
 *
 * Both spellings of read-only are tested, and the reason is not symmetry:
 * the settings page marks its FIELDS read-only rather than setting the
 * form-level prop, because the prop renders values as prose. A fix written
 * against the prop alone would pass a test suite and leave that page
 * broken.
 */

const SCHEMA = {
  sections: [{
    columns: 1,
    fields: [
      { key: 'email', label: 'Email', type: 'text', rules: 'required|email' },
      { key: 'name', label: 'Name', type: 'text' },
    ],
  }],
};

/** Read-only the way a page does it: field by field. */
const perField = (readonly: boolean) => ({
  sections: [{
    columns: 1,
    fields: SCHEMA.sections[0].fields.map((f) => ({ ...f, readonly })),
  }],
});

/** Type something invalid and let the field lose focus, as a user does. */
async function complain(w: ReturnType<typeof mount>) {
  const input = w.findAll('input')[0];
  await input.setValue('not-an-address');
  await input.trigger('blur');
  await flushPromises();

  expect(w.text(), 'the fixture did not produce a local error').toMatch(/valid email/i);
}

describe('a page-shell form ends its session when it locks', () => {
  it('forgets the browser’s complaint when every field goes read-only', async () => {
    const w = mount(ApexForm, {
      props: { schema: perField(false), shell: 'page', modelValue: { email: '', name: '' } } as never,
      attachTo: document.body,
    });
    await flushPromises();
    await complain(w);

    await w.setProps({ schema: perField(true) } as never);
    await flushPromises();

    expect(w.text(), 'the message outlived the session that produced it').not.toMatch(/valid email/i);
    w.unmount();
  });

  it('and equally when the host sets the form-level prop', async () => {
    /* Round-tripped BACK to editable on purpose. The prop renders every
       field as prose, so a locked form shows no error markup whatever the
       state behind it — asserting on the locked screen passes even when
       nothing was cleared. Returning to edit mode is what makes the
       clearing observable. */
    const w = mount(ApexForm, {
      props: { schema: SCHEMA, shell: 'page', modelValue: { email: '', name: '' } } as never,
      attachTo: document.body,
    });
    await flushPromises();
    await complain(w);

    await w.setProps({ readonly: true } as never);
    await flushPromises();
    await w.setProps({ readonly: false } as never);
    await flushPromises();

    expect(w.text(), 'the message came back with the controls').not.toMatch(/valid email/i);
    w.unmount();
  });

  it('clears the footer’s claim of unsaved changes with it', async () => {
    /* The same state, differently visible: `dirty` survived a revert too,
       so a form matching the server still said "Unsaved changes" the
       moment it was editable again. */
    const w = mount(ApexForm, {
      props: { schema: perField(false), shell: 'page', modelValue: { email: '', name: '' } } as never,
      attachTo: document.body,
    });
    await flushPromises();
    await w.findAll('input')[1].setValue('Ada');
    await flushPromises();
    expect(w.find('.apex-form__dirty').exists()).toBe(true);

    await w.setProps({ schema: perField(true) } as never);
    await w.setProps({ schema: perField(false) } as never);
    await flushPromises();

    expect(w.find('.apex-form__dirty').exists(), 'a cancelled session still claimed changes').toBe(false);
    w.unmount();
  });

  it('but leaves the SERVER’s answer alone', async () => {
    /* The distinction the whole rule rests on. A 422 is not this
       component's opinion and does not expire when the mode changes — a
       locked record should still say why its last save was refused. */
    const form = {
      data: { email: 'taken@example.com', name: '' },
      errors: { email: ['That address is already registered.'] },
      processing: false,
      post() {},
      /* Clears for real. A no-op stub cannot catch a fix that calls
         clearErrors() on the host's form — which is precisely the mistake
         this test exists to forbid. */
      clearErrors() { (this as { errors: object }).errors = {}; },
    };
    const w = mount(ApexForm, {
      props: { schema: perField(false), shell: 'page', form } as never,
      attachTo: document.body,
    });
    await flushPromises();
    expect(w.text()).toContain('That address is already registered.');

    await w.setProps({ schema: perField(true) } as never);
    await flushPromises();

    expect(w.text(), 'the server’s words were thrown away with the browser’s')
      .toContain('That address is already registered.');
    w.unmount();
  });

  it('and a half-locked form is still an editing session', async () => {
    /* One read-only field among editable ones is a normal form, not a
       locked one — `every` is the right test, `some` would reset a form
       the user is still filling in. */
    const mixed = (readonly: boolean) => ({
      sections: [{
        columns: 1,
        fields: [
          { key: 'email', label: 'Email', type: 'text', rules: 'required|email' },
          { key: 'name', label: 'Name', type: 'text', readonly },
        ],
      }],
    });

    const w = mount(ApexForm, {
      props: { schema: mixed(false), shell: 'page', modelValue: { email: '', name: '' } } as never,
      attachTo: document.body,
    });
    await flushPromises();
    await complain(w);

    await w.setProps({ schema: mixed(true) } as never);
    await flushPromises();

    expect(w.text(), 'locking one field threw away the work on another').toMatch(/valid email/i);
    w.unmount();
  });

  it('a form with no visible fields is not "read-only"', async () => {
    /* `every` is true of nothing, so without the length check an empty
       field list reads as fully locked. Fields empty and refill in normal
       use — a schema that loads late, a section whose fields are all
       conditionally hidden — and none of that is a lock.

       Tested across the round trip, because the damage is the reset on
       the way back: at mount there is no session to lose yet, so emptying
       FIRST would pass with or without the guard. */
    const w = mount(ApexForm, {
      props: { schema: perField(false), shell: 'page', modelValue: { email: '', name: '' } } as never,
      attachTo: document.body,
    });
    await flushPromises();
    await complain(w);

    await w.setProps({ schema: { sections: [{ columns: 1, fields: [] }] } } as never);
    await flushPromises();
    await w.setProps({ schema: perField(false) } as never);
    await flushPromises();

    expect(w.text(), 'an empty field list was mistaken for a locked form').toMatch(/valid email/i);
    w.unmount();
  });
});
