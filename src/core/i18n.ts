import { getCurrentInstance, inject } from 'vue';
import { APEX_UI_OPTIONS } from './symbols';
import type { ApexStrings, ApexUiOptions } from '../types';

export const APEX_FALLBACK_STRINGS: ApexStrings = {
  'apexui.select': 'Select…',
  'apexui.clear': 'Clear',
  'apexui.remove': 'Remove',
  'apexui.search': 'Search',
  'apexui.noResults': 'No matches',
  'apexui.showPassword': 'Show password',
  'apexui.hidePassword': 'Hide password',
  'apexui.loading': 'Loading',
  'apexui.required': 'Required',
  'apexui.optional': 'Optional',
  'apexui.increment': 'Increase',
  'apexui.decrement': 'Decrease',
  'apexui.errorSummaryTitle': 'Fix the following before continuing',
};

/**
 * Uses vue-i18n's `$t` when the host app has it installed, otherwise falls back
 * to plugin-supplied messages, then to the built-in English strings.
 * Translate by adding the `apexui.*` keys to your own locale files.
 */
export function useApexI18n() {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});
  const inst = getCurrentInstance();
  const globalT = (inst?.appContext.config.globalProperties as Record<string, unknown> | undefined)?.$t;

  return function t(key: keyof ApexStrings, fallback?: string): string {
    if (typeof globalT === 'function') {
      const out = (globalT as (k: string) => string)(key);
      if (out && out !== key) return out;
    }
    return opts.messages?.[key] ?? fallback ?? APEX_FALLBACK_STRINGS[key];
  };
}
