/**
 * Seed documents for the ApexEditor and ApexHTMLEditor pages — AF2-286.
 *
 * Extracted from the gallery's shell rather than written again: 39 constants,
 * from the rich sample the first example loads to the Word and Docs clipboard
 * payloads the paste section runs through the cleaner. A second set written
 * by hand would drift from the sections that read it, and several of these
 * are the POINT of their example — the merged-cell table, the suggestion
 * document with its marks already in place, the HTML a database would hand
 * back.
 *
 * `li`, `cell`, `hcell` and `row` stay local: they build the documents below
 * and are not data anyone imports.
 */

/* Documents as JSON, which is what the editor stores. Written out longhand
   rather than parsed from HTML, so the demos show the real shape. */
type Mark = { type: string; attrs?: Record<string, unknown> };
type Node = Record<string, unknown>;
const p = (text: string, marks?: Mark[]): Node => ({ type: 'text', text, marks });
const para = (content?: Node[]): Node => ({ type: 'paragraph', content });

export const ED_RICH = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Harbour rotation brief' }] },
    para([
      p('The evening loop runs '),
      p('four displays', [{ type: 'strong' }]),
      p(' between Sliema and Valletta, with '),
      p('menu boards', [{ type: 'em' }]),
      p(' swapping at 18:00. Set '),
      p('ROTATION_TZ', [{ type: 'code' }]),
      p(' before deploying.'),
    ]),
    { type: 'blockquote', content: [para([
      p('Terminal screens are excluded until the certification queue clears.'),
    ])] },
    para([
      p('See the '),
      p('deployment notes', [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }]),
      p(' for the full sequence.'),
    ]),
  ],
};
export const ED_LONG = {
  type: 'doc',
  content: Array.from({ length: 8 }, (_, i) => para([
    p('Paragraph ' + (i + 1) + ' \u2014 enough content that the writing area has to scroll rather than grow without limit.'),
  ])),
};
export const ED_DOCS = {
  empty: { type: 'doc', content: [{ type: 'paragraph' }] },
  brief: ED_RICH,
  notes: {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Standup notes' }] },
      para([p('Freezer controller replaced at the north site; gate sensor loop still open.')]),
      { type: 'horizontal_rule' },
      para([p('Next: verify the night crew handoff.')]),
    ],
  },
};
const li = (content: Node[]): Node => ({ type: 'list_item', content: content });
export const ED_BLOCKS = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Rollout checklist' }] },
    { type: 'bullet_list', attrs: { tight: true }, content: [
      li([para([p('Confirm the display inventory')])]),
      li([
        para([p('Stage the rotation')]),
        /* A nested list inside an item, which is why list_item holds BLOCKS. */
        { type: 'bullet_list', attrs: { tight: true }, content: [
          li([para([p('Sliema loop')])]),
          li([para([p('Valletta loop')])]),
        ] },
      ]),
      li([para([p('Notify the site leads')])]),
    ] },
    { type: 'ordered_list', attrs: { order: 3, tight: true }, content: [
      li([para([p('Third step \u2014 the list starts at 3, and that survives a round-trip')])]),
      li([para([p('Fourth step')])]),
    ] },
    { type: 'blockquote', content: [para([p('Terminal screens stay excluded until certification clears.')])] },
    { type: 'horizontal_rule' },
    para([p('A closing paragraph.')]),
  ],
};
export const ED_TASKS = {
  type: 'doc',
  content: [
    para([p('Before the evening loop:')]),
    { type: 'task_list', content: [
      { type: 'task_item', attrs: { checked: true }, content: [para([p('Replace the freezer controller')])] },
      { type: 'task_item', attrs: { checked: true }, content: [para([p('Stage the weekend crew')])] },
      { type: 'task_item', attrs: { checked: false }, content: [para([p('Investigate the gate sensor loop')])] },
      { type: 'task_item', attrs: { checked: false }, content: [para([p('Verify the night crew handoff')])] },
    ] },
  ],
};
export const ED_MARKS_DOC = {
  type: 'doc',
  content: [
    para([
      p('This paragraph carries '), p('bold', [{ type: 'strong' }]), p(', '),
      p('italic', [{ type: 'em' }]), p(', '), p('underline', [{ type: 'underline' }]),
      p(', '), p('strikethrough', [{ type: 'strike' }]), p(' and '),
      p('inline code', [{ type: 'code' }]), p('.'),
    ]),
    para([
      p('Highlights are named tones: '), p('yellow', [{ type: 'highlight', attrs: { color: 'yellow' } }]),
      p(', '), p('green', [{ type: 'highlight', attrs: { color: 'green' } }]),
      p(', '), p('blue', [{ type: 'highlight', attrs: { color: 'blue' } }]),
      p(', '), p('pink', [{ type: 'highlight', attrs: { color: 'pink' } }]),
      p(' and '), p('orange', [{ type: 'highlight', attrs: { color: 'orange' } }]), p('.'),
    ]),
    para([
      p('Chemical formulae need subscripts \u2014 H'), p('2', [{ type: 'subscript' }]),
      p('O \u2014 and footnotes need superscripts'), p('1', [{ type: 'superscript' }]), p('.'),
    ]),
  ],
};
export const ED_ALIGN = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3, align: 'center' }, content: [{ type: 'text', text: 'Centred heading' }] },
    para([p('Left by default \u2014 no attribute is stored at all, so an unaligned document carries nothing to strip.')]),
    { type: 'paragraph', attrs: { align: 'center' }, content: [p('Centred.')] },
    { type: 'paragraph', attrs: { align: 'right' }, content: [p('Right aligned.')] },
    { type: 'paragraph', attrs: { align: 'justify' }, content: [p('Justified, which needs enough text to show the effect at all \u2014 the spacing only becomes visible once a line has to stretch to reach both margins.')] },
  ],
};
export const ED_CODE = {
  type: 'doc',
  content: [
    para([p('Set the timezone before deploying:')]),
    { type: 'code_block', attrs: { language: 'bash' }, content: [
      { type: 'text', text: 'export ROTATION_TZ=Europe/Malta\nnpm run deploy -- --site sliema' },
    ] },
    para([p('The indentation below is content, not formatting:')]),
    { type: 'code_block', attrs: { language: 'json' }, content: [
      { type: 'text', text: '{\n  "loop": "evening",\n  "displays": [\n    "harbour-1",\n    "harbour-2"\n  ]\n}' },
    ] },
  ],
};
export const ED_RULES = [
  ['# ' + String.fromCharCode(8230) + ' ###### ', 'Heading, level from the count'],
  ['- or * or +', 'Bullet list'],
  ['1. ', 'Ordered list, starting at the number typed'],
  ['[ ] ', 'Task list'],
  ['> ', 'Blockquote'],
  [String.fromCharCode(96, 96, 96) + 'js', 'Code block, with the language'],
  ['**bold**', 'Bold'],
  ['*italic*', 'Italic'],
  ['~~strike~~', 'Strikethrough'],
  [String.fromCharCode(96) + 'code' + String.fromCharCode(96), 'Inline code'],
  ['--', 'En dash, and ... becomes an ellipsis'],
];
export const ED_BLOCK_BUTTONS = [
  { cmd: 'paragraph', icon: 'notes', label: 'Paragraph', block: 'paragraph' },
  { cmd: 'heading2', icon: 'format_h2', label: 'Heading 2', block: null },
  { cmd: 'heading3', icon: 'format_h3', label: 'Heading 3', block: null },
  { cmd: 'bullet_list', icon: 'format_list_bulleted', label: 'Bullet list', block: null },
  { cmd: 'ordered_list', icon: 'format_list_numbered', label: 'Ordered list', block: null },
  { cmd: 'task_list', icon: 'checklist', label: 'Task list', block: null },
  { cmd: 'blockquote', icon: 'format_quote', label: 'Blockquote', block: null },
  { cmd: 'code_block', icon: 'code_blocks', label: 'Code block', block: 'code_block' },
  { cmd: 'outdent', icon: 'format_indent_decrease', label: 'Outdent', block: null },
  { cmd: 'indent', icon: 'format_indent_increase', label: 'Indent', block: null },
  { cmd: 'horizontal_rule', icon: 'horizontal_rule', label: 'Divider', block: null },
];
export const ED_MARK_BUTTONS = [
  { cmd: 'strong', icon: 'format_bold', label: 'Bold' },
  { cmd: 'em', icon: 'format_italic', label: 'Italic' },
  { cmd: 'underline', icon: 'format_underlined', label: 'Underline' },
  { cmd: 'strike', icon: 'format_strikethrough', label: 'Strikethrough' },
  { cmd: 'code', icon: 'code', label: 'Inline code' },
  { cmd: 'highlight', icon: 'format_ink_highlighter', label: 'Highlight' },
  { cmd: 'subscript', icon: 'subscript', label: 'Subscript' },
  { cmd: 'superscript', icon: 'superscript', label: 'Superscript' },
];

