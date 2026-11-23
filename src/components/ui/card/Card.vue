<script lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'

export const cardVariants = cva('rounded-[var(--radius)] border shadow-card', {
  variants: {
    tone: {
      plain: 'border-border bg-card text-card-foreground',
      mint: 'border-border bg-[linear-gradient(135deg,var(--candy-mint),#FFFFFF_74%)] text-card-foreground',
      peach: 'border-border bg-[linear-gradient(135deg,var(--candy-peach),#FFFFFF_74%)] text-card-foreground',
      lemon: 'border-border bg-[linear-gradient(135deg,var(--candy-lemon),#FFFFFF_74%)] text-card-foreground',
      sakura: 'border-border bg-[linear-gradient(135deg,var(--candy-sakura),#FFFFFF_74%)] text-card-foreground',
      lavender: 'border-border bg-[linear-gradient(135deg,var(--candy-lavender),#FFFFFF_74%)] text-card-foreground',
      sky: 'border-border bg-[linear-gradient(135deg,var(--candy-sky),#FFFFFF_74%)] text-card-foreground'
    }
  },
  defaultVariants: { tone: 'plain' }
})

export type CardTone = VariantProps<typeof cardVariants>['tone']
</script>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  tone?: CardTone
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), { tone: 'plain' })

const classes = computed(() => cn(cardVariants({ tone: props.tone }), props.class))
</script>

<template>
  <section :class="classes">
    <slot />
  </section>
</template>
