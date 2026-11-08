<script lang="ts">
/**
 * The 33 worked examples on the ApexEditor page — AF2-286.
 *
 * Options API, deliberately — the only two files in this app that are. The
 * gallery drives these examples from 41 pieces of page state, and every
 * reference in 40,707 characters of template is written against `this`.
 * Ported as they stand, the markup is byte-identical apart from tag casing;
 * rewritten for `<script setup>`, each one becomes a `.value` edit in a file
 * no test reads line by line. These examples ARE the documentation, and a
 * subtly different one is worse than an unfashionable one.
 */
import { defineComponent } from 'vue';
import { cleanPastedHtml } from '@exorgroup/apex-ui';

/* The two shapes the examples read off the editor's reports. Declared here
   because the gallery never typed them and every field access below is
   otherwise a read on `unknown`. */
interface Anchor { threadId: string; top: number; text: string; [k: string]: unknown }
interface Suggestion { id?: string; kind?: string; text: string; [k: string]: unknown }
import {
  ED_RICH,
  ED_LONG,
  ED_DOCS,
  ED_BLOCKS,
  ED_TASKS,
  ED_MARKS_DOC,
  ED_ALIGN,
  ED_CODE,
  ED_RULES,
  ED_BLOCK_BUTTONS,
  ED_MARK_BUTTONS,
  ED_SLASH,
  ED_LINKS,
  ED_LINK_BAR,
  ED_PASTE_SOURCES,
  ED_MD_YES,
  ED_MD_NO,
  ED_MD_SAMPLE,
  ED_PASTE_LINK,
  ED_TABLE_DOC,
  ED_TABLE_MERGED,
  ED_MEDIA_DOC,
  ED_EMBED_DOC,
  ED_EMBED_TESTS,
  ED_MEDIA_ITEMS,
  ED_THREADS,
  ED_COMMENT_DOC,
  ED_SUGGEST_DOC,
  ED_EXPORT_DOC,
  ED_ASSIST_DOC,
  ED_DB_HTML,
  ED_SOURCE_DOC,
  ED_KEYS
} from '../../editorData';

