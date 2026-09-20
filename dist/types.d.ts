/** @exorgroup/apex-ui — shared types */
export type ApexSize = 'sm' | 'md' | 'lg';
export type ApexTone = 'default' | 'danger' | 'warning' | 'success';
/**
 * 'float-over' | 'float-on' | 'float-in' animate the label out of the field on
 * focus or fill — above it, onto its border, or up inside the box.
 * 'floating' is kept as an alias of 'float-on'.
 */
export type ApexLabelPlacement = 'top' | 'before' | 'after' | 'under' | 'float-over' | 'float-on' | 'float-in' | 'floating' | 'inline' | 'hidden';
/**
 * What an item asks of the permission resolver, so it can be hidden from
 * someone who may not use it.
 *
 * Three forms, in the order you will reach for them:
 *
 *   'events'                 the resource, asked about with `read`
 *   { action, resource }     when the action is something else
 *   false                    hide regardless; true shows regardless
 *
 * The bare string is the resource rather than the action because that is what
 * a hidden row nearly always means — "may this user see this thing at all" —
 * and because the resource is the half the resolver cannot answer without.
 *
 * Resolved through the same `useCan()` seam every other gated control uses,
 * so an app wires one resolver — Autentica, Spatie, anything — and every menu
 * follows it. An item with no `can` is always shown, which is what keeps this
 * inert for callers who do not use it.
 *
 * Presentation only. Hiding an item does not stop the action being invoked;
 * the endpoint behind it still has to authorise the request.
 */
export type ApexPermission = string | {
    action: string;
    resource: string;
} | boolean;
export interface ApexOption<V = unknown> {
    value: V;
    label: string;
    help?: string;
    icon?: string;
    /** Thumbnail URL — flags, avatars, product shots. Rendered before the label. */
    image?: string;
    disabled?: boolean;
}
/** Options may be given as bare strings; normaliseOptions() widens them. */
export type ApexOptionsInput<V = unknown> = Array<ApexOption<V> | string | number>;
/**
 * Condition — the same grammar apex-form uses, evaluated against a scope.
 * For a standalone control the scope is `{ value, ...context }` and `field`
 * defaults to `'value'`, so `{ eq: 3 }` means "this control's value is 3".
 */
export interface ApexCondition {
    field?: string;
    eq?: unknown;
    ne?: unknown;
    gt?: number | string;
    gte?: number | string;
    lt?: number | string;
    lte?: number | string;
    in?: unknown[];
    nin?: unknown[];
    includes?: unknown;
    truthy?: boolean;
    falsy?: boolean;
    empty?: boolean;
    matches?: string;
    all?: ApexCondition[];
    any?: ApexCondition[];
    not?: ApexCondition;
    /** long form */
    op?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'includes' | 'truthy' | 'falsy' | 'empty' | 'notEmpty' | 'matches';
    value?: unknown;
}
/** Value-driven conditional formatting. Evaluated on every change, top to bottom; last match wins. */
export interface ApexRule {
    when: ApexCondition;
    tone?: ApexTone;
    message?: string;
    /** Extra class applied to the field root when the rule matches. */
    class?: string;
}
/** A trailing affordance rendered inside the control. */
export interface ApexTrailingAction {
    icon: string;
    label: string;
    disabled?: boolean;
}
/** Props every control accepts, forwarded to ApexField. */
/**
 * Your own classes, per part of a field.
 *
 * Dark mode is not a key here on purpose: the library already puts `.dark` on
 * the root, so one class plus `.dark .my-class { ... }` in your own stylesheet
 * covers both themes and keeps the two definitions next to each other.
 */
