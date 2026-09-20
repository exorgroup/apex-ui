import { createApp, h } from 'vue';
import { ApexUI, ApexDataTable } from '../dist/apex-ui.js';
import '../dist/apex-ui.css';

/* The blog list's own shape: several wide columns and a frozen actions
   column pinned to the trailing edge. */
const columns = [
  { field: 'title', header: 'Title', minWidth: '22rem' },
  { field: 'tag', header: 'Tag', minWidth: '10rem' },
  { field: 'author', header: 'Author', minWidth: '12rem' },
  { field: 'read', header: 'Read', minWidth: '8rem' },
  { field: 'status', header: 'Status', minWidth: '10rem' },
  { field: 'published', header: 'Published', minWidth: '12rem' },
  { field: 'actions', header: 'Actions', minWidth: '8rem', frozen: true, alignFrozen: 'right', fixed: true },
];

const rows = Array.from({ length: 6 }, (_, i) => ({
  id: i, title: `A post number ${i}`, tag: 'Field notes', author: 'Duncan Dimech',
  read: '1 min', status: 'Draft', published: '22 May 2026', actions: '',
}));

createApp({
  render: () => h(ApexDataTable, {
    value: rows, columns, dataKey: 'id', paginator: true, rows: 10, gridLines: 'both', striped: true, hoverable: true, rowRipple: true, lazy: true, totalRecords: 6,
  }, { 'cell:actions': () => h('button', { class: 'probe-action' }, 'Edit') }),
}).use(ApexUI, {}).mount('#app');

window.__frozen = () => {
  const th = document.querySelector('th[data-frozen="end"]');
  const td = document.querySelector('tbody td[data-frozen="end"]');
  const read = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { position: cs.position, insetInlineEnd: cs.insetInlineEnd, right: cs.right,
             zIndex: cs.zIndex, x: Math.round(r.x), width: Math.round(r.width) };
  };
  const scroller = document.querySelector('.apex-dt__scroll, .apex-dt__wrap, .apex-dt');
  return { th: read(th), td: read(td), inlineStyleTh: th?.getAttribute('style'),
           inlineStyleTd: td?.getAttribute('style'),
           scroller: scroller ? { cls: scroller.className, overflowX: getComputedStyle(scroller).overflowX } : null };
};
/* Whatever actually scrolls sideways - the class name has changed
   before, and guessing it is how the first probe measured nothing. */
window.__scroller = () => Array.from(document.querySelectorAll('#app *'))
  .find((el) => el.scrollWidth > el.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(el).overflowX));

window.__scrollRight = () => {
  const el = window.__scroller();
  if (!el) return 'NO SCROLLER';
  el.scrollLeft = el.scrollWidth;
  return { cls: el.className, left: Math.round(el.scrollLeft), max: Math.round(el.scrollWidth - el.clientWidth) };
};
