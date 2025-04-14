<script setup lang="ts">
import type { IComment } from "~/types/user.type";

const commentText = ref("");
const isFormLoading = ref(false);
const commentInput = ref<HTMLInputElement | null>(null);
const showTag = ref(false);
const tagName = ref("");

const props = defineProps<{
  isFormLoading: boolean;
  replyComment?: IComment;
  discussionId?: number;
}>();

const emits = defineEmits(["submit", "removeReply"]);

watch(
  () => props.replyComment,
  () => {
    if (props.replyComment) {
      tagName.value = `@${props.replyComment.profile?.name}`;
      showTag.value = true;

      nextTick(() => {
        if (commentInput.value) {
          commentInput.value.focus();
          const position = commentText.value.length;
          commentInput.value.setSelectionRange(position, position);
        }
      });
    }
  }
);

const addComment = () => {
  if (commentText.value.trim()) {
    const result = tagName.value ? `${tagName.value}, ${commentText.value}` : commentText.value;
    emits("submit", result, props.discussionId);
    commentText.value = "";
    showTag.value = false;
    tagName.value = "";
  }
};

const removeTag = () => {
  commentText.value = commentText.value.replace(tagName.value + ", ", "");
  showTag.value = false;
  tagName.value = "";
  emits("removeReply");
};

const handleInput = (e: Event) => {
  if (showTag.value) {
    const input = e.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;

    if (cursorPos < tagName.value.length) {
      input.value = tagName.value + ", " + input.value.slice(tagName.value.length + 2);
      input.setSelectionRange(tagName.value.length + 2, tagName.value.length + 2);
    }
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (showTag.value && e.key === "Backspace") {
    const input = e.target as HTMLInputElement;
    const cursorPos = input.selectionStart || 0;

    if (cursorPos <= 0) {
      e.preventDefault();
      removeTag();
    }
  }
};
</script>

<template>
  <form @submit.prevent="addComment" class="flex gap-2 items-center relative">
    <div class="flex-1 relative">
      <div
        v-if="showTag"
        class="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center bg-[#ae1c3c] dark:bg-[#ae1c3c] rounded px-2 py-0.5 mr-1 z-10"
      >
        <span class="text-sm">{{ tagName }}</span>
        <button
          type="button"
          @click="removeTag"
          class="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 "
        >
          <IconsClose class="w-3 aspect-square text-white" />
        </button>
      </div>
      <input
        ref="commentInput"
        v-model="commentText"
        type="text"
        :placeholder="$t(showTag ? 'reply' : 'addComment')"
        @input="handleInput"
        @keydown="handleKeyDown"
        class="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F02C56]"
        :style="{ paddingLeft: showTag ? `${tagName.length * 9 + 32}px` : '1rem' }"
      />
    </div>
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
