<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-full bg-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
    aria-label="Toggle theme"
  >
    <Icon :name="colorMode.value === 'dark' ? 'ph:sun' : 'ph:moon'" class="w-6 h-6 text-gray-800 dark:text-gray-200" />
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>
