<!-- HhProgressBar: shows numeric progress with a filled bar -->
<template>
  <div class="hh-progress">
    <div class="hh-progress__track">
      <div
        class="hh-progress__fill"
        :class="`hh-progress__fill--${variant}`"
        :style="{ width: `${clampedPct}%` }"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="max"
      />
    </div>
    <span v-if="showLabel" class="hh-progress__label">
      {{ value }}&thinsp;/&thinsp;{{ max }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value:     { type: Number, default: 0 },
  max:       { type: Number, default: 100 },
  variant:   { type: String, default: 'accent' }, // accent | success | navy
  showLabel: { type: Boolean, default: true },
})

const clampedPct = computed(() =>
  props.max > 0 ? Math.min(100, Math.round((props.value / props.max) * 100)) : 0
)
</script>

<style scoped>
.hh-progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.hh-progress__track {
  flex: 1;
  height: 8px;
  background: var(--color-hh-gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.hh-progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.hh-progress__fill--accent  { background: var(--color-accent); }
.hh-progress__fill--success { background: #2DA864; }
.hh-progress__fill--navy    { background: var(--color-hh-navy); }

.hh-progress__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  white-space: nowrap;
  min-width: 5ch;
  text-align: right;
}
</style>
