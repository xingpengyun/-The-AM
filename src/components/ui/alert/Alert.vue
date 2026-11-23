<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'error' | 'info' | 'success'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), { variant: 'info' })

const tone: Record<NonNullable<Props['variant']>, string> = {
  error: 'border-destructive/30 bg-destructive-soft text-destructive-ink',
  info: 'border-border bg-muted text-foreground',
  success: 'border-transparent bg-candy-mint text-candy-mint-ink'
}

const classes = computed(() => cn('rounded-[10px] border px-3 py-2.5 text-[12px] font-medium', tone[props.variant], props.class))
</script>

<template>
  <div role="alert" :class="classes">
    <slot />
  </div>
</template>
