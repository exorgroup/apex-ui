import type { ApexValidationAdapter } from '../types';

/**
 * Zod adapter. Pass any object schema.
 *   app.use(ApexUI, { adapter: zodAdapter(UserSchema) })
 * Zod is not a dependency of this package — the schema is duck-typed.
 */
export function zodAdapter(schema: {
  safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ path: Array<string | number>; message: string }> } };
}): ApexValidationAdapter {
  const run = (values: Record<string, unknown>) => {
    const res = schema.safeParse(values);
    const out: Record<string, string> = {};
    if (!res.success && res.error) {
      res.error.issues.forEach((i) => {
        const key = i.path.join('.');
        if (!(key in out)) out[key] = i.message;
      });
    }
    return out;
  };
  return {
    validate: run,
    validateField(name, _value, all) { return run(all || {})[name] ?? null; },
  };
}
