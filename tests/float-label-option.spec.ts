import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { APEX_UI_OPTIONS } from '../src/core/symbols';
import ApexInput from '../src/components/ApexInput.vue';
import ApexTextarea from '../src/components/ApexTextarea.vue';
import ApexNumber from '../src/components/ApexNumber.vue';
import ApexSelect from '../src/components/ApexSelect.vue';
import ApexTags from '../src/components/ApexTags.vue';
import ApexDatePicker from '../src/components/ApexDatePicker.vue';
import ApexColorPicker from '../src/components/ApexColorPicker.vue';
import ApexMultiselect from '../src/components/ApexMultiselect.vue';
import ApexCascadeSelect from '../src/components/ApexCascadeSelect.vue';
import ApexTreeSelect from '../src/components/ApexTreeSelect.vue';

/**
 * A float label set APP-WIDE behaves like one set on the field — AF2-374.
 *
 * It did not. `ApexField` reads the placement through `useFieldState`,
 * which falls back to the plugin option; the ten controls that draw their
 * own placeholder each computed it from `props.labelPlacement` ALONE. So
 * with `labelPlacement: 'float-on'` in the plugin options, the label was
 * drawn inside the box and the placeholder was drawn in the same place, on
 * top of each other. Reported from a screen: "Entity Name" over "Company or
 * person name".
 *
 * Nothing here could have caught it. Every other test mounts a control and
 * passes the prop, which is the case that always worked. This one sets the
 * option and passes no prop — the arrangement a real application uses.
 *
 * The two symptoms are the two halves of the same contract:
 *   - the control must not render its own placeholder while the label is
 *     down (ApexInput's job, since a text input has a real `placeholder`)
 *   - the field must be treated as FILLED when a placeholder exists, so the
 *     label lifts out of the way instead (every control's job)
 */

const FLOAT = { global: { provide: { [APEX_UI_OPTIONS as symbol]: { labelPlacement: 'float-on' } } } };

describe('the app-wide float label', () => {
  it('lifts the label off an input that has a placeholder', () => {
    const w = mount(ApexInput, {
      props: { label: 'Entity Name', placeholder: 'Company or person name' },
      ...FLOAT,
    });

    /* data-float is what moves the label up and out of the text's way. */
    expect(w.find('.apex-field').attributes('data-float'),
      'the label stayed in the box with a placeholder under it').toBe('true');
    /* And a text input must not draw the placeholder while the label is
       down — belt and braces, since the two are drawn by different files. */
    expect(w.find('input').attributes('placeholder')).toBeUndefined();
  });

  it('does the same for every control that draws its own placeholder', () => {
    const cases: Array<[string, any, Record<string, unknown>]> = [
      ['ApexTextarea', ApexTextarea, {}],
      ['ApexNumber', ApexNumber, {}],
      ['ApexSelect', ApexSelect, { options: [{ value: 1, label: 'One' }] }],
      ['ApexTags', ApexTags, {}],
      ['ApexDatePicker', ApexDatePicker, {}],
      ['ApexColorPicker', ApexColorPicker, {}],
      ['ApexMultiselect', ApexMultiselect, { options: [{ value: 1, label: 'One' }] }],
      ['ApexCascadeSelect', ApexCascadeSelect, { options: [] }],
      ['ApexTreeSelect', ApexTreeSelect, { nodes: [] }],
    ];

    cases.forEach(([name, component, extra]) => {
      const w = mount(component, {
        props: { label: 'A Label', placeholder: 'some hint', ...extra },
        ...FLOAT,
      });

      expect(w.find('.apex-field').attributes('data-float'), `${name} left its label on the placeholder`).toBe('true');
      w.unmount();
    });
  });

  it('and a field with no placeholder still starts with its label down', () => {
    /* The other half: the label belongs IN the box until there is a reason
       to move it. A fix that floated everything would empty every box. */
    const w = mount(ApexInput, { props: { label: 'Entity Name' }, ...FLOAT });

    expect(w.find('.apex-field').attributes('data-float')).not.toBe('true');
  });

  it('a non-float app-wide placement leaves placeholders alone', () => {
    /* `top` is the default, and there the placeholder is the only text in
       the box — suppressing it would be the same bug in reverse. */
    const w = mount(ApexInput, {
      props: { label: 'Entity Name', placeholder: 'Company or person name' },
      global: { provide: { [APEX_UI_OPTIONS as symbol]: { labelPlacement: 'top' } } },
    });

    expect(w.find('input').attributes('placeholder')).toBe('Company or person name');
  });
});