export default defineComponent({
  name: 'EditorSections',
  data() {
    return {
      /* An empty document, shared by the examples that start blank. A
         data() entry in the gallery under an UPPERCASE key, which the
         `ed*` sweep skipped — four examples name it. */
      ED_DOCS_EMPTY: { type: 'doc', content: [{ type: 'paragraph' }] },
      /* The marks the "Selection state" example lists as chips. */
      ED_MARKS: ['strong', 'em', 'code', 'link'],
      /* The table toolbar's own command list. The gallery reads this from
         `window.ApexUIMirror.editorTableItems`, a global that exists only
         because its components are script tags; the same list is the
         catalogue's table domain, named here so the example is readable. */
      ED_TABLE_ITEMS: [
        'table_add_row_before', 'table_add_row_after', 'table_delete_row',
        'separator',
        'table_add_column_before', 'table_add_column_after', 'table_delete_column',
        'separator',
        'table_merge_or_split', 'table_toggle_header_row', 'table_delete',
      ],
      edDoc: JSON.parse(JSON.stringify(ED_RICH)),
      edPgDoc: JSON.parse(JSON.stringify(ED_RICH)),
      edExternal: JSON.parse(JSON.stringify(ED_DOCS.notes)),
      edText: '',
      edPgText: '',
      edShowJson: false,
      edDoc2: { type: 'doc', content: [{ type: 'paragraph' }] },
      edPasteSrc: 'Word',
      edPasteKind: '',
      edSuggestDoc: JSON.parse(JSON.stringify(ED_SUGGEST_DOC)),
      edSuggesting: true,
      /* Typed, because an empty literal infers `never[]` and every later
         read of an element's field is then an error on `never`. */
      edSuggestions: [] as Suggestion[],
      edExportDoc: JSON.parse(JSON.stringify(ED_EXPORT_DOC)),
      edExportAs: 'markdown',
      edExportSug: 'accept',
      edExportComments: false,
      edExportOut: '',
      edWords: 0,
      edAssistDoc: JSON.parse(JSON.stringify(ED_ASSIST_DOC)),
      edAssistBusy: false,
      edAssistLog: '',
      edDbDoc: { type: 'doc', content: [{ type: 'paragraph' }] },
      edDbColumn: ED_DB_HTML,
      edDbLog: '',
      edSourceDoc: JSON.parse(JSON.stringify(ED_SOURCE_DOC)),
      edSourceOn: false,
      edCommentDoc: JSON.parse(JSON.stringify(ED_COMMENT_DOC)),
      edThreads: ED_THREADS.slice(),
      edAnchors: [] as Anchor[],
      edActiveThread: 'th-1' as string | null,
      edResolvedIds: [] as string[],
      edCardHeights: {} as Record<string, number>,
      edCanComment: false,
      edShowResolved: true,
      edThreadSeq: 2,
      edMediaDoc: JSON.parse(JSON.stringify(ED_MEDIA_DOC)),
      edUploadMode: 'succeeds',
      edUploadLog: '',
      edTableDoc: JSON.parse(JSON.stringify(ED_TABLE_DOC)),
      edTableIn: 'no',
      edTasks: JSON.parse(JSON.stringify(ED_TASKS))
    };
  },
  setup() {
    /* Exposed for the template. <script setup> publishes its imports;
       the Options API does not, and a template naming one renders nothing. */
    return { ED_RICH, ED_LONG, ED_BLOCKS, ED_MARKS_DOC, ED_ALIGN, ED_CODE, ED_RULES, ED_BLOCK_BUTTONS, ED_MARK_BUTTONS, ED_SLASH, ED_LINKS, ED_LINK_BAR, ED_PASTE_SOURCES, ED_MD_YES, ED_MD_NO, ED_MD_SAMPLE, ED_PASTE_LINK, ED_TABLE_MERGED, ED_EMBED_DOC, ED_EMBED_TESTS, ED_MEDIA_ITEMS, ED_KEYS };
  },
  computed: {
      edPasteRawSource() {
        return ED_PASTE_SOURCES.find((s2) => s2.name === this.edPasteSrc) || ED_PASTE_SOURCES[0];
      },

      edPasteRaw() {
        /* Wrapped for reading, since real clipboard HTML arrives as one line. */
        return this.edPasteRawSource.html.replace(/></g, '>\n<');
      },

      edPasteClean() {
        /* The package's own cleaner, imported. The gallery reaches it through
           `window.ApexEditorPaste`, which exists only because its components are
           script tags on a page; here it is an export. */
        return cleanPastedHtml(this.edPasteRawSource.html, {}).replace(/></g, '>\n<');
      },

      edPasteNote() {
        const notes = {
          Word: 'The <style> block goes, the outer <b style="font-weight:normal"> is unwrapped rather than taken at its word, the <o:p> scaffolding and the empty spacer paragraphs are dropped, and the span that really carries font-weight:bold becomes a <strong>.',
          'Google Docs': 'The docs-internal-guid wrapper is unwrapped, and the formatting \u2014 which Docs records only as font-weight:700 and font-style:italic on spans \u2014 is rewritten into <strong> and <em> before the attribute is discarded.',
          'A web page': 'The <script> and <iframe> go, classes, ids and inline styles are stripped, the onclick attribute is removed, and the javascript: href is dropped while the real link survives.',
        };
        return (notes as Record<string, string>)[this.edPasteSrc] || '';
      },

      edVisibleAnchors() {
        const list = this.edShowResolved
          ? this.edAnchors
          : this.edAnchors.filter((a) => this.edResolvedIds.indexOf(a.threadId) === -1);
        /* Sorted by anchor, then each card pushed to clear the one above it. The
           editor reports where the TEXT is; a card's height is ours, so the
           stacking has to happen here. */
        const gap = 8;
        let floor = 0;
        return list.slice().sort((a, b) => a.top - b.top).map((a) => {
          const height = this.edCardHeights[a.threadId] || 96;
          const top = Math.max(a.top, floor);
          floor = top + height + gap;
          return Object.assign({}, a, { stackTop: top, drifted: top > a.top + 1 });
        });
      },

      edTaskCount() {
        const list = (this.edTasks.content || []).find((n: any) => n.type === 'task_list');
        if (!list) return '0 of 0';
        const items = list.content || [];
        return items.filter((i: any) => i.attrs && i.attrs.checked).length + ' of ' + items.length;
      },
  },
  watch: {
      edExportAs() { this.edRefreshExport(); },

      edExportSug() { this.edRefreshExport(); },

      edExportComments() { this.edRefreshExport(); },
  },
  methods: {
      /* The assist buttons reach the editor through its ref. In a method
         rather than inline in the template: a TS cast written inside an
         attribute expression parses as a value there and takes the whole
         file down with it. */
      edRunAssist(action: string): void {
        (this.$refs.edAI as { runAssist?: (a: string) => void } | undefined)?.runAssist?.(action);
      },

      edUpload(request: any) {
        const self = this;
        const mode = this.edUploadMode;
        const finish = () => {
          if (mode === 'fails') {
            request.reject('the storage bucket refused it');
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            request.resolve({ src: String(reader.result) });
            self.edUploadLog = 'stored ' + request.file.name;
          };
          reader.readAsDataURL(request.file);
        };
        /* "slow" exists to show the placeholder surviving edits: type above it
           while it runs and it stays where the file was dropped. */
        setTimeout(finish, mode === 'slow' ? 4000 : 250);
      },

      edDbLoad() {
        const ed = this.$refs.edDb as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (!ed || !ed.setHtml) return;
        ed.setHtml(this.edDbColumn);
        this.edDbLog = 'loaded \u2014 the span and marquee were dropped by the schema';
      },

      edDbSave() {
        const ed = this.$refs.edDb as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (!ed || !ed.toHtml) return;
        this.edDbColumn = ed.toHtml({ pretty: true });
        this.edDbLog = 'saved \u2014 this is what the column now holds';
      },

      edToggleSource() {
        const ed = this.$refs.edSrc as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (!ed || !ed.toggleSource) return;
        ed.toggleSource();
        this.edSourceOn = ed.isSourceOpen();
      },

      edHandleAssist(request: any) {
        const self = this;
        this.edAssistBusy = true;
        this.edAssistLog = request.action + '\u2026';
        setTimeout(() => {
          self.edAssistBusy = false;
          if (request.action === 'fails') {
            request.reject('the provider refused');
            self.edAssistLog = 'refused \u2014 nothing was changed';
            return;
          }
          const words = request.text.trim().split(/\s+/);
          const out = request.action === 'shorten'
            ? words.slice(0, Math.max(3, Math.ceil(words.length / 2))).join(' ')
            : request.action === 'proofread'
              ? request.text.replace(/\bsix\b/g, '18:00')
              : words.slice().reverse().join(' ');
          request.resolve(out);
          self.edAssistLog = request.action + ' proposed \u2014 accept or reject it';
        }, 900);
      },

      edRefreshExport() {
        const ed = this.$refs.edExp as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (!ed || !ed.toHtml) return;
        const opts = { suggestions: this.edExportSug, comments: this.edExportComments, pretty: true };
        this.edExportOut = this.edExportAs === 'html' ? ed.toHtml(opts)
          : this.edExportAs === 'text' ? ed.toText(opts) : ed.toMarkdown(opts);
        this.edWords = ed.wordCount(opts);
      },

      edResolve(range: any, verb: any) {
        const ed = this.$refs.edSug as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (ed) ed.resolveSuggestion(range, verb);
      },

      edResolveAll(verb: any) {
        const ed = this.$refs.edSug as {
          toggleSource: () => void; isSourceOpen: () => boolean;
          toText: (o?: unknown) => string; toMarkdown: (o?: unknown) => string;
          toHtml: (o?: unknown) => string; wordCount: (o?: unknown) => number;
          resolveSuggestion: (r: unknown, v: unknown) => void;
          resolveAll: (v: unknown) => void;
          addComment: (id: string) => void;
          setHtml: (h: string) => void;
        } | undefined;
        if (ed) ed.resolveAll(verb);
      },

      edMeasureCards() {
        const cards = document.querySelectorAll('.ed-thread[data-thread]');
        if (!cards.length) return;
        const next: Record<string, number> = {};
        let changed = false;
        cards.forEach((el) => {
          const id = el.getAttribute('data-thread') || '';
          const h = Math.round(el.getBoundingClientRect().height);
          next[id] = h;
          if (this.edCardHeights[id] !== h) changed = true;
        });
        if (changed) this.edCardHeights = next;
      },

      edThread(id: any) {
        return this.edThreads.find((t) => t.id === id) || { author: 'Unknown', body: '' };
      },

      edHasRange() {
        const ed = this.$refs && this.$refs.edCommentEditor;
        void ed;
        return true;
      },

      edAddThread() {
        const editors = document.querySelectorAll('.apex-ed');
        let target: any = null;
        editors.forEach((el) => {
          /* Vue's own back-pointer from an element to the component that
             rendered it. Real, and not on the DOM's Element type. */
          let v = (el as unknown as { __vueParentComponent?: any }).__vueParentComponent;
          while (v && v.type && v.type.name !== 'ApexEditor') v = v.parent;
          if (v && v.proxy.comments) target = v.proxy;
        });
        if (!target) return;
        this.edThreadSeq += 1;
        const id = 'th-' + this.edThreadSeq;
        this.edThreads = this.edThreads.concat([{
          id: id, author: 'You', body: 'A new note on this passage.',
        }]);
        if (!target.addComment(id)) {
          /* Refused, so the thread we just created has nothing to anchor to. */
          this.edThreads = this.edThreads.filter((t) => t.id !== id);
          return;
        }
        this.edActiveThread = id;
      },

      edToggleResolved(id: any) {
        this.edResolvedIds = this.edResolvedIds.indexOf(id) > -1
          ? this.edResolvedIds.filter((x) => x !== id)
          : this.edResolvedIds.concat([id]);
      },

      edDeleteThread(id: any) {
        const editors = document.querySelectorAll('.apex-ed');
        editors.forEach((el) => {
          /* Vue's own back-pointer from an element to the component that
             rendered it. Real, and not on the DOM's Element type. */
          let v = (el as unknown as { __vueParentComponent?: any }).__vueParentComponent;
          while (v && v.type && v.type.name !== 'ApexEditor') v = v.parent;
          if (v && v.proxy.comments) v.proxy.removeComment(id);
        });
        this.edThreads = this.edThreads.filter((t) => t.id !== id);
        if (this.edActiveThread === id) this.edActiveThread = null;
      },

      edLoad(which: any) {
        /* A fresh clone each time: handing the same object back would compare
           equal to what the editor last emitted and be ignored as an echo. */
        this.edExternal = JSON.parse(JSON.stringify((ED_DOCS as Record<string, unknown>)[which]));
      },
  },
});
</script>

