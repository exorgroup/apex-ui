import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import ApexUI from '../src/index';
import ApexSwitch from '../src/components/ApexSwitch.vue';

/**
 * Label placement "after" (a switch, a checkbox) with help under it — TBX TL7/007.
 *
 * The control and its message shared one flex column, so a long help text widened that column and pushed the label
 * far to the right, beside nothing. The placement is now a grid: the control, the label beside it, the help / message
 * under the label. jsdom lays nothing out, so the rules are read from the stylesheet (with fs — Vite stubs a CSS
 * import to an empty string under vitest) and the markup they rely on is checked by mounting.
 */
const css = readFileSync(resolve(__dirname, '../src/styles/apex-ui.css'), 'utf8');
const rule = (selector: string) => {
    const at = css.indexOf(`${selector}{`);
    expect(at, `no rule for ${selector}`).toBeGreaterThan(-1);
    return css.slice(at + selector.length + 1, css.indexOf('}', at));
};

describe('label placement "after"', () => {
    it('is a grid: the control, then the label, then the help under the label', () => {
        expect(rule('.apex-field[data-lp="after"]')).toContain('display:grid');
        expect(rule('.apex-field[data-lp="after"]')).toContain('grid-template-columns:auto minmax(0,1fr)');
        expect(rule('.apex-field[data-lp="after"] .apex-field__body')).toContain('display:contents');
        expect(rule('.apex-field[data-lp="after"] > .apex-field__label')).toContain('grid-column:2');
        expect(rule('.apex-field[data-lp="after"] .apex-field__body > :not(.apex-field__msg)')).toContain('grid-column:1');
        const msg = rule('.apex-field[data-lp="after"] .apex-field__msg');
        expect(msg).toContain('grid-column:2');
        expect(msg).toContain('grid-row:2');
    });

    it('a switch with help puts the label, the control and the help where the grid expects them', () => {
        const w = mount(ApexSwitch, { props: { label: 'Ask for tips', help: 'Offer 5 / 10 / 15 % at payment.' }, global: { plugins: [ApexUI] } });
        const field = w.find('.apex-field');

        expect(field.attributes('data-lp')).toBe('after');
        expect(field.element.children[0].classList.contains('apex-field__label')).toBe(true);   // the label: a direct child
        const body = w.find('.apex-field__body');
        expect(body.element.children[0].classList.contains('apex-switch')).toBe(true);           // the control first in the body
        expect(body.find('.apex-field__msg').text()).toContain('Offer 5 / 10 / 15 %');
        w.unmount();
    });
});
