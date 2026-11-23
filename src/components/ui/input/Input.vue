<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

defineOptions({ inheritAttrs: false })

interface Props {
  modelValue?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const emits = defineEmits<{
  'update:modelValue': [value: string]
  enter: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)

defineExpose({ focus: () => inputRef.value?.focus() })

const classes = computed(() =>
  cn(
    'flex h-[38px] w-full rounded-[9px] border border-input bg-background px-3 py-2 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground hover:border-input-hover focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    props.class
  )
)

function onInput(event: Event): void {
  emits('update:modelValue', (event.target as HTMLInputElement).value)
}

function onKeyup(event: KeyboardEvent): void {
  if (event.key === 'Enter') emits('enter')
}
</script>

<template>
  <input
    ref="inputRef"
    :value="modelValue"
    :class="classes"
    v-bind="$attrs"
    @input="onInput"
    @keyup="onKeyup"
  />
</template>
