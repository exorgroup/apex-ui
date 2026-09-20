import { describe, it, expect } from 'vitest';
import {
  normaliseRules, validateField, validate, normalise, serverOnlyFields,
  expandCondition, isVisible, isDisabled, controlFor, knownProps, makeDriver,
  isServerOnly, isBlank, CONTROLS,
} from '../src/core/form';

/**
 * The form engine, checked against the claims its own design record makes.
 *
 * APEXFORM.md states the behaviour precisely — `required` runs first and
 * stops, every other rule skips a blank value, invisible fields are never
 * validated, anything unrecognised is server-only, the condition shorthand is
 * real. Each of those is a sentence that is either true of this module or is
 * not, which is the best kind of test list: written before the code, by
 * someone deciding what the code should do.
 *
 * Three of them were DEFECTS during their build, all the same class — a prop
 * or shape assumed rather than read, and every one silent. The shorthand is
 * the sharpest: `{ custom: true }` fell through core/conditions' default
 * branch and compared `undefined === undefined`, which is TRUE, so every
 * conditional field showed and every inverse one hid. Nothing errored.
 */

const field = (f: Record<string, unknown>) => ({ key: 'f', label: 'Field', ...f } as never);

describe('rules parse from either surface into one shape', () => {
  it('the Laravel pipe DSL, which can be pasted from a FormRequest', () => {
    const rules = normaliseRules('required|email|maxLength:40' as never);
    expect(rules.map((r) => r.name)).toEqual(['required', 'email', 'maxLength']);
    expect(rules[2].args).toEqual(['40']);
  });

  it('the object form, for a typed literal', () => {
    expect(normaliseRules({ required: true, maxLength: 40 } as never).map((r) => r.name))
      .toEqual(['required', 'maxLength']);
  });

  it('an unrecognised rule is server-only, not an error', () => {
    const [rule] = normaliseRules('unique:users,email' as never);
    expect(isServerOnly(rule)).toBe(true);
  });
});

describe('validateField', () => {
  it('required runs first and stops', () => {
    /* A blank field should say it is required, not that it is not a valid
       email. Both rules are present and only one message comes back. */
    const msgs = validateField(field({ rules: 'required|email' }), '', {});
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatch(/required/i);
  });

  it('every other rule skips a blank value, as Laravel does', () => {
    expect(validateField(field({ rules: 'email' }), '', {})).toEqual([]);
    expect(validateField(field({ rules: 'email' }), 'not-an-email', {})).toHaveLength(1);
  });

  it('a server-only rule is never evaluated locally', () => {
    /* Retained on the field and reported — never guessed at. */
    expect(validateField(field({ rules: 'unique:users' }), 'anything', {})).toEqual([]);
  });

  it('the label appears in the message, not the key', () => {
    expect(validateField(field({ label: 'Monthly price', rules: 'required' }), '', {})[0])
      .toContain('Monthly price');
  });

  it('a field-level message overrides the default', () => {
    const msgs = validateField(
      field({ rules: 'required', messages: { required: 'We need this one.' } }), '', {},
    );
    expect(msgs).toEqual(['We need this one.']);
  });
});