export const ED_SLASH = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Try the slash menu' }] },
    para([p('Put the caret on the empty line below and press / \u2014 then type h2, list or code to filter.')]),
    para([p('Mid-sentence a slash is just a slash: and/or, 24/7, https://example.com all keep typing.')]),
    { type: 'paragraph' },
  ],
};
export const ED_LINKS = {
  type: 'doc',
  content: [
    para([
      p('An existing link to '),
      p('the deployment notes', [{ type: 'link', attrs: { href: 'https://example.com/notes', target: '_blank' } }]),
      p(' \u2014 put the caret inside it and press the link button to edit rather than replace it.'),
    ]),
    para([
      p('A mail link: '),
      p('ops@example.com', [{ type: 'link', attrs: { href: 'mailto:ops@example.com' } }]),
      p('. Select a word with no link and add one \u2014 or press the button with just a caret, and it takes the word.'),
    ]),
  ],
};
export const ED_LINK_BAR = [
  { command: 'strong', icon: 'format_bold', label: 'Bold', keys: 'Mod-B', activeMark: 'strong' },
  { command: 'em', icon: 'format_italic', label: 'Italic', keys: 'Mod-I', activeMark: 'em' },
  'separator',
  { type: 'custom', slot: 'link', label: 'Link' },
];

/* Real clipboard payloads, abbreviated but structurally what these sources
   actually emit. */
