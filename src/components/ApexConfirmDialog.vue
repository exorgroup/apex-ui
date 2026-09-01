<script setup lang="ts">
/**
 * ApexConfirmDialog — the shared confirmation window. Mount one anywhere and
 * every `useApexConfirm().require()` call in the app drives it.
 *
 * Values from `require()` override the declarative props and slots, so a dialog
 * can carry defaults for the common case and still be specialised per call.
 * The `container` slot replaces the whole body for headless use.
 */
import { computed, ref, watch } from 'vue';
import ApexDialog from './ApexDialog.vue';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';
import { useApexConfirm, type ConfirmButton, type ConfirmOptions } from '../core/confirm';

const props = withDefaults(defineProps<{
  /** Only respond to requests carrying this group. */
  group?: string;
  /* declarative defaults — a require() value wins over any of these */
  header?: string;
  message?: string;
  icon?: string;
  iconPosition?: 'top' | 'left' | 'right' | 'bottom';
  iconAnimation?: 'none' | 'pulse' | 'shake' | 'bounce' | 'spin';
  iconColor?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  width?: string;
}>(), {
  iconPosition: 'top', iconAnimation: 'none',
  acceptLabel: 'Yes', rejectLabel: 'Cancel',
});

const confirm = useApexConfirm();
const state = confirm.state;

/** require() values take precedence, falling back to the declarative props. */
const o = computed<ConfirmOptions>(() => state.options || {});
const pick = <K extends keyof ConfirmOptions>(key: K, fallback?: unknown) =>
  (o.value[key] !== undefined ? o.value[key] : fallback);

/* A request carrying a target belongs to ApexConfirmPopup — one service drives
   both, and the presence of a target is what routes between them. */
const mine = computed(() => {
  if (o.value.target) return false;
  return props.group ? o.value.group === props.group : !o.value.group;
});
const open = computed(() => state.visible && mine.value);

const header = computed(() => pick('header', props.header) as string | undefined);
const message = computed(() => pick('message', props.message) as string | undefined);
const icon = computed(() => pick('icon', props.icon) as string | undefined);
const iconPosition = computed(() => pick('iconPosition', props.iconPosition) as string);
const iconAnimation = computed(() => pick('iconAnimation', props.iconAnimation) as string);
const iconColor = computed(() => pick('iconColor', props.iconColor) as string | undefined);

const buttons = computed<ConfirmButton[]>(() => {
  if (o.value.buttons) return o.value.buttons;
  return [
    {
      label: (pick('rejectLabel', props.rejectLabel) as string),
      icon: o.value.rejectIcon,
      severity: o.value.rejectSeverity || 'secondary',
      variant: 'outlined',
      role: 'reject',
    },
    {
      label: (pick('acceptLabel', props.acceptLabel) as string),
      icon: o.value.acceptIcon,
      severity: o.value.acceptSeverity || 'primary',
      variant: 'solid',
      role: 'accept',
    },
  ];
});

/** Re-keyed per request so the icon animation replays on every open. */
const animKey = ref(0);
watch(() => state.seq, () => { animKey.value += 1; });

function onVisible(v: boolean) { if (!v) confirm.close(); }
</script>

<template>
  <ApexDialog :visible="open" :header="$slots.container ? undefined : header"
              :position="(o.position as never) || 'center'"
              :width="pick('width', width) as string" :padding="o.padding"
              :background="o.background" :radius="o.radius"
              :mask-color="o.maskColor" :mask-blur="o.maskBlur"
              :draggable="o.draggable" :closable="o.closable !== false"
              :dismissable-mask="o.dismissableMask" :auto-close="o.autoClose"
              :show-timer="o.showTimer" :transition="o.transition || 'scale'"
              :enter-class="o.enterClass" :leave-class="o.leaveClass"
              content-class="apex-cfm" @update:visible="onVisible">
    <!-- headless: the caller owns the entire body -->
    <slot v-if="$slots.container" name="container" :options="o" :accept="confirm.accept"
          :reject="confirm.reject" :close="confirm.close" :buttons="buttons" />

    <template v-else>
      <div class="apex-cfm__body" :data-icon-pos="iconPosition">
        <slot name="icon" :options="o">
          <img v-if="o.image" class="apex-cfm__image" :src="o.image" :alt="o.imageAlt || ''" />
          <span v-else-if="icon" :key="animKey" class="apex-cfm__icon"
                :data-anim="iconAnimation" :style="iconColor ? { '--cfm-icon': iconColor } : undefined">
            <ApexIcon :name="icon" :size="30" />
          </span>
        </slot>

        <div class="apex-cfm__text">
          <slot name="message" :options="o">
            <p v-if="message" class="apex-cfm__message">{{ message }}</p>
          </slot>
        </div>
      </div>
    </template>

    <template v-if="!$slots.container" #footer>
      <slot name="footer" :accept="confirm.accept" :reject="confirm.reject" :buttons="buttons">
        <div class="apex-cfm__actions">
          <ApexButton v-for="(b, i) in buttons" :key="i" :severity="b.severity" :variant="b.variant"
                      :icon="b.icon" :data-autofocus="b.role === 'accept' ? '' : undefined"
                      @click="confirm.custom(b, i)">{{ b.label }}</ApexButton>
        </div>
        <p v-if="o.footnote" class="apex-cfm__footnote">{{ o.footnote }}</p>
      </slot>
    </template>
  </ApexDialog>
</template>