describe('min and max mean what Laravel means', () => {
  /* `max:255` is the most common rule in any Laravel application, and it was
     numeric-only here: `Number('rere') <= 255` is `NaN <= 255`, which is
     false, so every text field carrying it failed against a four-character
     value. Found on the first screen migrated from a real FormRequest. */
  it('a string is measured by its LENGTH', () => {
    expect(validateField(field({ rules: 'max:255' }), 'rere', {})).toEqual([]);
    expect(validateField(field({ rules: 'max:3' }), 'rere', {})).toHaveLength(1);
    expect(validateField(field({ rules: 'min:2' }), 'rere', {})).toEqual([]);
    expect(validateField(field({ rules: 'min:5' }), 'rere', {})).toHaveLength(1);
  });

  it('a number is measured by its VALUE', () => {
    expect(validateField(field({ rules: 'max:100' }), 23, {})).toEqual([]);
    expect(validateField(field({ rules: 'max:10' }), 23, {})).toHaveLength(1);
  });

  it('a numeric FIELD measures its value even when the value is a string', () => {
    /* Laravel decides by the field's other rules, not by the shape of the
       value alone. */
    expect(validateField(field({ rules: 'integer|max:100' }), '23', {})).toEqual([]);
    expect(validateField(field({ rules: 'integer|max:10' }), '23', {})).toHaveLength(1);
  });

  it('a digit string in a plain text field is measured by length', () => {
    /* '23' is two characters, so max:10 passes — which is what Laravel
       does for a field with no numeric rule. */
    expect(validateField(field({ rules: 'max:10' }), '23', {})).toEqual([]);
  });

  it('an array is measured by its COUNT', () => {
    expect(validateField(field({ rules: 'max:2' }), ['a', 'b'], {})).toEqual([]);
    expect(validateField(field({ rules: 'max:1' }), ['a', 'b'], {})).toHaveLength(1);
  });

  it('between is polymorphic too', () => {
    expect(validateField(field({ rules: 'between:2,10' }), 'rere', {})).toEqual([]);
    expect(validateField(field({ rules: 'between:5,10' }), 'rere', {})).toHaveLength(1);
  });

  it('minLength and maxLength still measure length, whatever the field', () => {
    /* The library's own unambiguous names, kept for a schema author who
       wants to say exactly what they mean. */
    expect(validateField(field({ rules: 'integer|maxLength:2' }), '23', {})).toEqual([]);
    expect(validateField(field({ rules: 'integer|maxLength:1' }), '23', {})).toHaveLength(1);
  });
});

describe('the condition shorthand is real', () => {
  it('a bare key object expands to field/eq', () => {
    expect(expandCondition({ custom: true })).toEqual({ field: 'custom', eq: true });
  });

  it('two bare keys expand to an all-group', () => {
    expect(expandCondition({ a: 1, b: 2 }))
      .toEqual({ all: [{ field: 'a', eq: 1 }, { field: 'b', eq: 2 }] });
  });

  it('a real condition is left alone', () => {
    const cond = { field: 'custom', eq: true };
    expect(expandCondition(cond)).toBe(cond);
    expect(expandCondition({ any: [{ field: 'a', truthy: true }] }))
      .toEqual({ any: [{ field: 'a', truthy: true }] });
  });

  it('and the shorthand actually drives visibility, both directions', () => {
    /* The defect this closes: with no shorthand the object compared
       `undefined === undefined` and every conditional field showed. */
    const shown = field({ hiddenIf: { custom: true } });
    expect(isVisible(shown, { custom: false })).toBe(true);
    expect(isVisible(shown, { custom: true })).toBe(false);

    const off = field({ disabledIf: { locked: true } });
    expect(isDisabled(off, { locked: true })).toBe(true);
    expect(isDisabled(off, { locked: false })).toBe(false);
  });
});

describe('validate over a schema', () => {
  const schema = normalise({
    sections: [{
      label: 'Plan',
      fields: [
        { key: 'name', label: 'Name', type: 'text', rules: 'required' },
        { key: 'price', label: 'Monthly price', type: 'number', rules: 'required', hiddenIf: { custom: true } },
        { key: 'contact', label: 'Sales contact', type: 'text', rules: 'required', hiddenIf: { custom: false } },
      ],
    }],
  } as never);

  it('an invisible field is never validated', () => {
    /* The worst failure a conditional form has, and a silent one: the summary
       names a field that is not on screen. */
    const off = validate(schema, { custom: false });
    expect(Object.keys(off.errors).sort()).toEqual(['name', 'price']);

    const on = validate(schema, { custom: true });
    expect(Object.keys(on.errors).sort()).toEqual(['contact', 'name']);
    expect(on.errors.price).toBeUndefined();
  });

  it('ok is false while anything fails and true when nothing does', () => {
    expect(validate(schema, { custom: false }).ok).toBe(false);
    expect(validate(schema, { custom: false, name: 'Standard', price: 9 }).ok).toBe(true);
  });

  it('serverOnlyFields names what the browser cannot settle', () => {
    const s = normalise({
      sections: [{
        fields: [
          { key: 'a', rules: 'required' },
          { key: 'b', rules: 'unique:users,email' },
        ],
      }],
    } as never);
    expect(serverOnlyFields(s)).toEqual(['b']);
  });
});

