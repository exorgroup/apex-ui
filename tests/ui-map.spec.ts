import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexPaginator from '../src/components/ApexPaginator.vue';
import ApexProgressBar from '../src/components/ApexProgressBar.vue';
import ApexPickList from '../src/components/ApexPickList.vue';
import ApexOrgChart from '../src/components/ApexOrgChart.vue';
import ApexTimeline from '../src/components/ApexTimeline.vue';
import ApexDataView from '../src/components/ApexDataView.vue';
import ApexTree from '../src/components/ApexTree.vue';
import ApexTreeTable from '../src/components/ApexTreeTable.vue';
import ApexDataTable from '../src/components/ApexDataTable.vue';
import ApexScheduler from '../src/components/ApexScheduler.vue';
import ApexCalendar from '../src/components/ApexCalendar.vue';
import ApexEditor from '../src/components/ApexEditor.vue';
import ApexEditorToolbar from '../src/components/ApexEditorToolbar.vue';
import ApexEditorSlash from '../src/components/ApexEditorSlash.vue';
import ApexEditorTableTools from '../src/components/ApexEditorTableTools.vue';
import ApexEditorImage from '../src/components/ApexEditorImage.vue';
import ApexHTMLEditor from '../src/components/ApexHTMLEditor.vue';
import ApexForm from '../src/components/ApexForm.vue';
import { flushPromises } from '@vue/test-utils';
import { loadEngine } from '../src/core/editor/engine';
import { DEFAULT_SLASH_ITEMS } from '../src/core/editor/slash';

/**
 * The `ui` map reaches every part it names.
 *
 * A class map is the one feature that fails silently: pass `ui: { fill: 'x' }`
 * at a part that was never bound and nothing errors, nothing warns, and the
 * class simply never appears. AF2-253 bound 61 parts across seven files; this
 * is what says they are wired rather than merely declared.
 *
 * OrgChart earns its own case because its parts are rendered by ApexOrgNode,
 * recursively — the map has to be handed down at two levels, and a child node
 * that quietly drops it looks correct until someone expands a branch.
 */
