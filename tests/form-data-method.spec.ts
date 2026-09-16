import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * The host form whose `data` is a METHOD — which is what Inertia and
 * Precognition actually ship.
 *
 * `makeDriver` has guarded this since AF2-306 (`bag()`), but the component's
 * own `model` computed did not: it read `props.form.data || props.form`, and a
 * method is truthy, so every whole-form read landed on the FUNCTION OBJECT.
 *
 * Why nobody saw it for four screens: `getPath(fn, 'name')` does not return
 * undefined, it returns the function's own `.name` — a non-empty string. So a
 * form whose only required field is called `name` validated perfectly, by
 * accident. Tax rates was the first screen with a second required field, and
 * `code` and `rate` were reported empty while holding values.
 */

const SCHEMA = {
  sections: [{
    fields: [
      { key: 'name', label: 'Name', type: 'text', rules: 'required' },
      { key: 'code', label: 'Code', type: 'text', rules: 'required' },
      { key: 'rate', label: 'Rate', type: 'number', rules: 'required|numeric' },
    ],
  }],
};

/** The real shape: values on the form itself, `data()` as a method. */
function precognition(values: Record<string, unknown>) {
  return {
    ...values,
    errors: {} as Record<string, string[]>,
    processing: false,
    validating: false,
    post() {},
    validate() {},
    clearErrors(path?: string) {
      if (path) delete this.errors[path];
      else this.errors = {};
    },
    data() {
      return values;
    },
  };
}

describe('a form whose data is a method', () => {
  it('does not report a filled field as required on submit', async () => {
    const form = precognition({ name: 'Reduced', code: 'MT_5', rate: 5 });
    const w = mount(ApexForm, { props: { schema: SCHEMA, form }, attachTo: document.body });
    await flushPromises();

    await (w.vm as unknown as { submit: () => void }).submit();
    await flushPromises();

    expect(w.text()).not.toContain('is required');
    expect(w.emitted('submit')).toBeTruthy();
    w.unmount();
  });

  it('and the submit payload is the values, not the data function', async () => {
    const form = precognition({ name: 'Reduced', code: 'MT_5', rate: 5 });
    const w = mount(ApexForm, { props: { schema: SCHEMA, form }, attachTo: document.body });
    await flushPromises();

    await (w.vm as unknown as { submit: () => void }).submit();
    await flushPromises();

    const payload = w.emitted('submit')?.[0]?.[0];
    expect(typeof payload).not.toBe('function');
    expect((payload as Record<string, unknown>).code).toBe('MT_5');
    w.unmount();
  });

  it('still refuses a genuinely empty required field', async () => {
    /* The guard on the guard: the fix must not make everything pass. */
    const form = precognition({ name: 'Reduced', code: '', rate: 5 });
    const w = mount(ApexForm, { props: { schema: SCHEMA, form }, attachTo: document.body });
    await flushPromises();

    await (w.vm as unknown as { submit: () => void }).submit();
    await flushPromises();

    expect(w.text()).toContain('Code is required.');
    expect(w.emitted('submit')).toBeFalsy();
    w.unmount();
  });
});
