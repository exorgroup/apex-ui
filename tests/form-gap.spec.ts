import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { APEX_UI_OPTIONS } from '../src/core/symbols';
import ApexForm from '../src/components/ApexForm.vue';
import { gridGap } from '../src/core/form';

/**
 * The space between fields — AF2-394.
 *
 * It was a literal in the stylesheet, so a dense settings pane and a
 * spacious create dialog had to share one gutter. Resolved the way every
 * other look-and-feel default in this kit is: the section wins, then the
 * app-wide option, then the stylesheet's own value.
 *
 * The validation is the part worth testing hardest. The value lands in a
 * custom property, and an invalid custom property makes the whole `gap`
 * declaration invalid at computed-value time — so a typo would not fall
 * back to 18px, it would put every field flat against its neighbour.
 */
describe('resolving a gap', () => {
  it('prefers the section, then the option', () => {
    expect(gridGap({ gap: '4px' }, '30px')).toBe('4px');
    expect(gridGap({}, '30px')).toBe('30px');
  });

  it('writes nothing when neither says anything, so the stylesheet stands', () => {
    expect(gridGap({})).toBeUndefined();
    expect(gridGap({ gap: '' }, '')).toBeUndefined();
  });

  it('reads a bare number as pixels, because that is what people write', () => {
    expect(gridGap({ gap: 8 })).toBe('8px');
    expect(gridGap({}, 24)).toBe('24px');
    expect(gridGap({ gap: 0 })).toBe('0px');
  });

  it('takes one length or two', () => {
    expect(gridGap({ gap: '1.5rem' })).toBe('1.5rem');
    expect(gridGap({ gap: '8px 24px' })).toBe('8px 24px');
    expect(gridGap({ gap: '0 2ch' })).toBe('0 2ch');
  });

  it('refuses anything else rather than collapsing the grid', () => {
    const said: string[] = [];

    ['8x', 'normal', 'var(--x)', '10px 10px 10px', 'calc(1px + 2px)', 'red']
      .forEach((bad) => expect(gridGap({ gap: bad }, undefined, (m) => said.push(m)), bad).toBeUndefined());

    expect(said.length).toBe(6);
    expect(said[0]).toContain('would collapse the grid');
  });
});

describe('what the form renders', () => {
  const form = (section: Record<string, unknown>, options: Record<string, unknown> = {}) => mount(ApexForm, {
    props: { schema: { sections: [{ columns: 2, fields: [{ key: 'a', label: 'A', type: 'text' }], ...section }] } } as never,
    global: { provide: { [APEX_UI_OPTIONS as symbol]: options } },
    attachTo: document.body,
  });

  it('writes the variable when a section asks', async () => {
    const w = form({ gap: '6px 12px' });
    await flushPromises();

    expect(w.find('.apex-form__grid').attributes('style')).toContain('--apex-form-gap: 6px 12px');
    w.unmount();
  });

  it('and when only the app asks', async () => {
    const w = form({}, { formGap: 10 });
    await flushPromises();

    expect(w.find('.apex-form__grid').attributes('style')).toContain('--apex-form-gap: 10px');
    w.unmount();
  });

  it('but writes NOTHING when neither does', async () => {
    /* An inline variable would beat a host's own stylesheet rule, so a
       form with nothing to say must stay silent rather than inline the
       default. */
    const w = form({});
    await flushPromises();

    const style = w.find('.apex-form__grid').attributes('style') ?? '';
    expect(style).toContain('--form-cols');
    expect(style, 'the default was inlined, which a host rule can no longer beat')
      .not.toContain('--apex-form-gap');
    w.unmount();
  });

  it('and refuses a bad value at the boundary, once', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const w = form({ gap: 'wide please' });
    await flushPromises();

    expect(w.find('.apex-form__grid').attributes('style') ?? '').not.toContain('--apex-form-gap');
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('not one or two CSS lengths')).length).toBe(1);
    warn.mockRestore();
    w.unmount();
  });

  it('each section keeps its own', async () => {
    const w = mount(ApexForm, {
      props: {
        schema: {
          sections: [
            { title: 'Tight', gap: '4px', columns: 2, fields: [{ key: 'a', label: 'A', type: 'text' }] },
            { title: 'Loose', gap: '32px', columns: 2, fields: [{ key: 'b', label: 'B', type: 'text' }] },
          ],
        },
      } as never,
      attachTo: document.body,
    });
    await flushPromises();

    const grids = w.findAll('.apex-form__grid');
    expect(grids[0].attributes('style')).toContain('--apex-form-gap: 4px');
    expect(grids[1].attributes('style')).toContain('--apex-form-gap: 32px');
    w.unmount();
  });
});
