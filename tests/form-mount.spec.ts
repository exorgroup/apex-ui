import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexForm from '../src/components/ApexForm.vue';

/**
 * ApexForm renders a schema, and the behaviour its design record promises
 * survives contact with a real mount.
 *
 * §11.5 again: `core/form.ts` typechecked clean and passed 23 tests without
 * a single component existing. What a mount adds is everything the engine
 * cannot answer — whether the three layouts draw, whether a conditional
 * field actually disappears from the DOM, whether read-only renders TEXT
 * rather than a disabled control, and whether the tab pattern carries the
 * roles the design says it does.
 */

const SCHEMA = {
  title: 'Plan',
  sections: [
    {
      id: 'basics',
      title: 'Basics',
      columns: 2,
      fields: [
        { key: 'name', label: 'Name', type: 'text', rules: 'required' },
        { key: 'custom', label: 'Custom pricing', type: 'switch' },
        { key: 'price', label: 'Monthly price', type: 'number', rules: 'required', hiddenIf: { custom: true } },
        { key: 'contact', label: 'Sales contact', type: 'text', rules: 'required', hiddenIf: { custom: false } },
      ],
    },
    {
      id: 'owner',
      title: 'Owner',
      fields: [{ key: 'owner', label: 'Plan owner', type: 'text', rules: 'required' }],
    },
  ],
};

async function form(props: Record<string, unknown> = {}) {
  const w = mount(ApexForm, {
    props: { schema: SCHEMA, ...props },
    attachTo: document.body,
  });
  await flushPromises();
  return w;
}

describe('ApexForm mounts', () => {
  it('renders its root and both sections in the long layout', async () => {
    const w = await form();
    expect(w.find('.apex-form').exists()).toBe(true);
    expect(w.findAll('.apex-form__section').length).toBe(2);
    w.unmount();
  });

  it('renders a control per visible field', async () => {
    const w = await form({ modelValue: { custom: false } });
    expect(w.text()).toContain('Name');
    expect(w.text()).toContain('Monthly price');
    w.unmount();
  });

  it('a hidden field is absent from the DOM, not merely disabled', async () => {
    /* The whole point of the conditional: a field the author cannot see must
       not be rendered, or the summary can name something off-screen. */
    const off = await form({ modelValue: { custom: false } });
    expect(off.text()).toContain('Monthly price');
    expect(off.text()).not.toContain('Sales contact');
    off.unmount();

    const on = await form({ modelValue: { custom: true } });
    expect(on.text()).toContain('Sales contact');
    expect(on.text()).not.toContain('Monthly price');
    on.unmount();
  });

  it('unmounts without throwing', async () => {
    const w = await form();
    expect(() => w.unmount()).not.toThrow();
  });
});

describe('the three layouts', () => {
  it('long renders no tab or panel roles at all', async () => {
    const w = await form();
    expect(w.find('[role="tablist"]').exists()).toBe(false);
    expect(w.find('[role="tabpanel"]').exists()).toBe(false);
    w.unmount();
  });

  it('tabs renders one tab per section and one panel', async () => {
    const w = await form({ layout: 'tabs' });
    const tabs = w.findAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    /* Only the active panel is rendered — mounting every section would
       re-run every control and let focusFirstError land off-screen. */
    expect(w.findAll('[role="tabpanel"]').length).toBe(1);
    expect(w.find('[role="tablist"]').attributes('aria-orientation')).toBe('horizontal');
    w.unmount();
  });

  it('sidebar is the same section list, vertically', async () => {
    const w = await form({ layout: 'sidebar' });
    expect(w.findAll('[role="tab"]').length).toBe(2);
    expect(w.find('[role="tablist"]').attributes('aria-orientation')).toBe('vertical');
    w.unmount();
  });

  it('the selected tab points at the panel, and the others point at nothing', async () => {
    /* Only the selected tab carries aria-controls: the other panels are not
       rendered, so emitting it on all of them would leave dangling IDREFs —
       the defect this project has already recorded as real for ApexListbox. */
    const w = await form({ layout: 'tabs' });
    const tabs = w.findAll('[role="tab"]');
    const selected = tabs.find((t) => t.attributes('aria-selected') === 'true');
    expect(selected!.attributes('aria-controls')).toBeTruthy();
    const others = tabs.filter((t) => t.attributes('aria-selected') !== 'true');
    others.forEach((t) => expect(t.attributes('aria-controls')).toBeUndefined());

    const panel = w.find('[role="tabpanel"]');
    expect(panel.attributes('aria-labelledby')).toBe(selected!.attributes('id'));
    w.unmount();
  });

  it('a roving tabindex, or the other sections have no keyboard route', async () => {
    const w = await form({ layout: 'tabs' });
    const tabs = w.findAll('[role="tab"]');
    expect(tabs[0].attributes('tabindex')).toBe('0');
    expect(tabs[1].attributes('tabindex')).toBe('-1');
    w.unmount();
  });
});

