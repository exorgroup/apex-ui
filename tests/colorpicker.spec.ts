import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexColorPicker from '../src/components/ApexColorPicker.vue';

const open = (props: Record<string, unknown> = {}) =>
  mount(ApexColorPicker, {
    props: {
      label: 'Brand colour', modelValue: '#0B5FFF', inline: true,
      showFormatToggle: true, showChannels: true, showInput: true,
      presets: ['#0B5FFF', '#E11D48', '#16A34A'], ...props,
    },
  });

describe('ApexColorPicker — the class map', () => {
  const ui = {
    control: 'c-ctl', input: 'c-in', picker: 'c-pick', area: 'c-area', thumb: 'c-thumb',
    sliders: 'c-sliders', slider: 'c-slider', formats: 'c-formats', format: 'c-format',
    channels: 'c-channels', channel: 'c-channel', output: 'c-out', presets: 'c-presets',
    swatch: 'c-swatch',
  };

  it('reaches every part of the open picker', () => {
    const w = open({ ui });
    expect(w.find('.apex-picker.c-pick').exists()).toBe(true);
    expect(w.find('.apex-picker__area.c-area').exists()).toBe(true);
    expect(w.find('.apex-picker__thumb.c-thumb').exists()).toBe(true);
    expect(w.find('.apex-picker__sliders.c-sliders').exists()).toBe(true);
    // Hue and alpha.
    expect(w.findAll('.apex-picker__slider.c-slider').length).toBe(2);
    expect(w.find('.apex-picker__formats.c-formats').exists()).toBe(true);
    expect(w.findAll('.apex-picker__formats button.c-format').length).toBe(4);
    expect(w.find('.apex-picker__channels.c-channels').exists()).toBe(true);
    expect(w.findAll('.apex-picker__channels label.c-channel').length).toBeGreaterThan(2);
    expect(w.find('.apex-picker__value.c-out').exists()).toBe(true);
    expect(w.find('.apex-picker__presets.c-presets').exists()).toBe(true);
    // The static swatch beside the output, plus the three presets.
    expect(w.findAll('.apex-swatch.c-swatch').length).toBe(4);
  });

  it('the box takes the shared keys, and its trigger swatch takes swatch', () => {
    const w = mount(ApexColorPicker, {
      props: { label: 'Brand colour', modelValue: '#0B5FFF', ui },
    });
    expect(w.find('.apex-ctl.c-ctl').exists()).toBe(true);
    expect(w.find('.apex-ctl__input.c-in').exists()).toBe(true);
    expect(w.find('.apex-ctl .apex-swatch.c-swatch').exists()).toBe(true);
  });

  it('the inline modifier survives a custom class', () => {
    const cls = open({ ui }).find('.apex-picker').attributes('class') || '';
    expect(cls).toContain('apex-picker--inline');
    expect(cls).toContain('c-pick');
  });

  it('an untouched picker carries only its own classes', () => {
    const w = open();
    expect(w.find('.apex-picker__area').attributes('class')).toBe('apex-picker__area');
  });
});

describe('ApexColorPicker — appearance props', () => {
  it('all twelve reach their variables', () => {
    const w = open({
      pickerBackground: '#101820', pickerBorderColor: '#243040', pickerRadius: '14px',
      pickerShadow: '0 10px 34px #0009', areaHeight: '190px', areaWidth: '260px',
      areaRadius: '8px', thumbColor: '#0B0F14', sliderHeight: '16px',
      sliderThumbColor: '#E8EEF7', swatchSize: '28px', swatchBorderColor: '#243040',
    });
    const style = w.find('.apex-picker').element.parentElement!.getAttribute('style') || '';
    for (const v of ['--apex-picker-bg', '--apex-picker-border', '--apex-picker-radius',
      '--apex-picker-shadow', '--apex-picker-area-h', '--apex-picker-area-w',
      '--apex-picker-area-radius', '--apex-picker-thumb-border', '--apex-picker-slider-h',
      '--apex-picker-slider-thumb', '--apex-swatch-size', '--apex-swatch-border']) {
      expect(style, v).toContain(v);
    }
  });

  it('positioning survives, and an untouched picker sets nothing', () => {
    const w = mount(ApexColorPicker, { props: { label: 'Brand colour' } });
    const style = w.find('.apex-ctl').element.parentElement!.getAttribute('style') || '';
    expect(style).toContain('position: relative');
    expect(style).not.toContain('--apex-');
  });

  it('the colour maths still drives the swatch and area, not the props', () => {
    const w = open({ modelValue: '#E11D48', thumbColor: '#000' });
    // --sw and --hue are written per render; a prop must not displace them.
    expect(w.find('.apex-picker__thumb').attributes('style')).toContain('--sw');
    expect(w.find('.apex-picker__area').attributes('style')).toContain('--hue');
  });
});

