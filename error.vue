<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps({
  error: Object as () => NuxtError,
});
</script>

<template>
  <section class="flex min-h-screen flex-col items-center justify-center">
    <h1 class="mb-2 text-9xl font-bold text-gray-900 dark:text-white">
      {{ error?.statusCode }}
    </h1>
    <p class="mb-10 text-xl sm:text-3xl text-gray-900 dark:text-white">
      {{ error?.statusMessage }}
    </p>
    <a
      href="/"
      class="px-4 py-2 text-white bg-gray-800 dark:bg-[#2a2a2a] rounded-md text-lg cursor-pointer"
      >{{ $t('errors.goHome') }}</a
    >
  </section>
</template>
