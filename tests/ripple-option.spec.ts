import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ApexUI from '../src/index';
import ApexForm from '../src/components/ApexForm.vue';
import ApexAlert from '../src/components/ApexAlert.vue';
import ApexDataTable from '../src/components/ApexDataTable.vue';
import { useApexAlert, __alertSettle } from '../src/core/alert';

/**
 * The buttons the kit renders for itself can ripple too — AF2-324.
 *
 * An app that writes `v-apex-ripple` on its own buttons ends up with one
 * dialog whose Save is the only unrippled control on the screen, because
 * ApexForm and ApexAlert draw their own footers. So both take a `ripple`
 * prop, and the plugin takes a `ripple` option for the whole app.
 *
 * Three-way resolution, and the ORDER is the thing worth pinning: the prop
 * wins, then the plugin option, then OFF. Off matters most — a library that
 * started rippling on upgrade would be changing every existing consumer's
 * screens without being asked.
 *
 * The ripple itself is a pointer effect and happy-dom does no layout, so
 * what is assertable is whether the directive was given a live or a dead
 * binding. `v-apex-ripple="false"` is the documented way to switch it off,
 * and the directive stores no state for a disabled element — so "did it
 * bind" is read from whether a press produces an ink layer.
 */

const SCHEMA = {
  title: 'Plan',
  sections: [{ fields: [{ key: 'name', label: 'Name', type: 'text' }] }],
};

/** Press it the way a pointer would, and see whether ink appeared. */
async function ripples(button: Element): Promise<boolean> {
  button.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, clientX: 5, clientY: 5,
  }));
  await Promise.resolve();
  return !!button.querySelector('.apex-ripple__layer, .apex-ripple__ink');
}

function form(props: Record<string, unknown> = {}, plugin: Record<string, unknown> = {}) {
  return mount(ApexForm, {
    props: { schema: SCHEMA, ...props },
    global: { plugins: [[ApexUI, plugin]] },
    attachTo: document.body,
  });
}

/** The submit button ApexForm draws for itself. */
const saveIn = (w: ReturnType<typeof form>) =>
  w.findAll('button').find((b) => /save|submit/i.test(b.text()))!.element;

afterEach(() => { document.body.innerHTML = ''; });

describe('ApexForm', () => {
  it('does not ripple by default', async () => {
    /* The upgrade-safety claim. If this ever flips, every app using the kit
       gains an effect it never asked for. */
    const w = form();
    expect(await ripples(saveIn(w))).toBe(false);
    w.unmount();
  });

  it('ripples when the app turns it on for everything', async () => {
    const w = form({}, { ripple: true });
    expect(await ripples(saveIn(w))).toBe(true);
    w.unmount();
  });

  it('ripples when this one form asks', async () => {
    const w = form({ ripple: true });
    expect(await ripples(saveIn(w))).toBe(true);
    w.unmount();
  });

  it('and the prop can say NO to an app-wide yes', async () => {
    /* The half of the override that a truthy-only check would miss:
       `props.ripple ?? option` is right, `props.ripple || option` is not. */
    const w = form({ ripple: false }, { ripple: true });
    expect(await ripples(saveIn(w)), 'the prop could not switch it off').toBe(false);
    w.unmount();
  });
});