<template>

        <h2>A working editor</h2>
        <p style="font-size:13.5px">The fixed toolbar, the bubble menu over a selection, the slash menu on <code>/</code>, and the link editor — all four rendering from one declaration and calling one command registry, so a button cannot work in one surface and be missing from another. Select some text; type <code>/</code> on an empty line.</p>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edDoc" placeholder="Start writing, or press / for blocks…"
                       min-height="230" @change="edText = $event.text">
            <template #toolbar="{ active, can, run, link, setLink, unsetLink }">
              <ApexEditorToolbar preset="standard" :active="active" :can="can" :run="run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                    @apply="setLink($event)" @remove="unsetLink()" />
                </template>
              </ApexEditorToolbar>
            </template>
            <template #overlay="ov">
              <ApexEditorBubble :view="ov.view" :active="ov.active" :can="ov.can" :run="ov.run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="ov.link.href" :target="ov.link.target"
                                    @apply="ov.setLink($event)" @remove="ov.unsetLink()" />
                </template>
              </ApexEditorBubble>
            </template>
          </ApexEditor>
        </div>

        <h2>Presets</h2>
        <p style="font-size:13.5px">Named sets rather than a boolean per button: "give me a normal toolbar" is the common request, and twenty booleans is a configuration language nobody wants to learn to answer it. A button greys out because the <em>document</em> says the command does not apply there — that is ProseMirror's own applicability check, not a rule we guessed.</p>
        <div class="grid grid--3" style="margin-top:12px">
          <div v-for="pre in ['minimal','standard','full']" :key="pre" class="cell">
            <span class="cell__tag">{{ pre }}</span>
            <ApexEditor :doc="ED_RICH" min-height="150" :slash-menu="false">
              <template #toolbar="{ active, can, run, link, setLink, unsetLink }">
                <ApexEditorToolbar :preset="pre" :active="active" :can="can" :run="run">
                  <template #link="s">
                    <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                      @apply="setLink($event)" @remove="unsetLink()" />
                  </template>
                </ApexEditorToolbar>
              </template>
            </ApexEditor>
          </div>
        </div>

        <h2>Leaving items out</h2>
        <p style="font-size:13.5px">A preset minus a few names. The alternative — retyping the preset as an <code>items</code> list with two entries missing — is a fork: it stops tracking the preset the day anything is added to one, and nobody notices, because a bar that is merely out of date still renders. <code>exclude</code> matches a command name, a custom slot name (<code>link</code>, <code>table</code>) or an option of the block select, and it reaches the overflow menu too. Separators left stranded are tidied away, so a group can go without leaving a double line behind it.</p>
        <div class="grid grid--2" style="margin-top:12px">
          <div class="cell">
            <span class="cell__tag">standard</span>
            <ApexEditor :doc="ED_RICH" min-height="150" :slash-menu="false">
              <template #toolbar="{ active, can, run, link, setLink, unsetLink, insertTable }">
                <ApexEditorToolbar preset="standard" :active="active" :can="can" :run="run">
                  <template #link="s">
                    <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                      @apply="setLink($event)" @remove="unsetLink()" />
                  </template>
                  <!-- the size picker. A custom slot, not a command: a table's
                       shape is the first thing an author decides, and an
                       UNFILLED slot renders nothing at all - no button, no gap,
                       no warning -->
                  <template #table>
                    <ApexEditorTableGrid :insert="insertTable" />
                  </template>
                </ApexEditorToolbar>
              </template>
            </ApexEditor>
          </div>
          <div class="cell">
            <span class="cell__tag">exclude: code, source_code</span>
            <ApexEditor :doc="ED_RICH" min-height="150" :slash-menu="false">
              <template #toolbar="{ active, can, run, link, setLink, unsetLink }">
                <ApexEditorToolbar preset="standard" :exclude="['code', 'source_code']"
                                   :active="active" :can="can" :run="run">
                  <template #link="s">
                    <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                      @apply="setLink($event)" @remove="unsetLink()" />
                  </template>
                </ApexEditorToolbar>
              </template>
            </ApexEditor>
          </div>
        </div>

        <h2>The JSON</h2>
        <p style="font-size:13.5px">The document is ProseMirror JSON and the JSON is authoritative — HTML comes later as an export.</p>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edDoc2" placeholder="Type here…" min-height="150" />
        </div>
        <div class="iconstrip" style="margin-top:10px">
          <ApexButton size="sm" severity="secondary" variant="outlined" icon="data_object"
                       @click="edShowJson = !edShowJson">{{ edShowJson ? 'Hide' : 'Show' }} JSON</ApexButton>
        </div>
        <pre v-if="edShowJson" class="doc-pre" style="margin-top:10px;max-height:260px;overflow:auto">{{ JSON.stringify(edDoc2, null, 2) }}</pre>

        <h2>Slash menu</h2>
        <p style="font-size:13.5px">A plugin rather than a keystroke listener, because the menu has to know the position the <code>/</code> was typed at — so choosing a command deletes exactly that text, in the same transaction that inserts the block. It fires only on a <code>/</code> that begins a word: mid-sentence a slash is a slash, and firing on "and/or" or a URL would interrupt writing constantly. Never inside a code block, where every character is literal.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_SLASH" min-height="220" placeholder="Press / to insert…" />
        </div>
        <p style="font-size:13px;margin-top:8px">Arrow keys move, Enter or Tab inserts, Escape closes. Typing past the last match closes it too — someone typing prose is not searching.</p>

        <h2>Link editor</h2>
        <p style="font-size:13.5px">A popover rather than a prompt, and it <em>edits</em> rather than replaces: opening it on an existing link reads that link's own attributes. A bare domain gets <code>https://</code>, because that is what someone typing "example.com" means — but anything already carrying a scheme is left alone, since prefixing <code>mailto:</code> would corrupt it. An address that looks like an email becomes a <code>mailto:</code>, as nobody means to visit one.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_LINKS" min-height="170" :slash-menu="false">
            <template #toolbar="{ active, can, run, link, setLink, unsetLink }">
              <ApexEditorToolbar :items="ED_LINK_BAR" :active="active" :can="can" :run="run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                    @apply="setLink($event)" @remove="unsetLink()" />
                </template>
              </ApexEditorToolbar>
            </template>
          </ApexEditor>
        </div>

        <h2>Bubble menu</h2>
        <p style="font-size:13.5px">Positioned from the <em>selection's</em> rectangle rather than the pointer, since a selection can be made by keyboard and a menu tracking the mouse would appear in the wrong place or not at all. It measures both ends, because a selection spanning lines starts and finishes on different rows. It flips below when there is no room above.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_LONG" min-height="200" max-height="200" :slash-menu="false">
            <template #overlay="ov">
              <ApexEditorBubble :view="ov.view" :active="ov.active" :can="ov.can" :run="ov.run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="ov.link.href" :target="ov.link.target"
                                    @apply="ov.setLink($event)" @remove="ov.unsetLink()" />
                </template>
              </ApexEditorBubble>
            </template>
          </ApexEditor>
        </div>
        <p style="font-size:13px;margin-top:8px">Select text near the top of the scroller to see it flip.</p>

        <h2>Sticky toolbar</h2>
        <p style="font-size:13.5px">A long document scrolls under its own toolbar rather than past it.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_LONG" min-height="200" max-height="200" :slash-menu="false">
            <template #toolbar="{ active, can, run }">
              <ApexEditorToolbar preset="minimal" sticky :active="active" :can="can" :run="run" />
            </template>
          </ApexEditor>
        </div>

        <h2>Keyboard</h2>
        <p style="font-size:13.5px">Commands are plain functions, so a shortcut, a toolbar button and a slash menu all invoke the same code — the toolbar in slice 3 will call exactly these. <code>Mod-</code> resolves per platform rather than hard-coding Ctrl.</p>
        <div class="card" style="margin-top:12px">
          <table class="doc-table">
            <thead><tr><th>Keys</th><th>Does</th></tr></thead>
            <tbody>
              <tr v-for="k in ED_KEYS" :key="k[0]"><td><code>{{ k[0] }}</code></td><td>{{ k[1] }}</td></tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_RICH" min-height="170" aria-label="Keyboard demo" />
        </div>

        <h2>Blocks</h2>
        <p style="font-size:13.5px">Lists are three nodes — the list, the item, and the blocks inside it — which is what lets an item hold a paragraph and a nested list at once. Toggling converts rather than nests: press bullets inside an ordered list and the wrapper changes in place, keeping the items and their nesting. Tab and Shift-Tab nest and lift.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_BLOCKS" min-height="330">
            <template #toolbar="{ run, can, active }">
              <div class="ed-bar">
                <ApexButton v-for="b in ED_BLOCK_BUTTONS" :key="b.cmd" size="sm" variant="text"
                             :icon="b.icon" :aria-label="b.label" :disabled="can[b.cmd] === false"
                             :severity="active && active.blockType === b.block ? 'primary' : 'secondary'"
                             @click="run(b.cmd)" />
              </div>
            </template>
          </ApexEditor>
        </div>

        <h2>Task lists</h2>
        <p style="font-size:13.5px">Its own node rather than a bullet list with a checkbox mark: the checked state belongs to the item, and a mark would let it apply to half a row. The box is drawn in CSS — a real <code>&lt;input&gt;</code> inside contenteditable takes focus away from the document and the caret cannot reach it. Click a box.</p>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edTasks" min-height="170" />
        </div>
        <p style="font-size:13px;margin-top:8px">Checked: <code>{{ edTaskCount }}</code> — read from the document, so it is stored rather than inferred from the DOM.</p>

        <h2>Marks</h2>
        <p style="font-size:13.5px">Underline is its own mark rather than reusing emphasis, since it means something different and conflating them exports neither faithfully. Sub and sup exclude each other — text cannot be both, and allowing the pair renders as whichever the stylesheet applied last. Highlight stores a colour <em>name</em>, because a document carrying <code>#FFF3A0</code> cannot follow a theme into dark mode.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_MARKS_DOC" min-height="200">
            <template #toolbar="{ run, can, active }">
              <div class="ed-bar">
                <ApexButton v-for="mk in ED_MARK_BUTTONS" :key="mk.cmd" size="sm" variant="text"
                             :icon="mk.icon" :aria-label="mk.label" :disabled="can[mk.cmd] === false"
                             :severity="active && active.marks[mk.cmd] ? 'primary' : 'secondary'"
                             @click="run(mk.cmd)" />
                <span class="ed-bar__sep"></span>
                <ApexButton size="sm" variant="text" icon="format_clear" aria-label="Clear formatting"
                             :disabled="can.clear_marks === false" @click="run('clear_marks')" />
              </div>
            </template>
          </ApexEditor>
        </div>

        <h2>Alignment</h2>
        <p style="font-size:13.5px">A block attribute, not a mark: half a paragraph cannot be centred, so expressing it as a mark would allow a document nobody can render. Setting the alignment already in force clears it, so the button reads as a toggle.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_ALIGN" min-height="200">
            <template #toolbar="{ run, can, active }">
              <div class="ed-bar">
                <ApexButton v-for="a in ['left','center','right','justify']" :key="a" size="sm"
                             variant="text" :icon="'format_align_' + a" :aria-label="'Align ' + a"
                             :disabled="can['align_' + a] === false"
                             :severity="active && active.blockAttrs.align === a ? 'primary' : 'secondary'"
                             @click="run('align_' + a)" />
              </div>
            </template>
          </ApexEditor>
        </div>

        <h2>Code blocks</h2>
        <p style="font-size:13.5px">No marks inside — code says the text is literal — and whitespace is preserved in full, because indentation <em>is</em> the content and collapsing it breaks every pasted snippet. The language round-trips as an attribute rather than as text, so nobody can edit the label. <code>Shift-Enter</code> exits: every other key inside is literal, so there would otherwise be no way out.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_CODE" min-height="200" />
        </div>

        <h2>Input rules</h2>
        <p style="font-size:13.5px">Markdown shorthands run exactly the command the toolbar button runs, so a document is identical whichever route produced it. Deliberately conservative: <code>smartQuotes</code> is off by default, because a rule that fires when the author did not mean it is worse than one that never fires — and quote conversion rewrites code and measurements typed on purpose.</p>
        <div class="card" style="margin-top:12px">
          <table class="doc-table">
            <thead><tr><th>Type</th><th>Get</th></tr></thead>
            <tbody><tr v-for="r in ED_RULES" :key="r[0]"><td><code>{{ r[0] }}</code></td><td>{{ r[1] }}</td></tr></tbody>
          </table>
        </div>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_DOCS_EMPTY" placeholder="Try typing ## or - or 1. or **bold**…" min-height="190" />
        </div>

        <h2>Storing HTML in a database</h2>
        <p style="font-size:13.5px">A website usually wants an HTML column: it renders without the editor, any language can read it, and a template can print it directly. So the round trip is <code>setHtml()</code> in, <code>toHtml()</code> out.</p>
        <pre class="doc-pre">// Loading a record