export const ED_PASTE_SOURCES = [
  { name: 'Word', html: '<html xmlns:o="urn:schemas-microsoft-com:office:office">'
    + '<head><style>p.MsoNormal{margin:0cm;font-size:11.0pt}</style></head><body>'
    + '<b style="font-weight:normal"><p class="MsoNormal" style="margin:0cm">'
    + '<span style="font-size:11.0pt;font-family:Calibri">Rotation brief</span></p>'
    + '<p class="MsoNormal">&nbsp;<o:p></o:p></p>'
    + '<p class="MsoNormal"><span style="font-weight:bold">Four displays</span>'
    + '<span> run the evening loop.</span></p>'
    + '<p class="MsoNormal">&nbsp;<o:p></o:p></p></b></body></html>' },
  { name: 'Google Docs', html: '<meta charset="utf-8">'
    + '<b style="font-weight:normal" id="docs-internal-guid-9f2">'
    + '<p dir="ltr" style="line-height:1.38;margin-top:0pt"><span style="font-size:11pt;'
    + 'font-family:Arial;font-weight:700">Standup notes</span></p>'
    + '<p dir="ltr"><span style="font-style:italic">Freezer controller</span>'
    + '<span style="font-size:11pt"> replaced at the north site.</span></p></b>' },
  { name: 'A web page', html: '<div class="article" id="main" style="max-width:720px">'
    + '<script>alert(1)</script><h2 class="title" style="color:red">Harbour rotation</h2>'
    + '<p class="body" onclick="steal()">Runs <strong>four displays</strong> nightly.</p>'
    + '<a href="javascript:alert(1)">Click</a> and '
    + '<a href="https://example.com" class="cta">a real link</a>'
    + '<iframe src="https://ads.example"></iframe></div>' },
];
export const ED_MD_YES = ['## Heading', '- one\n- two', '1. first\n2. second', '\u0060\u0060\u0060js', '| a | b |\n| 1 | 2 |'];
export const ED_MD_NO = ['- just one dash line', 'the * character', 'a 3.5 inch pipe', 'and/or'];
export const ED_MD_SAMPLE = ['## Evening rotation', '', 'Four displays run the **evening loop**, with',
  '*menu boards* swapping at 18:00.', '', '- Sliema loop', '- Valletta loop',
  '- [x] Freezer controller replaced', '', '> Terminal screens stay excluded.', '',
  '\u0060\u0060\u0060bash', 'export ROTATION_TZ=Europe/Malta', '\u0060\u0060\u0060'].join('\n');
