import { type ApexSeverity } from './ApexButton.vue';
export interface UploadFile {
    /** The browser File. */
    file: File;
    /** Object URL for an image, revoked when the file is removed. */
    preview?: string;
    /** 0–100 while uploading. */
    progress: number;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    error?: string;
}
type __VLS_Props = {
    /** Bindable list of selected Files. */
    modelValue?: File[];
    /** basic is one button; advanced adds the drop area and the file list. */
    mode?: 'basic' | 'advanced';
    /** Field name in the multipart request. */
    name?: string;
    /** Endpoint. Omit with customUpload, or to keep the files client-side. */
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    withCredentials?: boolean;
    multiple?: boolean;
    /** Same syntax as the native input: 'image/*', '.pdf,.docx'. */
    accept?: string;
    /** Size limit per file, in bytes. A file over it is rejected with a message. */
    maxFileSize?: number;
    /** Size limit across the whole selection, in bytes. */
    maxTotalSize?: number;
    /** How many files may be selected at once. */
    maxFiles?: number;
    /** Upload as soon as files are chosen. */
    auto?: boolean;
    /** Emits `uploader` instead of sending the request yourself. */
    customUpload?: boolean;
    disabled?: boolean;
    /** Show the file list as rows, or as a thumbnail grid. */
    layout?: 'list' | 'grid';
    /** Thumbnail size in pixels — row height in list layout, cell width in grid. */
    previewSize?: number;
    /** Hide the built-in button row, e.g. when the header slot replaces it. */
    showButtons?: boolean;
    /** Drop area in advanced mode. */
    dropzone?: boolean;
    chooseLabel?: string;
    uploadLabel?: string;
    cancelLabel?: string;
    chooseIcon?: string;
    uploadIcon?: string;
    cancelIcon?: string;
    /** Colour and weight of each built-in button, straight through to ApexButton. */
    chooseSeverity?: ApexSeverity;
    uploadSeverity?: ApexSeverity;
    cancelSeverity?: ApexSeverity;
    chooseVariant?: 'solid' | 'outlined' | 'text';
    uploadVariant?: 'solid' | 'outlined' | 'text';
    cancelVariant?: 'solid' | 'outlined' | 'text';
    /** Size for all three, and rounded corners. */
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonsRounded?: boolean;
    /** Drop area copy. The hint defaults to the size limit, when there is one. */
    emptyLabel?: string;
    hint?: string;
    invalidTypeMessage?: string;
    invalidSizeMessage?: string;
    invalidLimitMessage?: string;
    width?: string;
    background?: string;
    borderColor?: string;
    radius?: string;
};
declare function formatSize(bytes: number): string;
declare function choose(): void;
declare function removeFile(index: number): void;
declare function removeUploaded(index: number): void;
declare function clear(): void;
declare function upload(): void;
declare var __VLS_8: {
    files: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    uploadedFiles: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    chooseCallback: typeof choose;
    uploadCallback: typeof upload;
    clearCallback: typeof clear;
    removeFileCallback: typeof removeFile;
    removeUploadedFileCallback: typeof removeUploaded;
    progress: number;
    messages: string[];
    formatSize: typeof formatSize;
}, __VLS_37: {
    files: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    uploadedFiles: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    chooseCallback: typeof choose;
    uploadCallback: typeof upload;
    clearCallback: typeof clear;
    removeFileCallback: typeof removeFile;
    removeUploadedFileCallback: typeof removeUploaded;
    progress: number;
    messages: string[];
    formatSize: typeof formatSize;
}, __VLS_39: {
    file: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    };
    index: number;
    removeFileCallback: typeof removeFile;
    formatSize: typeof formatSize;
}, __VLS_56: {}, __VLS_61: {
    files: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    uploadedFiles: {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[];
    chooseCallback: typeof choose;
    uploadCallback: typeof upload;
    clearCallback: typeof clear;
    removeFileCallback: typeof removeFile;
    removeUploadedFileCallback: typeof removeUploaded;
    progress: number;
    messages: string[];
    formatSize: typeof formatSize;
};
type __VLS_Slots = {} & {
    header?: (props: typeof __VLS_8) => any;
} & {
    content?: (props: typeof __VLS_37) => any;
} & {
    file?: (props: typeof __VLS_39) => any;
} & {
    empty?: (props: typeof __VLS_56) => any;
} & {
    footer?: (props: typeof __VLS_61) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    choose: typeof choose;
    upload: typeof upload;
    clear: typeof clear;
    removeFile: typeof removeFile;
    files: import("vue").Ref<{
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[], UploadFile[] | {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[]>;
    uploadedFiles: import("vue").Ref<{
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[], UploadFile[] | {
        file: {
            readonly lastModified: number;
            readonly name: string;
            readonly webkitRelativePath: string;
            readonly size: number;
            readonly type: string;
            arrayBuffer: () => Promise<ArrayBuffer>;
            bytes: () => Promise<Uint8Array<ArrayBuffer>>;
            slice: (start?: number, end?: number, contentType?: string) => Blob;
            stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
            text: () => Promise<string>;
        };
        preview?: string | undefined;
        progress: number;
        status: "pending" | "uploading" | "complete" | "error";
        error?: string | undefined;
    }[]>;
    formatSize: typeof formatSize;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (v: File[]) => void;
    select: (payload?: unknown) => void;
    clear: (payload?: unknown) => void;
    remove: (payload?: unknown) => void;
    "before-upload": (payload: {
        formData: FormData;
        xhr: XMLHttpRequest;
    }) => void;
    progress: (payload: {
        progress: number;
        file?: File;
    }) => void;
    upload: (payload: {
        files: File[];
        response?: unknown;
    }) => void;
    error: (payload: {
        files?: File[];
        message: string;
        xhr?: XMLHttpRequest;
    }) => void;
    uploader: (payload: {
        files: File[];
        clear: () => void;
        setProgress: (n: number) => void;
    }) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onProgress?: ((payload: {
        progress: number;
        file?: File;
    }) => any) | undefined;
    onSelect?: ((payload?: unknown) => any) | undefined;
    onError?: ((payload: {
        files?: File[];
        message: string;
        xhr?: XMLHttpRequest;
    }) => any) | undefined;
    "onUpdate:modelValue"?: ((v: File[]) => any) | undefined;
    onClear?: ((payload?: unknown) => any) | undefined;
    onRemove?: ((payload?: unknown) => any) | undefined;
    onUpload?: ((payload: {
        files: File[];
        response?: unknown;
    }) => any) | undefined;
    "onBefore-upload"?: ((payload: {
        formData: FormData;
        xhr: XMLHttpRequest;
    }) => any) | undefined;
    onUploader?: ((payload: {
        files: File[];
        clear: () => void;
        setProgress: (n: number) => void;
    }) => any) | undefined;
}>, {
    name: string;
    mode: "basic" | "advanced";
    layout: "list" | "grid";
    method: string;
    previewSize: number;
    showButtons: boolean;
    dropzone: boolean;
    chooseLabel: string;
    uploadLabel: string;
    cancelLabel: string;
    chooseIcon: string;
    uploadIcon: string;
    cancelIcon: string;
    chooseSeverity: ApexSeverity;
    uploadSeverity: ApexSeverity;
    cancelSeverity: ApexSeverity;
    chooseVariant: "solid" | "outlined" | "text";
    uploadVariant: "solid" | "outlined" | "text";
    cancelVariant: "solid" | "outlined" | "text";
    emptyLabel: string;
    invalidTypeMessage: string;
    invalidSizeMessage: string;
    invalidLimitMessage: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