describe('read-only is text, not a disabled control', () => {
  it('renders no inputs at all', async () => {
    /* A greyed-out input reads as something the author failed to fill in.
       Same schema, so a detail page and an edit page are one definition. */
    const w = await form({ readonly: true, modelValue: { name: 'Standard', custom: false, price: 9 } });
    expect(w.findAll('input, textarea, select').length).toBe(0);
    expect(w.text()).toContain('Standard');
    w.unmount();
  });
});

describe('a field can be read-only WITHOUT becoming text', () => {
  /* AF2-313. A screen that wants its view dialog to look like its edit
     dialog reached for `disabled` on every field, because that was the only
     per-field switch the type declared. The result is a whole form in the
     muted palette, which nobody can read — disabled means "you may not
     touch this", not "this is the record".

     `field.readonly` was already wired to the control and simply undeclared,
     so it was unreachable to anyone reading the type. */
  const one = (patch: Record<string, unknown>) => ({
    sections: [{ fields: [{ key: 'name', label: 'Name', type: 'text', ...patch }] }],
  });

  async function only(patch: Record<string, unknown>) {
    const w = mount(ApexForm, {
      props: { schema: one(patch), modelValue: { name: 'Standard' } },
      attachTo: document.body,
    });
    await flushPromises();
    return w;
  }

  it('still renders a real control, carrying the value', async () => {
    const w = await only({ readonly: true });
    const input = w.find('input');
    expect(input.exists(), 'a read-only FIELD became text — that is the form-level prop').toBe(true);
    expect((input.element as HTMLInputElement).value).toBe('Standard');
    w.unmount();
  });

  it('is read-only and NOT disabled, which is the whole point', async () => {
    const w = await only({ readonly: true });
    const el = w.find('input').element as HTMLInputElement;
    expect(el.readOnly).toBe(true);
    /* The legibility claim. Disabled draws in the muted palette; a view
       dialog rendered that way is unreadable, which is how this was found. */
    expect(el.disabled, 'read-only must not grey the control out').toBe(false);
    w.unmount();
  });

  it('and `disabled` still disables, so the two remain different things', async () => {
    const w = await only({ disabled: true });
    const el = w.find('input').element as HTMLInputElement;
    expect(el.disabled).toBe(true);
    w.unmount();
  });

  it('readonlyText renders that one field as text, inside an editable form', async () => {
    const w = mount(ApexForm, {
      props: {
        schema: {
          sections: [{
            fields: [
              { key: 'id', label: 'Reference', type: 'text', readonlyText: true },
              { key: 'name', label: 'Name', type: 'text' },
            ],
          }],
        },
        modelValue: { id: 'CAT-7', name: 'Standard' },
      },
      attachTo: document.body,
    });
    await flushPromises();

    expect(w.text()).toContain('CAT-7');
    /* One control, not two: the reference is text and the name is not. */
    expect(w.findAll('input').length).toBe(1);
    w.unmount();
  });
});

