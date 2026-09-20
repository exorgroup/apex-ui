import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';
import { cellPlacement, gridTracks } from '../src/core/form';

/**
 * The twelve-track grid — AF2-393.
 *
 * A section's `columns` is unchanged and so is `span`: `span: 2` in a
 * two-column section is the whole row, as three live screens already say.
 * Underneath, the grid is twelve tracks and every span is scaled — which
 * renders identically and makes two new things possible: `span12`, for a
 * third inside a section of halves, and `start`, for placement rather than
 * flow.
 *
 * The maths is tested against `cellPlacement` and the rendering against a
 * mounted form, because the two can disagree: the component could compute
 * the right numbers and write them to the wrong attribute, which is what
 * the last version of this did (an inline `grid-column` a media query
 * could not override).
 */
describe('how many tracks a section has', () => {
  it('is twelve for every column count a form uses', () => {
    [1, 2, 3, 4, 6, 12].forEach((n) => expect(gridTracks(n), `columns: ${n}`).toBe(12));
  });

  it('and the section itself when twelve will not divide', () => {
    /* Scaling would need a fractional span, and a grid cannot have one. */
    [5, 7, 8, 9, 10, 11].forEach((n) => expect(gridTracks(n), `columns: ${n}`).toBe(n));
  });

  it('survives nonsense', () => {
    expect(gridTracks(0)).toBe(12);
    expect(gridTracks(-3)).toBe(12);
    expect(gridTracks(2.7)).toBe(12);
  });
});

describe('a span keeps meaning what it always meant', () => {
  const at = (columns: number, field: Record<string, unknown>) => cellPlacement(field, { columns });

  it('one of two columns is half the row', () => {
    expect(at(2, { span: 1 })).toEqual({ span: 6, start: undefined });
  });

  it('two of two columns is the whole row, not a sixth', () => {
    /* The reinterpretation that would have broken every existing schema:
       as twelfths, `span: 2` is a sixth. */
    expect(at(2, { span: 2 }).span).toBe(12);
  });

  it('one of three is a third, two of three is two thirds', () => {
    expect(at(3, { span: 1 }).span).toBe(4);
    expect(at(3, { span: 2 }).span).toBe(8);
  });

  it('and a span larger than the section is still clamped to the row', () => {
    expect(at(2, { span: 9 }).span).toBe(12);
  });
});

describe('span12 and start', () => {
  const at = (columns: number, field: Record<string, unknown>) => cellPlacement(field, { columns });

  it('a third inside a section of halves — which two tracks cannot express', () => {
    expect(at(2, { span12: 4 }).span).toBe(4);
  });

  it('beats the scaled span when both are given', () => {
    expect(at(2, { span: 2, span12: 3 }).span).toBe(3);
  });

  it('places a field at a track rather than letting it flow', () => {
    expect(at(2, { span12: 4, start: 5 })).toEqual({ span: 4, start: 5 });
  });

  it('and a field placed near the end cannot run off it', () => {
    /* Left alone, the grid answers an overrun by inventing tracks — the
       row silently becomes wider than the form. */
    expect(at(2, { span12: 6, start: 9 }).span).toBe(4);
    expect(at(2, { span12: 12, start: 12 }).span).toBe(1);
  });

  it('are refused, with a warning, where the grid is not twelve tracks', () => {
    const said: string[] = [];
    const out = cellPlacement({ key: 'x', span12: 4, start: 2 }, { columns: 5 }, (m) => said.push(m));

    expect(out).toEqual({ span: 1, start: undefined });
    expect(said.join(' ')).toContain('does not divide 12');
    expect(said.join(' ')).toContain('"x"');
  });
});

describe('what the form actually renders', () => {
  const grid = async (section: Record<string, unknown>) => {
    const w = mount(ApexForm, {
      props: { schema: { sections: [section] } } as never,
      attachTo: document.body,
    });
    await flushPromises();

    return w;
  };

  it('writes the tracks and the placement as variables', async () => {
    const w = await grid({
      columns: 2,
      fields: [
        { key: 'a', label: 'A', type: 'text', span: 2 },
        { key: 'b', label: 'B', type: 'text' },
        { key: 'c', label: 'C', type: 'text', span12: 4, start: 9 },
      ],
    });

    expect(w.find('.apex-form__grid').attributes('style')).toContain('--form-cols: 12');

    const cells = w.findAll('.apex-form__cell');
    expect(cells[0].attributes('style')).toContain('--cell-span: 12');
    expect(cells[1].attributes('style')).toContain('--cell-span: 6');
    expect(cells[2].attributes('style')).toContain('--cell-span: 4');
    expect(cells[2].attributes('style')).toContain('--cell-start: 9');
    w.unmount();
  });

  it('never writes grid-column inline, because the collapse must override it', async () => {
    const w = await grid({ columns: 2, fields: [{ key: 'a', label: 'A', type: 'text', span: 2 }] });

    expect(w.find('.apex-form__cell').attributes('style'),
      'an inline grid-column cannot be beaten by a media query').not.toContain('grid-column');
    w.unmount();
  });

  it('warns once, not once per render', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const w = await grid({ columns: 5, fields: [{ key: 'odd', label: 'Odd', type: 'text', span12: 4 }] });
    await w.setProps({ modelValue: { odd: 'changed' } } as never);
    await flushPromises();

    const mine = warn.mock.calls.filter((c) => String(c[0]).includes('does not divide 12'));
    expect(mine.length).toBe(1);
    warn.mockRestore();
    w.unmount();
  });
});