export interface ApexFieldClasses {
    /** The .apex-field root — wraps label, control and message. */
    root?: string;
    label?: string;
    /** The wrapper around the control and its message line. */
    body?: string;
    message?: string;
    /** The control box, .apex-ctl. */
    control?: string;
    /** The <input> or equivalent inside the box. */
    input?: string;
    /** Leading and trailing icons. */
    icon?: string;
    /** Static prefix and suffix text. */
    affix?: string;
    /** Clear, reveal, trailing action and dropdown buttons. */
    button?: string;
    /** The typeahead overlay, where the control has one. */
    popover?: string;
    /** A row inside that overlay. */
    option?: string;
    /** ApexOtp — one digit box. */
    box?: string;
    /** ApexStepper and ApexSelect — the displayed value. */
    value?: string;
    /** ApexStepper — the unit tag. */
    unit?: string;
    /** ApexSelect — the tick beside the selected row. */
    tick?: string;
    /** ApexSelect and ApexMultiselect — the search box in the overlay. */
    filter?: string;
    /** ApexMultiselect — the select-all row. */
    selectAll?: string;
    /** ApexMultiselect — the checkbox on a row. */
    checkbox?: string;
    /** ApexTextarea — the character counter. */
    counter?: string;
    /** ApexPassword — the meter and checklist panel. ApexOrderList — the framed
        panel holding the filter and the list. */
    panel?: string;
    /** ApexPassword — the four-band strength bar. */
    meter?: string;
    /** ApexPassword — the strength label under the bar. */
    strength?: string;
    /** ApexPassword — the requirements list. */
    rules?: string;
    /** ApexTags — one tag chip. */
    chip?: string;
    /** ApexStepper — the decrement and increment buttons. */
    decrement?: string;
    increment?: string;
    /** ApexKnob — the unfilled rail, the filled arc, the centre text. */
    range?: string;
    valueArc?: string;
    text?: string;
    /** ApexSlider — the rail, the filled portion, a handle, the value bubble.
        ApexSwitch reuses `track` for its bar and `handle` for its knob. */
    track?: string;
    fill?: string;
    handle?: string;
    tooltip?: string;
    /** ApexDatePicker — the calendar popover and the row above the grid. The
        prev/next buttons are .apex-ctl__btn inside `nav`, so reach them from
        there rather than through `button`, which is the field's own. */
    calendar?: string;
    nav?: string;
    title?: string;
    /** The month columns — `months` is the row, `month` one column, `monthLabel`
        the caption that appears once numberOfMonths is above one. */
    months?: string;
    month?: string;
    monthLabel?: string;
    /** The seven-column grid, a weekday heading, one day. */
    grid?: string;
    weekday?: string;
    day?: string;
    /** The month and year grids behind the title. */
    pick?: string;
    /** The time row, one hour/minute/second spinner, the AM-PM toggle. */
    time?: string;
    spin?: string;
    meridiem?: string;
    /** The Today / Clear bar. */
    bar?: string;
    /** ApexColorPicker — the popover, the saturation/value square and the
        marker you drag across it. */
    picker?: string;
    area?: string;
    thumb?: string;
    /** The hue and alpha tracks: `sliders` is the pair, `slider` each one. */
    sliders?: string;
    slider?: string;
    /** The hex/rgb/hsl/hsb switcher, and one segment of it. */
    formats?: string;
    format?: string;
    /** The numeric channel boxes, and one box with its caption. */
    channels?: string;
    channel?: string;
    /** The row holding the serialised colour, and the preset row. */
    output?: string;
    presets?: string;
    /** Every swatch — the trigger, the one beside the output, and each preset.
        They are one part, so scope by ancestor to reach a single kind. */
    swatch?: string;
    /** ApexSelect and ApexMultiselect — the text shown when nothing is chosen,
        the open/close arrow, and the no-results message. */
    placeholder?: string;
    chevron?: string;
    empty?: string;
    /** An option's thumbnail, in the box and in the overlay row alike, and the
        secondary line under a row's label. */
    thumbnail?: string;
    optionHelp?: string;
    /** The "Add new" row at the foot of the overlay. */
    addNew?: string;
    /** ApexListbox — the scrolling list inside the box, and a group heading in
        it. The box itself is `control` and a row is `option`, as elsewhere. */
    list?: string;
    group?: string;
    /** ApexCascadeSelect — the overlay holding the columns, one column, and the
        heading and footer a column can carry. */
    cascade?: string;
    column?: string;
    heading?: string;
    footer?: string;
    /** ApexTreeSelect — a branch and its children, and the expand/collapse
        button. A node's row is `option`, as a row is everywhere else. */
    branch?: string;
    twisty?: string;
    /** ApexOrderList — the framed panel, the column of move buttons, one of
        those buttons, a row's drag handle and its position number. The scrolling
        list is `list` and a row is `option`. */
    controls?: string;
    moveButton?: string;
    grip?: string;
    index?: string;
    /** ApexRadio and ApexRadioGroup — the dot, and the label row beside it. A
        whole radio row is `option` and the wrapper is `group`, as in the
        checkbox group. */
    dot?: string;
    lead?: string;
}
/**
 * Appearance shared by every control built on .apex-btn — ApexButton,
 * ApexSplitButton, ApexSpeedDial's trigger and ApexButtonGroup.
 *
 * The four colours are the whole severity system, not a subset of it. A
 * severity is nothing more than these four values, and all four variants
 * (solid, outlined, text, link) are written against them — so setting them is
 * how you define a severity the library does not ship, and it works across
 * every variant without further help.
 */
export interface ApexButtonAppearance {
    /** Base colour: solid background, outlined and text foreground. */
    color?: string;
    /** Hover colour. */
    hoverColor?: string;
    /** Text colour on a solid button. */
    labelColor?: string;
    /** The soft tint behind an outlined or text button on hover, and the focus ring. */
    tintColor?: string;
    /** Sizing, beyond the three `size` presets. Any CSS length. */
    height?: string;
    fontSize?: string;
    paddingInline?: string;
    radius?: string;
    /** Your own class on any part. */
    ui?: ApexButtonClasses;
}
/** Your own classes, per part of a button-family control. */
export interface ApexButtonClasses {
    /** The button element itself, or the root of a composite. */
    root?: string;
    /** ApexButton — the label span and the corner badge. */
    label?: string;
    badge?: string;
    /** ApexSplitButton — the default action and the chevron half. Also
        ApexSpeedDial's action button, inside its positioner. */
    action?: string;
    toggle?: string;
    /** ApexSpeedDial — the trigger, the fan, one action, the page mask, a tooltip. */
    trigger?: string;
    items?: string;
    item?: string;
    mask?: string;
    tooltip?: string;
    /** ApexButtonGroup — the frame, its legend and the help line. */
    frame?: string;
    legend?: string;
    help?: string;
    /** ApexSplitButton — the overlay and its rows, headers, hints and rules. */
    menu?: string;
    menuItem?: string;
    menuHeader?: string;
    menuHint?: string;
    menuSeparator?: string;
}
/**
 * Your own classes, per part of a container — ApexToolbar, ApexTabs, ApexSteps,
 * ApexSplitter, ApexScrollArea, ApexPanel, ApexFieldset, ApexCard and
 * ApexAccordion.
 *
 * The third such map, after ApexFieldClasses and ApexButtonClasses, because a
 * container is neither: it has no value, no label/message line and no tone —
 * it has a header, a body and things inside it.
 *
 * The keys below are the parts that recur across three or more of the nine;
 * everything after them belongs to one or two controls and is ignored by the
 * rest, exactly as ApexFieldClasses handles its own long tail. A key names the
 * part's ROLE, not its class — `head` reaches ApexAccordion's `__header` as
 * readily as ApexCard's `__head`.
 */
/**
 * Your own class on any part of ApexAlert.
 *
 * ApexConfirmDialog, which this replaces, had no ui map and no variable layer
 * — the one control family that never got the AF2-133/140/169 treatment. Since
 * it was being rebuilt anyway, this was the moment to bring it into line
 * rather than leave a hole to file later.
 */
