import { createApp, h, ref } from 'vue';
import { ApexUI, ApexEditor, ApexEditorToolbar, ApexEditorTableGrid, ApexEditorLink,
  ApexEditorObjectBar, ApexEditorTableTools, ApexEditorImageTools } from '../dist/apex-ui.js';
import '../dist/apex-ui.css';

const editor = ref(null);
const PICTURE = 'data:image/svg+xml;base64,' + btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e11"/></svg>');

createApp({
  render: () => h(ApexEditor, {
    ref: editor, media: true, tables: true, minHeight: '18rem',
    onReady: () => {
      editor.value.setHtml(
        /* The figure LAST, with nothing after it: the reported case,
           where there is nowhere for the caret to go. */
        `<p>before</p><figure><img src="${PICTURE}" alt="a"><figcaption>cap</figcaption></figure>`);
      window.__ready = true;
    },
  }, {
    /* The same bar the application mounts, so what is measured here is
       what an author sees there. */
    toolbar: (slot) => h(ApexEditorToolbar, {
      active: slot.active, can: slot.can, run: slot.run,
      preset: 'standard', exclude: ['code', 'source_code'],
    }, {
      link: (s) => h(ApexEditorLink, {
        active: s.active, href: slot.link?.href, target: slot.link?.target,
        onApply: (v) => slot.setLink(v), onRemove: () => slot.unsetLink(),
      }),
      table: () => h(ApexEditorTableGrid, { insert: slot.insertTable }),
    }),
    /* The same object bar the application mounts. */
    overlay: (ov) => (ov.object ? h(ApexEditorObjectBar, {
      rect: ov.object.rect, measure: ov.measure, kind: ov.object.kind,
    }, () => (ov.object.kind === 'table'
      ? h(ApexEditorTableTools, { cell: ov.cell, run: ov.run, can: ov.can, setCellStyle: ov.setCellStyle })
      : h(ApexEditorImageTools, { run: ov.run, can: ov.can }))) : null),
  }),
}).use(ApexUI, {}).mount('#app');

/* Read from the LIVE document: a wrong answer here is a wrong answer in
   the application. */
window.__probe = () => {
  const figure = document.querySelector('.apex-ed__host figure');
  const handle = figure && figure.querySelector('.apex-ed__img-handle');
  const style = handle ? getComputedStyle(handle) : null;
  const box = handle ? handle.getBoundingClientRect() : null;

  return {
    figure: !!figure,
    figureTag: figure ? figure.outerHTML.slice(0, 160) : null,
    handleCount: figure ? figure.querySelectorAll('.apex-ed__img-handle').length : 0,
    selected: figure ? figure.getAttribute('data-selected') : null,
    opacity: style ? style.opacity : null,
    display: style ? style.display : null,
    at: box ? { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width) } : null,
  };
};

window.__imgBox = () => {
  const r = document.querySelector('.apex-ed__host figure img').getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
};

window.__html = () => editor.value.toHtml();

/* Put the caret in the caption the way a click would, for a probe that
   cannot rely on hitting a broken image's caption by coordinates. */
window.__caretInCaption = async () => {
  const PM = await import('prosemirror-state');
  const view = editor.value.getView();
  const pos = view.state.doc.resolve(view.state.doc.content.size - 1);
  view.dispatch(view.state.tr.setSelection(PM.TextSelection.create(view.state.doc, pos.pos)));
  view.focus();
  return view.state.selection.$head.parent.type.name;
};

/* A document a move can be SEEN in: text, picture, text. */
window.__setHtml = () => editor.value.setHtml(
  `<p>first</p><figure><img src="${PICTURE}" alt="a"><figcaption></figcaption></figure><p>last</p>`);

/* A half-width picture, aligned, so an auto margin has room to work. */
window.__setAligned = (align) => editor.value.setHtml(
  `<p>first</p><figure data-width="50%" data-align="${align}"><img src="${PICTURE}" alt="a"><figcaption></figcaption></figure>`);

/* A table with a picture in the first cell: the reported case. */
window.__setTable = () => editor.value.setHtml(
  `<p>before</p><table><tbody><tr><td><figure><img src="${PICTURE}" alt="a"><figcaption></figcaption></figure></td><td>b</td></tr></tbody></table>`);

/* Parse a clipboard fragment with the editor's OWN schema, to tell a
   broken schema from a broken view. */
window.__parseProbe = async (html) => {
  const { DOMParser } = await import('prosemirror-model');
  const view = editor.value.getView();
  const div = document.createElement('div');
  div.innerHTML = html;
  const parser = DOMParser.fromSchema(view.state.schema);
  const slice = parser.parseSlice(div);
  return { size: slice.content.size, json: JSON.stringify(slice.content.toJSON()).slice(0, 200) };
};

