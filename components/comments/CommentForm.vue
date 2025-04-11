<script setup lang="ts">
const commentText = ref("");
const isFormLoading = ref(false);

const props = defineProps<{
  isFormLoading: boolean;
}>();

const emits = defineEmits(["submit"]);

const addComment = () => {
  if (commentText.value.trim()) {
    emits("submit", commentText.value);
    commentText.value = "";
  }
};
</script>

<template>
  <form @submit.prevent="addComment" class="flex gap-2">
    <input
      v-model="commentText"
      type="text"
      :placeholder="$t('addComment')"
      class="flex-1 px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F02C56]"
    />
    <button
      type="submit"
      class="px-4 py-2 bg-[#F02C56] text-white rounded-md hover:bg-[#ae1c3c] transition-colors cursor-pointer disabled:bg-gray-400"
      :disabled="!commentText.trim() || isFormLoading"
    >
      <IconsLoader v-if="isFormLoading" class="h-5 w-5 animate-spin" />
      <span v-else>{{ $t("post") }}</span>
    </button>
  </form>
</template>
