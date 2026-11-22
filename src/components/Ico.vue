<script setup>
import { icons } from '@/data/icons'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 16 }
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
