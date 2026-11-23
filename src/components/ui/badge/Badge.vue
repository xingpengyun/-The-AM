<script lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-[5px] border px-2 py-0.5 text-[10.5px] font-semibold',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-muted-foreground',
        mint: 'border-transparent bg-candy-mint text-candy-mint-ink',
        peach: 'border-transparent bg-candy-peach text-candy-peach-ink',
        lemon: 'border-transparent bg-candy-lemon text-candy-lemon-ink',
        sakura: 'border-transparent bg-candy-sakura text-candy-sakura-ink',
        lavender: 'border-transparent bg-candy-lavender text-candy-lavender-ink',
        sky: 'border-transparent bg-candy-sky text-candy-sky-ink'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
</script>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: BadgeVariant
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' })

const classes = computed(() => cn(badgeVariants({ variant: props.variant }), props.class))
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
