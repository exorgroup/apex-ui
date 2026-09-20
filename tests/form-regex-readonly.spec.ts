import { describe, it, expect, vi } from 'vitest';
import { validate, validateField, normalise } from '../src/core/form';

/**
 * Two defects the payment settings screen found, in one place because one
 * hid the other — L/015 and L/016.
 *
 * The screen showed *Booking Fee is not in the expected format* against
 * `2.5`, `5%` and `0`, in VIEW MODE, on values the server was perfectly
 * happy with. Two separate faults:
 *
 *   - the `regex` rule was handed Laravel's DELIMITERS. Laravel requires
 *     them (`regex:/^\d+$/`) and JavaScript's RegExp must not have them,
 *     so the pattern matched the literal slashes and therefore matched
 *     nothing. Every value failed.
 *   - a READ-ONLY field validated at all. Even with a working pattern, a
 *     message on a value the reader cannot change is an instruction
 *     nobody can follow.
 */

const fee = (over: Record<string, unknown> = {}) => ({
  key: 'booking_fee',
  label: 'Booking Fee',
  /* Copied from PaymentSettingsRequest, delimiters and all, because that
     is the point: a rule pasted out of a FormRequest must work. */
  rules: 'required|regex:/^\\d{1,6}(\\.\\d{1,2})?%?$/',
  ...over,
});

describe('a regex rule written the way Laravel writes it', () => {
  it.each([
    ['2.50', true],
    ['2.5', true],
    ['5%', true],
    ['0', true],
    ['150', true],
    ['2.5ttt', false],
    ['abc', false],
    ['5%%', false],
    ['2,50', false],
  ])('decides %s → %s', (value, ok) => {
    const errors = validateField(fee() as never, value, {});

    expect(errors.length === 0, `'${value}' was judged wrongly`).toBe(ok);
  });

  it('accepts a pattern with no delimiters too', () => {
    /* A rule written for this library rather than pasted from a
       FormRequest has no reason to carry them, and used to work. */
    expect(validateField({ key: 'k', label: 'K', rules: 'regex:^[a-z]+$' } as never, 'abc', {})).toEqual([]);
    expect(validateField({ key: 'k', label: 'K', rules: 'regex:^[a-z]+$' } as never, 'ABC', {})).toHaveLength(1);
  });

  it('honours flags', () => {
    expect(validateField({ key: 'k', label: 'K', rules: 'regex:/^[a-z]+$/i' } as never, 'ABC', {})).toEqual([]);
  });

  it('leaves a pattern that will not compile to the server', () => {
    /* Throwing on a keystroke because a schema has a typo is the worst of
       the three options. It warns and defers, like every rule the browser
       cannot settle. */
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(validateField({ key: 'k', label: 'K', rules: 'regex:/(unclosed/' } as never, 'x', {})).toEqual([]);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('survives a pattern containing a comma', () => {
    /* The pipe DSL splits arguments on commas and the rule rejoins them;
       `{1,6}` is the case that matters, and it is in the fee pattern
       above — asserted directly here so a change to the splitting shows
       up as this test rather than as a screen full of red. */
    expect(validateField(fee() as never, '123456', {})).toEqual([]);
    expect(validateField(fee() as never, '1234567', {})).toHaveLength(1);
  });
});

describe('a field nobody can edit is not validated', () => {
  it('a read-only field with a bad value reports nothing', () => {
    expect(validateField(fee({ readonly: true }) as never, 'nonsense', {})).toEqual([]);
  });

  it('and neither does a disabled one', () => {
    expect(validateField(fee({ disabled: true }) as never, 'nonsense', {})).toEqual([]);
  });

  it('but the same field reports again once it is editable', () => {
    /* The distinction that makes this a mode rule and not a licence:
       nothing is relaxed about what may be SAVED. */
    expect(validateField(fee() as never, 'nonsense', {})).toHaveLength(1);
  });

  it('a read-only field cannot block a submit either', () => {
    /* validate() is the submit path and has its own loop, so the rule is
       stated in both places — a form of read-only fields that refused to
       submit would be the same bug wearing a different hat. */
    const schema = normalise({
      sections: [{
        columns: 1,
        fields: [fee({ readonly: true }), { key: 'name', label: 'Name', rules: 'required' }],
      }],
    } as never);

    const locked = validate(schema, { booking_fee: 'nonsense', name: 'Ada' });
    expect(locked.ok, 'a read-only field blocked the submit').toBe(true);

    const open = validate(
      normalise({ sections: [{ columns: 1, fields: [fee()] }] } as never),
      { booking_fee: 'nonsense' },
    );
    expect(open.ok).toBe(false);
  });

  it('a required read-only field that is blank is still not an error', () => {
    /* `required` runs before every other rule and returns early, so it
       needs the guard ahead of it — this is the case that would slip
       through a check placed one line lower. */
    expect(validateField({ key: 'k', label: 'K', rules: 'required', readonly: true } as never, '', {})).toEqual([]);
  });
});
