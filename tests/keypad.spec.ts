import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import ApexKeyPad from '../src/components/ApexKeyPad.vue';
import { evaluate, press, shuffledDigits, displayText, type KeyPadRules } from '../src/core/keypad';

const money = { decimals: 2 };
const typed = (keys: string[], rules: KeyPadRules = money) =>
  keys.reduce((e, k) => press(e, k, rules), '');

describe('keypad arithmetic (TBX TL5 D16, D18)', () => {
  it('works × and ÷ before + and −', () => {
    expect(evaluate('2+3*4', money)).toBe('14');
    expect(evaluate('10-6/3', money)).toBe('8');
    expect(evaluate('2*3+4*5', money)).toBe('26');
    expect(evaluate('8/4/2', money)).toBe('1');   // left to right within one level
    expect(evaluate('10-2-3', money)).toBe('5');
  });

  it('adds money without binary noise', () => {
    expect(evaluate('0.1+0.2', money)).toBe('0.3');
    expect(evaluate('2.5*3', money)).toBe('7.5');
    expect(evaluate('19.99*3', money)).toBe('59.97');
  });

  it('refuses what it cannot work out', () => {
    expect(evaluate('5/0', money)).toBeNull();
    expect(evaluate('5+', money)).toBeNull();
    expect(evaluate('', money)).toBeNull();
    expect(evaluate('10/3', money)).toBeNull();               // 3.333… needs more than 2 places — never rounded
    expect(evaluate('7/2', { decimals: 0 })).toBeNull();
    expect(evaluate('999*999', { decimals: 0, maxLength: 4 })).toBeNull(); // longer than the pad
  });

  it('returns an entry without operators as typed, so a PIN keeps its zeros', () => {
    expect(evaluate('0042', { decimals: 0 })).toBe('0042');
    expect(evaluate('12.', money)).toBe('12');
  });

  it('takes a leading minus as a sign', () => {
    expect(evaluate('-5+2', money)).toBe('-3');
    expect(evaluate('2-5', money)).toBe('-3');
    expect(evaluate('5-5', money)).toBe('0');
  });
});

describe('keypad entry rules', () => {
  it('lets a second operator replace the first, and never starts with one but minus', () => {
    expect(typed(['5', '+', '*', '2'])).toBe('5*2');
    expect(typed(['+'])).toBe('');
    expect(typed(['-', '5'])).toBe('-5');
  });

  it('holds one dot per number, within the decimals', () => {
    expect(typed(['1', '.', '5', '.', '2'])).toBe('1.52');
    expect(typed(['1', '.', '5', '2', '9'])).toBe('1.52');
    expect(typed(['.', '5'])).toBe('0.5');
    expect(typed(['1', '.'], { decimals: 0 })).toBe('1');
  });

  it('drops leading zeros and treats 00 on nothing as one zero', () => {
    expect(typed(['0', '5'])).toBe('5');
    expect(typed(['00'])).toBe('0');
    expect(typed(['1', '00'])).toBe('100');
  });

  it('keeps leading zeros in a code, never in a number', () => {
    expect(typed(['0', '4', '2'], { decimals: 0, code: true })).toBe('042');
    expect(typed(['00', '1'], { decimals: 0, code: true })).toBe('001');
    expect(typed(['0', '4', '2'], { decimals: 0 })).toBe('42');
  });

  it('refuses digits past max-length', () => {
    expect(typed(['1', '2', '3', '4', '5'], { decimals: 0, maxLength: 4 })).toBe('1234');
    expect(typed(['1', '2', '3', '00'], { decimals: 0, maxLength: 4 })).toBe('123');
  });

  it('deletes and clears', () => {
    expect(press('12+3', 'del', money)).toBe('12+');
    expect(press('12+3', 'clear', money)).toBe('');
  });

  it('shows operators as their glyphs', () => {
    expect(displayText('-2+3*4/5-1')).toBe('−2 + 3 × 4 ÷ 5 − 1');
  });
});

