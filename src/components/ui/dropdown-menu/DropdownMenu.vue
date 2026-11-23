<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from 'reka-ui'
import Ico from '@/components/Ico.vue'
import { cn } from '@/lib/utils'
import type { MenuItem } from './types'

interface Props {
  items: MenuItem[]
  align?: 'start' | 'center' | 'end'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), { align: 'end' })

const emits = defineEmits<{
  select: [key: string]
}>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <slot name="trigger" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :align="align"
        :side-offset="8"
        :class="
          cn(
            'z-[120] min-w-[196px] rounded-[10px] border border-border bg-popover p-1.5 text-popover-foreground shadow-pop focus:outline-none',
            props.class
          )
        "
      >
        <template v-for="item in items" :key="item.key">
          <DropdownMenuSeparator v-if="item.separator" class="-mx-1 my-1 h-px bg-border" />
          <DropdownMenuItem
            v-else
            class="flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-[12.5px] font-medium text-foreground outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
            @select="emits('select', item.key)"
          >
            <Ico v-if="item.icon" :name="item.icon" :size="15" class="text-muted-foreground" />
            <span>{{ item.label }}</span>
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