describe('it never submits', () => {
  it('emits the values and leaves the verb to the host', async () => {
    const w = await form({ modelValue: { name: 'Standard', custom: false, price: 9, owner: 'Ada' } });
    const btn = w.findAll('button').find((b) => /save|submit/i.test(b.text()));
    expect(btn, 'no submit action rendered').toBeTruthy();
    await btn!.trigger('click');
    await flushPromises();

    expect(w.emitted('submit'), 'a clean form did not emit submit').toBeTruthy();
    expect(w.find('form').exists(), 'a real <form> element would let the browser navigate').toBe(false);
    w.unmount();
  });

  it('a failing form reports instead, and does not emit submit', async () => {
    const w = await form({ modelValue: { custom: false } });
    const btn = w.findAll('button').find((b) => /save|submit/i.test(b.text()));
    await btn!.trigger('click');
    await flushPromises();

    expect(w.emitted('submit')).toBeFalsy();
    /* The summary appears only after a failed submit — the entire
       post-submit story for a host with no per-field server validation. */
    expect(w.text()).toMatch(/required/i);
    w.unmount();
  });
});

describe('closing and reopening is a new editing session', () => {
  /* Found on the first screen migrated to ApexForm (AF2-306): the modal's
     panel unmounts when it closes, the COMPONENT does not, and every piece
     of session state survived. A blank Add dialog showed the previous
     record's errors and said "Unsaved changes". */
  const modal = () => mount(ApexForm, {
    props: { schema: { ...SCHEMA, shell: 'modal' }, open: true, modelValue: { custom: false } },
    attachTo: document.body,
  });

  async function failASubmit(w: ReturnType<typeof modal>) {
    const btn = w.findAll('button').find((b) => /save|submit/i.test(b.text()));
    await btn!.trigger('click');
    await flushPromises();
    expect(w.text(), 'the fixture was supposed to fail validation').toMatch(/required/i);
  }

  it('reopening clears the errors from last time', async () => {
    const w = modal();
    await flushPromises();
    await failASubmit(w);

    await w.setProps({ open: false });
    await flushPromises();
    await w.setProps({ open: true });
    await flushPromises();

    expect(w.text()).not.toMatch(/required/i);
    w.unmount();
  });

  it('reopening clears the dirty flag', async () => {
    const w = modal();
    await flushPromises();
    await w.findAll('input')[0].setValue('Something');
    await flushPromises();
    expect(w.find('.apex-form__dirty').exists()).toBe(true);

    await w.setProps({ open: false });
    await flushPromises();
    await w.setProps({ open: true });
    await flushPromises();

    expect(w.find('.apex-form__dirty').exists(), 'a freshly opened form claimed unsaved changes').toBe(false);
    w.unmount();
  });

  it('pointing it at a different host form resets it, without closing', async () => {
    /* A master/detail screen switching rows never closes the dialog. */
    const first = { name: '', errors: {}, processing: false, data() { return {}; }, post() {} };
    const w = mount(ApexForm, {
      props: { schema: { ...SCHEMA, shell: 'modal' }, open: true, form: first },
      attachTo: document.body,
    });
    await flushPromises();
    await failASubmit(w);

    await w.setProps({ form: { ...first } });
    await flushPromises();

    expect(w.text()).not.toMatch(/required/i);
    w.unmount();
  });

  it('and a host can ask for it explicitly', async () => {
    const w = modal();
    await flushPromises();
    await failASubmit(w);

    (w.vm as unknown as { reset: () => void }).reset();
    await flushPromises();

    expect(w.text()).not.toMatch(/required/i);
    w.unmount();
  });
});

