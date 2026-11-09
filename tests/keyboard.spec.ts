import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import ApexKeyboard from '../src/components/ApexKeyboard.vue';

/** A keyboard that keeps its own v-model, as a page would. */
function kb(props: Record<string, unknown> = {}) {
  const w = mount(ApexKeyboard, {
    props: { modelValue: '', ...props, 'onUpdate:modelValue': (v: string) => w.setProps({ modelValue: v }) },
    attachTo: document.body,
  });
  return w;
}
const tap = async (w: ReturnType<typeof kb>, key: string) => w.find(`[data-key="${key}"]`).trigger('click');
const typeAll = async (w: ReturnType<typeof kb>, keys: string[]) => { for (const k of keys) await tap(w, k); };

describe('ApexKeyboard (TBX TL5 D9)', () => {
  it('types letters in lower case, digits, space, and the design\'s - @ .', async () => {
    const w = kb();
    await typeAll(w, ['c', 'i', 's', 'k', 'space', '4', '-', '@', '.']);
    expect(w.props('modelValue')).toBe('cisk 4-@.');
  });

  it('deletes one character — a whole Maltese letter — and clears', async () => {
    const w = kb({ extraLetters: ['ċ', 'ġ', 'ħ', 'ż'] });
    await typeAll(w, ['ħ', 'o', 'b', 'ż']);
    expect(w.props('modelValue')).toBe('ħobż');
    await tap(w, 'del');
    expect(w.props('modelValue')).toBe('ħob');
    await tap(w, 'clear');
    expect(w.props('modelValue')).toBe('');
  });

  it('emits enter with the text, and hide', async () => {
    const w = kb({ modelValue: 'popcorn', hide: true });
    await tap(w, 'enter');
    expect(w.emitted('enter')?.at(-1)).toEqual(['popcorn']);
    await tap(w, 'hide');
    expect(w.emitted('hide')).toHaveLength(1);
  });

  it('draws only the keys switched on', () => {
    const bare = kb({ enter: false, del: false, clear: false, space: false, digits: false });
    for (const k of ['enter', 'del', 'clear', 'space', 'hide', 'shift', '1']) expect(bare.find(`[data-key="${k}"]`).exists(), k).toBe(false);
    expect(bare.find('[data-row="bottom"]').exists()).toBe(false);
    expect(bare.find('[data-row="extra"]').exists()).toBe(false);

    const noDigits = kb({ digits: false });
    expect(noDigits.find('[data-row="0"] [data-key="del"]').exists()).toBe(true); // ⌫ moves to the first letter row
    expect(kb().findAll('[data-key="del"]')).toHaveLength(1);
  });

  it('capitalises the next letter with shift, and locks on a second tap', async () => {
    const w = kb({ shift: true });
    await tap(w, 'shift');
    expect(w.find('[data-key="a"]').text()).toBe('A');
    await typeAll(w, ['c', 'i']);
    expect(w.props('modelValue')).toBe('Ci');

    await tap(w, 'shift');
    await tap(w, 'shift');                      // lock
    expect(w.find('[data-key="shift"]').attributes('data-caps')).toBe('lock');
    await typeAll(w, ['s', 'k']);
    expect(w.props('modelValue')).toBe('CiSK');
    await tap(w, 'shift');                      // off
    await tap(w, 'x');
    expect(w.props('modelValue')).toBe('CiSKx');
  });

  it('keeps shift for a digit — only a letter uses it up', async () => {
    const w = kb({ shift: true });
    await typeAll(w, ['shift', '4', 'b']);
    expect(w.props('modelValue')).toBe('4B');
  });

  it('stops at max-length', async () => {
    const w = kb({ maxLength: 3 });
    await typeAll(w, ['a', 'b', 'c', 'd', 'space']);
    expect(w.props('modelValue')).toBe('abc');
    await w.find('.apex-keyboard').trigger('keydown', { key: 'z' });
    expect(w.props('modelValue')).toBe('abc');
  });

  it('never takes the focus from the field being typed into', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    const w = kb();
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    w.find('[data-key="q"]').element.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(w.findAll('.apex-keyboard__key').every((b) => b.attributes('tabindex') === '-1')).toBe(true);
    input.remove();
  });

  it('takes a physical keyboard while focused', async () => {
    const w = kb({ hide: true });
    const root = w.find('.apex-keyboard');
    for (const key of ['K', 'i', 'n', 'n', 'i', 'e', ' ']) await root.trigger('keydown', { key });
    expect(w.props('modelValue')).toBe('Kinnie ');
    await root.trigger('keydown', { key: 'Backspace' });
    expect(w.props('modelValue')).toBe('Kinnie');
    await root.trigger('keydown', { key: 'Enter' });
    expect(w.emitted('enter')?.at(-1)).toEqual(['Kinnie']);
    await root.trigger('keydown', { key: 'Escape' });
    expect(w.emitted('hide')).toHaveLength(1);
    await root.trigger('keydown', { key: 'a', ctrlKey: true });
    expect(w.props('modelValue')).toBe('Kinnie');
  });

  it('ignores a physical key whose on-screen key is off', async () => {
    const w = kb({ modelValue: 'ab', del: false, enter: false, space: false });
    const root = w.find('.apex-keyboard');
    await root.trigger('keydown', { key: 'Backspace' });
    await root.trigger('keydown', { key: 'Enter' });
    await root.trigger('keydown', { key: ' ' });
    expect(w.props('modelValue')).toBe('ab');
    expect(w.emitted('enter')).toBeUndefined();
  });

  it('does nothing while disabled', async () => {
    const w = kb({ disabled: true });
    await w.find('.apex-keyboard').trigger('keydown', { key: 'a' });
    expect(w.emitted('update:modelValue')).toBeUndefined();
    expect(w.findAll('.apex-keyboard__key').every((b) => b.attributes('disabled') !== undefined)).toBe(true);
  });

  it('names itself and its symbol keys for a screen reader', () => {
    const w = kb({ shift: true, hide: true });
    expect(w.find('.apex-keyboard').attributes('role')).toBe('group');
    expect(w.find('[data-key="del"]').attributes('aria-label')).toBe('Delete');
    expect(w.find('[data-key="shift"]').attributes('aria-label')).toBe('Shift');
    expect(w.find('[data-key="hide"]').attributes('aria-label')).toBe('Hide the keyboard');
  });
});

