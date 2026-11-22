<script setup lang="ts">
import { icons, type IconName } from '@/data/icons'

interface Props {
  name: IconName
  size?: number | string
}

withDefaults(defineProps<Props>(), {
  size: 16
})
</script>

<template>
  <svg
    class="ico"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="icons[name] || ''"
  ></svg>
</template>