export const ED_PASTE_LINK = {
  type: 'doc',
  content: [
    para([p('Select the words '), p('deployment notes', [{ type: 'strong' }]),
      p(' and paste a URL over them \u2014 they become a link rather than being replaced.')]),
  ],
};

const cell = (text: string, attrs?: Record<string, unknown>): Node => ({
  type: 'table_cell',
  attrs: attrs || {},
  content: [text ? para([p(text)]) : { type: 'paragraph' }],
});
const hcell = (text: string): Node => ({ type: 'table_header', attrs: {}, content: [para([p(text)])] });
const row = (cells: Node[]): Node => ({ type: 'table_row', content: cells });

export const ED_TABLE_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Display inventory' }] },
    { type: 'table', content: [
      row([hcell('Site'), hcell('Displays'), hcell('Loop')]),
      row([cell('Sliema'), cell('4', { align: 'right' }), cell('Evening')]),
      row([cell('Valletta'), cell('6', { align: 'right' }), cell('Evening')]),
      row([cell('Airport'), cell('2', { align: 'right' }), cell('All day')]),
    ] },
    para([p('Tab moves between cells; drag a column edge to resize.')]),
  ],
};
export const ED_TABLE_MERGED = {
  type: 'doc',
  content: [
    { type: 'table', content: [
      row([
        hcell('Region'),
        /* one header spanning two columns, with the pair of widths it needs */
        { type: 'table_header', attrs: { colspan: 2, colwidth: [120, 120] },
          content: [para([p('Evening loop')])] },
      ]),
      row([hcell('Site'), hcell('Displays'), hcell('Status')]),
      row([cell('Sliema'), cell('4', { align: 'right' }), cell('Live')]),
      row([
        /* one cell spanning two rows */
        { type: 'table_cell', attrs: { rowspan: 2 }, content: [para([p('Valletta')])] },
        cell('6', { align: 'right' }), cell('Live'),
      ]),
      row([cell('2', { align: 'right' }), cell('Staged')]),
    ] },
  ],
};