export interface ApexAlertClasses {
    /** The full-screen backdrop. */
    overlay?: string;
    /** The panel itself. */
    panel?: string;
    /** The close control, when `closable`. */
    close?: string;
    /** The figure well, whether it holds the drawn mark, an icon or an image. */
    figure?: string;
    /** Everything below the figure, re-keyed per stage. */
    content?: string;
    title?: string;
    text?: string;
    /** The from→to list on an edit-confirm. */
    changes?: string;
    /** The button row, and the note under it. */
    actions?: string;
    footnote?: string;
    /** The autoClose countdown bar. */
    timer?: string;
}
export interface ApexContainerClasses {
    /** The outermost element. */
    root?: string;
    /** The header row, and the two lines of text in it. */
    head?: string;
    title?: string;
    sub?: string;
    /** The content area, and the footer where the control has one. */
    body?: string;
    foot?: string;
    /** The collapse/expand button and its chevron. */
    toggle?: string;
    icon?: string;
    /** A section within: a tab's panel, a step's panel, a splitter pane, an
        accordion item. */
    panel?: string;
    /** Text identifying a part — a tab's label, a step's label, a legend's. */
    label?: string;
    /** ApexToolbar — one of the start / center / end regions. */
    region?: string;
    /** ApexTabs — the strip and its scroller, one tab, the count beside a
        label, the moving indicator, and the panel area below. */
    striparea?: string;
    scroll?: string;
    strip?: string;
    tab?: string;
    badge?: string;
    bar?: string;
    panels?: string;
    /** ApexSteps — one step, its numbered marker, the text beside it, the line
        joining them, and the nav bar beneath. */
    item?: string;
    marker?: string;
    text?: string;
    rail?: string;
    nav?: string;
    list?: string;
    /** ApexSplitter — the draggable divider and the grip drawn on it. */
    gutter?: string;
    grip?: string;
    /** ApexScrollArea — the clipping box and the content inside it. The
        scrollbar is `bar` and its handle is `thumb`. */
    viewport?: string;
    content?: string;
    thumb?: string;
    /** ApexFieldset — the legend that straddles the border. */
    legend?: string;
    /** ApexCard — the image band above the header. */
    media?: string;
    /** ApexAccordion — the element wrapping one item's header. */
    heading?: string;
    inner?: string;
}
/**
 * What every container accepts. Deliberately small: a container has no value
 * and no validation, so this is the class map and nothing else — each control
 * declares its own appearance props, which are already in place.
 */
/**
 * Class hooks for the display controls: ApexAvatar, ApexBadge, ApexChip,
 * ApexSkeleton, ApexProgressSpinner, ApexMeterGroup, ApexInplace, ApexBlockUI
 * and ApexScrollTop.
 *
 * The fourth such map, after ApexFieldClasses, ApexButtonClasses and
 * ApexContainerClasses. These nine are neither field, action nor container:
 * they mark, measure or cover something.
 *
 * A caveat worth stating, because it differs from the container family: these
 * nine have almost nothing structurally in common. Reading every part they
 * render, only `label` appears in three or more — an avatar, a spinner and a
 * meter simply are not built alike. So the shared core here is deliberately
 * two keys, and the rest of the map is per-control extras. That is the honest
 * shape of the group rather than a shared vocabulary invented to look tidy.
 *
 * A key names the part's ROLE, not its class.
 */
export interface ApexDisplayClasses {
    /** The outermost element. Every one of the nine has this. */
    root?: string;
    /** Text identifying the thing — ApexScrollTop's tooltip, a meter's caption,
        a chip's text. */
    label?: string;
    /** ApexAvatar and ApexChip — the image, and the glyph shown instead. */
    img?: string;
    icon?: string;
    /** ApexAvatar — the initials, the corner count, the status dot. */
    text?: string;
    badge?: string;
    dot?: string;
    /** ApexChip and ApexInplace — the remove/close button. */
    close?: string;
    /** ApexProgressSpinner and ApexMeterGroup — the unfilled groove behind the
        value. */
    track?: string;
    /** ApexProgressSpinner — the drawing, the moving arc, the number in it. */
    svg?: string;
    arc?: string;
    value?: string;
    /** ApexMeterGroup — one filled segment, the legend area and its rows, a
        row's icon, the marker on the bar, and the percentage. */
    seg?: string;
    labelregion?: string;
    labels?: string;
    licon?: string;
    marker?: string;
    pct?: string;
    /** ApexInplace — the closed state and the editor it opens into. */
    display?: string;
    content?: string;
    /** ApexBlockUI — the sheet over the content, the panel on it, its message
        and its countdown. */
    cover?: string;
    body?: string;
    msg?: string;
    timer?: string;
    /** ApexScrollTop — the button itself. */
    dock?: string;
}
/**
 * The media family: ApexCompare, ApexCarousel and ApexGallery.
 *
 * A sixth map rather than more keys on ApexDisplayClasses, which documents
 * itself as "these nine" and is already a long union. Same reasoning that gave
 * ApexAlert its own: a family with its own parts gets its own map, and a
 * reader of one control's `ui` should not have to scroll past another's.
 *
 * Parts are added as each control is normalised, so nothing here is
 * speculative — every key below is rendered by something.
 */
export interface ApexMediaClasses {
    /** The outermost element. Every control in the family has this. */
    root?: string;
    /** ApexCompare — one side of the comparison, and the line between them. */
    item?: string;
    divider?: string;
    /** ApexCompare — the draggable control on the divider, and its chevrons. */
    handle?: string;
    grip?: string;
    chev?: string;
    /** ApexCarousel — the scrolling track, the arrows and the indicator dots.
        `item` is shared with ApexCompare: both mean "one child of the set". */
    track?: string;
    nav?: string;
    dots?: string;
    dot?: string;
    /** ApexGallery — the image frame, and the picture inside it. `nav` is shared
        with ApexCarousel: in both it is one prev-or-next button. */
    stage?: string;
    img?: string;
    /** ApexGallery — the floating toolbar and one of its buttons. */
    bar?: string;
    act?: string;
    /** ApexGallery — the "3 / 8" counter, the thumbnail strip and one thumbnail. */
    count?: string;
    thumbs?: string;
    thumb?: string;
}
export interface ApexDisplayProps {
    /** Your own class on any part. See ApexDisplayClasses. */
    ui?: ApexDisplayClasses;
}
export interface ApexMediaProps {
    /** Your own class on any part. See ApexMediaClasses. */
    ui?: ApexMediaClasses;
}
/**
 * ApexTaskBoard and ApexTaskCard.
 *
 * The board's own family. Not folded into ApexMediaClasses: a board shares no
 * part with a carousel or a viewer, and one interface holding both would offer
 * every caller ten keys that do nothing for their control.
 *
 * The scaffolding is deliberately absent \u2014 the spacer rows windowing uses, the
 * corner cell above the lane column, the collapse chevrons, the over-limit and
 * lock glyphs. Those are the board's internal geometry, and a class map is for
 * the parts a caller means to restyle, not for everything with a class.
 */
