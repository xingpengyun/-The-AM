<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: boolean
  id?: string
  class?: HTMLAttributes['class']
}

withDefaults(defineProps<Props>(), { modelValue: false })

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function onUpdate(value: boolean | 'indeterminate'): void {
  emits('update:modelValue', value === true)
}
</script>

<template>
  <CheckboxRoot
    :id="id"
    :model-value="modelValue"
    :class="
      cn(
        'peer grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border border-login-border bg-login-field text-primary-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        $props.class
      )
    "
    @update:model-value="onUpdate"
  >
    <CheckboxIndicator class="grid place-items-center">
      <svg
        viewBox="0 0 24 24"
        class="h-3 w-3"
        fill="none"
        stroke="currentColor"
        stroke-width="3.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
