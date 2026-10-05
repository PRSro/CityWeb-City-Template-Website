<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    value: string
    name: string
    label: string
    description?: string
    disabled?: boolean
  }>(),
  { modelValue: undefined, description: undefined, disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const uid = useId()
const inputId = computed(() => `radio-${uid}`)
const descId = computed(() => (props.description ? `${inputId.value}-desc` : undefined))

function select() {
  if (props.disabled) return
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div
    class="relative flex items-start gap-2.5 cursor-pointer select-none"
    :class="props.disabled ? 'cursor-not-allowed opacity-50' : ''"
    @click="select"
  >
    <div
      class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150"
      :class="props.modelValue === props.value
        ? 'border-action bg-action'
        : 'border-control-border bg-surface hover:border-action'"
    >
      <input
        :id="inputId"
        :name="props.name"
        :value="props.value"
        type="radio"
        class="sr-only"
        :checked="props.modelValue === props.value"
        :disabled="props.disabled"
        :aria-describedby="descId"
        @change="select"
      >
      <span
        v-if="props.modelValue === props.value"
        class="h-2 w-2 rounded-full bg-surface"
      />
    </div>

    <div class="min-w-0">
      <label
        :for="inputId"
        class="block cursor-pointer font-ui text-body font-medium text-text"
        :class="props.disabled ? 'cursor-not-allowed' : ''"
      >
        {{ props.label }}
      </label>
      <p
        v-if="props.description"
        :id="descId"
        class="mt-0.5 font-body text-caption text-text-muted"
      >
        {{ props.description }}
      </p>
    </div>
  </div>
</template>