describe('shuffledDigits (TBX TL5 D17)', () => {
  it('uses every digit exactly once', () => {
    for (let n = 0; n < 50; n++) expect([...shuffledDigits()].sort()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });

  it('draws from the secure source', () => {
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    shuffledDigits();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('follows the random draw (Fisher–Yates)', () => {
    expect(shuffledDigits(() => 0)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
    expect(shuffledDigits((n) => n - 1)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  });
});

/** A keypad that keeps its own v-model, as a page would. */
function pad(props: Record<string, unknown> = {}) {
  const w = mount(ApexKeyPad, {
    props: { modelValue: '', ...props, 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) },
    attachTo: document.body,
  });
  return w;
}
const click = async (w: ReturnType<typeof pad>, key: string) => w.find(`[data-key="${key}"]`).trigger('click');
const digitsShown = (w: ReturnType<typeof pad>) =>
  w.findAll('.apex-keypad__digits .apex-keypad__key').map((b) => b.attributes('data-key')).filter((k) => /^\d$/.test(k!));

describe('ApexKeyPad', () => {
  it('lays the digits out as a calculator or a phone', () => {
    expect(digitsShown(pad())).toEqual(['7', '8', '9', '4', '5', '6', '1', '2', '3', '0']);
    expect(digitsShown(pad({ layout: 'phone' }))).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
  });

  it('draws only the keys switched on', () => {
    const bare = pad({ enter: false, del: false });
    expect(bare.find('.apex-keypad__ops').exists()).toBe(false);
    expect(bare.find('[data-key="."]').exists()).toBe(false);
    expect(bare.find('[data-key="00"]').exists()).toBe(false);
    expect(bare.find('.apex-keypad__actions').exists()).toBe(false);

    const all = pad({ operators: true, dot: true, clear: true, doubleZero: true });
    for (const k of ['+', '-', '*', '/', '.', '00', 'clear', 'del', 'enter']) expect(all.find(`[data-key="${k}"]`).exists(), k).toBe(true);

    const some = pad({ operators: ['+', '-'] });
    expect(some.findAll('.apex-keypad__ops .apex-keypad__key').map((b) => b.attributes('data-key'))).toEqual(['-', '+']);
  });

  it('emits the RESULT on enter (D16)', async () => {
    const w = pad({ operators: true });
    for (const k of ['2', '+', '3', '*', '4']) await click(w, k);
    expect(w.find('.apex-keypad__display').text()).toBe('2 + 3 × 4');
    await click(w, 'enter');
    expect(w.emitted('enter')?.at(-1)).toEqual(['14']);
  });

  it('gives a function key the result (D19)', async () => {
    const w = pad({ operators: true, functionKeys: [{ id: 'qty', label: '× Qty' }, { id: 'off', label: '% off', disabled: true }] });
    for (const k of ['3', '+', '2']) await click(w, k);
    await w.find('[data-fn="qty"]').trigger('click');
    expect(w.emitted('function')?.at(-1)).toEqual(['qty', '5']);
    await w.find('[data-fn="off"]').trigger('click');
    expect(w.emitted('function')).toHaveLength(1);
  });

  it('says a bad sum, emits nothing, and the next key clears it (D18)', async () => {
    const w = pad({ operators: true });
    for (const k of ['5', '/', '0']) await click(w, k);
    await click(w, 'enter');
    expect(w.emitted('enter')).toBeUndefined();
    expect(w.find('.apex-keypad__display').text()).toBe("Can't work that out");
    expect(w.find('.apex-keypad__display').attributes('data-error')).toBe('true');
    await click(w, 'enter');
    expect(w.emitted('enter')).toBeUndefined();
    await click(w, '7');
    expect(w.find('.apex-keypad__display').text()).toBe('7');
    expect(w.props('modelValue')).toBe('7');
  });

  it('masks a PIN, stops at max-length and submits by itself', async () => {
    const w = pad({ mask: true, maxLength: 4, autoSubmit: true, layout: 'phone', enter: false });
    for (const k of ['0', '4', '2']) await click(w, k);
    expect(w.find('.apex-keypad__display').text()).toBe('●●●');
    expect(w.emitted('enter')).toBeUndefined();
    await click(w, '7');
    expect(w.emitted('enter')?.at(-1)).toEqual(['0427']);
    await click(w, '9');
    expect(w.props('modelValue')).toBe('0427');
  });

  it('shuffles the digits when it appears and after each entry, keeping every other key in place (D17)', async () => {
    const draws = [[3, 1, 4, 1, 5, 9, 2, 6, 5], [0, 0, 0, 0, 0, 0, 0, 0, 0]].map((d) => d.slice());
    let set = 0, k = 0;
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((buf) => {
      const seq = draws[Math.min(set, draws.length - 1)];
      (buf as Uint32Array)[0] = seq[k++ % seq.length];
      if (k % 9 === 0) set++;
      return buf;
    });
    const w = pad({ randomise: true, layout: 'phone', operators: ['+'], clear: true });
    await w.vm.$nextTick();
    const first = digitsShown(w);
    expect([...first].sort()).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(first).not.toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
    expect(w.find('.apex-keypad__ops [data-key="+"]').exists()).toBe(true);

    await click(w, first[0]!);
    await click(w, 'enter');
    await w.vm.$nextTick();
    expect(digitsShown(w)).not.toEqual(first);
    spy.mockRestore();
  });

  it('keeps the layout after an entry when reshuffle is off', async () => {
    const w = pad({ randomise: true, reshuffle: false, layout: 'phone' });
    await w.vm.$nextTick();
    const first = digitsShown(w);
    await click(w, first[0]!);
    await click(w, 'enter');
    await w.vm.$nextTick();
    expect(w.emitted('enter')).toHaveLength(1);
    expect(digitsShown(w)).toEqual(first);
  });

  it('does not shuffle unless asked', async () => {
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    const w = pad({ layout: 'phone' });
    await click(w, '1');
    await click(w, 'enter');
    expect(digitsShown(w)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('takes a physical keyboard while focused, only for keys switched on', async () => {
    const w = pad({ operators: ['*'], dot: true });
    const root = w.find('.apex-keypad');
    for (const key of ['1', '2', 'x', '3', '.', '5', '+']) await root.trigger('keydown', { key });
    expect(w.props('modelValue')).toBe('12*3.5');
    await root.trigger('keydown', { key: 'Backspace' });
    expect(w.props('modelValue')).toBe('12*3.');
    await root.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('enter')?.at(-1)).toEqual(['36']);
    await root.trigger('keydown', { key: 'Escape' });        // clear is off
    expect(w.props('modelValue')).toBe('12*3.');
  });

  it('does nothing while disabled', async () => {
    const w = pad({ disabled: true });
    await click(w, '5');
    await w.find('.apex-keypad').trigger('keydown', { key: '5' });
    expect(w.emitted('update:modelValue')).toBeUndefined();
    expect(w.findAll('.apex-keypad__key').every((b) => b.attributes('disabled') !== undefined)).toBe(true);
  });

  it('names its keys for a screen reader', () => {
    const w = pad({ operators: true, dot: true, clear: true });
    expect(w.find('.apex-keypad').attributes('role')).toBe('group');
    expect(w.find('[data-key="/"]').attributes('aria-label')).toBe('Divide by');
    expect(w.find('[data-key="del"]').attributes('aria-label')).toBe('Delete');
    expect(w.find('.apex-keypad__display').attributes('aria-live')).toBe('polite');
  });
});

describe('ApexKeyPad secure — a PIN pad that gives nothing away (TBX TL6 D12, Till P-D53 / D54)', () => {
  const PHONE = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  it('shuffles and masks by itself, without randomise or mask', async () => {
    const w = pad({ secure: true, layout: 'phone', enter: false });
    await w.vm.$nextTick();
    const first = digitsShown(w);
    expect([...first].sort()).toEqual([...PHONE].sort());
    await click(w, first[0]!);
    await click(w, first[1]!);
    expect(w.find('.apex-keypad__entry').text()).toBe('●●');
    expect(w.find('.apex-keypad').attributes('data-secure')).toBe('true');
  });

  it('reshuffles after an entry even when reshuffle is off', async () => {
    const draws = [[3, 1, 4, 1, 5, 9, 2, 6, 5], [0, 0, 0, 0, 0, 0, 0, 0, 0]];
    let set = 0, k = 0;
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((buf) => {
      const seq = draws[Math.min(set, draws.length - 1)];
      (buf as Uint32Array)[0] = seq[k++ % seq.length];
      if (k % 9 === 0) set++;
      return buf;
    });
    const w = pad({ secure: true, reshuffle: false, layout: 'phone' });
    await w.vm.$nextTick();
    const first = digitsShown(w);
    await click(w, first[0]!);
    await click(w, 'enter');
    await w.vm.$nextTick();
    expect(w.emitted('enter')).toHaveLength(1);
    expect(digitsShown(w)).not.toEqual(first);
    spy.mockRestore();
  });

  it('ignores a physical keyboard — a PIN is never typed', async () => {
    const w = pad({ secure: true, maxLength: 4, autoSubmit: true });
    const root = w.find('.apex-keypad');
    for (const key of ['1', '2', '3', '4', 'Enter', 'Backspace']) await root.trigger('keydown', { key });
    expect(w.props('modelValue')).toBe('');
    expect(w.emitted('enter')).toBeUndefined();
    expect(w.emitted('update:modelValue')).toBeUndefined();
  });

  it('never says which digit — every digit key is "PIN key", the display says how many', async () => {
    const w = pad({ secure: true, enter: false });
    await w.vm.$nextTick();
    const digits = w.findAll('.apex-keypad__digits .apex-keypad__key').filter((b) => /^\d$/.test(b.attributes('data-key')!));
    expect(digits).toHaveLength(10);
    expect(digits.every((b) => b.attributes('aria-label') === 'PIN key')).toBe(true);
    await click(w, digitsShown(w)[0]!);
    expect(w.find('.apex-keypad__display').attributes('aria-label')).toBe('1 digit entered');
    await click(w, digitsShown(w)[0]!);
    expect(w.find('.apex-keypad__display').attributes('aria-label')).toBe('2 digits entered');
  });

  it('keeps the focus off the keys: no tab stops, and a press does not move the focus', async () => {
    const w = pad({ secure: true, clear: true });
    expect(w.find('.apex-keypad').attributes('tabindex')).toBe('-1');
    expect(w.findAll('.apex-keypad__key').every((b) => b.attributes('tabindex') === '-1')).toBe(true);
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    w.find('.apex-keypad__key').element.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    const ptr = new Event('pointerdown', { bubbles: true, cancelable: true });
    w.find('.apex-keypad__key').element.dispatchEvent(ptr);
    expect(ptr.defaultPrevented).toBe(true);
  });

  it('changes nothing for an ordinary pad', async () => {
    const w = pad({ layout: 'phone' });
    expect(digitsShown(w)).toEqual(PHONE);
    expect(w.find('.apex-keypad').attributes('data-secure')).toBe('false');
    expect(w.find('.apex-keypad').attributes('tabindex')).toBe('0');
    expect(w.find('[data-key="5"]').attributes('aria-label')).toBeUndefined();
    expect(w.find('.apex-keypad__display').attributes('aria-label')).toBeUndefined();
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    w.find('.apex-keypad__key').element.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(false);
    await w.find('.apex-keypad').trigger('keydown', { key: '5' });
    expect(w.props('modelValue')).toBe('5');
  });
});

describe('ApexKeyPad CSS', () => {
  const css = readFileSync('src/styles/apex-ui.css', 'utf8');
  it('never draws a key or a gap below 44px (touch)', () => {
    const key = css.match(/^\.apex-keypad__key\{[^}]*\}/m)![0];
    expect(key).toContain('min-block-size:max(44px,var(--apex-keypad-key))');
    expect(key).toContain('min-inline-size:44px');
    expect(css).toMatch(/\.apex-keypad__gap\{min-block-size:max\(44px,var\(--apex-keypad-key\)\)\}/);
  });
  it('a secure pad shows no hover, press or focus — those rules are for ordinary pads only (TL6 D12)', () => {
    for (const state of ['hover', 'active', 'focus-visible']) {
      const rules = css.match(new RegExp(`[^}\n]*\\.apex-keypad__key:${state}[^{]*\\{`, 'g')) ?? [];
      expect(rules.length).toBeGreaterThan(0);
      for (const r of rules) expect(r).toContain('.apex-keypad:not([data-secure="true"])');
    }
    expect(css).toContain('.apex-keypad[data-secure="true"] .apex-keypad__key{transition:none;-webkit-tap-highlight-color:transparent;outline:none}');
  });
});