export interface ApexBoardClasses {
    root?: string;
    /** The stack of rows inside the board. */
    grid?: string;
    /** The column-header row, one header in it, and a column-group cell above. */
    head?: string;
    column?: string;
    group?: string;
    columnTitle?: string;
    count?: string;
    /** A swimlane's header, and its title. */
    lane?: string;
    laneTitle?: string;
    /** One column \u00d7 lane cell, its empty note, and its add-card button. */
    cell?: string;
    empty?: string;
    add?: string;
    /** One card, the drop indicator, and the clone that follows the pointer. */
    card?: string;
    indicator?: string;
    preview?: string;
    /** ApexTaskCard \u2014 the default card's own parts. A `card` slot replaces the
        whole card, so these matter only while the default renderer is in use. */
    body?: string;
    cardTitle?: string;
    labels?: string;
    label?: string;
    meta?: string;
    chip?: string;
}
export interface ApexBoardProps {
    /** Your own class on any part. See ApexBoardClasses. */
    ui?: ApexBoardClasses;
}
/** ApexPaginator. Its root is `.apex-pager`, not `.apex-pg`. */
export interface ApexPaginatorClasses {
    root?: string;
    /** The row of page controls. */
    nav?: string;
    /** Any button in the nav — first, previous, next, last and the page numbers. */
    button?: string;
    /** Only the numbered page buttons, `.apex-pager__btn--page`. */
    page?: string;
    /** The rows-per-page selector, shown when `rowsPerPageOptions` is set. */
    size?: string;
    /** The "Showing 1–10 of 84" line. */
    summary?: string;
}
export interface ApexProgressBarClasses {
    root?: string;
    /** The bar and its readout side by side, when the value sits outside. */
    row?: string;
    /** The groove, and the filled portion of it. */
    track?: string;
    fill?: string;
    /** The value text — `readout` outside the bar, `inside` within the fill. */
    readout?: string;
    inside?: string;
    /** The step caption under the bar, in step mode. */
    label?: string;
}
export interface ApexTimelineClasses {
    root?: string;
    /** One entry, and the line joining it to the next. */
    event?: string;
    connector?: string;
    /** The dot or icon on the line. */
    marker?: string;
    /** The two sides: the card, and the text opposite it. */
    content?: string;
    opposite?: string;
    /** The rule drawn between events where the layout calls for one. */
    separator?: string;
}
/** ApexOrgChart. Most parts are rendered by ApexOrgNode, one per node. */
export interface ApexOrgChartClasses {
    root?: string;
    /** The single top node's wrapper. */
    top?: string;
    /** A subtree, and the row of children under a node. */
    branch?: string;
    children?: string;
    /** One node: its positioning wrapper and the box that gets the border. */
    nodeWrap?: string;
    node?: string;
    /** Inside the box — the icon or image, and the two lines of text. */
    icon?: string;
    image?: string;
    text?: string;
    label?: string;
    sub?: string;
    /** The collapse/expand control, when `collapsible`. */
    toggle?: string;
}
export interface ApexDataViewClasses {
    root?: string;
    /** The toolbar above the items, and the two things in it. */
    bar?: string;
    sort?: string;
    /** The list/grid switcher, shown when `showLayoutSwitcher`. */
    layoutSwitch?: string;
    /** The region below the bar, the item container, and one item. */
    main?: string;
    items?: string;
    item?: string;
    /** The caption line, the empty note, and the loading veil. */
    caption?: string;
    empty?: string;
    overlay?: string;
}
/**
 * ApexDataTable, and the column filter it renders.
 *
 * The table names a lot of elements. These are the ones worth reaching from
 * outside: the toolbar, the scroll frame, the header controls, the row
 * decorations, the grouping and detail rows, and the three states. The inline
 * editor's own internals (`.apex-dte*`) are deliberately absent — an edit box
 * is a control in its own right and giving it keys here would document a
 * seam that does not exist yet.
 *
 * The `filter*` keys belong to ApexColumnFilter, which the table renders once
 * per filterable column and hands this same map to — the arrangement
 * ApexOrgChart and ApexOrgNode already use. A separate interface would make a
 * consumer import two types to style one table.
 */
export interface ApexDataTableClasses {
    root?: string;
    /** The toolbar above the table: the frame, the caption, the global search,
        the clear-all button and the selected-row count. */
    bar?: string;
    caption?: string;
    search?: string;
    clearAll?: string;
    count?: string;
    /** The scroll container, the viewport inside it, and the table element. */
    main?: string;
    viewport?: string;
    table?: string;
    /** The header: the row of per-column filters, the sort button in a heading,
        and the direction arrow it draws. */
    filterRow?: string;
    sort?: string;
    arrow?: string;
    /** Fixed leading columns — the drag gutter, the row-number cell, the
        expander cell and its button, the lock cell and its button, and the edit
        cell. */
    gutter?: string;
    rank?: string;
    expandCol?: string;
    expand?: string;
    lockCol?: string;
    lock?: string;
    editCol?: string;
    /** Grouping: the group header row, its label and count, and the group
        footer that carries the aggregates. */
    group?: string;
    groupLabel?: string;
    groupCount?: string;
    groupFoot?: string;
    /** An expanded row's detail area, and the grid inside it. */
    detail?: string;
    detailGrid?: string;
    /** Cell decorations: a formatted badge, an image cell, a secondary line,
        a stacked pair, and a per-row action button. */
    badge?: string;
    media?: string;
    sub?: string;
    stack?: string;
    rowButton?: string;
    /** The label beside a column footer's aggregate. */
    footLabel?: string;
    /** The pinned rows drawn above the scrolling body. */
    frozenRows?: string;
    /** The drag grip on a column boundary, when `resizableColumns`. */
    resizer?: string;
    /** The header-group row above the columns, when `columnGroups` is set. */
    groupRow?: string;
    /** The show/hide picker: its wrapper, the button, the count beside it, the
        menu, one row in it, and the reset button. */
    columnPick?: string;
    columnButton?: string;
    columnCount?: string;
    columnMenu?: string;
    columnRow?: string;
    columnReset?: string;
    /** The empty note, the loading veil, and one skeleton placeholder. */
    empty?: string;
    overlay?: string;
    skeleton?: string;
    /** The filter root, the button that opens it, and the badge counting the
        rules in force. */
    filter?: string;
    filterTrigger?: string;
    filterBadge?: string;
    /** The popup, and the list of rules in it. */
    filterPop?: string;
    filterMenu?: string;
    /** One rule: the row, its operator select, and the value control. */
    filterRule?: string;
    filterOp?: string;
    filterControl?: string;
    /** The two-value row a `between` operator needs. */
    filterPair?: string;
    /** The footer, its add-a-rule button, and the remove control on a rule. */
    filterActions?: string;
    filterAdd?: string;
    filterRemove?: string;
}
/**
 * ApexScheduler — a resource timeline, and the largest part map in the library.
 *
 * Named for what the reader sees rather than for the abbreviations the class
 * names use: `rowSub` is the row header's subtitle, `groupChip` a chip on a
 * grouping row, `popoverRecurrence` the recurrence line in the popover. The
 * abbreviations stay in the markup, where they are already load-bearing, and
 * do not leak into the API.
 */
