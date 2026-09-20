import { defineComponent, h, type PropType } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexFieldClasses } from '../types';

export interface TreeNode {
  key: string;
  label: string;
  icon?: string;
  image?: string;
  help?: string;
  disabled?: boolean;
  children?: TreeNode[];
}

export type TreeState = 'on' | 'off' | 'partial';

/** Recursive row renderer for ApexTreeSelect. */
const ApexTreeNode = defineComponent({
  name: 'ApexTreeNode',
  props: {
    node: { type: Object as PropType<TreeNode>, required: true },
    depth: { type: Number, default: 0 },
    checkbox: Boolean,
    stateOf: { type: Function as PropType<(n: TreeNode) => TreeState>, required: true },
    isExpanded: { type: Function as PropType<(n: TreeNode) => boolean>, required: true },
    /** The branch above this node, root first. Used to report where an added
        record belongs; this node is appended before the row emits. */
    trail: { type: Array as PropType<TreeNode[]>, default: () => [] },
    addNew: Boolean,
    addNewText: { type: String, default: '' },
    ui: { type: Object as PropType<ApexFieldClasses>, default: () => ({}) },
  },
  emits: ['pick', 'toggle', 'add-new'],
  setup(props, { emit }) {
    /** Depth-proportional inset, so a level's width is one variable to change. */
    const inset = (depth: number) =>
      `calc(8px + var(--apex-treesel-indent, 18px) * ${depth})`;

    return () => {
      const n = props.node;
      const leaf = !n.children || !n.children.length;
      const st = props.stateOf(n);
      const open = props.isExpanded(n);
      const ui = props.ui;

      const row = h('div', {
        class: ['apex-tree__row', ui.option],
        role: 'treeitem',
        'aria-expanded': leaf ? undefined : open,
        'aria-selected': st === 'on',
        'data-state': st,
        'data-disabled': n.disabled ? 'true' : 'false',
        style: { paddingInlineStart: inset(props.depth) },
        onClick: (e: MouseEvent) => { e.stopPropagation(); emit('pick', n); },
      }, [
        leaf
          ? h('span', { class: 'apex-tree__spacer' })
          : h('button', {
            class: ['apex-tree__twisty', ui.twisty],
            type: 'button',
            'aria-label': open ? 'Collapse' : 'Expand',
            onClick: (e: MouseEvent) => { e.stopPropagation(); emit('toggle', n); },
          }, [h(ApexIcon, { name: open ? 'keyboard_arrow_down' : 'chevron_right', size: 18 })]),
        props.checkbox
          ? h('span', { class: ['apex-cb__box', ui.checkbox], 'data-on': st === 'on', 'data-partial': st === 'partial' },
            st === 'on' ? [h(ApexIcon, { name: 'check', size: 14 })]
              : st === 'partial' ? [h(ApexIcon, { name: 'remove', size: 14 })] : [])
          : null,
        n.image ? h('img', { class: ['apex-pop__img', ui.thumbnail], src: n.image, alt: '' })
          : n.icon ? h(ApexIcon, { name: n.icon, size: 18 }) : null,
        h('span', { class: 'apex-tree__label' }, [
          n.label,
          n.help ? h('span', { class: ['apex-pop__help', ui.optionHelp] }, n.help) : null,
        ]),
        !props.checkbox && st === 'on' ? h(ApexIcon, { name: 'check', class: ['apex-pop__tick', ui.tick] }) : null,
      ]);

      const here = [...props.trail, n];
      const kids = !leaf && open
        ? (n.children || []).map((c) => h(ApexTreeNode, {
          key: c.key,
          node: c,
          depth: props.depth + 1,
          checkbox: props.checkbox,
          stateOf: props.stateOf,
          isExpanded: props.isExpanded,
          trail: here,
          addNew: props.addNew,
          addNewText: props.addNewText,
          ui: props.ui,
          onPick: (x: TreeNode) => emit('pick', x),
          onToggle: (x: TreeNode) => emit('toggle', x),
          onAddNew: (p: TreeNode[]) => emit('add-new', p),
        }))
        : [];

      /* One row per open branch, at the children's own depth — so it reads as
         "add a child here", not "add a sibling of this branch". */
      const add = props.addNew && !leaf && open
        ? [h('button', {
          type: 'button',
          class: ['apex-pop__add', ui.addNew],
          style: { paddingInlineStart: inset(props.depth + 1) },
          onClick: (e: MouseEvent) => { e.stopPropagation(); emit('add-new', here); },
        }, [h(ApexIcon, { name: 'add', size: 18 }), h('span', props.addNewText)])]
        : [];

      return h('div', { class: ['apex-tree__branch', ui.branch], role: leaf ? undefined : 'group' },
        [row, ...kids, ...add]);
    };
  },
});

export default ApexTreeNode;