export const ED_MEDIA_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Harbour displays' }] },
    /* a captioned figure, a half-width one, and one with no caption at all */
    { type: 'image', attrs: { src: 'web/thumbs/totem-43.png', alt: 'A harbour totem display' },
      content: [p('The Sliema totem, running the evening loop.')] },
    { type: 'image', attrs: { src: 'web/thumbs/totem-43.png', alt: 'Half width', width: '50%', align: 'center' },
      content: [p('Half width, centred \u2014 a ratio of the container rather than pixels.')] },
    para([p('The figure below has no caption at all, which is a different thing from an empty one:')]),
    { type: 'image', attrs: { src: 'web/thumbs/totem-43.png', alt: 'Uncaptioned', width: '33%' } },
  ],
};
export const ED_EMBED_DOC = {
  type: 'doc',
  content: [
    para([p('Paste a video URL on its own line and it becomes an embed:')]),
    { type: 'embed', attrs: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Rotation walkthrough' } },
    { type: 'embed', attrs: { provider: 'vimeo', videoId: '347119375', title: 'Site survey' } },
    /* a provider we do not know renders as unknown rather than guessing a URL */
    { type: 'embed', attrs: { provider: 'unknown-host', videoId: 'abc123', title: 'From another system' } },
  ],
};
export const ED_EMBED_TESTS = [
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube / dQw4w9WgXcQ'],
  ['https://youtu.be/dQw4w9WgXcQ', 'youtube / dQw4w9WgXcQ'],
  ['https://youtube.com/shorts/dQw4w9WgXcQ', 'youtube / dQw4w9WgXcQ'],
  ['https://vimeo.com/347119375', 'vimeo / 347119375'],
  ['https://example.com/video.mp4', 'not an embed \u2014 pasted as a link'],
];
export const ED_MEDIA_ITEMS = [
  { command: 'image_width_full', icon: 'fit_screen', label: 'Full width' },
  { command: 'image_width_half', icon: 'width_normal', label: 'Half width' },
  { command: 'image_width_third', icon: 'width_wide', label: 'A third' },
  'separator',
  { command: 'image_align_left', icon: 'format_align_left', label: 'Align left' },
  { command: 'image_align_center', icon: 'format_align_center', label: 'Align centre' },
  { command: 'image_align_right', icon: 'format_align_right', label: 'Align right' },
];

/* Threads live HERE, in the app's own store — the document only carries ids. */
export const ED_THREADS = [
  { id: 'th-1', author: 'Sarah Wilson', body: 'Is four still right after the Airport change?' },
  { id: 'th-2', author: 'James Chen', body: 'Confirmed with the site lead \u2014 18:00 holds.' },
];
export const ED_COMMENT_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Evening rotation' }] },
    para([
      p('The loop runs '),
      /* an anchor spanning several text nodes, one of them bold — the anchor is
         the union rather than the first run found */
      p('four displays', [{ type: 'comment', attrs: { threadId: 'th-1' } }, { type: 'strong' }]),
      p(' between Sliema and Valletta.'),
    ]),
    para([
      p('Menu boards swap at '),
      p('18:00 sharp', [{ type: 'comment', attrs: { threadId: 'th-2' } }]),
      p(', which the site leads confirmed last week.'),
    ]),
    para([p('Select any text here and add a comment of your own.')]),
  ],
};

export const ED_SUGGEST_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Rotation brief' }] },
    para([
      p('The evening loop runs '),
      /* an existing suggestion from another author, so accept and reject have
         something to act on before anyone types */
      p('four', [{ type: 'deletion', attrs: { authorId: 'sarah', authorName: 'Sarah Wilson', at: '2026-09-01T09:12:00Z' } }]),
      p('six', [{ type: 'insertion', attrs: { authorId: 'sarah', authorName: 'Sarah Wilson', at: '2026-09-01T09:12:00Z' } }]),
      p(' displays between Sliema and Valletta.'),
    ]),
    para([p('Select any text here and press Backspace with suggesting on.')]),
  ],
};

/* One document carrying BOTH editorial kinds, so export options are visible. */
export const ED_EXPORT_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Rotation brief' }] },
    para([
      p('The evening loop runs '),
      p('four', [{ type: 'deletion', attrs: { authorId: 'sarah', authorName: 'Sarah Wilson', at: null } }]),
      p('six', [{ type: 'insertion', attrs: { authorId: 'sarah', authorName: 'Sarah Wilson', at: null } }]),
      p(' displays, per the '),
      p('site leads', [{ type: 'comment', attrs: { threadId: 'th-x' } }]),
      p('.'),
    ]),
    { type: 'bullet_list', content: [
      { type: 'list_item', content: [para([p('Confirm '), p('inventory', [{ type: 'strong' }])])] },
      { type: 'list_item', content: [para([p('Swap boards at 18:00')])] },
    ] },
    para([p('See '), p('the schedule', [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }]), p(' for detail.')]),
    /* An image and an embed in the fixture on purpose: a round-trip check over
       a document without them proves nothing about them, which is how two
       wrong node names survived. */
    { type: 'image', attrs: { src: 'web/thumbs/totem-43.png', alt: 'Totem display', width: null, align: null },
      content: [{ type: 'text', text: 'Harbour rotation, evening' }] },
    { type: 'image', attrs: { src: 'web/thumbs/window-32.png', alt: 'Uncaptioned window display', width: null, align: null } },
    { type: 'embed', attrs: { provider: 'youtube', videoId: 'dQw4w9WgXcQ', title: 'Install walkthrough', width: null, align: null } },
  ],
};