export interface ApexSchedulerClasses {
    root?: string;
    toolbar?: string;
    nav?: string;
    range?: string;
    arrow?: string;
    legend?: string;
    swatch?: string;
    grouping?: string;
    treeButtons?: string;
    header?: string;
    corner?: string;
    weekday?: string;
    tier?: string;
    axis?: string;
    now?: string;
    canvas?: string;
    scroll?: string;
    grid?: string;
    rows?: string;
    row?: string;
    rowHead?: string;
    rowIcon?: string;
    rowName?: string;
    rowSub?: string;
    rowCount?: string;
    rowBody?: string;
    twirl?: string;
    order?: string;
    spacer?: string;
    cell?: string;
    cellRow?: string;
    track?: string;
    event?: string;
    eventMain?: string;
    eventRow?: string;
    eventThumb?: string;
    eventTitle?: string;
    eventTime?: string;
    ghost?: string;
    more?: string;
    chip?: string;
    chipMain?: string;
    chipRow?: string;
    chipThumb?: string;
    groupChip?: string;
    groupFixed?: string;
    groupLabel?: string;
    popover?: string;
    popoverBar?: string;
    popoverBody?: string;
    popoverMeta?: string;
    popoverFoot?: string;
    popoverRecurrence?: string;
    catcher?: string;
    menu?: string;
    menuItem?: string;
    menuTime?: string;
    createTime?: string;
    createTitle?: string;
}
/**
 * ApexCalendar — month, week, day, list and year in one control.
 *
 * The map spans all five views: `grid`/`cell`/`num` are the month matrix,
 * `timeGrid`/`slots`/`lanes` the week and day columns, `list*` the agenda,
 * `year`/`mini` the year overview. A key belonging to a view the caller never
 * shows is simply unused.
 */
/**
 * ApexEditor's class map — AF2-284.
 *
 * ONE map for the editor and the ten surfaces it ships with, on the
 * ApexOrgChart/ApexOrgNode precedent: a host styling an editor is styling one
 * thing, and eleven maps to import would make `ui` more work than writing the
 * CSS. The keys are prefixed by surface where a bare name would collide —
 * `imageFoot` and `dialogFoot` are different feet.
 */
/**
 * ApexForm's class map — AF2-293.
 *
 * The form is chrome around other controls, so this map covers the SHELL —
 * panel, layouts, grid, action bar — and each field's own control carries
 * its own map through the schema's `props`. Two maps meeting at a field
 * rather than one map trying to reach through it.
 */
