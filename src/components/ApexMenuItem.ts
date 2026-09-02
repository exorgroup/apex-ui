import { defineComponent, h, nextTick, ref, type PropType } from 'vue';
import type { ApexButtonClasses } from '../types';
import ApexIcon from './ApexIcon.vue';

export interface MenuItem {
  label?: string;
  icon?: string;
  /** Right-aligned hint — a shortcut, a count. */
  hint?: string;
  disabled?: boolean;
  /** Horizontal rule instead of a row. */
  separator?: boolean;
  /** Section heading instead of a row. */
  header?: string;
  href?: string;
  target?: string;
  /** Nested submenu. */
  items?: MenuItem[];
  /** Any payload you want back on the click event. */
  [key: string]: unknown;
}

/** One overlay row: separator, header, leaf, or a branch with a submenu. */
const ApexMenuItem = defineComponent({
  name: 'ApexMenuItem',
  props: {
    item: { type: Object as PropType<MenuItem>, required: true },
    depth: { type: Number, default: 0 },
    /**
     * Optional replacement for a row's contents, passed down from an owner's
     * `item` slot. The row itself — click, hover, submenu — stays ours, so a
     * custom template never has to reimplement the menu behaviour.
     */
    itemRender: { type: Function as PropType<(ctx: { item: MenuItem; depth: number; branch: boolean }) => unknown>, default: undefined },
    /** Your own classes on the row, header, hint and separator. */
    ui: { type: Object as PropType<ApexButtonClasses>, default: undefined },
  },
  emits: ['pick'],
  setup(props, { emit }) {
    const open = ref(false);
    const row = ref<HTMLElement | null>(null);
    const sub = ref<HTMLElement | null>(null);
    /* Which side the submenu opens on, decided from the row's real position:
       a context menu near the right edge would otherwise push its submenu off
       screen. Same for a branch near the bottom. */
    const side = ref<'end' | 'start'>('end');
    const lift = ref(0);

    function measure() {
      const r = row.value?.getBoundingClientRect();
      const s = sub.value?.getBoundingClientRect();
      if (!r || !s) return;
      const pad = 8;
      side.value = r.right + s.width > window.innerWidth - pad && r.left - s.width > pad ? 'start' : 'end';
      const overflow = s.bottom - (window.innerHeight - pad);
      lift.value = overflow > 0 ? Math.min(overflow, Math.max(0, s.top - pad)) : 0;
    }
    function setOpen(v: boolean) {
      open.value = v;
      if (v) nextTick(measure);
      else { side.value = 'end'; lift.value = 0; }
    }

    return () => {
      const it = props.item;
      if (it.separator) return h('li', { class: ['apex-menu__sep', props.ui?.menuSeparator], role: 'separator' });
      if (it.header) return h('li', { class: ['apex-menu__header', props.ui?.menuHeader], role: 'presentation' }, it.header);

      const branch = !!(it.items && it.items.length);
      const tag = it.href && !branch ? 'a' : 'button';

      const rowNode = h(tag, {
        ref: row,
        class: ['apex-menu__row', props.ui?.menuItem],
        role: 'menuitem',
        href: it.href,
        target: it.target,
        type: tag === 'button' ? 'button' : undefined,
        disabled: tag === 'button' ? it.disabled : undefined,
        'aria-haspopup': branch ? 'menu' : undefined,
        'aria-expanded': branch ? open.value : undefined,
        'data-disabled': it.disabled ? 'true' : 'false',
        onClick: (e: MouseEvent) => {
          if (it.disabled) return;
          if (branch) { e.stopPropagation(); setOpen(!open.value); return; }
          emit('pick', it, e);
        },
      }, props.itemRender
        ? [props.itemRender({ item: it, depth: props.depth, branch })]
        : [
          it.icon ? h(ApexIcon, { name: it.icon, size: 18 }) : h('span', { class: 'apex-menu__gap' }),
          h('span', { class: 'apex-menu__label' }, it.label),
          it.hint ? h('span', { class: ['apex-menu__hint', props.ui?.menuHint] }, it.hint) : null,
          branch ? h(ApexIcon, { name: 'chevron_right', size: 18, class: 'apex-menu__chev' }) : null,
        ]);

      const subNode = branch
        ? h('ul', {
          ref: sub,
          class: 'apex-menu__sub',
          role: 'menu',
          'data-open': open.value ? 'true' : 'false',
          'data-side': side.value,
          style: lift.value ? { marginBlockStart: -lift.value + 'px' } : undefined,
        },
          (it.items || []).map((child, i) => h(ApexMenuItem, {
            key: i, item: child, depth: props.depth + 1, itemRender: props.itemRender, ui: props.ui,
            onPick: (x: MenuItem, e: MouseEvent) => emit('pick', x, e),
          })))
        : null;

      return h('li', {
        class: 'apex-menu__item',
        onMouseenter: () => { if (branch) setOpen(true); },
        onMouseleave: () => { if (branch) setOpen(false); },
      }, [rowNode, subNode]);
    };
  },
});

export default ApexMenuItem;
