import type { InjectionKey, Ref } from 'vue';
import type { ApexMediaClasses } from '../types';

/**
 * Carousel context. The root owns the scroll state and every sub-component
 * reads it from here, so a carousel can be composed in any arrangement — nav
 * above the track, indicators beside it, two tracks driven by one slide index.
 */
export interface CarouselCtx {
  /**
   * The root's `ui` map, so one map on ApexCarousel reaches every part.
   *
   * Through the context rather than a prop on each sub-component: the parts
   * are spread across five files, and a consumer classing a carousel wants to
   * write one object, not five. ApexCompare keeps `ui` on its item because
   * there the two sides are meant to differ.
   */
  ui: Ref<ApexMediaClasses | undefined>;
  align: Ref<'start' | 'center' | 'end'>;
  slidesPerPage: Ref<number>;
  orientation: Ref<'horizontal' | 'vertical'>;
  loop: Ref<boolean>;
  autoSize: Ref<boolean>;
  gap: Ref<string>;
  indicators: Ref<boolean>;
  indicatorPosition: Ref<'left' | 'center' | 'right'>;
  navPosition: Ref<'bottom' | 'top' | 'middle' | 'both-start' | 'both-end' | 'split'>;
  current: Ref<number>;
  /** True while a programmatic goTo is still animating. */
  settling: Ref<boolean>;
  count: Ref<number>;
  /** Set by ApexCarouselContent once it mounts. */
  setScroller: (el: HTMLElement | null) => void;
  goTo: (i: number, smooth?: boolean) => void;
  next: () => void;
  prev: () => void;
  canPrev: Ref<boolean>;
  canNext: Ref<boolean>;
}

export const CAROUSEL_CTX: InjectionKey<CarouselCtx> = Symbol('apex-carousel');
