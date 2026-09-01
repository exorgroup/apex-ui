import type { InjectionKey } from 'vue';
import type { ApexUiOptions, ApexValidationAdapter } from '../types';

export const APEX_UI_OPTIONS: InjectionKey<ApexUiOptions> | string = Symbol('apex-ui:options');
export const APEX_ADAPTER: InjectionKey<ApexValidationAdapter> | string = Symbol('apex-ui:adapter');
