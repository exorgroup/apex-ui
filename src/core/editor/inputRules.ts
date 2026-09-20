/**
 * Input rules — the markdown shorthands.
 *
 * These are conveniences over the same commands a toolbar calls, not a second
 * way to build a document: typing "## " runs exactly the command the H2 button
 * runs, so a document is identical whichever route produced it.
 *
 * Deliberately conservative. A rule that fires when the author did not mean it
 * is worse than one that never fires, because undoing it costs a keystroke and
 * noticing it costs attention — so quote conversion and dash replacement are
 * opt-in rather than on.
 */
import type { Schema } from 'prosemirror-model';

interface Deps {
  inputrules: typeof import('prosemirror-inputrules');
}

export interface InputRuleOptions {
  /** Markdown block shorthands: "# ", "> ", "- ", "1. ", "```". */
  markdown?: boolean;
  /** Inline marks from `code`, **bold**, *italic*. */
  inlineMarks?: boolean;
  /** Curly quotes and apostrophes. Off by default: it rewrites code and
   *  measurements ("6\" pipe") that the author typed deliberately. */
  smartQuotes?: boolean;
  /** En and em dashes, and an ellipsis from three dots. */
  dashes?: boolean;
}

export function buildInputRules(schema: Schema, deps: Deps, options: InputRuleOptions = {}) {
  const ir = deps.inputrules;
  const rules: unknown[] = [];
  const on = (v: boolean | undefined, dflt: boolean) => (v === undefined ? dflt : v);

  if (on(options.dashes, true)) {
    rules.push(ir.emDash, ir.ellipsis);
  }
  if (on(options.smartQuotes, false)) {
    rules.push(ir.smartQuotes[0], ir.smartQuotes[1], ir.smartQuotes[2], ir.smartQuotes[3]);
  }

  if (on(options.markdown, true)) {
    if (schema.nodes.blockquote) {
      rules.push(ir.wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote));
    }
    if (schema.nodes.ordered_list) {
      rules.push(ir.wrappingInputRule(
        /^(\d+)\.\s$/, schema.nodes.ordered_list,
        (match) => ({ order: Number(match[1]) }),
        /* A list that already starts at the typed number should absorb the new
           item rather than starting a second list beside it. */
        (match, node) => node.childCount + (node.attrs.order as number) === Number(match[1]),
      ));
    }
    if (schema.nodes.bullet_list) {
      rules.push(ir.wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list));
    }
    if (schema.nodes.task_list) {
      rules.push(ir.wrappingInputRule(/^\s*\[( |x|X)\]\s$/, schema.nodes.task_list));
    }
    if (schema.nodes.code_block) {
      rules.push(ir.textblockTypeInputRule(/^```([a-z]*)?\s$/, schema.nodes.code_block,
        (match) => ({ language: match[1] || null })));
    }
    if (schema.nodes.heading) {
      rules.push(ir.textblockTypeInputRule(
        new RegExp('^(#{1,6})\\s$'), schema.nodes.heading,
        (match) => ({ level: match[1].length }),
      ));
    }
  }

  if (on(options.inlineMarks, true)) {
    /* Marks are applied by rebuilding the range rather than by a mark input rule,
       which ProseMirror does not provide: the pattern's delimiters have to be
       removed as well as the mark added. */
    const markRule = (pattern: RegExp, markName: string) => {
      const type = schema.marks[markName];
      if (!type) return null;
      /* Written against an untyped engine originally: the handler took
         `state: never` and reached the transaction through three structural
         casts. With prosemirror declared (AF2-276) the real signature applies,
         and the casts were hiding the return type the rule actually needs. */
      return new ir.InputRule(pattern, (state, match, start, end) => {
        const inner = match[1];
        if (!inner) return null;
        const tr = state.tr;
        tr.replaceWith(start, end, schema.text(inner));
        tr.addMark(start, start + inner.length, type.create());
        /* The stored mark is cleared, or the next character typed after the
           closing delimiter would inherit the mark the author just closed. */
        tr.removeStoredMark(type);
        return tr;
      });
    };
    [
      [/(?:`)([^`]+)(?:`)$/, 'code'],
      [/(?:\*\*)([^*]+)(?:\*\*)$/, 'strong'],
      [/(?:^|[^*])(?:\*)([^*]+)(?:\*)$/, 'em'],
      [/(?:~~)([^~]+)(?:~~)$/, 'strike'],
    ].forEach(([pattern, name]) => {
      const rule = markRule(pattern as RegExp, name as string);
      if (rule) rules.push(rule);
    });
  }

  return ir.inputRules({ rules: rules as never });
}