describe('ui map lands on the part', () => {
  it('paginator', () => {
    const w = mount(ApexPaginator, { props: { totalRecords: 84, rows: 10,
      rowsPerPageOptions: [10, 20], ui: { root: 'X-root', summary: 'X-sum', page: 'X-page', size: 'X-size' } } });
    expect(w.find('.apex-pager').classes()).toContain('X-root');
    expect(w.find('.apex-pager__summary').classes()).toContain('X-sum');
    expect(w.find('.apex-pager__btn--page').classes()).toContain('X-page');
    expect(w.find('.apex-pager__size').classes()).toContain('X-size');
  });
  it('progressbar', () => {
    const w = mount(ApexProgressBar, { props: { value: 40, ui: { root: 'X-r', track: 'X-t', fill: 'X-f' } } });
    expect(w.find('.apex-pb').classes()).toContain('X-r');
    expect(w.find('.apex-pb__track').classes()).toContain('X-t');
    expect(w.find('.apex-pb__fill').classes()).toContain('X-f');
  });
  it('picklist', () => {
    const w = mount(ApexPickList, { props: { modelValue: [[{ id: 1, label: 'a' }], []],
      dataKey: 'id', ui: { root: 'X-r', panel: 'X-p', item: 'X-i' } } });
    expect(w.find('.apex-pl').classes()).toContain('X-r');
    expect(w.find('.apex-pl__panel').classes()).toContain('X-p');
    expect(w.find('.apex-pl__item').classes()).toContain('X-i');
  });
  it('orgchart passes the map down to every node, including children', () => {
    const w = mount(ApexOrgChart, { props: {
      value: { key: 'a', label: 'A', children: [{ key: 'b', label: 'B' }] },
      ui: { root: 'X-r', node: 'X-n', label: 'X-l' } } });
    expect(w.find('.apex-oc').classes()).toContain('X-r');
    expect(w.findAll('.apex-oc__node').length).toBe(2);
    w.findAll('.apex-oc__node').forEach((n) => expect(n.classes()).toContain('X-n'));
    expect(w.findAll('.apex-oc__label')[1].classes()).toContain('X-l');
  });
  it('timeline', () => {
    const w = mount(ApexTimeline, { props: { value: [{ status: 'One' }, { status: 'Two' }],
      ui: { root: 'X-r', event: 'X-e', marker: 'X-m', content: 'X-c' } } });
    expect(w.find('.apex-tl').classes()).toContain('X-r');
    expect(w.find('.apex-tl__event').classes()).toContain('X-e');
    expect(w.find('.apex-tl__marker').classes()).toContain('X-m');
    expect(w.find('.apex-tl__content').classes()).toContain('X-c');
  });

  it('dataview', () => {
    const w = mount(ApexDataView, { props: { value: [{ id: 1 }, { id: 2 }], dataKey: 'id',
      ui: { root: 'X-r', main: 'X-m', items: 'X-is', item: 'X-i' } } });
    expect(w.find('.apex-dv').classes()).toContain('X-r');
    expect(w.find('.apex-dv__main').classes()).toContain('X-m');
    expect(w.find('.apex-dv__items').classes()).toContain('X-is');
    expect(w.find('.apex-dv__item').classes()).toContain('X-i');
  });

  it('tree', () => {
    const w = mount(ApexTree, { props: {
      value: [{ key: 'a', label: 'A', children: [{ key: 'b', label: 'B' }] }],
      expandedKeys: { a: true },
      ui: { root: 'X-r', list: 'X-li', row: 'X-row', label: 'X-l' } } });
    expect(w.find('.apex-tr').classes()).toContain('X-r');
    expect(w.find('.apex-tr__list').classes()).toContain('X-li');
    expect(w.find('.apex-tr__row').classes()).toContain('X-row');
    expect(w.find('.apex-tr__label').classes()).toContain('X-l');
  });

  it('treetable', () => {
    const w = mount(ApexTreeTable, { props: {
      value: [{ key: 'a', data: { name: 'A', size: 1 } }],
      columns: [{ field: 'name', header: 'Name', expander: true }, { field: 'size', header: 'Size' }],
      ui: { root: 'X-r', table: 'X-t', cell: 'X-c', label: 'X-l' } } });
    expect(w.find('.apex-tt').classes()).toContain('X-r');
    expect(w.find('.apex-dt__table').classes()).toContain('X-t');
    expect(w.find('.apex-tt__cell').classes()).toContain('X-c');
    expect(w.find('.apex-tt__label').classes()).toContain('X-l');
  });

  it('datatable, and the column filter it renders', () => {
    const w = mount(ApexDataTable, { props: {
      value: [{ id: 1, name: 'One' }, { id: 2, name: 'Two' }],
      dataKey: 'id',
      columns: [{ field: 'name', header: 'Name', sortable: true, filter: true }],
      filterDisplay: 'row',
      caption: 'Rows',
      ui: { root: 'X-r', table: 'X-t', bar: 'X-b', sort: 'X-s',
            filter: 'X-f', filterControl: 'X-fc' } } });
    expect(w.find('.apex-dt').classes()).toContain('X-r');
    expect(w.find('.apex-dt__table').classes()).toContain('X-t');
    expect(w.find('.apex-dt__bar').classes()).toContain('X-b');
    expect(w.find('.apex-dt__sort').classes()).toContain('X-s');
    /* The filter is a child component: the map has to be handed to it, the
       same way ApexOrgChart hands its map to every ApexOrgNode. */
    expect(w.find('.apex-dtf').classes()).toContain('X-f');
    /* `row` mode renders the control inline; the trigger button belongs to
       `menu` mode, so asserting it here would test the wrong branch. */
    expect(w.find('.apex-dtf__ctl').classes()).toContain('X-fc');
  });

  it('scheduler', () => {
    const w = mount(ApexScheduler, { props: {
      /* `room` is the leaf label and `roomId` the link — the scheduler's own
         vocabulary, not `name`/`resourceId`. */
      resources: [{ id: 'r1', room: 'Room 1' }],
      events: [{ id: 'e1', roomId: 'r1', type: 'event', title: 'Rehearsal',
                 start: Date.UTC(2026, 0, 5, 9), end: Date.UTC(2026, 0, 5, 11) }],
      anchor: new Date(Date.UTC(2026, 0, 5)),
      ui: { root: 'X-r', toolbar: 'X-tb', header: 'X-hd', rowHead: 'X-rh' } } });
    expect(w.find('.apex-sched').classes()).toContain('X-r');
    expect(w.find('.apex-sched__toolbar').classes()).toContain('X-tb');
    expect(w.find('.apex-sched__header').classes()).toContain('X-hd');
    expect(w.find('.apex-sched__rowhead').classes()).toContain('X-rh');
  });

  it('calendar', () => {
    const w = mount(ApexCalendar, { props: {
      view: 'month',
      events: [{ id: 'e1', title: 'Launch',
                 start: Date.UTC(2026, 0, 5, 9), end: Date.UTC(2026, 0, 5, 10) }],
      ui: { root: 'X-r', head: 'X-h', row: 'X-rw', cell: 'X-c' } } });
    expect(w.find('.apex-calendar').classes()).toContain('X-r');
    expect(w.find('.apex-calendar__head').classes()).toContain('X-h');
    expect(w.find('.apex-calendar__row').classes()).toContain('X-rw');
    expect(w.find('.apex-calendar__cell').classes()).toContain('X-c');
  });

  it('editor', async () => {
    await loadEngine();
    const w = mount(ApexEditor, {
      props: { ui: { root: 'X-r', frame: 'X-f', host: 'X-h' } },
      attachTo: document.body,
    });
    await flushPromises();
    await flushPromises();
    expect(w.find('.apex-ed').classes()).toContain('X-r');
    expect(w.find('.apex-ed__frame').classes()).toContain('X-f');
    expect(w.find('.apex-ed__host').classes()).toContain('X-h');
    w.unmount();
  });

  it('editor toolbar', () => {
    const w = mount(ApexEditorToolbar, {
      props: { items: ['strong', 'separator', 'em'], active: null,
        ui: { toolbar: 'X-bar', toolbarButton: 'X-btn', toolbarSep: 'X-sep' } },
    });
    expect(w.find('.apex-edbar').classes()).toContain('X-bar');
    expect(w.find('.apex-edbar__btn').classes()).toContain('X-btn');
    expect(w.find('.apex-edbar__sep').classes()).toContain('X-sep');
    w.unmount();
  });

  it('the slash menu binds the map it is given', async () => {
    const w = mount(ApexEditorSlash, {
      props: {
        state: { active: true, from: 1, to: 2, query: '' },
        items: DEFAULT_SLASH_ITEMS,
        coords: { x: 5, y: 5 },
        ui: { slash: 'X-s', slashItem: 'X-i', slashGroup: 'X-g' },
      },
      attachTo: document.body,
    });
    await flushPromises();
    expect(document.body.querySelector('.apex-edslash')?.classList.contains('X-s')).toBe(true);
    expect(document.body.querySelector('.apex-edslash__item')?.classList.contains('X-i')).toBe(true);
    w.unmount();
  });

  it('the editor HANDS the map to the slash menu', async () => {
    /* The ApexOrgNode case: a surface the parent renders has to be handed
       the map, and one that drops it looks right until it opens.
       The test above does NOT cover this — it mounts the menu directly with
       a `ui` of its own, so deleting `:ui="ui"` from ApexEditor left it
       green. Asserting the child's resolved prop tests the hand-down
       without needing to drive a "/" into ProseMirror. */
    await loadEngine();
    const map = { slash: 'X-s', slashItem: 'X-i' };
    const w = mount(ApexEditor, {
      props: { slashMenu: true, ui: map },
      attachTo: document.body,
    });
    await flushPromises();
    await flushPromises();
    const child = w.findComponent(ApexEditorSlash);
    expect(child.exists(), 'the editor never rendered a slash menu').toBe(true);
    expect(child.props('ui')).toEqual(map);
    w.unmount();
  });

  it('editor table tools', () => {
    const w = mount(ApexEditorTableTools, {
      props: { cell: { style: {}, selectedCells: 1 }, run: () => true,
        ui: { tableTools: 'X-t', tableToolsButton: 'X-b' } } as never,
    });
    expect(w.find('.apex-tbl-tools').classes()).toContain('X-t');
    expect(w.find('.apex-tbl-tools__btn').classes()).toContain('X-b');
    w.unmount();
  });

  it('the image dialog, which teleports', async () => {
    const w = mount(ApexEditorImage, {
      props: { openRequest: 0, ui: { image: 'X-img', imageHead: 'X-head' } } as never,
      attachTo: document.body,
    });
    await w.setProps({ openRequest: 1 } as never);
    await flushPromises();
    /* Through document.body: the dialog is teleported, so the wrapper's own
       tree is empty whether the map landed or not. */
    expect(document.body.querySelector('.apex-edimg')?.classList.contains('X-img')).toBe(true);
    expect(document.body.querySelector('.apex-edimg__head')?.classList.contains('X-head')).toBe(true);
    w.unmount();
  });

  it('html editor', async () => {
    await loadEngine();
    const w = mount(ApexHTMLEditor, {
      props: { html: '<p>x</p>', ui: { root: 'X-r', frame: 'X-f' } },
      attachTo: document.body,
    });
    await flushPromises();
    await flushPromises();
    expect(w.find('.apex-hed').classes()).toContain('X-r');
    expect(w.find('.apex-hed__frame').classes()).toContain('X-f');
    w.unmount();
  });

  it('form, in the long layout', () => {
    const w = mount(ApexForm, {
      props: {
        schema: { sections: [{ title: 'S', fields: [{ key: 'a', label: 'A', type: 'text' }] }] },
        ui: { root: 'X-r', section: 'X-s', grid: 'X-g', cell: 'X-c', foot: 'X-f' },
      } as never,
      attachTo: document.body,
    });
    expect(w.find('.apex-form').classes()).toContain('X-r');
    expect(w.find('.apex-form__section').classes()).toContain('X-s');
    expect(w.find('.apex-form__grid').classes()).toContain('X-g');
    expect(w.find('.apex-form__cell').classes()).toContain('X-c');
    expect(w.find('.apex-form__foot').classes()).toContain('X-f');
    w.unmount();
  });

  it('form, the parts only a tabbed layout draws', () => {
    const w = mount(ApexForm, {
      props: {
        layout: 'tabs',
        schema: {
          sections: [
            { title: 'One', fields: [{ key: 'a', type: 'text' }] },
            { title: 'Two', fields: [{ key: 'b', type: 'text' }] },
          ],
        },
        ui: { tabs: 'X-t', main: 'X-m' },
      } as never,
      attachTo: document.body,
    });
    expect(w.find('.apex-form__tabs').classes()).toContain('X-t');
    /* `main` is the container query's container, so a host restyling it is
       the most likely reason to reach for this map at all. */
    expect(w.find('.apex-form__main').classes()).toContain('X-m');
    w.unmount();
  });

  it('form, the one part whose binding had to be MERGED', () => {
    /* `.apex-form__pass` is the only element in ApexForm that already
       carried a `:class`, so the map had to join its array rather than add a
       second attribute — a second one is a duplicate-attribute SyntaxError,
       which is how AF2-253 broke seven files. Nothing else covered this
       key, and dropping the map half of the array left the suite green. */
    const w = mount(ApexForm, {
      props: {
        schema: { sections: [{ title: 'S', fields: [{ key: 'a', type: 'text' }] }] },
        ui: { fieldsetPass: 'X-pass' },
      } as never,
      attachTo: document.body,
    });
    expect(w.find('.apex-form__pass').classes()).toContain('X-pass');
    w.unmount();
  });

  it('form, the validating note — a part only a Precognition form ever draws', () => {
    /* It needs a host form that reports `validating`, so no other case in
       this file can reach it and the key would sit declared but unbound. */
    const w = mount(ApexForm, {
      props: {
        schema: { sections: [{ fields: [{ key: 'a', label: 'A', type: 'text' }] }] },
        form: { data: { a: '' }, errors: {}, processing: false, post() {}, validating: true, validate() {} },
        ui: { validating: 'X-v' },
      } as never,
      attachTo: document.body,
    });
    expect(w.find('.apex-form__validating').classes()).toContain('X-v');
    w.unmount();
  });

  it('form, the read-only parts', () => {
    const w = mount(ApexForm, {
      props: {
        readonly: true,
        modelValue: { a: 'Standard' },
        schema: { sections: [{ fields: [{ key: 'a', label: 'A', type: 'text' }] }] },
        ui: { readonly: 'X-ro', readonlyLabel: 'X-rl', readonlyValue: 'X-rv' },
      } as never,
      attachTo: document.body,
    });
    expect(w.find('.apex-form__ro').classes()).toContain('X-ro');
    expect(w.find('.apex-form__rovalue').classes()).toContain('X-rv');
    w.unmount();
  });
});