export interface ApexFormClasses {
    /** `.apex-form` */
    root?: string;
    /** `.apex-form__scrim` */
    scrim?: string;
    /** `.apex-form__panel` */
    panel?: string;
    /** `.apex-form__head` */
    head?: string;
    /** `.apex-form__titles` */
    titles?: string;
    /** `.apex-form__dirty` — shown only after a change */
    dirty?: string;
    /** `.apex-form__validating` — shown while a Precognition round trip is in flight */
    validating?: string;
    /** `.apex-form__body` */
    body?: string;
    /** `.apex-form__side` */
    side?: string;
    /** `.apex-form__tabs` */
    tabs?: string;
    /** `.apex-form__badge` — a section's error count */
    badge?: string;
    /** `.apex-form__tiperr` */
    tabTip?: string;
    /** `.apex-form__main` — the container query's container */
    main?: string;
    /** `.apex-form__section` */
    section?: string;
    /** `.apex-form__sectionhead` */
    sectionHead?: string;
    /** `.apex-form__grid` */
    grid?: string;
    /** `.apex-form__cell` */
    cell?: string;
    /** `.apex-form__table` */
    table?: string;
    /** `.apex-form__pass` */
    fieldsetPass?: string;
    /** `.apex-form__ro` */
    readonly?: string;
    /** `.apex-form__rolabel` */
    readonlyLabel?: string;
    /** `.apex-form__rovalue` */
    readonlyValue?: string;
    /** `.apex-form__spacer` */
    spacer?: string;
    /** `.apex-form__foot` */
    foot?: string;
}
export interface ApexEditorClasses {
    /** `.apex-ed` */
    root?: string;
    /** `.apex-ed__frame` */
    frame?: string;
    /** `.apex-ed__host` */
    host?: string;
    /** `.apex-ed__loading` */
    loading?: string;
    /** `.apex-ed__placeholder` */
    placeholder?: string;
    /** `.apex-ed__error` */
    error?: string;
    /** `.apex-ed__source` */
    source?: string;
    /** `.apex-ed__source-error` */
    sourceError?: string;
    /** `.apex-edbar` */
    toolbar?: string;
    /** `.apex-edbar__btn` */
    toolbarButton?: string;
    /** `.apex-edbar__select` */
    toolbarSelect?: string;
    /** `.apex-edbar__sep` */
    toolbarSep?: string;
    /** `.apex-ed__menubar` */
    menubar?: string;
    /** `.apex-edbub` */
    bubble?: string;
    /** `.apex-edslash` */
    slash?: string;
    /** `.apex-edslash__group` */
    slashGroup?: string;
    /** `.apex-edslash__item` */
    slashItem?: string;
    /** `.apex-edslash__label` */
    slashLabel?: string;
    /** `.apex-edimg` */
    image?: string;
    /** `.apex-edimg__scrim` */
    imageScrim?: string;
    /** `.apex-edimg__head` */
    imageHead?: string;
    /** `.apex-edimg__title` */
    imageTitle?: string;
    /** `.apex-edimg__x` */
    imageClose?: string;
    /** `.apex-edimg__tabs` */
    imageTabs?: string;
    /** `.apex-edimg__tab` */
    imageTab?: string;
    /** `.apex-edimg__pane` */
    imagePane?: string;
    /** `.apex-edimg__field` */
    imageField?: string;
    /** `.apex-edimg__input` */
    imageInput?: string;
    /** `.apex-edimg__dims` */
    imageDims?: string;
    /** `.apex-edimg__lock` */
    imageLock?: string;
    /** `.apex-edimg__drop` */
    imageDrop?: string;
    /** `.apex-edimg__dropmsg` */
    imageDropMessage?: string;
    /** `.apex-edimg__browse` */
    imageBrowse?: string;
    /** `.apex-edimg__file` */
    imageFile?: string;
    /** `.apex-edimg__preview` */
    imagePreview?: string;
    /** `.apex-edimg__note` */
    imageNote?: string;
    /** `.apex-edimg__err` */
    imageError?: string;
    /** `.apex-edimg__foot` */
    imageFoot?: string;
    /** `.apex-edimg__save` */
    imageSave?: string;
    /** `.apex-edimg__cancel` */
    imageCancel?: string;
    /** `.apex-edimg__check` */
    imageCheck?: string;
    /** `.apex-edlink` */
    link?: string;
    /** `.apex-edlink__pop` */
    linkPopover?: string;
    /** `.apex-edlink__row` */
    linkRow?: string;
    /** `.apex-edlink__input` */
    linkInput?: string;
    /** `.apex-edlink__go` */
    linkGo?: string;
    /** `.apex-edlink__rm` */
    linkRemove?: string;
    /** `.apex-edlink__cancel` */
    linkCancel?: string;
    /** `.apex-edlink__check` */
    linkCheck?: string;
    /** `.apex-eddlg` */
    dialog?: string;
    /** `.apex-eddlg__scrim` */
    dialogScrim?: string;
    /** `.apex-eddlg__head` */
    dialogHead?: string;
    /** `.apex-eddlg__title` */
    dialogTitle?: string;
    /** `.apex-eddlg__close` */
    dialogClose?: string;
    /** `.apex-eddlg__x` */
    dialogX?: string;
    /** `.apex-eddlg__note` */
    dialogNote?: string;
    /** `.apex-eddlg__foot` */
    dialogFoot?: string;
    /** `.apex-edwc` */
    wordCount?: string;
    /** `.apex-edgrid` */
    grid?: string;
    /** `.apex-edgrid__pop` */
    gridPopover?: string;
    /** `.apex-edgrid__grid` */
    gridBody?: string;
    /** `.apex-edgrid__cell` */
    gridCell?: string;
    /** `.apex-edgrid__readout` */
    gridReadout?: string;
    /** `.apex-tbl-tools` */
    tableTools?: string;
    /** `.apex-tbl-tools__btn` */
    tableToolsButton?: string;
    /** `.apex-tbl-tools__scope` */
    tableToolsScope?: string;
    /** `.apex-tbl-tools__sep` */
    tableToolsSep?: string;
    /** `.apex-tbl-tools__field` — the border width box (N/048) */
    tableToolsField?: string;
    /** `.apex-tbl-tools__colour` — the border colour picker (N/048) */
    tableToolsColour?: string;
    /** `.apex-objtools` */
    imageTools?: string;
    /** `.apex-objtools__alt` */
    imageToolsAlt?: string;
    /** `.apex-objtools__alt` — the caption field (N/037) */
    imageToolsCaption?: string;
    /** `.apex-objtools__sep` */
    imageToolsSep?: string;
    /** The width/height pair on the image bar - N/034. */
    imageToolsSize?: string;
    /** `.apex-objtools__group` */
    imageToolsGroup?: string;
    /** `.apex-objtools__btn` */
    imageToolsButton?: string;
    /** `.apex-objtools__select` */
    imageToolsSelect?: string;
    /** `.apex-objbar` */
    objectBar?: string;
}
/**
 * ApexHTMLEditor's class map — AF2-284.
 *
 * Separate from ApexEditorClasses because the page editor is a separate
 * control with its own page and its own parts. `source` and `sourceError`
 * are the two it shares, and they keep the same names there.
 */
export interface ApexHTMLEditorClasses {
    /** `.apex-hed` */
    root?: string;
    /** `.apex-hed__frame` */
    frame?: string;
    /** `.apex-hed__loading` */
    loading?: string;
    /** `.apex-hed__error` */
    error?: string;
    /** `.apex-hed__path` */
    path?: string;
    /** `.apex-hed__crumb` */
    crumb?: string;
    /** `.apex-hed__status` */
    status?: string;
    /** `.apex-hed__words` */
    words?: string;
    /** `.apex-ed__source` */
    source?: string;
    /** `.apex-ed__source-error` */
    sourceError?: string;
}
export interface ApexCalendarClasses {
    root?: string;
    head?: string;
    title?: string;
    nav?: string;
    views?: string;
    zone?: string;
    grid?: string;
    row?: string;
    cell?: string;
    cells?: string;
    num?: string;
    nums?: string;
    weekday?: string;
    weekNumber?: string;
    more?: string;
    mores?: string;
    dot?: string;
    empty?: string;
    bar?: string;
    barEvent?: string;
    timeGrid?: string;
    timeGridBg?: string;
    axis?: string;
    tick?: string;
    time?: string;
    slots?: string;
    column?: string;
    lanes?: string;
    block?: string;
    now?: string;
    spacer?: string;
    dayHead?: string;
    dayBar?: string;
    allDay?: string;
    allDayRow?: string;
    allDayCell?: string;
    allDayLabel?: string;
    background?: string;
    backgroundSpan?: string;
    list?: string;
    listItem?: string;
    listDay?: string;
    listDot?: string;
    listTime?: string;
    listTitle?: string;
    year?: string;
    mini?: string;
    miniHead?: string;
    body?: string;
    eventTitle?: string;
    popover?: string;
    refusal?: string;
}
/** ApexTree. Its root is `.apex-tr`; `.apex-tree` belongs to ApexTreeSelect. */
export interface ApexTreeClasses {
    root?: string;
    /** The header strip, and the filter field in it. */
    head?: string;
    filter?: string;
    /** The scrolling region and the list of rows inside it. */
    main?: string;
    list?: string;
    /** One node row. The skeleton placeholders carry this too, as they should:
        the library styles them as rows. */
    row?: string;
    /** The expand/collapse control, and the spacer that keeps leaves in line. */
    toggle?: string;
    spacer?: string;
    /** The selection box, when `selectionMode` is checkbox. */
    checkbox?: string;
    /** Inside a row: the node icon and its text. */
    icon?: string;
    label?: string;
    /** The empty note, and the veil drawn over the list while loading. */
    empty?: string;
    overlay?: string;
}
/**
 * ApexTreeTable.
 *
 * Most of what it renders is ApexDataTable's chrome — the bar, the viewport,
 * the table, the filter row — because it IS a table with an expander column.
 * Only `root`, `cell` and `label` are its own; `toggle` comes from ApexTree.
 * The keys are named for what the reader sees, not for which file the class
 * came from.
 */
