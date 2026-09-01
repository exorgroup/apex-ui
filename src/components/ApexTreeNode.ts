import { defineComponent, h, type PropType } from 'vue';
import ApexIcon from './ApexIcon.vue';

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
  },
  emits: ['pick', 'toggle'],
  setup(props, { emit }) {
    return () => {
      const n = props.node;
      const leaf = !n.children || !n.children.length;
      const st = props.stateOf(n);
      const open = props.isExpanded(n);

      const row = h('div', {
        class: 'apex-tree__row',
        role: 'treeitem',
        'aria-expanded': leaf ? undefined : open,
        'aria-selected': st === 'on',
        'data-state': st,
        'data-disabled': n.disabled ? 'true' : 'false',
        style: { paddingInlineStart: 8 + props.depth * 18 + 'px' },
        onClick: (e: MouseEvent) => { e.stopPropagation(); emit('pick', n); },
      }, [
        leaf
          ? h('span', { class: 'apex-tree__spacer' })
          : h('button', {
            class: 'apex-tree__twisty',
            type: 'button',
            'aria-label': open ? 'Collapse' : 'Expand',
            onClick: (e: MouseEvent) => { e.stopPropagation(); emit('toggle', n); },
          }, [h(ApexIcon, { name: open ? 'keyboard_arrow_down' : 'chevron_right', size: 18 })]),
        props.checkbox
          ? h('span', { class: 'apex-cb__box', 'data-on': st === 'on', 'data-partial': st === 'partial' },
            st === 'on' ? [h(ApexIcon, { name: 'check', size: 14 })]
              : st === 'partial' ? [h(ApexIcon, { name: 'remove', size: 14 })] : [])
          : null,
        n.image ? h('img', { class: 'apex-pop__img', src: n.image, alt: '' })
          : n.icon ? h(ApexIcon, { name: n.icon, size: 18 }) : null,
        h('span', { class: 'apex-tree__label' }, [
          n.label,
          n.help ? h('span', { class: 'apex-pop__help' }, n.help) : null,
        ]),
        !props.checkbox && st === 'on' ? h(ApexIcon, { name: 'check', class: 'apex-pop__tick' }) : null,
      ]);

      const kids = !leaf && open
        ? (n.children || []).map((c) => h(ApexTreeNode, {
          key: c.key,
          node: c,
          depth: props.depth + 1,
          checkbox: props.checkbox,
          stateOf: props.stateOf,
          isExpanded: props.isExpanded,
          onPick: (x: TreeNode) => emit('pick', x),
          onToggle: (x: TreeNode) => emit('toggle', x),
        }))
        : [];

      return h('div', { class: 'apex-tree__branch', role: leaf ? undefined : 'group' }, [row, ...kids]);
    };
  },
});

export default ApexTreeNode;
