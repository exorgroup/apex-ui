<script lang="ts">
/**
 * The 6 worked examples on the ApexHTMLEditor page — AF2-286.
 *
 * Options API, deliberately — the only two files in this app that are. The
 * gallery drives these examples from 8 pieces of page state, and every
 * reference in 13,719 characters of template is written against `this`.
 * Ported as they stand, the markup is byte-identical apart from tag casing;
 * rewritten for `<script setup>`, each one becomes a `.value` edit in a file
 * no test reads line by line. These examples ARE the documentation, and a
 * subtly different one is worse than an unfashionable one.
 */
import { defineComponent } from 'vue';
import {
  HED_STYLES,
  HED_HTML
} from '../../editorData';

export default defineComponent({
  name: 'HtmlEditorSections',
  data() {
    return {
      /* The font and size vocabularies the character-style controls offer.
         Both are data() entries in the gallery under UPPERCASE keys, which
         the `hed*` sweep skipped — the template named them and the selects
         would have rendered empty. */
      HED_FONTS: ['Georgia, serif', '"Helvetica Neue", Arial, sans-serif', '"IBM Plex Mono", monospace'],
      HED_SIZES: ['13px', '15px', '19px', '24px', '32px'],
      hedHtml: HED_HTML,
      hedActive: { blockStyle: null, characterStyle: null, path: [] } as
        { blockStyle: string | null; characterStyle: string | null; path: Record<string, unknown>[] },
      hedLog: '',
      hedTag: 'section',
      hedClassInput: '',
      hedStylesOpen: false,
      /* Held between calls so the measuring canvas is made once. */
      hedSwatchCtx: null as CanvasRenderingContext2D | null
    };
  },
  setup() {
    /* Exposed for the template. <script setup> publishes its imports;
       the Options API does not, and a template naming one renders nothing. */
    return { HED_STYLES };
  },
  methods: {
      hedSwatch(active: any) {
        const raw = active && active.textStyle && active.textStyle.color;
        if (!raw) return '#000000';
        if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
        if (!this.hedSwatchCtx) {
          this.hedSwatchCtx = document.createElement('canvas').getContext('2d');
        }
        const ctx = this.hedSwatchCtx;
        if (!ctx) return '#000000';
        /* A value the context rejects leaves fillStyle unchanged, so it is seeded
           with a sentinel first — otherwise an invalid colour would silently
           report whatever was set last. */
        ctx.fillStyle = '#000000';
        ctx.fillStyle = raw;
        /* `fillStyle` reads back as a string here — the union with the
           gradient and pattern types is what the DOM declares, and a colour
           just assigned is never either of those. */
        const got = ctx.fillStyle as string;
        if (/^#[0-9a-f]{6}$/i.test(got)) return got;
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(got);
        return m
          ? '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
          : '#000000';
      },

      hedTableFixture() {
        return '<table><thead><tr><th>Site</th><th>Window</th><th>Owner</th></tr></thead>'
          + '<tbody><tr><td>Sliema</td><td>14:00</td><td>Sarah</td></tr>'
          + '<tr><td>Valletta</td><td>16:30</td><td>James</td></tr></tbody></table>';
      },

      hedOpenLink(linkContext: any) {
        const ed = this.$refs.hedMain as {
          getHtml?: () => string;
          setHtml: (h: string) => void;
          setLink: (attrs: { href: string; target?: string }) => void;
          unsetLink: () => void;
        } | undefined;
        const current = linkContext ? linkContext() : { href: '' };
        const href = window.prompt('Link address', current.href || 'https://');
        if (href === null) return;
        if (!href.trim()) { ed?.unsetLink(); return; }
        ed?.setLink({ href: href.trim(), target: '_blank' });
      },

      hedSetClass(value: any, structure: any) {
        this.hedClassInput = value;
        /* A null value removes the attribute, so one call both sets and clears. */
        structure('attrs', { class: value.trim() || null });
      },

      hedRoundTrip() {
        const ed = this.$refs.hedMain as {
          getHtml?: () => string;
          setHtml: (h: string) => void;
          setLink: (attrs: { href: string; target?: string }) => void;
          unsetLink: () => void;
        } | undefined;
        if (!ed || !ed.getHtml) return;
        const before = this.hedHtml;
        ed.setHtml(before);
        this.$nextTick(() => {
          const after = ed.getHtml!();
          const norm = (h: any) => h.replace(/\s+/g, ' ').trim();
          this.hedLog = norm(before) === norm(after)
            ? 'identical \u2014 nothing was lost'
            : 'differs \u2014 ' + Math.abs(after.length - before.length) + ' characters';
          this.hedHtml = after;
        });
      },

  },
});
</script>

<template>

        <h2>A page, in its own stylesheet</h2>
        <p style="font-size:13.5px">The surface is an iframe with the target site's CSS loaded into it, so the author is looking at the production cascade rather than an approximation. That is the difference that makes this a separate component: <code>ApexEditor</code> deliberately seals its writing area against the host page's CSS, because a document should look like itself wherever it is embedded — a page is the opposite.</p>
        <div class="iconstrip" style="margin-top:12px">
          <span style="font-size:13px;color:var(--fg-subtle)">select text or a block, then click a style — exactly like Word's gallery</span>
        </div>
        <div style="margin-top:12px">
          <ApexHTMLEditor ref="hedMain" v-model:html="hedHtml" :styles="HED_STYLES"
                            :stylesheets="['web/meeting-page.css']" min-height="360px"
                            @selection-change="hedActive = $event">
            <template #toolbar="{ blockStyles, characterStyles, active, apply, clear, sourceOpen, run, commands, setTextStyle, setLink, unsetLink, linkContext, cell, setCellStyle, objectRect, linkRequest, imageRequest, imageAttrs, applyImage, tableRequest, insertTable, countRequest, wordStats }">
              <!-- the menubar is the COMPLETE index: every catalogued command has
                   a home here, disabled when inapplicable rather than hidden,
                   because a greyed-out "Merge cells" teaches that merging exists
                   where a hidden one teaches nothing. The toolbar under it is a
                   frequent subset drawn from the same catalogue, so a label or a
                   shortcut can only be wrong in one place -->
              <ApexEditorMenubar :active="active" :can="commands" :run="run"
                                   :insert-table="insertTable"></ApexEditorMenubar>
              <!-- ApexEditor's own toolbar, unchanged: the commands are driven by
                   the schema rather than a fixed node list, so the full formatting
                   set works here without a second implementation. `standard`
                   rather than `full` is B3: the bar is a frequent subset and the
                   second tier sits behind the overflow, because the menubar above
                   is already the complete index -->
              <ApexEditorToolbar preset="standard" :active="active" :can="commands"
                                   :disabled="sourceOpen" :run="run">
                <template #link="s">
                  <ApexEditorLink :active="s.active" :href="linkContext().href"
                                    :target="linkContext().target" :open-request="linkRequest"
                                    @apply="setLink($event)" @remove="unsetLink()" />
                </template>
                <!-- the size picker, reached from the button AND from
                     Insert › Table: a table's shape is the first thing an author
                     decides, so neither surface guesses it -->
                <template #table>
                  <ApexEditorTableGrid :open-request="tableRequest" :insert="insertTable"
                                          :disabled="sourceOpen" />
                </template>
              </ApexEditorToolbar>
              <!-- the four the toolbar preset has no place for, since they are
                   page concerns rather than document ones -->
              <div class="apex-hed__styles">
                <button type="button" class="apex-hed__style" data-scope="disclosure"
                        :data-on="hedStylesOpen ? 'true' : 'false'"
                        :aria-expanded="hedStylesOpen ? 'true' : 'false'"
                        @click="hedStylesOpen = !hedStylesOpen">
                  <ApexIcon name="palette" :size="16"></ApexIcon>Styles
                </button>
                <label class="apex-hed__style" style="display:flex;align-items:center;gap:6px">
                  Colour
                  <input type="color" :value="hedSwatch(active)" style="width:26px;height:20px;border:0;padding:0;background:none"
                         @change="setTextStyle('text_color', ($event.target as HTMLInputElement).value)" />
                </label>
                <ApexSelect :model-value="active.textStyle && active.textStyle.fontFamily" :options="HED_FONTS"
                             size="sm" style="width:150px" placeholder="Font"
                             @update:model-value="setTextStyle('font_family', $event)" />
                <ApexSelect :model-value="active.textStyle && active.textStyle.fontSize" :options="HED_SIZES"
                             size="sm" style="width:104px" placeholder="Size"
                             @update:model-value="setTextStyle('font_size', $event)" />
                <button type="button" class="apex-hed__style" @click="setTextStyle('text_color', null)">Clear colour</button>
              </div>
              <!-- Insert › Image and the toolbar's own button open the SAME
                   dialog, and it doubles as the edit dialog for a selected
                   image — one declaration of the fields rather than two -->
              <ApexEditorImage :open-request="imageRequest" :attrs="imageAttrs"
                                 :disabled="sourceOpen" @apply="applyImage($event)" />
              <ApexEditorWordCount :open-request="countRequest" :stats="wordStats" />
              <!-- B4: the same bar, FLOATED at the object it acts on. It sat in
                   this stack because an overlay would cover the cells being
                   edited; anchoring below with a flip above is what fixes that,
                   so only where it is drawn changed. Contents by kind: a table,
                   an image and an embed are all objects, but they are not the
                   same object -->
              <ApexEditorObjectBar v-if="!sourceOpen && active.object && active.object.kind !== 'embed'"
                                      :rect="active.object.rect" :measure="objectRect"
                                      :kind="active.object.kind">
                <ApexEditorTableTools v-if="active.object.kind === 'table'"
                                         :cell="cell" :run="run" :can="commands"
                                         :set-cell-style="setCellStyle" :disabled="sourceOpen" />
                <ApexEditorImageTools v-else-if="active.object.kind === 'image'"
                                         :image="imageAttrs" :run="run" :can="commands"
                                         :disabled="sourceOpen" @edit="run('insert_image')" />
              </ApexEditorObjectBar>
              <div v-show="hedStylesOpen" class="apex-hed__styles">
                <button v-for="s in blockStyles" :key="s.className" type="button"
                        class="apex-hed__style" data-scope="block"
                        :data-on="active.blockStyle === s.className ? 'true' : 'false'"
                        :style="s.preview" @click="apply(s)">{{ s.label }}</button>
                <button type="button" class="apex-hed__style" @click="clear('block')">No style</button>
                <span style="width:1px;background:var(--border-default);margin:0 4px"></span>
                <button v-for="s in characterStyles" :key="s.className" type="button"
                        class="apex-hed__style" data-scope="character"
                        :data-on="active.characterStyle === s.className ? 'true' : 'false'"
                        :style="s.preview" @click="apply(s)">{{ s.label }}</button>
                <button type="button" class="apex-hed__style" @click="clear('character')">No character style</button>
              </div>
            </template>
          </ApexHTMLEditor>
        </div>
        <p style="font-size:13px;margin-top:8px">Block styles are set on the enclosing block; character styles wrap the selection in a span. That distinction is Word's, and it is not cosmetic — a character style applies to a run of text so it has to be a mark, where a block style belongs to the whole block so it has to be an attribute. One control for both would mean guessing.</p>
        <p style="font-size:13px">The element path along the bottom is how an author sees and selects the container they are inside. Click a crumb to select that element.</p>

        <h2>Tables</h2>
        <p style="font-size:13.5px">Click into a table and a contextual bar appears below the toolbar — rows, columns, merge and split, cell fill, borders and alignment. It is contextual because table controls are meaningless outside a table, and eighteen more buttons in the main toolbar would be dead weight on every document that has no table.</p>
        <p style="font-size:13px">Cell appearance is written as real CSS on the cell, not a data attribute — so a filled cell renders filled wherever the markup lands. The fills and borders are a small palette rather than a free picker, because a page's cells should match its stylesheet rather than whatever colour was to hand. Select a block of cells and the bar says how many it will act on.</p>

        <h2>Formatting</h2>
        <p style="font-size:13.5px">Colour, font family and font size are expressed as <code>span</code>s carrying a style, not as invented marks — a page's colour <em>is</em> a span with a colour on it, and a <code>textColor</code> mark would serialise to something the site's own CSS never sees. Each replaces its own property and leaves the others alone, so setting a colour does not clear the size.</p>
        <p style="font-size:13px">An image is inserted as a real void element, the same node a pasted <code>&lt;img&gt;</code> becomes, so it round-trips identically whichever way it arrived.</p>
        <p style="font-size:13.5px">The full toolbar is <code>ApexEditor</code>'s, unchanged. Its commands are driven <em>by the schema</em> rather than by a fixed node list, so bold, italic, headings, lists, links, tables, images, alignment and colour all work here without a second implementation — which was the premise of making this a separate component rather than a second engine.</p>
        <p style="font-size:13px">To turn a paragraph into a heading, use the toolbar's heading buttons. The container list below is for HTML <em>containers</em> — and note that <code>header</code> there is the <code>&lt;header&gt;</code> page-banner element, not a heading; the two read alike and the label says which is which.</p>

        <h2>Structure</h2>
        <p style="font-size:13.5px">Wrap, insert, retag, unwrap and delete. <strong>Unwrap and delete are different verbs and both exist</strong> — unwrap keeps the content and drops the wrapper, delete drops both. One verb for the two would mean an author removing a layout div lost the text inside it.</p>
        <p style="font-size:13.5px">Retag is where the generic-element design pays off: because a container's tag is an <em>attribute</em> rather than a node type, turning a div into a section is a single node-markup change that touches nothing inside it. A schema with one node type per tag would have to rebuild the subtree and hope the content still validated.</p>
        <p style="font-size:13px">Buttons disable themselves by asking the command without dispatching, which is ProseMirror's own applicability test — so a disabled button is disabled because the document said so rather than because a rule guessed.</p>

        <h2>Source view</h2>
        <p style="font-size:13.5px">On by default here, unlike <code>ApexEditor</code>. In a prose editor the source view is an escape hatch most authors never want; in a page editor it is the reliable way to reach anything the visual surface cannot, so hiding it would withhold the tool this component exists to complement.</p>
        <p style="font-size:13px">The markup is indented for reading, because a page nests far deeper than a document and one long line is unusable. Structural indentation only — nothing inside a tag is reflowed, since reformatting there risks changing it. Parsing happens when you leave the view, not as you type: half-typed markup is invalid markup.</p>
        <p style="font-size:13px">The iframe is hidden with <code>v-show</code> rather than <code>v-if</code>, since <code>v-if</code> would destroy it — and its document, its stylesheets and the view mounted inside would all be rebuilt from nothing every time you closed the source view.</p>

        <h2>Faithful markup</h2>
        <p style="font-size:13.5px">Divs, sections, classes, inline styles and data attributes are all carried verbatim, because the schema is a <em>superset</em> of the prose schema rather than a replacement: everything with affordances keeps a real node, everything else is carried by a generic element holding its tag and attributes.</p>
        <div class="iconstrip" style="margin-top:12px">
          <ApexButton size="sm" severity="secondary" variant="outlined" icon="sync"
                       @click="hedRoundTrip">Round-trip check</ApexButton>
          <span style="font-size:13px;color:var(--fg-subtle)">{{ hedLog || 'parses the markup and serialises it back' }}</span>
        </div>
        <pre class="doc-pre" style="margin-top:10px;max-height:220px;overflow:auto">{{ hedHtml }}</pre>
        <p style="font-size:13px">Attributes are the one place the whitelist stays strict: every <code>on*</code> handler is dropped, URL attributes are gated on a safe scheme, and a <code>style</code> attribute keeps its safe declarations while suspect ones go — losing every inline style because one looked wrong would break the layout.</p>
</template>
