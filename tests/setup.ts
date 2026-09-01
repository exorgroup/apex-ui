import { config } from '@vue/test-utils';

// Material Symbols are a font; nothing to stub. Silence Vue's missing-injection warnings.
config.global.provide = {};