window.__propProbe = () => {
  const view = editor.value.getView();
  const has = (name) => !!view.someProp(name, () => true);
  return {
    transformPastedHTML: has('transformPastedHTML'),
    handlePaste: has('handlePaste'),
    clipboardParser: has('clipboardParser'),
    clipboardTextParser: has('clipboardTextParser'),
    transformPasted: has('transformPasted'),
    editable: view.editable,
  };
};

/* Record every prop ProseMirror asks the view for, so a paste can be
   followed branch by branch. */
window.__watchProps = () => {
  const view = editor.value.getView();
  window.__asked = [];
  const original = view.someProp.bind(view);
  view.someProp = (name, f) => { window.__asked.push(name); return original(name, f); };
};

window.__whoseProp = (name) => {
  const view = editor.value.getView();
  const own = view._props && view._props[name];
  const direct = (view.directPlugins || []).filter((pl) => pl.props && pl.props[name]).length;
  const state = view.state.plugins.filter((pl) => pl.props && pl.props[name])
    .map((pl) => String(pl.key || 'plugin'));
  return {
    onView: typeof own,
    ownSource: own ? String(own).slice(0, 320).replace(/\s+/g, ' ') : null,
    directPluginsWithIt: direct,
    statePluginsWithIt: state,
  };
};

/* A sized picture and text below it, for testing a drag-to-move. */
window.__setDrag = () => editor.value.setHtml(
  `<figure data-width="200px"><img src="${PICTURE}" alt="a"></figure><p>one</p><p>two</p><p>three</p>`);

/* What the browser puts on the dataTransfer when the picture is dragged. */
window.__watchDrop = () => {
  const pm = document.querySelector('.apex-ed__host .ProseMirror');
  window.__drops = [];
  for (const type of ['dragstart', 'drop']) {
    pm.addEventListener(type, (e) => {
      window.__drops.push({ type, types: Array.from(e.dataTransfer?.types || []),
        files: e.dataTransfer?.files?.length ?? 0 });
    }, true);
  }
};

/* A sized picture with real prose after it, to measure wrapping. */
window.__setWrap = (wrap) => editor.value.setHtml(
  `<figure data-width="200px" data-wrap="${wrap}"><img src="${PICTURE}" alt="a"></figure>`
  + `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pharetra nibh a ligula pretium, `
  + `non tempor purus consequat. Etiam a ex sit amet enim sollicitudin condimentum vel vitae metus.</p>`);

/* Does the text sit BESIDE the picture, or below it? */
window.__wrapGeometry = () => {
  const f = document.querySelector('.apex-ed__host figure');
  const p = document.querySelector('.apex-ed__host .ProseMirror > p');
  const fr = f.getBoundingClientRect(); const pr = p.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(p);
  const first = range.getClientRects()[0];
  return {
    float: getComputedStyle(f).float,
    figure: { x: Math.round(fr.x), y: Math.round(fr.y), w: Math.round(fr.width), bottom: Math.round(fr.bottom) },
    firstLine: first ? { x: Math.round(first.x), y: Math.round(first.y), w: Math.round(first.width) } : null,
    beside: !!first && first.y < fr.bottom - 4,
  };
};

/* A picture in the MIDDLE of a paragraph, floated: the text before it
   should run full width, and the text after it should run beside it. */
window.__setMidParagraph = (wrap) => editor.value.setHtml(
  `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pharetra nibh a ligula pretium, non tempor purus consequat. `
  + `<img src="/probe.png" data-width="200px" data-wrap="${wrap}">`
  + `Etiam a ex sit amet enim sollicitudin condimentum vel vitae metus. In fermentum egestas dolor. `
  + `Phasellus egestas rhoncus tortor, sed vestibulum ex rhoncus quis. Duis fermentum accumsan magna sollicitudin iaculis.</p>`);

window.__midGeometry = () => {
  const span = document.querySelector('.apex-ed__img-inline');
  const p = document.querySelector('.apex-ed__host .ProseMirror > p');
  if (!span || !p) return { span: !!span, p: !!p };
  const sr = span.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(p);
  const lines = Array.from(range.getClientRects() || []);
  return {
    float: getComputedStyle(span).float,
    display: getComputedStyle(span).display,
    picture: { x: Math.round(sr.x), y: Math.round(sr.y), w: Math.round(sr.width), bottom: Math.round(sr.bottom) },
    firstLine: lines[0] ? { x: Math.round(lines[0].x), y: Math.round(lines[0].y), w: Math.round(lines[0].width) } : null,
    lineWidths: lines.slice(0, 8).map((r) => Math.round(r.width)),
  };
};