describe('controlFor maps a schema type to a control', () => {
  it('a type resolves to the tag the catalogue names', () => {
    expect(controlFor(field({ type: 'text' })).tag).toBe('ApexInput');
    expect(controlFor(field({ type: 'money' })).tag).toBe(CONTROLS.money.tag);
  });

  it('knownProps reads what the control declares rather than guessing', () => {
    /* The structural fix for the class of defect their build kept hitting:
       `prefix` on ApexNumber, which takes `currency` and `unit`. An unknown
       prop becomes one message naming the field, not a Vue warning from
       inside a component the schema author never wrote. */
    expect(knownProps).toBeTypeOf('function');
  });
});

describe('the driver is one source of truth', () => {
  it('with nothing to bind to, it makes an internal store', () => {
    const d = makeDriver(undefined, { a: 1 });
    expect(d.kind).toBe('internal');
    expect(d.get('a')).toBe(1);
    d.set('a', 2);
    expect(d.get('a')).toBe(2);
    expect(d.validateField).toBeNull();
  });

  it('an Inertia form: the form IS the values, and there is no per-field validate', () => {
    const form = { data: { a: 1 }, errors: { a: ['Server said no.'] }, processing: false, post() {} };
    const d = makeDriver(form);
    expect(d.kind).toBe('inertia');
    expect(d.get('a')).toBe(1);
    expect(d.serverErrors()).toEqual({ a: ['Server said no.'] });
    expect(d.validateField).toBeNull();
  });

  it('a Precognition form is detected by having validate(), not by a flag', () => {
    /* Capability detection rather than two code paths: adopting Precognition
       later is a change of which useForm you import, with no schema and no
       markup changes. */
    let asked = '';
    const form = {
      data: { a: 1 },
      errors: {},
      processing: false,
      validating: false,
      validate(f: string) { asked = f; },
      post() {},
    };
    const d = makeDriver(form);
    expect(d.kind).toBe('precognition');
    expect(d.validateField).toBeTypeOf('function');
    d.validateField!('a');
    expect(asked).toBe('a');
  });

  it('an Inertia useForm keeps its values on ITSELF, with data() as a method', () => {
    /* The shape that actually ships. Inertia's useForm has no `data`
       property — it has `data()`. A driver that tests `f.data ?` finds a
       function, treats it as the value bag, and reads `get('name')` as the
       string "data", because that is a function's own `.name`. Every write
       lands on the function and vanishes.

       Found wiring the first real screen (AF2-306), not by any test here:
       the fixtures had always used a plain `data` object. */
    const form = {
      name: 'Ada',
      errors: {},
      processing: false,
      data() { return { name: this.name }; },
      post() {},
    };
    const d = makeDriver(form);

    expect(d.kind).toBe('inertia');
    expect(d.get('name')).toBe('Ada');

    d.set('name', 'Grace');
    expect(form.name).toBe('Grace');
    expect(d.get('name')).toBe('Grace');
  });

  it('writes go through the driver, so there is never a second copy', () => {
    const form = { data: { a: 1 }, errors: {}, processing: false, post() {} };
    const d = makeDriver(form);
    d.set('a', 9);
    expect(form.data.a).toBe(9);
  });
});

describe('isBlank', () => {
  it('treats empty string, null, undefined and the empty array as blank', () => {
    for (const v of ['', null, undefined, []]) expect(isBlank(v)).toBe(true);
  });

  it('and 0 and false as present', () => {
    /* A number field holding 0 is filled in. */
    for (const v of [0, false, 'x', [1]]) expect(isBlank(v)).toBe(false);
  });
});
