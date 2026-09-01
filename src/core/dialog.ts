import { markRaw, reactive, readonly } from 'vue';
import type { Component } from 'vue';
import type { DialogPosition } from '../components/ApexDialog.vue';

/**
 * Dialog service. One <ApexDynamicDialog> mounted anywhere in the tree renders
 * every dialog opened with `open()`, so a component can be shown in a dialog
 * without the caller keeping visible state or importing a dialog anywhere.
 *
 * Unlike the confirm service this holds a STACK: opening a second dialog over
 * the first is normal (a picker over a form), so each instance keeps its own
 * options and z-index and closes independently.
 */
export interface DynamicDialogOptions {
  /** ApexDialog props — header, width, position, modal, draggable and the rest. */
  props?: Record<string, unknown>;
  /** Props passed to the loaded component itself. */
  contentProps?: Record<string, unknown>;
  /** Read by the loaded component through its injected dialogRef. */
  data?: unknown;
  /** Handlers for events the loaded component emits. */
  emits?: Record<string, (...args: unknown[]) => void>;
  /** Components rendered into the dialog's header and footer slots. */
  templates?: { header?: Component; footer?: Component };
  /** Receives whatever the component passed to dialogRef.close(). */
  onClose?: (result: { data?: unknown }) => void;
}

export interface DynamicDialogInstance {
  id: number;
  component: Component;
  options: DynamicDialogOptions;
  visible: boolean;
  /** Result held from close() until the leave transition ends. */
  result?: { data?: unknown };
}

export interface DynamicDialogHandle {
  id: number;
  /** Closes from the caller's side; the data reaches onClose. */
  close: (data?: unknown) => void;
}

interface DialogState {
  instances: DynamicDialogInstance[];
  seq: number;
}

const state = reactive<DialogState>({ instances: [], seq: 0 });

/** Each dialog sits above the one it was opened from. */
export const DIALOG_BASE_Z = 1000;
export const dialogZ = (index: number) => DIALOG_BASE_Z + index * 10;

function hide(id: number, data?: unknown) {
  const inst = state.instances.find((i) => i.id === id);
  if (!inst || !inst.visible) return;
  inst.result = { data };
  inst.visible = false;
}

/** Called once the leave transition ends, so onClose fires after the animation. */
function destroy(id: number) {
  const i = state.instances.findIndex((x) => x.id === id);
  if (i < 0) return;
  const inst = state.instances[i];
  state.instances.splice(i, 1);
  inst.options.onClose?.(inst.result || {});
}

export function useApexDialog() {
  return {
    state: readonly(state) as DialogState,
    /** Opens `component` in a dialog and returns a handle that can close it. */
    open(component: Component, options: DynamicDialogOptions = {}): DynamicDialogHandle {
      state.seq += 1;
      const id = state.seq;
      /* markRaw keeps Vue from making the component definition reactive, which
         would warn and slow every render of the loaded component. */
      state.instances.push({ id, component: markRaw(component), options, visible: true });
      return { id, close: (data?: unknown) => hide(id, data) };
    },
    close(id: number, data?: unknown) { hide(id, data); },
    /** Closes every open dialog, e.g. on a route change. */
    closeAll() { state.instances.forEach((i) => hide(i.id)); },
  };
}

/** Internal handles for ApexDynamicDialog, which needs the writable state. */
export const __dialogState = state;
export const __dialogHide = hide;
export const __dialogDestroy = destroy;

export type { DialogPosition };