describe('a section rendered as a fieldset', () => {
  /**
   * AF2-374. `fieldset: true` hands the section's title to ApexFieldset as
   * its legend, which skips the section head above — and the SUBTITLE went
   * with it. On the screen that found this, the subtitle was the only place
   * saying that a blank gateway fee means "inherit" rather than "zero", so
   * turning the section into a fieldset silently deleted the explanation.
   */
  const withFieldset = (fieldset: boolean) => mount(ApexForm, {
    props: {
      schema: {
        sections: [{
          title: 'Gateway fee override',
          subtitle: 'Leave blank to inherit the system default.',
          fieldset,
          columns: 2,
          fields: [{ key: 'pct', label: 'Gateway fee %', type: 'number' }],
        }],
      },
    } as never,
    attachTo: document.body,
  });

  it('keeps the subtitle the section head would have shown', async () => {
    const w = withFieldset(true);
    await flushPromises();

    expect(w.find('.apex-fieldset legend, .apex-fs__legend, legend').text()).toContain('Gateway fee override');
    expect(w.text(), 'the explanation vanished with the section head').toContain(
      'Leave blank to inherit the system default.',
    );
    w.unmount();
  });

  it('and says it once, not twice', async () => {
    /* The head must still be suppressed — a legend plus a heading of the
       same words reads as a rendering fault. */
    const w = withFieldset(true);
    await flushPromises();

    expect(w.findAll('.apex-form__sectionhead h3').length).toBe(0);
    expect(w.text().match(/Gateway fee override/g)?.length).toBe(1);
    w.unmount();
  });

  it('while an ordinary section still uses its head', async () => {
    const w = withFieldset(false);
    await flushPromises();

    expect(w.find('.apex-form__sectionhead h3').text()).toContain('Gateway fee override');
    expect(w.text()).toContain('Leave blank to inherit the system default.');
    w.unmount();
  });
});

describe('a section subtitle in every layout', () => {
  /**
   * AF2-374. The section head renders only in the long layout, because tabs
   * and sidebar name the section in their nav — but the subtitle went with
   * the heading, so switching a form to tabs silently deleted its section
   * descriptions. The heading is a repeat of the tab; the subtitle is not.
   */
  const inLayout = (layout: string) => mount(ApexForm, {
    props: {
      layout,
      schema: {
        sections: [
          { title: 'Entity details', subtitle: 'Who they are.', columns: 2, fields: [{ key: 'a', label: 'A', type: 'text' }] },
          { title: 'Gateway fee override', subtitle: 'Leave blank to inherit.', columns: 2, fields: [{ key: 'b', label: 'B', type: 'text' }] },
        ],
      },
    } as never,
    attachTo: document.body,
  });

  it('shows on the visible pane of a sidebar form', async () => {
    const w = inLayout('sidebar');
    await flushPromises();

    expect(w.text(), 'the section description vanished with the heading').toContain('Who they are.');
    w.unmount();
  });

  it('and the pane does not repeat its own nav item', async () => {
    const w = inLayout('sidebar');
    await flushPromises();

    /* The nav names it once; a heading inside the pane would be twice. */
    expect(w.findAll('.apex-form__sectionhead h3').length).toBe(0);
    w.unmount();
  });

  it('while the long layout still shows heading and subtitle together', async () => {
    const w = inLayout('long');
    await flushPromises();

    expect(w.find('.apex-form__sectionhead h3').text()).toContain('Entity details');
    expect(w.text()).toContain('Who they are.');
    w.unmount();
  });
});

describe('a class on one section', () => {
  /**
   * AF2-374. The `ui` map is form-wide — `ui.cell` is every cell in the
   * form — so a screen that wants one pane styled differently had nothing
   * to say it with short of an id selector on a generated id.
   */
  const w = () => mount(ApexForm, {
    props: {
      schema: {
        sections: [
          { title: 'Entity details', columns: 2, fields: [{ key: 'a', label: 'A', type: 'text' }] },
          { title: 'Gateway fee override', class: 'fee-pane', columns: 1, fields: [{ key: 'b', label: 'B', type: 'number' }] },
        ],
      },
    } as never,
    attachTo: document.body,
  });

  it('lands on that section and no other', async () => {
    const view = w();
    await flushPromises();

    const sections = view.findAll('.apex-form__section');
    expect(sections.length).toBe(2);
    expect(sections[0].classes()).not.toContain('fee-pane');
    expect(sections[1].classes(), 'the section class never reached the element').toContain('fee-pane');
    view.unmount();
  });
});
