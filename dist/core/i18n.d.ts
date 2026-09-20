import type { ApexStrings } from '../types';
export declare const APEX_FALLBACK_STRINGS: ApexStrings;
/**
 * Uses vue-i18n's `$t` when the host app has it installed, otherwise falls back
 * to plugin-supplied messages, then to the built-in English strings.
 * Translate by adding the `apexui.*` keys to your own locale files.
 */
export declare function useApexI18n(): (key: keyof ApexStrings, fallback?: string) => string;
