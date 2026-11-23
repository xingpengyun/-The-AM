<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger
} from 'reka-ui'

interface Props {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
}

withDefaults(defineProps<Props>(), { side: 'top', delay: 200 })
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot name="trigger" />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side"
          :side-offset="8"
          class="z-[120] rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-white shadow-pop"
        >
          {{ content }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