describe('ApexAlert', () => {
  const alert = useApexAlert();

  async function open(props: Record<string, unknown> = {}, plugin: Record<string, unknown> = {}) {
    const w = mount(ApexAlert, {
      props, global: { plugins: [[ApexUI, plugin]] }, attachTo: document.body,
    });
    const done = alert.confirm({ title: 'Delete?', confirmText: 'Delete' });
    await w.vm.$nextTick();
    const button = [...document.querySelectorAll('.apex-alert-actions button')]
      .find((b) => /delete/i.test(b.textContent || ''))!;
    return { w, done, button };
  }

  async function shut(w: { unmount: () => void }, done: Promise<unknown>) {
    __alertSettle('cancel');
    await done;
    w.unmount();
  }

  it('does not ripple by default', async () => {
    const { w, done, button } = await open();
    expect(await ripples(button)).toBe(false);
    await shut(w, done);
  });

  it('ripples on the app-wide option', async () => {
    const { w, done, button } = await open({}, { ripple: true });
    expect(await ripples(button)).toBe(true);
    await shut(w, done);
  });

  it('and the host prop wins over it', async () => {
    const { w, done, button } = await open({ ripple: false }, { ripple: true });
    expect(await ripples(button)).toBe(false);
    await shut(w, done);
  });

  it('and ONE call can override the host, like every other option here', async () => {
    /* The component's own rule: "props are the app-wide fallbacks; a
       per-call option always wins". The docs guard is what caught `ripple`
       breaking it — it was a host prop only, while every row in the same
       table is an AlertOptions field. */
    const w = mount(ApexAlert, { props: { ripple: false }, attachTo: document.body });
    const done = alert.confirm({ title: 'Delete?', confirmText: 'Delete', ripple: true });
    await w.vm.$nextTick();
    const button = [...document.querySelectorAll('.apex-alert-actions button')]
      .find((b) => /delete/i.test(b.textContent || ''))!;

    expect(await ripples(button), 'the per-call option lost to the prop').toBe(true);
    await shut(w, done);
  });
});

describe('the directive is imported, not assumed', () => {
  it('a form mounted WITHOUT the plugin still renders and still ripples', async () => {
    /* These components can be imported directly. Relying on the plugin
       having registered `v-apex-ripple` would give a runtime warning and a
       button that does nothing. */
    const w = mount(ApexForm, {
      props: { schema: SCHEMA, ripple: true },
      attachTo: document.body,
    });
    const save = w.findAll('button').find((b) => /save|submit/i.test(b.text()))!.element;
    expect(await ripples(save)).toBe(true);
    w.unmount();
  });
});

