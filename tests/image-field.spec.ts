import { describe, it, expect, beforeAll, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexImageField from '../src/components/ApexImageField.vue';

/**
 * ApexImageField — M/003.
 *
 * The state machine, which is the whole of this component: four states, and
 * which buttons each one offers.
 *
 * The important pair is `modelValue` and `removed`. They look like one boolean
 * and are not — "I picked a new picture" and "I want no picture" are different
 * instructions, and a server reads them differently. Collapsing them means an
 * operator can never clear an image, because a form with an empty file box is
 * indistinguishable from a form nobody touched. Most of what follows is that
 * distinction, asserted from the outside.
 *
 * The crop itself is `ApexImageCrop`'s to prove (21 tests there) and
 * `canvas.toBlob` is not implemented by jsdom, so `confirm()` is exercised only
 * as far as the boundary: a stubbed `render()` standing in for the canvas, so
 * what IS asserted is this component's contract — a File with a sensible name,
 * `removed` cleared, the dialog closed.
 */

beforeAll(() => {
  if (!('createObjectURL' in URL)) {
    // @ts-expect-error — jsdom in some versions
    URL.createObjectURL = () => 'blob:stub';
    // @ts-expect-error
    URL.revokeObjectURL = () => {};
  }
});

const png = (name = 'photo.png', size = 1024) => {
  const f = new File([new Uint8Array(size)], name, { type: 'image/png' });
  Object.defineProperty(f, 'size', { value: size });

  return f;
};

async function field(props: Record<string, unknown> = {}) {
  const w = mount(ApexImageField, {
    props,
    attachTo: document.body,
    global: { stubs: { ApexDialog: { template: '<div><slot /><slot name="footer" /></div>' } } },
  });
  await flushPromises();

  return w;
}

const state = (w: ReturnType<typeof mount>) => w.find('.apex-imf__preview').attributes('data-state');
/* The LABEL only. ApexButton renders its icon as a Material Symbols ligature,
   which is real text in the DOM — so `uploadReplace` is what `.text()` returns
   and the icon name has to come off or every assertion below reads as a typo. */
const buttons = (w: ReturnType<typeof mount>) =>
  w.findAll('.apex-imf__actions button')
    .map((b) => b.findAll('span').map((s) => s.text().trim()).filter(Boolean).pop() ?? b.text().trim())
    .filter(Boolean);

describe('the four states', () => {
  it('empty when nothing is stored and nothing is picked', async () => {
    const w = await field();

    expect(state(w)).toBe('empty');
    expect(buttons(w)).toEqual(['Choose image']);
    w.unmount();
  });

  it('stored when the host supplies a url', async () => {
    const w = await field({ previewUrl: 'https://x.test/a.webp' });

    expect(state(w)).toBe('stored');
    expect(w.find('.apex-imf__img').attributes('src')).toBe('https://x.test/a.webp');
    expect(buttons(w)).toEqual(['Replace', 'Remove']);
    w.unmount();
  });

  it('picked when a file is bound, and it WINS over the stored one', async () => {
    /* What saving would keep is what the box must show. */
    const w = await field({ previewUrl: 'https://x.test/old.webp', modelValue: png() });

    expect(state(w)).toBe('picked');
    expect(w.find('.apex-imf__img').attributes('src')).not.toBe('https://x.test/old.webp');
    expect(w.find('.apex-imf__pending').text()).toBe('Not saved yet');
    expect(buttons(w)).toEqual(['Replace', 'Discard']);
    w.unmount();
  });

  it('removing when the stored one is marked for removal', async () => {
    /* The field reflects what saving would DO, not what the record holds. */
    const w = await field({ previewUrl: 'https://x.test/a.webp', removed: true });

    expect(state(w)).toBe('removing');
    expect(w.find('.apex-imf__img').exists()).toBe(false);
    expect(buttons(w)).toEqual(['Keep it']);
    w.unmount();
  });
});

describe('the two models are not one boolean', () => {
  it('Remove clears the file AND sets the instruction', async () => {
    /* Both, because a server that reads only the empty file box cannot tell a
       removal from an untouched form. */
    const w = await field({ previewUrl: 'https://x.test/a.webp' });
    await w.findAll('.apex-imf__actions button')[1].trigger('click');

    expect(w.emitted('update:modelValue')?.[0]).toEqual([null]);
    expect(w.emitted('update:removed')?.[0]).toEqual([true]);
    w.unmount();
  });

  it('Discard clears the file and does NOT touch the instruction', async () => {
    /* Throwing away a new pick must not also delete the stored image. */
    const w = await field({ previewUrl: 'https://x.test/a.webp', modelValue: png() });
    await w.findAll('.apex-imf__actions button')[1].trigger('click');

    expect(w.emitted('update:modelValue')?.[0]).toEqual([null]);
    expect(w.emitted('update:removed')).toBeUndefined();
    w.unmount();
  });

  it('Keep it withdraws the removal without choosing anything', async () => {
    const w = await field({ previewUrl: 'https://x.test/a.webp', removed: true });
    await w.findAll('.apex-imf__actions button')[0].trigger('click');

    expect(w.emitted('update:removed')?.[0]).toEqual([false]);
    expect(w.emitted('update:modelValue')).toBeUndefined();
    w.unmount();
  });
});

describe('choosing a file', () => {
  const pick = async (w: ReturnType<typeof mount>, file: File) => {
    const input = w.find('.apex-imf__input');
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
    await input.trigger('change');
    await flushPromises();
  };

  it('refuses one over maxFileSize BEFORE any of it reaches a canvas', async () => {
    /* A sub-megabyte limit used to render as "larger than 0 MB" — true,
       unhelpful, and the kind of message that reads as a broken control. */
    const w = await field({ maxFileSize: 512 * 1024 });
    await pick(w, png('huge.png', 900 * 1024));

    expect((w.emitted('error')?.[0][0] as { message: string }).message).toContain('512 KB');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    w.unmount();
  });

  it('refuses something that is not an image', async () => {
    const w = await field();
    const notImage = new File(['x'], 'notes.pdf', { type: 'application/pdf' });
    await pick(w, notImage);

    expect((w.emitted('error')?.[0][0] as { message: string }).message).toContain('not an image');
    w.unmount();
  });

  it('clears the input so the SAME file can be chosen twice', async () => {
    /* Cancel a crop, choose that file again — without the reset the input's
       value is unchanged, `change` never fires, and nothing happens. */
    const w = await field();
    const input = w.find('.apex-imf__input');
    Object.defineProperty(input.element, 'files', { value: [png()], configurable: true });
    await input.trigger('change');

    expect((input.element as HTMLInputElement).value).toBe('');
    w.unmount();
  });
});

describe('keeping a crop', () => {
  it('hands back a File named after the original, with the new extension', async () => {
    /* `poster.png` cropped to WebP becomes `poster.webp` — an operator who
       later finds it in a folder can still tell what it was. */
    const w = await field({ modelValue: null, removed: true });

    (w.vm as unknown as { cropper: unknown }).cropper = {
      render: async () => ({ blob: new Blob([new Uint8Array(8)], { type: 'image/webp' }) }),
    };
    (w.vm as unknown as { pending: File | null }).pending = png('poster.png');

    await (w.vm as unknown as { confirm: () => Promise<void> }).confirm();
    await flushPromises();

    const file = w.emitted('update:modelValue')?.[0][0] as File;
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe('poster.webp');

    /* Choosing a picture is not a removal — leaving both set would post an
       instruction and its opposite. */
    expect(w.emitted('update:removed')?.[0]).toEqual([false]);
    w.unmount();
  });

  it('reports an encode failure rather than emitting a broken file', async () => {
    const w = await field();

    (w.vm as unknown as { cropper: unknown }).cropper = {
      render: async () => { throw new Error('The cropped image could not be encoded.'); },
    };
    (w.vm as unknown as { pending: File | null }).pending = png();

    await (w.vm as unknown as { confirm: () => Promise<void> }).confirm();
    await flushPromises();

    expect((w.emitted('error')?.[0][0] as { message: string }).message).toContain('could not be encoded');
    expect(w.emitted('update:modelValue')).toBeUndefined();
    w.unmount();
  });
});

describe('read-only and disabled', () => {
  it('offers no actions when readonly', async () => {
    const w = await field({ previewUrl: 'https://x.test/a.webp', readonly: true });

    expect(buttons(w)).toEqual([]);
    expect(w.find('.apex-imf__img').exists()).toBe(true);
    w.unmount();
  });

  it('offers none when disabled either', async () => {
    const w = await field({ previewUrl: 'https://x.test/a.webp', disabled: true });

    expect(buttons(w)).toEqual([]);
    w.unmount();
  });
});

describe('the preview takes the target shape', () => {
  it('so the crop is judged in the shape it will be', async () => {
    const w = await field({ target: { width: 480, height: 300 } });

    expect(w.find('.apex-imf__preview').attributes('style')).toContain('480 / 300');
    w.unmount();
  });

  it('and falls back to 3 / 2 with no target', async () => {
    const w = await field();

    expect(w.find('.apex-imf__preview').attributes('style')).toContain('3 / 2');
    w.unmount();
  });
});