export interface ApexTreeTableClasses {
    root?: string;
    /** The toolbar above the table, and the caption line in it. */
    bar?: string;
    caption?: string;
    /** The scroll container, the viewport inside it, and the table element. */
    main?: string;
    viewport?: string;
    table?: string;
    /** The row of per-column filters, shown when a column sets `filter`. */
    filterRow?: string;
    /** One body row, and one cell in it. A node's own `styleClass` is applied
        alongside this, not instead of it. */
    row?: string;
    /** One body cell, and the label inside the expander cell. */
    cell?: string;
    label?: string;
    /** The expand/collapse control on a branch row. */
    toggle?: string;
    /** The empty note, and the veil drawn over the table while loading. */
    empty?: string;
    overlay?: string;
}
export interface ApexPickListClasses {
    root?: string;
    /** One of the two sides. Both get this — target the pair with `:nth-child`. */
    panel?: string;
    /** A panel's header row, its title, and its count. */
    head?: string;
    title?: string;
    count?: string;
    /** The select-all box and the filter field in a panel header. */
    all?: string;
    filter?: string;
    /** The scrolling area, the list inside it, and one row. */
    body?: string;
    list?: string;
    item?: string;
    /** The drag handle on a row, and the note shown when a side is empty. */
    grip?: string;
    empty?: string;
    /** The reorder buttons beside a list, and the move-across column. */
    controls?: string;
    transfer?: string;
}
/**
 * ApexChart, and the family renderers it hands the map to.
 *
 * The chart names sixty elements. This is twenty-six of them: the frame, the
 * axes, the legend, the tooltip, one key per mark type, and one each for the
 * treemap tile and the heat cell so a map on the chart still reaches the two
 * families that now render themselves.
 *
 * Absent on purpose \u2014 the navigator's internals (mask, grip, window, its own
 * svg), the brush rectangle, the screen-reader table, the canvas fallback, the
 * plugin layers and the gauge track. Those are machinery, not parts a caller
 * restyles, and a key for each would treble the map to no end.
 */
export interface ApexChartClasses {
    root?: string;
    svg?: string;
    /** The plot rect the series are drawn into. */
    plot?: string;
    /** The caption block above the chart, and its two lines. */
    head?: string;
    title?: string;
    caption?: string;
    /** The legend, one entry, and the colour chip on it. */
    legend?: string;
    key?: string;
    swatch?: string;
    /** The axis layer, a tick label, the gridlines and an axis title. */
    axis?: string;
    tick?: string;
    grid?: string;
    axisTitle?: string;
    /** The series layer, and one mark of each kind drawn in it. */
    series?: string;
    line?: string;
    area?: string;
    bar?: string;
    point?: string;
    slice?: string;
    /** The tooltip, its heading and one row of it. */
    tip?: string;
    tipTitle?: string;
    tipRow?: string;
    /** The navigator strip, the toolbar, and one of its buttons. */
    nav?: string;
    toolbar?: string;
    tool?: string;
    /** ApexChartTreemap and ApexChartHeat \u2014 handed down, so one map on the
        chart classes the families that render themselves. */
    tile?: string;
    cell?: string;
}
export interface ApexChartProps {
    /** Your own class on any part. See ApexChartClasses. */
    ui?: ApexChartClasses;
}
export interface ApexContainerProps {
    /** Your own class on any part. See ApexContainerClasses. */
    ui?: ApexContainerClasses;
}
export interface ApexFieldProps {
    label?: string;
    labelIcon?: string;
    labelPlacement?: ApexLabelPlacement;
    labelWidth?: string;
    help?: string;
    error?: string | string[] | null;
    warning?: string | null;
    success?: string | null;
    tone?: ApexTone;
    rules?: ApexRule[];
    /** Extra values `rules` conditions may reference by name. */
    context?: Record<string, unknown>;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    size?: ApexSize;
    statusIcon?: boolean;
    id?: string;
    name?: string;
    /** The control box. */
    background?: string;
    borderColor?: string;
    borderWidth?: string;
    radius?: string;
    hoverBorderColor?: string;
    focusBorderColor?: string;
    /** The whole focus ring shorthand, e.g. `color-mix(...)` or a flat colour. */
    focusRing?: string;
    disabledBackground?: string;
    /** The value and its placeholder. */
    textColor?: string;
    placeholderColor?: string;
    /** Sizing, beyond the three `size` presets. Any CSS length. */
    controlHeight?: string;
    fontSize?: string;
    paddingInline?: string;
    iconSize?: string;
    /** Icons, affixes and the trailing buttons. */
    iconColor?: string;
    affixColor?: string;
    buttonColor?: string;
    /** Label, message line and the required asterisk. */
    labelColor?: string;
    labelFontSize?: string;
    messageColor?: string;
    messageFontSize?: string;
    requiredColor?: string;
    /** The typeahead overlay, where the control has one. */
    popoverBackground?: string;
    popoverBorderColor?: string;
    optionHoverBackground?: string;
    /** Your own class on any part. See ApexFieldClasses. */
    ui?: ApexFieldClasses;
}
/** Resolved display state, provided to controls by ApexField. */
export interface ApexFieldState {
    id: string;
    describedBy: string | undefined;
    tone: ApexTone;
    invalid: boolean;
    message: string | undefined;
    size: ApexSize;
    disabled: boolean;
}
/** Validation adapter contract — wire Zod, Laravel Precognition, or anything else. */
export interface ApexValidationAdapter {
    /** Field-level check. Return an error string, or null/undefined when valid. */
    validateField?(name: string, value: unknown, all?: Record<string, unknown>): string | null | undefined | Promise<string | null | undefined>;
    /** Whole-payload check. Return a map of field name → first error message. */
    validate?(values: Record<string, unknown>): Record<string, string> | Promise<Record<string, string>>;
    /** Called on blur so server-backed adapters can debounce a round trip. */
    touch?(name: string): void;
}
export type OverlayTransitionName = 'scale' | 'slide' | 'fade' | 'none';
/**
 * The four every overlay has.
 *
 * Split from the named presets on purpose: a drawer's built-in animation is
 * its POSITION and a popover has exactly one, so neither has a scale /
 * slide / fade to choose between. Declaring `transition` on them would be
 * another prop that exists and does nothing — the defect this whole pass
 * started from. AF2-332.
 */