describe('a DataTable row can ripple too', () => {
  /* AF2-325/326. The first cut put `v-apex-ripple` on the <tr>, which
     appends the directive's layer as a child of the row — and a <span> is
     NOT a legal child of <tr>. It passed here (happy-dom does no layout and
     no table fixup) and drew nothing in a real browser. The cells host it
     now, each sized to the ROW so the slices form one wave. */
  const ROWS = [{ id: 1, name: 'Concerts' }, { id: 2, name: 'Festivals' }];
  const COLUMNS = [{ field: 'name', header: 'Name' }, { field: 'id', header: 'Id' }];

  const table = (props: Record<string, unknown> = {}) =>
    mount(ApexDataTable, {
      props: { value: ROWS, columns: COLUMNS, dataKey: 'id', ...props },
      attachTo: document.body,
    });

  /** Press the row itself, as a pointer would. */
  const pressRow = (row: Element) => row.dispatchEvent(new PointerEvent('pointerdown', {
    bubbles: true, clientX: 120, clientY: 40,
  }));

  const inkedCells = (row: Element) =>
    [...row.children].filter((c) => c.querySelector('.apex-ripple__ink')).length;

  it('does not by default, not even with the app-wide option on', async () => {
    /* Deliberately NOT wired to the plugin's `ripple`: that option is about
       the buttons the kit draws for itself, and a rippling row is a far
       larger visual statement. Opting into one must not give you the other. */
    const w = mount(ApexDataTable, {
      props: { value: ROWS, columns: COLUMNS, dataKey: 'id' },
      global: { plugins: [[ApexUI, { ripple: true }]] },
      attachTo: document.body,
    });
    const row = w.find('tbody tr').element;
    pressRow(row);
    expect(inkedCells(row)).toBe(0);
    w.unmount();
  });

  it('inks EVERY cell from one press, which is what makes it read as a row', async () => {
    /* One cell inking is a blob, not a row ripple. */
    const w = table({ rowRipple: true });
    const row = w.find('tbody tr').element;
    pressRow(row);
    expect(inkedCells(row), 'the wave did not cross the whole row').toBe(row.children.length);
    w.unmount();
  });

  it('hosts the layer in the CELLS, never as a child of the row', async () => {
    /* The structural claim. A span child of <tr> is invalid HTML and a
       browser may wrap it in an anonymous cell or drop it — which is
       exactly how the first version came to draw nothing. */
    const w = table({ rowRipple: true });
    const row = w.find('tbody tr').element;
    pressRow(row);

    const strays = [...row.children].filter((c) => c.classList.contains('apex-ripple__layer'));
    expect(strays.length, 'the layer is a direct child of <tr> again').toBe(0);
    expect(row.querySelectorAll('td > .apex-ripple__layer').length).toBe(row.children.length);
    w.unmount();
  });

  it('flags the table so the cells can be containing blocks', async () => {
    /* The layer is absolute; without `position: relative` on the cell it
       would resolve against something further up and land anywhere. */
    const on = table({ rowRipple: true });
    expect(on.find('.apex-dt').attributes('data-row-ripple')).toBe('true');
    on.unmount();

    const off = table();
    expect(off.find('.apex-dt').attributes('data-row-ripple')).toBe('false');
    off.unmount();
  });

  it('gives a big wave longer to cross, or it is invisible', async () => {
    /* AF2-327, and this is what was actually broken. The effect fired
       correctly the whole time; it could not be SEEN. The kit's --ease-out
       is cubic-bezier(.22,1,.36,1) — ~90% done in the first third — and a
       row's wave is over 2000px across, so it covered everything and faded
       to 0.03 opacity within 220ms. Measured in a real browser, because
       happy-dom has no layout and no compositor: nothing here could have
       caught it. What IS checkable is the arithmetic that fixes it. */
    const ORIGINAL = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      const wide = (this as HTMLElement).tagName === 'TR';
      const width = wide ? 1200 : 400;
      return { width, height: 40, top: 0, left: 0, right: width, bottom: 40,
               x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };

    const w = table({ rowRipple: true });
    const row = w.find('tbody tr').element;
    pressRow(row);

    const ink = row.querySelector('.apex-ripple__ink') as HTMLElement;
    const ms = parseFloat(ink.style.getPropertyValue('--rp-dur'));
    expect(ms, 'a row-wide wave still runs at the small-control speed').toBeGreaterThan(600);
    expect(ms, 'and is capped, so a very wide surface does not linger').toBeLessThanOrEqual(1200);

    Element.prototype.getBoundingClientRect = ORIGINAL;
    w.unmount();
  });

  it('but a small control keeps the 600ms it always had', async () => {
    /* The rule only ever LENGTHENS. If it could shorten, every existing
       button in every consuming app would change speed on upgrade. */
    const ORIGINAL = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      return { width: 90, height: 34, top: 0, left: 0, right: 90, bottom: 34,
               x: 0, y: 0, toJSON: () => ({}) } as DOMRect;
    };

    const w = form({ ripple: true });
    const save = saveIn(w);
    await ripples(save);
    const ink = save.querySelector('.apex-ripple__ink') as HTMLElement;
    expect(parseFloat(ink.style.getPropertyValue('--rp-dur'))).toBe(600);

    Element.prototype.getBoundingClientRect = ORIGINAL;
    w.unmount();
  });

  it('sizes every slice to the ROW, so they belong to one circle', async () => {
    /* Each cell clips its own part of the wave. If each sized its wave to
       ITSELF the row would light up as a line of little circles instead of
       one spreading front — so every ink in the row must share a radius. */
    const ORIGINAL = Element.prototype.getBoundingClientRect;
    let left = 0;
    Element.prototype.getBoundingClientRect = function () {
      const tag = (this as HTMLElement).tagName;
      const width = tag === 'TR' ? 400 : 200;
      const x = tag === 'TR' ? 0 : (left += 0); // cells share the stub; width is what matters
      return { width, height: 40, top: 0, left: x, right: x + width, bottom: 40,
               x, y: 0, toJSON: () => ({}) } as DOMRect;
    };

    const w = table({ rowRipple: true });
    const row = w.find('tbody tr').element;
    pressRow(row);

    const sizes = [...row.querySelectorAll('.apex-ripple__ink')]
      .map((i) => (i as HTMLElement).style.inlineSize);
    expect(sizes.length).toBeGreaterThan(1);
    expect(new Set(sizes).size, 'the cells drew different-sized waves').toBe(1);
    /* And sized to the 400px row, not the 200px cell. */
    expect(parseFloat(sizes[0])).toBeGreaterThan(400);

    Element.prototype.getBoundingClientRect = ORIGINAL;
    w.unmount();
  });
});
