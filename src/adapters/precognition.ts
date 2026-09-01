import type { ApexValidationAdapter } from '../types';

/**
 * Laravel Precognition bridge.
 *
 *   import { useForm } from 'laravel-precognition-vue';
 *   const form = useForm('post', '/users', { name: '' });
 *   app.use(ApexUI, { adapter: precognitionAdapter(form) });
 *
 * Bind each control's `:error="form.errors.name"` as usual, or let a parent
 * <ApexForm> read errors through this adapter. `touch()` triggers Precognition's
 * debounced server-side validation of that one field.
 */
export interface PrecognitionForm {
  errors: Record<string, string | string[]>;
  validate: (name?: string) => void;
  touch?: (name: string) => void;
  data?: () => Record<string, unknown>;
}

export function precognitionAdapter(form: PrecognitionForm): ApexValidationAdapter {
  const flat = () => {
    const out: Record<string, string> = {};
    Object.entries(form.errors || {}).forEach(([k, v]) => { out[k] = Array.isArray(v) ? v[0] : v; });
    return out;
  };
  return {
    validate: () => flat(),
    validateField: (name) => flat()[name] ?? null,
    touch(name) {
      form.touch?.(name);
      form.validate(name);
    },
  };
}
