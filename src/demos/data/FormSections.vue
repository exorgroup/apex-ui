<script setup lang="ts">
/**
 * The four worked examples on the ApexForm page — AF2-295.
 *
 * `<script setup>`, unlike the two editor section files: those carry 41
 * pieces of page state written against `this` and were ported as they
 * stood, where this page has exactly one computed value. The right shape
 * follows the content rather than the precedent.
 *
 * Every example renders the SAME schema — one definition through three
 * layouts, read-only and editable, which is the claim the page is making.
 */
import { computed } from 'vue';
import { ApexForm, serverOnlyFields, normaliseFormSchema } from '@exorgroup/apex-ui';
import { FORM_SCHEMA, FORM_MODEL } from '../../formData';

/* Named rather than described: "it looked valid and then the server refused
   it" gets an explanation instead of being a mystery. */
const serverOnly = computed(
  () => serverOnlyFields(normaliseFormSchema(FORM_SCHEMA as never)).join(', ') || 'none',
);
</script>

<template>

        <h2>The values live in one place</h2>
        <p style="font-size:13.5px">ApexForm is a <em>view</em>. It renders a schema, validates locally so a keystroke does not need the network, and displays whatever errors it holds — it never submits. Hand it an Inertia or Precognition form and <em>that</em> object is the source of truth: ApexForm reads and writes through it and keeps no copy. Hand it nothing and it makes an internal one. Never both, because two sources of truth for form state is the defect a form library exists to prevent. It detects capability rather than branching — a Precognition form has <code>validate(field)</code> and an Inertia form does not — so adopting Precognition later is a change of <em>which</em> <code>useForm</code> you import, with no schema and no markup change.</p>

        <h2>Three layouts, two shells, and nothing else</h2>
        <p style="font-size:13.5px">Tabs and sidebar are the <em>same section list in two orientations</em> — one ARIA contract, one keyboard model, one set of error affordances — so a schema switches between them without knowing which is showing. Long renders every section at once. The shells are the same panel, lifted: only where it sits and how tall it may grow differ. Wizard, settings and detail shells are deliberately absent; a section nav is a layout, not a shell.</p>
        <div class="grid grid--2" style="margin-top:12px">
          <div class="cell"><span class="cell__tag">tabs · page</span>
            <ApexForm :schema="FORM_SCHEMA" :model-value="FORM_MODEL" layout="tabs" shell="page"></ApexForm>
          </div>
          <div class="cell"><span class="cell__tag">long · page · read-only</span>
            <ApexForm :schema="FORM_SCHEMA" :model-value="FORM_MODEL" layout="long" shell="page" readonly></ApexForm>
          </div>
        </div>
        <p style="font-size:13px;margin-top:8px">Read-only renders values as <em>text</em>, not as disabled controls: a greyed-out input reads as something the author failed to fill in. Same schema, so a detail page and an edit page are one definition.</p>

        <h2>Where an error is allowed to speak</h2>
        <p style="font-size:13.5px">Once every field carries its own message under its own control, a summary block on top says all of them a second time <em>and</em> pushes the action bar down while doing it — so there is no summary in any layout. What a tabbed form needs instead is a way for an <em>off-screen</em> failure to announce itself: the tab turns red (a filled shape, not an 18px dot, because a dot is invisible to anyone who cannot separate red from grey), carries a count, and lists its errors on hover and on keyboard focus, quoting each field’s own message verbatim rather than rewording it. The list is teleported out of the nav, because a scrolling nav <em>clips</em> an absolutely-positioned child instead of letting it overflow.</p>
        <div style="margin-top:12px">
          <ApexForm :schema="FORM_SCHEMA" :model-value="{}" layout="sidebar" shell="page"></ApexForm>
        </div>
        <p style="font-size:13px;margin-top:8px">Press <b>Save changes</b> above with the form empty. Submit jumps to the first failing section and focuses the first invalid control — which is what a summary’s links were for.</p>

        <h2>The schema is data, all the way down</h2>
        <p style="font-size:13.5px">Conditions are expressions, not functions, because a schema emitted by PHP cannot carry a function: <code>hiddenIf: { custom: true }</code> means “the field <code>custom</code> equals true”. Rules take the Laravel pipe DSL so they can be pasted from a FormRequest and travel inside JSON. About fifteen rules run in the browser — Laravel has ninety, and reimplementing them would guarantee drift from the request that actually decides — so anything unrecognised is retained, never evaluated locally, and <em>reported</em>: <code>serverOnlyFields()</code> names it. On this schema that is <code>{{ serverOnly }}</code>.</p>
        <p style="font-size:13.5px">Two consequences worth stating. Invisible fields are never validated, because blocking a submit on a field the author cannot see is a form’s worst failure and a silent one — the message names a control that is not rendered. And server errors <em>win</em>, and keep winning until that field changes: after a 422 there is no revalidation, so the only way to clear one is to edit the field, and a local rule that happens to pass must not erase what the server said.</p>
</template>