const row = await db.query('select body_html from pages where id = $1', [id]);
editor.value.setHtml(row.body_html);

// Saving it back
await db.query('update pages set body_html = $1 where id = $2', [
  editor.value.toHtml(),   // suggestions accepted, comment anchors dropped
  id,
]);</pre>
        <p style="font-size:13.5px"><strong>The trade worth knowing before you choose the column.</strong> HTML cannot carry editorial state: comment anchors and tracked changes are stripped on export by default, because a published page should not contain them. If your workflow has review in it, store the JSON as the record being edited and write HTML alongside it on save — the JSON is what you re-open, the HTML is what the site renders.</p>
        <pre class="doc-pre">// Both columns: JSON is the record, HTML is the render target
await db.query(
  'update pages set body_json = $1, body_html = $2 where id = $3',
  [
    JSON.stringify(doc),                              // re-openable, keeps comments
    editor.value.toHtml({ suggestions: 'accept' }),   // what the site prints
    id,
  ],
);</pre>
        <p style="font-size:13.5px">Loading HTML runs through the same cleaner as a paste, because HTML from your own database is no more trustworthy than HTML from a clipboard — it may predate your current schema, come from a previous editor, or have been written by hand. The schema is still the whitelist, so anything it cannot represent is dropped rather than smuggled in.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" severity="secondary" variant="outlined" icon="download"
                       @click="edDbLoad">Load from &ldquo;database&rdquo;</ApexButton>
          <ApexButton size="sm" icon="save" @click="edDbSave">Save</ApexButton>
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edDbLog || 'the column below is the stored value' }}</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor ref="edDb" v-model:doc="edDbDoc" source-view min-height="200" />
        </div>
        <pre class="doc-pre" style="margin-top:10px;max-height:170px;overflow:auto">{{ edDbColumn }}</pre>

        <h2>HTML source view</h2>
        <p style="font-size:13.5px"><code>sourceView</code> adds the equivalent of TinyMCE's Code button. Off by default: a document with tables and figures is far easier to break in source than to build, and most authors never want it.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" :icon="edSourceOn ? 'visibility' : 'code'"
                       @click="edToggleSource">{{ edSourceOn ? 'Back to editing' : 'Edit HTML' }}</ApexButton>
          <span style="font-size:13px;color:var(--fg-subtle)">markup is parsed when you leave the view, not as you type</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor ref="edSrc" v-model:doc="edSourceDoc" source-view min-height="220" />
        </div>
        <p style="font-size:13px;margin-top:8px">Parsing on exit rather than per keystroke is deliberate: half-typed markup is invalid markup, and parsing it would destroy the document while you were mid-tag. Markup that will not parse leaves the view open with your text intact — try deleting a <code>&lt;/p&gt;</code> and switching back.</p>

        <h2>Assist</h2>
        <p style="font-size:13.5px">No provider is bundled and no prompt is written in the component. The editor emits a request; the application answers it — endpoints, model, auth, rate limits, cost and prompt wording all belong to whoever owns the account. What the editor owns is where the result lands and what the document looks like while the request is out.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" icon="auto_fix_high" :disabled="edAssistBusy"
                       @click="edRunAssist('rewrite')">Rewrite</ApexButton>
          <ApexButton size="sm" severity="secondary" variant="outlined" :disabled="edAssistBusy"
                       @click="edRunAssist('shorten')">Shorten</ApexButton>
          <ApexButton size="sm" severity="secondary" variant="outlined" :disabled="edAssistBusy"
                       @click="edRunAssist('proofread')">Proofread</ApexButton>
          <ApexButton size="sm" variant="text" severity="danger" :disabled="edAssistBusy"
                       @click="edRunAssist('fails')">Simulate a refusal</ApexButton>
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edAssistLog || 'Select text, then choose an action' }}</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor ref="edAI" v-model:doc="edAssistDoc" assist suggestions
                       :author="{ id: 'assistant', name: 'Assistant' }"
                       :on-assist="edHandleAssist" min-height="200" />
        </div>
        <p style="font-size:13px;margin-top:8px">The result arrives as a <em>suggestion</em>: the original struck through, the proposal beside it. Accept and reject work on it with no code of their own — a reviewer cannot tell whether a person or a model proposed it, which is the point. This demo's "provider" is a local function that reverses word order after a delay; a real one would call an API.</p>

        <h2>Export</h2>
        <p style="font-size:13.5px">HTML goes through ProseMirror's own serialiser, driven by the schema's <code>toDOM</code> — already the single definition of how each node renders, so a hand-written walker would be a second definition that drifts. Markdown is written to be the exact inverse of our own parser, because the two have to round-trip.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexSelectButton v-model="edExportAs" :options="['html','markdown','text']" size="sm" />
          <ApexSelectButton v-model="edExportSug" :options="['accept','reject','keep']" size="sm" />
          <ApexSwitch v-model="edExportComments" label="Keep anchors" />
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edWords }} words</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor ref="edExp" v-model:doc="edExportDoc" comments suggestions
                       :author="{ id: 'you', name: 'You' }" min-height="200"
                       @selection-change="edRefreshExport" />
        </div>
        <pre class="doc-pre" style="margin-top:10px;max-height:230px;overflow:auto">{{ edExportOut }}</pre>
        <p style="font-size:13px">Export accepts suggestions and drops comment anchors by default: a published document should carry neither <code>&lt;ins&gt;</code>/<code>&lt;del&gt;</code> nor anchor spans, since those are editorial state rather than content. Switch to <code>keep</code> for a diff or an audit trail.</p>

        <h2>Suggestions</h2>
        <p style="font-size:13.5px">Both an insertion and a deletion are <em>marks</em>, which is the whole design. An insertion could be either, but a deletion has no choice: the text must stay in the document and stay <em>visible</em> until someone accepts it — a reviewer has to see what would go. So "deleting" while suggesting means marking, and accepting the deletion is what finally removes the text.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexSwitch v-model="edSuggesting" label="Suggesting" />
          <ApexButton size="sm" severity="secondary" variant="outlined" icon="done_all"
                       :disabled="!edSuggestions.length" @click="edResolveAll('accept')">Accept all</ApexButton>
          <ApexButton size="sm" variant="text" icon="close"
                       :disabled="!edSuggestions.length" @click="edResolveAll('reject')">Reject all</ApexButton>
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edSuggestions.length }} pending</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor ref="edSug" v-model:doc="edSuggestDoc" suggestions :suggesting="edSuggesting"
                       :author="{ id: 'you', name: 'You' }" min-height="220"
                       @suggestions-change="edSuggestions = $event" />
        </div>
        <p style="font-size:13px;margin-top:8px">Turn suggesting on, then select some text and press Backspace — it goes red and struck rather than disappearing. Type to add green text.</p>
        <div v-if="edSuggestions.length" class="card" style="margin-top:12px">
          <table class="doc-table">
            <thead><tr><th>Change</th><th>By</th><th>Text</th><th></th></tr></thead>
            <tbody>
              <tr v-for="(sg, i) in edSuggestions" :key="i">
                <td><ApexChip :label="sg.kind" size="sm"
                               :severity="sg.kind === 'insertion' ? 'success' : 'danger'" /></td>
                <td>{{ sg.authorName || sg.authorId }}</td>
                <td><code style="font-size:11px">{{ sg.text.slice(0, 26) }}</code></td>
                <td>
                  <ApexButton size="sm" variant="text" icon="check" aria-label="Accept"
                               @click="edResolve(sg, 'accept')" />
                  <ApexButton size="sm" variant="text" icon="close" aria-label="Reject"
                               @click="edResolve(sg, 'reject')" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Comments</h2>
        <p style="font-size:13.5px">The document stores a thread id on a range and <em>nothing else</em> — the thread, its replies and authors live in the application's store, where they can be queried, paginated and permissioned. Embedding them would make the document grow without bound and mean migrating comment schema every time the comment feature changed.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" icon="add_comment" :disabled="!edCanComment"
                       @click="edAddThread">Comment on selection</ApexButton>
          <ApexSwitch v-model="edShowResolved" label="Show resolved" />
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edThreads.length }} threads</span>
        </div>
        <div class="ed-with-gutter" style="margin-top:12px">
          <ApexEditor v-model:doc="edCommentDoc" comments min-height="300"
                       :active-thread="edActiveThread"
                       :resolved-threads="edResolvedIds"
                       @selection-change="edCanComment = !$event.blockMixed && edHasRange()"
                       @anchors-change="edAnchors = $event; $nextTick(edMeasureCards)"
                       @thread-click="edActiveThread = $event.threadId" />
          <!-- the gutter is the APP's, drawn against measured anchor positions -->
          <div class="ed-gutter">
            <div v-for="a in edVisibleAnchors" :key="a.threadId" class="ed-thread"
                 :data-thread="a.threadId"
                 :style="{ transform: 'translateY(' + a.stackTop + 'px)' }"
                 :data-drifted="a.drifted ? 'true' : 'false'"
                 :data-on="a.threadId === edActiveThread ? 'true' : 'false'"
                 :data-resolved="edResolvedIds.includes(a.threadId) ? 'true' : 'false'"
                 @click="edActiveThread = a.threadId">
              <div class="ed-thread__head">
                <ApexAvatar :label="edThread(a.threadId).author" size="xs" auto-color />
                <strong style="font-size:12px">{{ edThread(a.threadId).author }}</strong>
                <ApexButton size="sm" variant="text"
                             :icon="edResolvedIds.includes(a.threadId) ? 'undo' : 'check'"
                             :aria-label="edResolvedIds.includes(a.threadId) ? 'Reopen' : 'Resolve'"
                             @click.stop="edToggleResolved(a.threadId)" />
                <ApexButton size="sm" variant="text" icon="delete" aria-label="Delete thread"
                             @click.stop="edDeleteThread(a.threadId)" />
              </div>
              <p class="ed-thread__quote">&ldquo;{{ a.text.slice(0, 46) }}&rdquo;</p>
              <p class="ed-thread__body">{{ edThread(a.threadId).body }}</p>
            </div>
          </div>
        </div>
        <p style="font-size:13px;margin-top:8px">Select text and press the button; click an anchor or a card to focus a thread. The cards are positioned from <code>anchors-change</code>, which reports <em>measured</em> anchor positions — wrapping, images and tables all affect where a range actually sits, so a gutter that computed them would drift further down the document with every block.</p>
        <p style="font-size:13px">The editor reports where the <em>text</em> is; a card's height is the caller's, so stacking is the caller's too. This gutter sorts by anchor and pushes each card clear of the one above it — the same one-pass displacement the pie chart's external labels use, and for the same reason: the collisions are exactly the comments closest together, and those are the ones still worth reading, so displacing beats culling. A card pushed away from its anchor gets a connector.</p>

        <h2>Images</h2>
        <p style="font-size:13.5px">An image is a <em>figure</em>, so the caption is content of the node rather than a following paragraph — otherwise a reorder leaves the caption under someone else's picture. An empty caption shows a prompt rather than collapsing to nothing — the third figure below, and any caption whose text you delete. Note that the test is not <code>:empty</code>: ProseMirror puts a trailing break in every empty block, so the caption always has a child and <code>:empty</code> could never match. Width is a ratio of the container, not pixels, so the document reads the same at any size.</p>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edMediaDoc" min-height="330">
            <template #toolbar="{ active, can, run }">
              <ApexEditorToolbar :items="ED_MEDIA_ITEMS" :active="active" :can="can" :run="run" />
            </template>
          </ApexEditor>
        </div>
        <p style="font-size:13px;margin-top:8px">Select an image — click its picture, not its caption — and the width and alignment buttons apply. Setting the value already in force clears it, so they read as toggles.</p>

        <h2>Uploads</h2>
        <p style="font-size:13.5px">The editor never uploads. It emits <code>onUpload</code> with <code>{ file, resolve, reject }</code> and the application answers with a URL, because endpoints, auth and retries belong to whoever owns the storage. What the editor owns is the placeholder — a <em>decoration</em>, not a node, so a save mid-upload cannot persist it and an undo cannot resurrect one whose upload had finished. Drop an image file below, or paste a screenshot.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexSelectButton v-model="edUploadMode" :options="['succeeds','fails','slow']" size="sm" />
          <span style="font-size:13px;color:var(--fg-subtle)">{{ edUploadLog || 'No uploads yet' }}</span>
        </div>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_DOCS_EMPTY" :on-upload="edUpload" min-height="200"
                       placeholder="Drop or paste an image here…"
                       @paste="edUploadLog = $event.kind === 'file' ? 'uploading…' : edUploadLog"
                       @upload-error="edUploadLog = 'rejected: ' + $event.reason" />
        </div>
        <p style="font-size:13px;margin-top:8px">With no handler at all the file becomes a data URL — a working default rather than a silent failure, but not for production, since a data URL bloats the document.</p>

        <h2>Video embeds</h2>
        <p style="font-size:13.5px">An embed stores the <em>provider and the id</em>, never an iframe: storing markup would put a third party's HTML in the document, where it could not be validated, re-themed, or rendered anywhere but a browser. The recognised providers are a closed list, because accepting arbitrary embed HTML would be a way to put third-party script into every document using this editor.</p>
        <div class="card" style="margin-top:12px">
          <table class="doc-table">
            <thead><tr><th>Paste</th><th>Becomes</th></tr></thead>
            <tbody>
              <tr v-for="u in ED_EMBED_TESTS" :key="u[0]">
                <td><code style="font-size:11px">{{ u[0] }}</code></td>
                <td><code>{{ u[1] }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style="font-size:13.5px;margin-top:14px">In the editor an embed is a preview card, not a live iframe: an iframe inside contenteditable swallows every pointer event, so the node could not be selected, dragged or deleted — and here you are arranging a document rather than watching a video. A renderer builds the real iframe from the same two attributes.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_EMBED_DOC" min-height="230" />
        </div>

        <h2>Tables</h2>
        <p style="font-size:13.5px">Built on <code>prosemirror-tables</code>, because a table's hard part is not the markup — it is keeping colspan and rowspan consistent through every edit, so that deleting a column a merged cell spans does the right thing. Tab moves between cells: inside a table that is what Tab means everywhere else, and it is the one place the list binding would be actively wrong. Drag a column edge to resize.</p>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edTableDoc" min-height="300"
                       @selection-change="edTableIn = $event.inTable ? 'yes' : 'no'">
            <template #toolbar="{ active, can, run, link, setLink, unsetLink }">
              <ApexEditorToolbar preset="standard" :active="active" :can="can" :run="run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="link.href" :target="link.target"
                                    @apply="setLink($event)" @remove="unsetLink()" />
                </template>
              </ApexEditorToolbar>
              <!-- shown only inside a table: sixteen table buttons on a document
                   with no table is a toolbar that is mostly disabled, which reads
                   as broken rather than contextual -->
              <ApexEditorToolbar v-if="active && active.inTable" :items="ED_TABLE_ITEMS"
                                   :active="active" :can="can" :run="run" size="sm" />
            </template>
          </ApexEditor>
        </div>
        <p style="font-size:13px;margin-top:8px">Selection is in a table: <code>{{ edTableIn }}</code> — put the caret in a cell and the second toolbar appears.</p>

        <h2>Merged cells</h2>
        <p style="font-size:13.5px">Select two or more cells and press merge; select a merged cell and the same button splits it — one button, both directions, which is what "merge/split" means to a reader. A cell's <code>colwidth</code> is an array rather than a number, because a cell spanning three columns has three widths to remember, and a width list that no longer matches its span is treated as stale rather than applied to the wrong cells.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_TABLE_MERGED" min-height="230">
            <template #toolbar="{ active, can, run }">
              <ApexEditorToolbar :items="ED_TABLE_ITEMS" :active="active" :can="can" :run="run" />
            </template>
          </ApexEditor>
        </div>

        <h2>Without tables</h2>
        <p style="font-size:13.5px"><code>:tables="false"</code> keeps them out of the schema entirely, so a paste cannot introduce one the document is not meant to hold. The table below is pasted as its text.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_DOCS_EMPTY" :tables="false" :slash-menu="false"
                       placeholder="Tables are not part of this document…" min-height="120" />
        </div>

        <h2>Paste</h2>
        <p style="font-size:13.5px">Cleaning runs on the clipboard HTML <em>before</em> ProseMirror parses it. The parser faithfully preserves anything the schema can represent — including a Word document's worth of empty spacer paragraphs — and once parsed, that damage is indistinguishable from content the author wrote. Press the buttons to run real clipboard payloads through the cleaner.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton v-for="src in ED_PASTE_SOURCES" :key="src.name" size="sm"
                       :severity="edPasteSrc === src.name ? 'primary' : 'secondary'"
                       :variant="edPasteSrc === src.name ? 'solid' : 'outlined'"
                       @click="edPasteSrc = src.name">{{ src.name }}</ApexButton>
        </div>
        <div class="grid grid--2" style="margin-top:12px">
          <div class="cell"><span class="cell__tag">on the clipboard</span>
            <pre class="doc-pre" style="max-height:190px;overflow:auto;font-size:11px">{{ edPasteRaw }}</pre>
          </div>
          <div class="cell"><span class="cell__tag">after cleaning</span>
            <pre class="doc-pre" style="max-height:190px;overflow:auto;font-size:11px">{{ edPasteClean }}</pre>
          </div>
        </div>
        <p style="font-size:13px;margin-top:8px">{{ edPasteNote }}</p>

        <h2>Markdown paste</h2>
        <p style="font-size:13.5px">Detected from <em>plain</em> text only: HTML on the clipboard means the source had structure of its own, and reading its text as markdown would parse a code sample or a URL as formatting. Detection is strict — a heading, a fence, a table, or two or more list items, because one line starting with a dash is just a sentence.</p>
        <div class="grid grid--2" style="margin-top:12px">
          <div class="cell"><span class="cell__tag">detected as markdown</span>
            <table class="doc-table">
              <tbody><tr v-for="t in ED_MD_YES" :key="t"><td><code>{{ t }}</code></td><td>yes</td></tr></tbody>
            </table>
          </div>
          <div class="cell"><span class="cell__tag">left as prose</span>
            <table class="doc-table">
              <tbody><tr v-for="t in ED_MD_NO" :key="t"><td><code>{{ t }}</code></td><td>no</td></tr></tbody>
            </table>
          </div>
        </div>
        <p style="font-size:13.5px;margin-top:14px">Paste the markdown below into this editor — it becomes real blocks, not literal text.</p>
        <pre class="doc-pre" style="margin-top:8px;font-size:11.5px">{{ ED_MD_SAMPLE }}</pre>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_DOCS_EMPTY" placeholder="Paste markdown here…" min-height="200"
                       @paste="edPasteKind = $event.kind" />
        </div>
        <p style="font-size:13px;margin-top:8px">Last paste read as: <code>{{ edPasteKind || 'nothing yet' }}</code></p>

        <h2>Pasting a link</h2>
        <p style="font-size:13.5px">A URL pasted over a selection links it rather than replacing it — which is what someone with text selected and a URL copied means. With nothing selected it pastes as text, since there is nothing to link.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_PASTE_LINK" min-height="130" :slash-menu="false" />
        </div>

        <h2>Selection state</h2>
        <p style="font-size:13.5px">The <code>toolbar</code> and <code>footer</code> slots receive <code>active</code>, read from the state on every transaction rather than tracked separately: a toolbar keeping its own idea of "is bold on" drifts the moment the caret moves, and that drift stays invisible until someone notices the wrong button lit. Move the caret through the bold and code text below.</p>
        <div style="margin-top:12px">
          <ApexEditor :doc="ED_RICH" min-height="150">
            <template #footer="{ active }">
              <div class="ed-state">
                <ApexChip v-for="m in ED_MARKS" :key="m" :label="m" size="sm"
                           :severity="active && active.marks[m] ? 'primary' : 'neutral'"
                           :variant="active && active.marks[m] ? 'solid' : 'subtle'" />
                <span style="margin-inline-start:auto;font-size:12px;color:var(--fg-subtle)">
                  block: <code>{{ active ? active.blockType : '—' }}</code>
                  <template v-if="active && active.blockType === 'heading'">
                    level {{ active.blockAttrs.level }}
                  </template>
                </span>
              </div>
            </template>
          </ApexEditor>
        </div>

        <h2>External changes</h2>
        <p style="font-size:13.5px">Setting the document from outside replaces it while keeping the selection where it still fits. The editor remembers what it last emitted and ignores that echo, so typing does not round-trip through the caller's model and reset the undo stack on every character — try typing, then undo past the load.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" severity="secondary" variant="outlined" @click="edLoad('brief')">Load a brief</ApexButton>
          <ApexButton size="sm" severity="secondary" variant="outlined" @click="edLoad('notes')">Load notes</ApexButton>
          <ApexButton size="sm" variant="text" @click="edLoad('empty')">Clear</ApexButton>
        </div>
        <div style="margin-top:12px">
          <ApexEditor v-model:doc="edExternal" min-height="180" />
        </div>

        <h2>States</h2>
        <p style="font-size:13.5px"><code>readonly</code> is still selectable and copyable — a reader needs to quote it. <code>disabled</code> is the field-level state, neither editable nor focusable.</p>
        <div class="grid grid--2" style="margin-top:12px">
          <div class="cell"><span class="cell__tag">readonly</span>
            <ApexEditor :doc="ED_RICH" readonly min-height="130" />
          </div>
          <div class="cell"><span class="cell__tag">disabled</span>
            <ApexEditor :doc="ED_RICH" disabled min-height="130" />
          </div>
          <div class="cell"><span class="cell__tag">bare — no frame of its own</span>
            <ApexEditor :doc="ED_RICH" :bordered="false" min-height="130" />
          </div>
          <div class="cell"><span class="cell__tag">scrolls past its max</span>
            <ApexEditor :doc="ED_LONG" min-height="90" max-height="130" />
          </div>
        </div>

        <h2>Sizes</h2>
        <p style="font-size:13.5px">Size scales the whole document, so headings stay proportional to body text rather than being fixed while the paragraphs move.</p>
        <div class="grid grid--3" style="margin-top:12px">
          <div v-for="s in ['sm','md','lg']" :key="s" class="cell">
            <span class="cell__tag">{{ s }}</span>
            <ApexEditor :doc="ED_RICH" :size="s" min-height="150" />
          </div>
        </div>
</template>

<style>
/*
 * The page's OWN classes, not the library's — AF2-286. `ed-bar`,
 * `ed-gutter`, `ed-state`, `ed-with-gutter` and `ed-thread` with their BEM
 * children belong to these examples: the comment gutter demonstrates what a
 * host builds beside the editor, not something ApexEditor ships. They live
 * in the gallery's page <style>, which no port of the components would have
 * carried across, and `zz-docs-classes` is what noticed.
 *
 * The first sweep found only the block selectors: a `.ed-bar` match guarded
 * against a following word character cannot match `.ed-bar__sep`, because
 * `_` IS one.
 *
 * Unscoped on purpose — the gallery's rules name these exact selectors.
 */
.ed-bar{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:6px 8px;
border:1px solid var(--border-default);border-block-end:0;
border-start-start-radius:var(--r-md);border-start-end-radius:var(--r-md);
background:var(--bg-subtle)}
/* the frame below drops its top corners so the two read as one control */
.ed-bar+.apex-ed__frame{border-start-start-radius:0;border-start-end-radius:0}
.ed-bar__sep{inline-size:1px;align-self:stretch;margin-inline:5px;background:var(--border-default)}
.ed-with-gutter{display:grid;grid-template-columns:minmax(0,1fr) 250px;gap:16px;align-items:start}
/* the cards are absolutely placed from measured tops, so the column is a
   positioning context rather than a flow */
.ed-gutter{position:relative;min-block-size:300px}
.ed-thread{position:absolute;inset-inline:0;inset-block-start:0;padding:9px 11px;
border:1px solid var(--border-default);border-radius:var(--r-md);background:var(--bg-surface);
cursor:pointer;transition:transform var(--dur-slow) var(--ease-out),border-color var(--dur-fast) var(--ease-out)}
.ed-thread[data-on="true"]{border-color:var(--accent-warning);box-shadow:var(--shadow-md)}
/* a card pushed clear of its anchor says so, or the reader cannot tell which
   passage it belongs to */
.ed-thread[data-drifted="true"]::before{content:"";position:absolute;
inset-inline-start:-14px;inset-block-start:14px;inline-size:10px;block-size:1px;
background:var(--border-default)}
.ed-thread[data-resolved="true"]{opacity:.62}
.ed-thread__head{display:flex;align-items:center;gap:6px;margin-block-end:6px}
.ed-thread__head>.apex-btn:first-of-type{margin-inline-start:auto}
.ed-thread__quote{margin:0 0 4px;font-size:11.5px;font-style:italic;color:var(--fg-subtle)}
.ed-thread__body{margin:0;font-size:12.5px;line-height:1.45;color:var(--fg-default)}
.ed-state{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:8px 2px 0}
</style>
