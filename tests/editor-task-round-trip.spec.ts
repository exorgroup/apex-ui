import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ApexEditor from '../src/components/ApexEditor.vue';
import { loadEngine } from '../src/core/editor/engine';

/**
 * A task list survives being saved and reopened — N/046.
 *
 * Found while looking at why a tick list rendered as plain text on the
 * public site: the markup in the database had no `data-task-list` on it
 * at all, though the editor had written one there.
 *
 * The editor WROTE task lists it could not READ. ProseMirror's parser
 * takes the rules in schema order, and `bullet_list`'s plain `ul` is
 * declared before `task_list`'s `ul[data-task-list]`, so it claimed the
 * element first; the same for `li` against `li[data-checked]`. Opening a
 * document and saving it demoted every task list in it to a bullet list,
 * and took the ticks with it.
 *
 * `priority: 60` on the two task rules — the parser's own way of saying
 * "try the specific one first". The same class of defect as the empty
 * paragraph at N/040: a round trip nobody had measured.
 */

async function editorWith(html: string) {
  await loadEngine();
  const w = mount(ApexEditor, { props: { taskList: true }, attachTo: document.body });
  await flushPromises();
  await flushPromises();

  (w.vm as never as { setHtml: (h: string) => void }).setHtml(html);
  await flushPromises();

  return w;
}

const api = (w: { vm: unknown }) => w.vm as { toHtml: () => string; run: (n: string) => boolean };

describe('a stored task list', () => {
  it('comes back a task list, not a bullet list', async () => {
    const w = await editorWith('<ul data-task-list><li data-checked="false"><p>tick 1</p></li></ul>');

    expect(api(w).toHtml()).toContain('data-task-list');

    w.unmount();
  });

  it('remembers which items were ticked', async () => {
    const w = await editorWith(
      '<ul data-task-list><li data-checked="false"><p>one</p></li><li data-checked="true"><p>two</p></li></ul>',
    );
    const out = api(w).toHtml();

    expect(out).toContain('data-checked="false"');
    expect(out).toContain('data-checked="true"');
    /* In that order: a list that comes back with the ticks moved is no
       better than one that loses them. */
    expect(out.indexOf('data-checked="false"')).toBeLessThan(out.indexOf('data-checked="true"'));

    w.unmount();
  });

  it('survives a second round trip, as reopening a post twice does', async () => {
    const w = await editorWith('<ul data-task-list><li data-checked="true"><p>done</p></li></ul>');
    const once = api(w).toHtml();

    (w.vm as never as { setHtml: (h: string) => void }).setHtml(once);
    await flushPromises();

    expect(api(w).toHtml()).toBe(once);

    w.unmount();
  });
});

describe('the lists it must not swallow', () => {
  it('leaves a plain bullet list plain', async () => {
    /* The other half of a priority change: the specific rule must not
       start claiming the general case. */
    const w = await editorWith('<ul><li><p>Item A</p></li><li><p>Item B</p></li></ul>');
    const out = api(w).toHtml();

    expect(out).not.toContain('data-task-list');
    expect(out).not.toContain('data-checked');
    expect(out).toContain('<li><p>Item A</p></li>');

    w.unmount();
  });

  it('and a numbered list numbered, from the start it was given', async () => {
    const w = await editorWith('<ol start="5"><li><p>five</p></li></ol>');
    const out = api(w).toHtml();

    expect(out).toContain('start="5"');
    expect(out).not.toContain('data-task-list');

    w.unmount();
  });
});

describe('the command that makes one', () => {
  it('still writes the markup the parser now reads', async () => {
    /* The two halves have to agree: this is the case that was passing
       on its own while the pair was broken. */
    const w = await editorWith('<p>x</p>');

    expect(api(w).run('task_list')).toBe(true);
    await flushPromises();

    const out = api(w).toHtml();
    expect(out).toContain('data-task-list');
    expect(out).toContain('data-checked="false"');

    w.unmount();
  });
});