describe('ApexKeyboard CSS', () => {
  const css = readFileSync('src/styles/apex-ui.css', 'utf8');
  it('never draws a key below 44px (touch)', () => {
    const key = css.match(/^\.apex-keyboard__key\{[^}]*\}/m)![0];
    expect(key).toContain('min-block-size:max(44px,var(--apex-keyboard-key))');
    expect(key).toContain('min-inline-size:44px');
  });

  it('sizes every key on one unit, so a wide key never takes the rest of its row (TL5 D35)', () => {
    const key = css.match(/^\.apex-keyboard__key\{[^}]*\}/m)![0];
    expect(key).toContain('flex:0 0 auto');
    expect(key).toContain('inline-size:calc(var(--s) * var(--w) - var(--apex-keyboard-gap))');
    expect(css).not.toMatch(/\.apex-keyboard__key--(wide|space)\{[^}]*flex:/);
    // Each full row adds up to the 13-unit board: digits + del 3; a-row indent .75 + 10 + Enter 2.25; Clear 2.5 + Space 8 + Hide 2.5.
    const w = (k: string) => Number(css.match(new RegExp(`\\[data-key="${k}"\\][^{]*\\{--w:([\\d.]+)\\}`))![1]);
    expect(10 + w('del')).toBe(13);
    expect(0.75 + 10 + w('enter')).toBe(13);
    expect(w('clear') + w('space') + w('hide')).toBe(13);
    expect(css).toContain('inline-size:calc(var(--s) * 13 - var(--apex-keyboard-gap))');
  });
});