export interface ApexOverlayClasses {
    /** Your own enter classes, e.g. 'animate__animated animate__fadeInDown'. */
    enterClass?: string;
    /** Your own leave classes. */
    leaveClass?: string;
    /** Any CSS time, e.g. '300ms'. Applies to the enter phase only. */
    enterDuration?: string;
    /** Any CSS time. Applies to the leave phase only. */
    leaveDuration?: string;
}
/** Those four plus a choice of built-in preset — dialog, form, alert. */
export interface ApexOverlayTransition extends ApexOverlayClasses {
    /** A built-in preset, used when no classes are given. */
    transition?: OverlayTransitionName;
}
export interface ApexUiOptions {
    /** Component name prefix. Default 'Apex'. */
    prefix?: string;
    /** Default size for every control. Default 'md'. */
    size?: ApexSize;
    /** Default label placement. Default 'top'. */
    labelPlacement?: ApexLabelPlacement;
    /**
     * App-wide default for every overlay's entry and exit — a form's modal, an
     * alert, a dialog, a drawer, a popover, a toast.
     *
     * Set it once here and the whole app animates the same way; any overlay's
     * own prop overrides it. This is where animate.css belongs: the library
     * never references it, so `{ enterClass: 'animate__animated
     * animate__fadeInDown' }` is just a string the app chose. AF2-330.
     */
    overlayTransition?: ApexOverlayTransition;
    /**
     * Ripple the buttons the kit renders for itself — a form's Save and
     * Cancel, an alert's answer row — so they behave like the ones the app
     * writes with `v-apex-ripple`.
     *
     * Off by default, and deliberately: a component cannot know that an app
     * uses ripples at all, and turning them on for every existing consumer
     * would be a visual change nobody asked for. Register it once here and
     * the whole app matches; a `ripple` prop on the component overrides it
     * either way. AF2-324.
     */
    ripple?: boolean;
    /**
     * The space between fields in every ApexForm — AF2-394.
     *
     * One CSS gap value: `16` (read as px), `'16px'`, or `'8px 24px'` for
     * rows and columns separately. A section may override it with its own
     * `gap`; unset, forms keep the built-in `18px 20px`.
     *
     * A dense settings pane and a spacious create dialog want different
     * gutters, and until now neither could have one — the value was a
     * literal in the stylesheet.
     */
    formGap?: string | number;
    /** Fallback strings, used when vue-i18n is not installed. */
    messages?: Partial<ApexStrings>;
    /** Global validation adapter. */
    adapter?: ApexValidationAdapter;
    /** Icon resolver — swap Material Symbols for another set. */
    iconResolver?: (name: string) => string;
    /**
     * Decides whether a control may offer its "Add new" row, given the control's
     * `resource`. Register it once and every chooser in the app is gated the same
     * way, instead of each call site repeating the check.
     *
     * Nothing here is tied to any particular authorisation library: return a
     * boolean however you like. With apex-autentica that is
     * `canCreate: (r) => can(permissions, r, 'create')`; with a plain array it is
     * `canCreate: (r) => allowed.includes(r)`.
     *
     * This is UX only. The endpoint that creates the record still has to
     * authorise the request itself.
     */
    canCreate?: (resource: string) => boolean;
    /**
     * The same idea for any action, not just creating: may this user `delete` an
     * `events` record, `export` a `reports` one. Register it once and every
     * control that offers a gated action — an alert's Delete button today, menu
     * items and toolbar actions next — asks the same question.
     *
     * `canCreate` is the special case. When both are registered `canCreate` wins
     * for the create action, so an app that wired only the older one keeps the
     * behaviour it already had.
     *
     * With apex-autentica this is `can: (a, r) => can(permissions, r, a)`; with a
     * plain map it is `can: (a, r) => allowed[r]?.includes(a)`.
     *
     * Also UX only, and the distinction matters more here than it does for an
     * "Add new" row: hiding a Delete button does not stop anyone deleting. The
     * action is still in the shipped bundle and the endpoint behind it is still
     * reachable. What this buys is an interface that tells the truth about what
     * a user can do — the endpoint must authorise the request itself.
     */
    can?: (action: string, resource: string) => boolean;
}
export interface ApexStrings {
    'apexui.select': string;
    'apexui.clear': string;
    'apexui.remove': string;
    'apexui.search': string;
    'apexui.noResults': string;
    'apexui.addNew': string;
    'apexui.showPassword': string;
    'apexui.hidePassword': string;
    'apexui.loading': string;
    'apexui.required': string;
    'apexui.optional': string;
    'apexui.increment': string;
    'apexui.decrement': string;
    'apexui.errorSummaryTitle': string;
    'apexui.alert.yes': string;
    'apexui.alert.cancel': string;
    'apexui.alert.ok': string;
    'apexui.alert.saving': string;
    'apexui.alert.doneTitle': string;
    'apexui.alert.errorTitle': string;
    'apexui.alert.saveErrorTitle': string;
    'apexui.alert.saveErrorMessage': string;
    'apexui.alert.copy': string;
    'apexui.alert.copied': string;
}
