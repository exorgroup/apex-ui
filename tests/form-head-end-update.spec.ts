import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * A header control that edits a field — the `head-end` slot's `update`.
 *
 * The case: a page editor with a Draft / Published switch beside the title, standing for
 * the same `is_published` field as the choice in the form's body. Written directly into
 * the model, the value is saved but the form never learns it changed — the footer keeps
 * saying there is nothing unsaved. `update(key, value)` goes through the field's own path.
 *
 * TBX AG/013.
 */
const SCHEMA = {
  title: 'Edit page',
  layout: 'long',
  sections: [
    { id: 'details', title: 'Details', fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'is_published', label: 'Published', type: 'switch' },
    ] },
  ],
};

function form(onUpdate: (update: (k: string, v: unknown) => void) => void) {
  return mount(ApexForm, {
    props: { schema: SCHEMA, modelValue: { title: 'About', is_published: false } },
    slots: {
      'head-end': (scope: { update: (k: string, v: unknown) => void }) => {
        onUpdate(scope.update);
        return h('span', { class: 'hdr' }, 'switch');
      },
    },
  });
}

describe('ApexForm — head-end update', () => {
  it('hands the header slot an update function', () => {
    let got: unknown = null;
    form((u) => { got = u; });

    expect(typeof got).toBe('function');
  });

  it('marks the form dirty, as a field edit does', async () => {
    let update!: (k: string, v: unknown) => void;
    const w = form((u) => { update = u; });
    expect(w.find('.apex-form__dirty').exists()).toBe(false);

    update('is_published', true);
    await nextTick();

    expect(w.find('.apex-form__dirty').exists()).toBe(true);
  });

  it('fires field-change with the field and the value', async () => {
    let update!: (k: string, v: unknown) => void;
    const w = form((u) => { update = u; });

    update('is_published', true);
    await nextTick();

    expect(w.emitted('field-change')?.at(-1)?.[0]).toEqual({ key: 'is_published', value: true });
  });

  it('still marks the form dirty for a key the schema does not draw', async () => {
    let update!: (k: string, v: unknown) => void;
    const w = form((u) => { update = u; });

    update('not_a_field', 'x');
    await nextTick();

    expect(w.find('.apex-form__dirty').exists()).toBe(true);
  });

  it('changes nothing for a form that leaves the slot empty', () => {
    const w = mount(ApexForm, { props: { schema: SCHEMA, modelValue: { title: 'About', is_published: false } } });

    expect(w.find('.apex-form__dirty').exists()).toBe(false);
  });
});