export const ED_ASSIST_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Draft note' }] },
    para([p('The evening rotation covers four displays across two sites and the boards swap at six.')]),
    para([p('Select a sentence and choose an action.')]),
  ],
};

/* Stands in for an HTML column: written by hand, with markup our schema does
   not carry, so dropping-not-smuggling is visible. */
export const ED_DB_HTML = [
  '<h3>Harbour rotation</h3>',
  '<p>The evening loop covers <strong>four</strong> displays.</p>',
  '<ul><li>Sliema</li><li>Valletta</li></ul>',
  '<p>Written by hand, with a <span class="legacy" data-cms="7">stray span</span> ',
  'and an <marquee>obsolete tag</marquee> our schema does not carry.</p>',
].join('');

export const ED_SOURCE_DOC = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Edit me as markup' }] },
    para([p('Switch to HTML, change something, and switch back.')]),
    { type: 'bullet_list', content: [
      { type: 'list_item', content: [para([p('A list item')])] },
    ] },
  ],
};

/* The application's classes — exactly what a consumer would pass. Previews are
   a hint for the button only; the real look comes from the page's own CSS in
   the iframe, which is the whole reason the surface is a real document. */
export const HED_STYLES = [
  { label: 'Lead', className: 'lead', scope: 'block', preview: 'font-size:14px' },
  { label: 'Callout', className: 'callout', scope: 'block', preview: 'border-left:3px solid #0d6f9c;padding-left:7px' },
  { label: 'Agenda', className: 'agenda', scope: 'block', preview: 'border-top:2px solid currentColor' },
  { label: 'Small print', className: 'small-print', scope: 'block', preview: 'font-size:10.5px;opacity:.7' },
  { label: 'Emphasis', className: 'emphasis', scope: 'character', preview: 'color:#0d6f9c;font-weight:600' },
  { label: 'Struck', className: 'strike-through', scope: 'character', preview: 'text-decoration:line-through' },
  { label: 'Badge', className: 'badge', scope: 'character', preview: 'background:#0d6f9c;color:#fff;border-radius:9px;padding:0 5px' },
];

export const HED_HTML = [
  '<h1>Quarterly review \u2014 harbour rotation</h1>',
  '<p class="lead">Four displays, two sites, one afternoon.</p>',
  '<div class="callout"><p>Bring the inventory sheet. <span class="badge">required</span></p></div>',
  '<section class="agenda" data-block="agenda">',
  '<h3>Agenda</h3>',
  '<p>14:00 &mdash; Rotation review</p>',
  '<p>14:30 &mdash; Menu board swap</p>',
  '</section>',
  '<div class="grid">',
  '<div class="card"><h3>Sliema</h3><p>Two totems, evening loop.</p></div>',
  '<div class="card"><h3>Valletta</h3><p>Two totems, all day.</p></div>',
  '</div>',
  '<p class="small-print" style="letter-spacing:.2px">Circulated to site leads only.</p>',
].join('');

export const ED_KEYS = [
  ['Mod-B / Mod-I', 'Bold, italic'],
  ['Mod-' + String.fromCharCode(96), 'Inline code'],
  ['Shift-Mod-1 \u2026 6', 'Heading level'],
  ['Shift-Mod-0', 'Back to a paragraph'],
  ['Mod-Shift->', 'Wrap in a blockquote'],
  ['Shift-Enter', 'Line break inside the paragraph'],
  ['Mod-Z / Shift-Mod-Z', 'Undo, redo'],
];

/**
 * The HTML editor playground's starting page.
 *
 * Here rather than inline in HtmlEditorStage.vue because `zz-docs-classes`
 * reads `class="…"` out of the .vue sources and cannot tell page CONTENT
 * from page markup — the `lead` class in this string is styled by the
 * stylesheet loaded INTO the iframe, and reported as a class defined
 * nowhere. A .ts module is not scanned, which is the honest place for
 * document content anyway.
 */
export const HED_PLAYGROUND = '<h2>Playground</h2><p class="lead">Try the styles and the markup view.</p>';

