<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, dismissToast } = useToast()

const dotClass: Record<ToastType, string> = {
  info: 'bg-primary',
  success: 'bg-candy-mint-ink',
  warning: 'bg-candy-lemon-ink',
  error: 'bg-destructive'
}
</script>

<template>
  <div class="pointer-events-none fixed right-5 top-5 z-[200] flex w-[min(340px,calc(100vw-40px))] flex-col gap-2">
    <TransitionGroup
      enter-active-class="animate-toast-in"
      leave-active-class="animate-toast-out"
      move-class="transition-transform duration-150"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        class="pointer-events-auto flex items-start gap-2.5 rounded-[10px] border border-border bg-popover px-3.5 py-2.5 text-[12.5px] font-medium text-foreground shadow-pop"
        role="status"
      >
        <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" :class="dotClass[item.type]" />
        <span class="flex-1 leading-relaxed">{{ item.text }}</span>
        <button
          class="mt-0.5 grid h-4 w-4 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
          type="button"
          aria-label="关闭提示"
          @click="dismissToast(item.id)"
        >
          <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
