import type { ApexPaginatorClasses } from '../types';
type __VLS_Props = {
    /** Your own class on any part. See ApexPaginatorClasses. */
    ui?: ApexPaginatorClasses;
    first?: number;
    rows?: number;
    totalRecords?: number;
    /** Page-size choices; omit to hide the selector. */
    rowsPerPageOptions?: number[];
    /** Page buttons either side of the current one. */
    pageLinks?: number;
    /** e.g. 'Showing {first} to {last} of {total}'. */
    template?: string;
    disabled?: boolean;
};
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:first": (v: number) => any;
    "update:rows": (v: number) => any;
    page: (payload: {
        first: number;
        rows: number;
        page: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:first"?: ((v: number) => any) | undefined;
    "onUpdate:rows"?: ((v: number) => any) | undefined;
    onPage?: ((payload: {
        first: number;
        rows: number;
        page: number;
    }) => any) | undefined;
}>, {
    template: string;
    rows: number;
    first: number;
    totalRecords: number;
    pageLinks: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
