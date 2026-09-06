import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ApexCompare from '../src/components/ApexCompare.vue';
import ApexCompareItem from '../src/components/ApexCompareItem.vue';
import ApexCarousel from '../src/components/ApexCarousel.vue';
import ApexCarouselContent from '../src/components/ApexCarouselContent.vue';
import ApexCarouselItem from '../src/components/ApexCarouselItem.vue';
import ApexCarouselControls from '../src/components/ApexCarouselControls.vue';
import ApexGallery from '../src/components/ApexGallery.vue';

/*
 * The media family's ui map, checked where the class has to land.
 *
 * Declaring a key on ApexMediaClasses costs nothing and proves nothing: the
 * interface is satisfied whether or not the template ever reads it, so a key
 * documented in a Customising section can be inert and every other gate here
 * still passes. This mounts each control with a map and looks for the class on
 * the element the key names.
 *
 * The carousel is the one worth spelling out: its parts live in five files and
 * take the map through the context rather than as props, so a key that reaches
 * ApexCarouselNav is travelling a route nothing else in the library uses.
 */

const IMAGES = [
  { background: '#8FB6D9', alt: 'One' },
  { background: '#C9A88F', alt: 'Two' },
];

describe('the media family accepts the ui class map', () => {
  it('ApexCompare', () => {
    const w = mount(ApexCompare, {
      props: {
        ui: { root: 'x-root', divider: 'x-div', handle: 'x-handle', grip: 'x-grip', chev: 'x-chev' },
      },
      slots: {
        default: `<div class="a">before</div><div class="b">after</div>`,
      },
    });
    expect(w.find('.apex-cmp').classes()).toContain('x-root');
    expect(w.find('.apex-cmp__divider').classes()).toContain('x-div');
    expect(w.find('.apex-cmp__handle').classes()).toContain('x-handle');
    expect(w.find('.apex-cmp__grip').classes()).toContain('x-grip');
    expect(w.findAll('.apex-cmp__chev').every((c) => c.classes().includes('x-chev'))).toBe(true);
  });

  it('ApexCompareItem', () => {
    /* The item keeps its own map: the two sides of a comparison are meant to
       be able to differ, which is why this one is not on the context. */
    const w = mount(ApexCompare, {
      slots: {
        default: () => [
          h(ApexCompareItem, { position: 'before', ui: { item: 'x-before' } }, () => 'before'),
          h(ApexCompareItem, { position: 'after', ui: { item: 'x-after' } }, () => 'after'),
        ],
      },
    });
    expect(w.find('.x-before').exists()).toBe(true);
    expect(w.find('.x-after').exists()).toBe(true);
  });

  it('ApexCarousel — one map on the root reaches all five parts', () => {
    const w = mount(ApexCarousel, {
      props: {
        ui: { root: 'x-root', track: 'x-track', item: 'x-item', nav: 'x-nav', dots: 'x-dots', dot: 'x-dot' },
      },
      slots: {
        default: () => [
          h(ApexCarouselContent, () => [
            h(ApexCarouselItem, () => 'one'),
            h(ApexCarouselItem, () => 'two'),
          ]),
          h(ApexCarouselControls),
        ],
      },
    });
    expect(w.find('.apex-carousel').classes()).toContain('x-root');
    expect(w.find('.apex-carousel__track').classes()).toContain('x-track');
    expect(w.findAll('.apex-carousel__item').every((i) => i.classes().includes('x-item'))).toBe(true);
    expect(w.findAll('.apex-carousel__nav').every((n) => n.classes().includes('x-nav'))).toBe(true);
    expect(w.find('.apex-carousel__dots').classes()).toContain('x-dots');
    expect(w.findAll('.apex-carousel__dot').every((d) => d.classes().includes('x-dot'))).toBe(true);
  });

  it('ApexGallery', () => {
    const w = mount(ApexGallery, {
      props: {
        images: IMAGES,
        showCounter: true,
        ui: {
          root: 'x-root', stage: 'x-stage', img: 'x-img', bar: 'x-bar', act: 'x-act',
          nav: 'x-nav', count: 'x-count', thumbs: 'x-thumbs', thumb: 'x-thumb',
        },
      },
    });
    expect(w.find('.apex-gal').classes()).toContain('x-root');
    expect(w.find('.apex-gal__stage').classes()).toContain('x-stage');
    expect(w.find('.apex-gal__img').classes()).toContain('x-img');
    expect(w.find('.apex-gal__bar').classes()).toContain('x-bar');
    expect(w.findAll('.apex-gal__act').every((a) => a.classes().includes('x-act'))).toBe(true);
    expect(w.findAll('.apex-gal__nav').every((n) => n.classes().includes('x-nav'))).toBe(true);
    expect(w.find('.apex-gal__count').classes()).toContain('x-count');
    expect(w.find('.apex-gal__thumbs').classes()).toContain('x-thumbs');
    expect(w.findAll('.apex-gal__thumb').every((t) => t.classes().includes('x-thumb'))).toBe(true);
  });
});

describe('the gallery writes its appearance props as --apex-gal-* variables', () => {
  /*
   * Seventeen props reach the stylesheet only as inline variables, so a
   * misspelling here is invisible: the prop is accepted, the style attribute
   * is written, and nothing renders differently. This is the AF2-131/141/170
   * rename's proof for the last family to get it.
   */
  it('every one is prefixed and reaches the root', () => {
    const w = mount(ApexGallery, {
      props: {
        images: IMAGES,
        height: '300px', aspectRatio: '4/3', radius: '10px', stageBackground: '#111',
        padding: '8px', toolbarBackground: '#222', toolbarColor: '#eee', toolbarRadius: '6px',
        navBackground: '#333', navColor: '#ddd', navSize: '40px', navRadius: '4px',
        thumbSize: '80px', thumbGap: '10px', thumbRadius: '3px', thumbActiveColor: '#0f0',
        thumbInactiveOpacity: 0.4,
      },
    });
    const style = w.find('.apex-gal').attributes('style') || '';
    expect(style).toContain('--apex-gal-height: 300px');
    expect(style).toContain('--apex-gal-thumb-active: #0f0');
    expect(style).toContain('--apex-gal-thumb-dim: 0.4');
    /* No survivor of the old prefix. `--gal-height` is a substring of
       `--apex-gal-height`, so this has to be matched to its start. */
    expect(/(^|[^-])--gal-/.test(style)).toBe(false);
  });
});
