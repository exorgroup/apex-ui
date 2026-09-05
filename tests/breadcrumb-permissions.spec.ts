import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, type Plugin, type VNodeArrayChildren } from 'vue';
import ApexUI from '../src/index';
import ApexBreadcrumb from '../src/components/ApexBreadcrumb.vue';
import type { CrumbItem } from '../src/components/ApexBreadcrumb.vue';

/**
 * The breadcrumb is the one control in the pack that does not filter.
 *
 * A trail is a path, not a list. Venue > Events > Shows > Seats says how you
 * got here, and each crumb is reachable only through the one before it. Deny
 * Shows and dropping just that crumb would leave Venue > Events > Seats, which
 * offers a route that does not exist — and stays a lie even for a user who can
 * reach Seats some other way, because that is not the path this trail claims.
 *
 * So it truncates. Everything here is about where it stops and what that does
 * to the rest of the component.
 */

const DENY = {
  can: (action: string, resource: string) => !(resource === 'secret' && action === 'read'),
};
const gated = { plugins: [[ApexUI, DENY] as [Plugin, unknown]] };
const open = { plugins: [ApexUI] };

const TRAIL: CrumbItem[] = [
  { label: 'Venue', href: '/venue' },
  { label: 'Events', href: '/events' },
  { label: 'Shows', href: '/shows', can: 'secret' },
  { label: 'Seats', href: '/seats' },
];

const labels = (w: ReturnType<typeof mount>) =>
  w.findAll('.apex-bc__label').map((n) => n.text());

describe('a denied crumb truncates the trail', () => {
  it('stops there, and does not carry on past the block', () => {
    const w = mount(ApexBreadcrumb, { props: { items: TRAIL }, global: gated, attachTo: document.body });
    expect(labels(w), 'the walkable prefix, and nothing after').toEqual(['Venue', 'Events']);
    w.unmount();
  });

  it('shows the whole trail when nothing is denied', () => {
    const w = mount(ApexBreadcrumb, { props: { items: TRAIL }, global: open, attachTo: document.body });
    expect(labels(w)).toEqual(['Venue', 'Events', 'Shows', 'Seats']);
    w.unmount();
  });

  it('renders nothing at all when the first crumb is denied', () => {
    const w = mount(ApexBreadcrumb, {
      props: { items: [{ label: 'Venue', can: 'secret' }, { label: 'Events' }] },
      global: gated,
      attachTo: document.body,
    });
    expect(w.find('nav').exists(), 'no empty bar describing a path they have none of').toBe(false);
    w.unmount();
  });

  it('home counts as the first crumb, so denying it empties the trail', () => {
    const w = mount(ApexBreadcrumb, {
      props: { home: { icon: 'home', can: 'secret' }, items: TRAIL },
      global: gated,
      attachTo: document.body,
    });
    expect(w.find('nav').exists()).toBe(false);
    w.unmount();
  });

  it('home is part of the trail, and survives when it is allowed', () => {
    const w = mount(ApexBreadcrumb, {
      props: { home: { label: 'Home' }, items: TRAIL },
      global: gated,
      attachTo: document.body,
    });
    expect(labels(w)).toEqual(['Home', 'Venue', 'Events']);
    w.unmount();
  });

  it('does not mark the last surviving crumb as the current page', () => {
    /*
     * You are on Seats. The trail stops at Events. Marking Events "you are
     * here" would state something false, so a truncated trail marks nothing —
     * and its last crumb stays a link, because it is a place you can go.
     */
    const w = mount(ApexBreadcrumb, { props: { items: TRAIL }, global: gated, attachTo: document.body });
    expect(w.findAll('[data-current="true"]').length, 'nothing claims to be the page').toBe(0);
    expect(w.findAll('.apex-bc__link')[1].element.tagName, 'and it is still a link').toBe('A');
    w.unmount();
  });

  it('still marks the last crumb when the trail is whole', () => {
    const w = mount(ApexBreadcrumb, { props: { items: TRAIL }, global: open, attachTo: document.body });
    const current = w.findAll('[data-current="true"]');
    expect(current.length).toBe(1);
    expect(current[0].text()).toContain('Seats');
    w.unmount();
  });
});

describe('truncation runs before the maxItems collapse', () => {
  /*
   * Order matters here and gets it wrong silently. Collapsing first would
   * measure the ellipsis against a trail this user cannot walk — hiding
   * crumbs behind a "show more" that, once expanded, reveals crumbs that
   * should never have been in the trail at all.
   */
  const LONG: CrumbItem[] = [
    { label: 'A' }, { label: 'B' }, { label: 'C' },
    { label: 'D', can: 'secret' }, { label: 'E' }, { label: 'F' },
  ];

  it('a trail that fits after truncating does not collapse', () => {
    const w = mount(ApexBreadcrumb, {
      props: { items: LONG, maxItems: 4 }, global: gated, attachTo: document.body,
    });
    expect(labels(w), 'three crumbs left, under the limit').toEqual(['A', 'B', 'C']);
    expect(w.find('.apex-bc__more').exists(), 'so no ellipsis').toBe(false);
    w.unmount();
  });

  it('the same trail does collapse when nothing is denied', () => {
    const w = mount(ApexBreadcrumb, {
      props: { items: LONG, maxItems: 4 }, global: open, attachTo: document.body,
    });
    expect(w.find('.apex-bc__more').exists(), 'six crumbs over a limit of four').toBe(true);
    w.unmount();
  });
});

describe('a crumb can name a route', () => {
  /* A stand-in for RouterLink or Inertia's Link: anything taking a `to`. */
  const StubLink = {
    name: 'StubLink',
    props: { to: { type: [String, Object], default: undefined } },
    render(this: { to: unknown; $slots: { default?: () => VNodeArrayChildren } }) {
      return h('a', { 'data-routed': String(this.to) }, this.$slots.default?.());
    },
  };

  it('renders `to` through the app’s link component', () => {
    const w = mount(ApexBreadcrumb, {
      props: {
        items: [{ label: 'Venue', to: '/venue' }, { label: 'Seats' }],
        linkComponent: StubLink,
      },
      global: open,
      attachTo: document.body,
    });
    expect(w.find('[data-routed="/venue"]').exists()).toBe(true);
    w.unmount();
  });

  it('falls back to an href when no link component is wired', () => {
    /*
     * Otherwise `to` would render a `to` attribute nothing acts on — a
     * documented prop that quietly does nothing, which is worse than a plain
     * link. A string route doubles as a URL, so this still navigates.
     */
    const w = mount(ApexBreadcrumb, {
      props: { items: [{ label: 'Venue', to: '/venue' }, { label: 'Seats' }] },
      global: open,
      attachTo: document.body,
    });
    expect(w.findAll('.apex-bc__link')[0].attributes('href')).toBe('/venue');
    w.unmount();
  });

  it('a denied routed crumb truncates like any other', () => {
    const w = mount(ApexBreadcrumb, {
      props: {
        items: [{ label: 'Venue', to: '/venue' }, { label: 'Shows', to: '/shows', can: 'secret' },
          { label: 'Seats', to: '/seats' }],
        linkComponent: StubLink,
      },
      global: gated,
      attachTo: document.body,
    });
    expect(labels(w)).toEqual(['Venue']);
    w.unmount();
  });
});
