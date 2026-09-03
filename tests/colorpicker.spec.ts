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
