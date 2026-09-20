/**
 * Media.
 *
 * The editor does not upload anything. It emits an intent — "this file wants to
 * become an image" — and the application answers with a URL. Anything else would
 * mean the component knowing about endpoints, auth headers, retry policy and
 * progress reporting, all of which belong to the app that owns the storage.
 *
 * What the editor does own is the part an app should not have to solve: holding a
 * placeholder while the upload runs, keeping it attached to the right position as
 * the document is edited around it, and replacing or removing it when the promise
 * settles.
 */
import type { NodeSpec } from 'prosemirror-model';
import type { Command } from 'prosemirror-state';
/**
 * An image is a FIGURE, not a bare img.
 *
 * A caption is part of what an image means in a document, and expressing it as
 * a following paragraph would let the two drift apart on any edit — a reorder
 * would leave the caption under someone else's picture. So the caption is
 * content of the node.
 */
export declare const mediaNodes: Record<string, NodeSpec>;
export interface EmbedProvider {
    name: string;
    /** Pulls the id out of a watch URL, a share URL or an embed URL. */
    match: (url: string) => string | null;
    /** Builds the iframe src from the id. */
    src: (id: string) => string;
    aspect?: number;
}
/**
 * The providers we recognise.
 *
 * A closed list rather than "any iframe": an editor that accepted arbitrary
 * embed HTML would be a way to put third-party script into every document that
 * used it, and no amount of sanitising the surrounding markup changes that.
 */
export declare const EMBED_PROVIDERS: EmbedProvider[];
export declare function matchEmbed(url: string): {
    provider: string;
    videoId: string;
} | null;
export declare function embedSrc(provider: string, videoId: string): string | null;
/**
 * The embed's editing view.
 *
 * A preview card, not a live iframe. An iframe inside contenteditable swallows
 * every pointer event, so the node cannot be selected, dragged or deleted — and
 * in an editor the reader is arranging a document rather than watching a video.
 * The real iframe is what a *renderer* builds from the same two attributes.
 *
 * Kept apart from `toDOM`, which stays the storage shape: the document should
 * serialise to provider and id, not to a third party's markup.
 */
export declare function embedNodeView(node: {
    attrs: Record<string, unknown>;
}): {
    dom: HTMLDivElement;
};
/**
 * The narrowest an image may be dragged, in pixels.
 *
 * Not zero: a picture dragged to nothing cannot be grabbed again, and
 * the author is left with a node they can only remove by selecting it
 * blind. 24px is still a thumbnail and still has grips to hold.
 */
export declare const MIN_IMAGE_WIDTH = 24;
/**
 * The width a drag would produce, in whole pixels.
 *
 * Clamped to the column: an image wider than the text it sits in is not
 * something a drag should be able to ask for, and `max-inline-size` would
 * overrule it anyway - leaving a stored number that does not match what
 * is on screen. Never below `MIN_IMAGE_WIDTH` either, since a picture
 * dragged to nothing cannot be grabbed again.
 */
export declare function dragWidth(startPx: number, dx: number, columnPx: number): number;
/**
 * The image node view: a figure you can resize by dragging a corner.
 *
 * Two things it must not do, both learned elsewhere in the kit. It must
 * not dispatch a transaction per pointer move - that is one undo step per
 * pixel, and an author who resizes an image and then presses Ctrl+Z two
 * hundred times is entitled to be angry. So the drag writes a CSS custom
 * property straight onto the figure and ONE transaction lands on release.
 *
 * And the handles are not part of the document. They are chrome, appended
 * beside the content and marked `contenteditable=false`, with
 * `ignoreMutation` keeping ProseMirror from rebuilding the node every time
 * a class changes on one. The serialised shape stays exactly what `toDOM`
 * says it is.
 *
 * Four corners and no edges, deliberately. An edge handle on a node whose
 * height follows its width would promise a free-form resize the model
 * cannot store: the schema keeps a ratio of the column and nothing else,
 * so every handle does the same thing and the aspect ratio can never be
 * wrong.
 */
export declare function imageNodeView(node: import('prosemirror-model').Node, view: import('prosemirror-view').EditorView, getPos: () => number | undefined, deps?: {
    state: typeof import('prosemirror-state');
}): {
    dom: HTMLElement | HTMLSpanElement;
    update(next: import("prosemirror-model").Node): boolean;
    selectNode(): void;
    deselectNode(): void;
    ignoreMutation(): boolean;
    destroy(): void;
};
/**
 * The upload placeholder plugin.
 *
 * A decoration rather than a real node, for two reasons. A node would be part of
 * the document, so a save mid-upload would persist a placeholder and an undo
 * could resurrect one whose upload had already finished. And a decoration set is
 * mapped through every transaction for free — so the placeholder stays where the
 * file was dropped even as text is typed above it, which is exactly the case a
 * stored position gets wrong.
 */
export type UploadPlaceholderPlugin = import('prosemirror-state').Plugin & {
    /**
     * The key this plugin stores its decorations under.
     *
     * Attached to the plugin because a caller CANNOT get it any other way,
     * and the obvious guess is wrong in a way nothing reports: a
     * ProseMirror `Plugin.key` is the key's NAME, a string. `setMeta`
     * accepts that string and indexes by it, so adding a placeholder
     * appears to work — and `getState` is not a method on a string, so
     * removing one throws, the placeholder never goes, and the picture is
     * never inserted. That was the bug: an upload that succeeded on the
     * server and left a grey box in the document for ever.
     */
    uploadKey: import('prosemirror-state').PluginKey;
};
export declare function uploadPlaceholderPlugin(deps: {
    state: typeof import('prosemirror-state');
    view: typeof import('prosemirror-view');
}): UploadPlaceholderPlugin;
/** Finds a placeholder's current position, or null if it is gone. */
export declare function placeholderPos(key: import('prosemirror-state').PluginKey, state: import('prosemirror-state').EditorState, id: object): number | null;
export interface UploadRequest {
    file: File;
    /** Resolve with a URL to keep the image, reject to remove the placeholder. */
    resolve: (result: {
        src: string;
        alt?: string;
        width?: string;
    }) => void;
    reject: (reason?: unknown) => void;
}
export type UploadHandler = (request: UploadRequest) => void;
/** Whether a dropped or pasted file is something we can turn into an image. */
export declare function isImageFile(file: File): boolean;
export interface MediaCommandDeps {
    state: typeof import('prosemirror-state');
}
export declare function buildMediaCommands(schema: import('prosemirror-model').Schema, deps: MediaCommandDeps): Record<string, Command>;
/**
 * The image commands that need a VALUE: a width, a height, a
 * description, a wrapping mode.
 *
 * Kept apart from the registry above because they are factories rather
 * than commands - `image_width` is not something that can be run, only
 * something that can be run WITH a number. The bar has always called
 * them (`run('image_width', value)`) and the prose editor had none of
 * them, so its width select changed nothing and its alternative
 * description could not be typed into at all.
 */
export declare function buildMediaValueCommands(schema: import('prosemirror-model').Schema): Record<string, (value: string | null) => Command>;
/**
 * Sets an attribute on the selected media node.
 *
 * Works from the node selection rather than a stored reference, because the
 * document may have been edited since the toolbar was drawn and a stale position
 * would set the attribute on whatever now occupies it.
 */
export declare function setMediaAttr(attr: string, value: string | null, toggle?: boolean): Command;