describe('ApexColorPicker — the props the gallery exposes', () => {
  const pick = (props: Record<string, unknown> = {}) =>
    mount(ApexColorPicker, {
      props: { label: 'Brand colour', modelValue: '#0B5FFF', inline: true, ...props },
    });

  it('format decides how the value is serialised', async () => {
    for (const [format, re] of [
      ['hex', /^#[0-9a-f]{6}/i], ['rgb', /^rgb/], ['hsl', /^hsl/], ['hsb', /^hsb/],
    ] as const) {
      const w = pick({ format, showInput: true });
      const shown = (w.find('.apex-picker__value input').element as HTMLInputElement).value;
      expect(shown, format).toMatch(re);
    }
  });

  it('the format switcher changes the emitted string', async () => {
    const w = pick({ showFormatToggle: true });
    const rgb = w.findAll('.apex-picker__formats button')[1];
    await rgb.trigger('click');
    const v = (w.emitted('update:modelValue') as string[][])[0][0];
    expect(v).toMatch(/^rgb/);
  });

  it('showAlpha adds the opacity track and an alpha channel', () => {
    expect(pick({ showAlpha: true }).findAll('.apex-picker__slider').length).toBe(2);
    expect(pick({ showAlpha: false }).findAll('.apex-picker__slider').length).toBe(1);
    const withA = pick({ showAlpha: true, showChannels: true });
    expect(withA.findAll('.apex-picker__channels label').length).toBe(4);
  });

  it('orientation is reported to CSS', () => {
    expect(pick({ orientation: 'vertical' }).find('.apex-picker').attributes('data-orientation'))
      .toBe('vertical');
  });

  it('presets render, mark the active one, and commit on click', async () => {
    const w = pick({ presets: ['#0B5FFF', '#E11D48'] });
    const swatches = w.findAll('.apex-picker__presets .apex-swatch');
    expect(swatches.length).toBe(2);
    // The one matching the model is flagged.
    expect(swatches[0].attributes('data-on')).toBe('true');
    expect(swatches[1].attributes('data-on')).toBe('false');
    await swatches[1].trigger('click');
    expect((w.emitted('update:modelValue') as string[][])[0][0].toLowerCase()).toBe('#e11d48');
  });

  it('showInput, showChannels and showFormatToggle each gate their part', () => {
    const off = pick({ showInput: false, showChannels: false, showFormatToggle: false });
    expect(off.find('.apex-picker__value').exists()).toBe(false);
    expect(off.find('.apex-picker__channels').exists()).toBe(false);
    expect(off.find('.apex-picker__formats').exists()).toBe(false);
    const on = pick({ showInput: true, showChannels: true, showFormatToggle: true });
    expect(on.find('.apex-picker__value').exists()).toBe(true);
    expect(on.find('.apex-picker__channels').exists()).toBe(true);
    expect(on.find('.apex-picker__formats').exists()).toBe(true);
  });

  it('inline embeds the picker; otherwise it is a popover behind the swatch', async () => {
    expect(pick().find('.apex-ctl').exists()).toBe(false);
    const popover = mount(ApexColorPicker, { props: { label: 'Brand colour', modelValue: '#0B5FFF' } });
    expect(popover.find('.apex-picker').exists()).toBe(false);
    await popover.find('.apex-ctl .apex-swatch').trigger('click');
    expect(popover.find('.apex-picker').exists()).toBe(true);
  });

  it('typing a colour into the box commits it', async () => {
    const w = mount(ApexColorPicker, { props: { label: 'Brand colour', modelValue: '#0B5FFF' } });
    const input = w.find('.apex-ctl__input');
    await input.setValue('#E11D48');
    expect((w.emitted('update:modelValue') as string[][])[0][0].toLowerCase()).toBe('#e11d48');
  });

  it('the hue track and the arrow keys both move the colour', async () => {
    const w = pick({});
    await w.find('.apex-picker__slider--hue input').setValue('200');
    expect(w.emitted('update:modelValue')).toBeTruthy();

    const keyed = pick({});
    await keyed.find('.apex-picker__area').trigger('keydown', { key: 'ArrowRight' });
    expect(keyed.emitted('update:modelValue')).toBeTruthy();
  });

  it('disabled blocks the trigger', async () => {
    const w = mount(ApexColorPicker, {
      props: { label: 'Brand colour', modelValue: '#0B5FFF', disabled: true },
    });
    expect(w.find('.apex-ctl .apex-swatch').attributes('disabled')).toBeDefined();
    await w.find('.apex-ctl .apex-swatch').trigger('click');
    expect(w.find('.apex-picker').exists()).toBe(false);
  });
});

describe('ApexColorPicker — vertical tracks and hidden labels', () => {
  it('the vertical tracks are long on the inline axis and thin on the block one', () => {
    // writing-mode: vertical-lr turns the inline axis vertical, so inline-size
    // is the track's length and block-size its thickness. Having those the
    // wrong way round drew wide, short bars lying across the popover.
    const w = mount(ApexColorPicker, {
      props: {
        label: 'Brand colour', modelValue: '#0B5FFF', inline: true,
        orientation: 'vertical', sliderLength: '190px', sliderHeight: '14px',
      },
    });
    const style = w.find('.apex-picker').element.parentElement!.getAttribute('style') || '';
    expect(style).toContain('--apex-picker-slider-length: 190px');
    expect(style).toContain('--apex-picker-slider-h: 14px');
    expect(w.find('.apex-picker').attributes('data-orientation')).toBe('vertical');
  });

  it('the track labels are marked screen-reader-only', () => {
    const w = mount(ApexColorPicker, {
      props: { label: 'Brand colour', modelValue: '#0B5FFF', inline: true, showAlpha: true },
    });
    const hidden = w.findAll('.sr-only').map((n) => n.text());
    expect(hidden).toContain('Hue');
    expect(hidden).toContain('Opacity');
  });
});
