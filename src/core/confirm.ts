import { reactive, readonly } from 'vue';
import type { DialogPosition } from '../components/ApexDialog.vue';

/**
 * Confirm service. One <ApexConfirmDialog> mounted anywhere in the tree serves
 * every `require()` call in the app, so a screen with a dozen destructive
 * actions needs one dialog rather than a dozen pieces of local state.
 *
 * Implemented as a shared reactive request rather than an event stream: the
 * dialog renders whatever request is current, so a second require() while one is
 * open simply replaces it — and a late accept can never resolve the wrong call.
 */
export interface ConfirmButton {
  label: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'contrast';
  variant?: 'solid' | 'outlined' | 'text';
  /** Marks the button that closes without accepting or rejecting. */
  role?: 'accept' | 'reject' | 'cancel';
}

export interface ConfirmOptions {
  /**
   * An element, selector, component ref or the click event itself. Its presence
   * is what routes a request to ApexConfirmPopup rather than ApexConfirmDialog,
   * so one service drives both without the caller choosing a component.
   */
  target?: unknown;
  /** Popup side and alignment, when anchored. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  message?: string;
  header?: string;
  icon?: string;
  /** Where the icon sits relative to the message. */
  iconPosition?: 'top' | 'left' | 'right' | 'bottom';
  /** Pulse, shake or spin the icon on open. */
  iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce' | 'spin';
  iconColor?: string;
  position?: DialogPosition;
  /** An image above the message, instead of an icon. */
  image?: string;
  imageAlt?: string;

  acceptLabel?: string;
  rejectLabel?: string;
  acceptIcon?: string;
  rejectIcon?: string;
  acceptSeverity?: ConfirmButton['severity'];
  rejectSeverity?: ConfirmButton['severity'];
  /** Replaces the default two buttons entirely. */
  buttons?: ConfirmButton[];
  /** A link or note under the buttons. */
  footnote?: string;

  /* dialog pass-through */
  width?: string;
  padding?: string;
  background?: string;
  radius?: string;
  maskColor?: string;
  maskBlur?: boolean;
  draggable?: boolean;
  closable?: boolean;
  dismissableMask?: boolean;
  autoClose?: number;
  showTimer?: boolean;
  transition?: 'scale' | 'slide' | 'fade' | 'none';
  enterClass?: string;
  leaveClass?: string;
  /** Marks a request so a headless container can render its own UI per kind. */
  group?: string;

  accept?: () => void;
  reject?: () => void;
  /** Fired for a third button, or a cancel. */
  onCustom?: (button: ConfirmButton, index: number) => void;
}

interface ConfirmState {
  visible: boolean;
  options: ConfirmOptions;
  /** Bumped per request, so the dialog can restart its icon animation. */
  seq: number;
}

const state = reactive<ConfirmState>({ visible: false, options: {}, seq: 0 });

export function useApexConfirm() {
  return {
    state: readonly(state) as ConfirmState,
    /** Opens the shared dialog with these options. */
    require(options: ConfirmOptions) {
      state.options = options;
      state.seq += 1;
      state.visible = true;
    },
    close() { state.visible = false; },
    accept() {
      const fn = state.options.accept;
      state.visible = false;
      fn?.();
    },
    reject() {
      const fn = state.options.reject;
      state.visible = false;
      fn?.();
    },
    custom(button: ConfirmButton, index: number) {
      const opts = state.options;
      state.visible = false;
      if (button.role === 'accept') opts.accept?.();
      else if (button.role === 'reject') opts.reject?.();
      else opts.onCustom?.(button, index);
    },
  };
}

/** Internal handle for ApexConfirmDialog, which needs the writable state. */
export const __confirmState = state;
