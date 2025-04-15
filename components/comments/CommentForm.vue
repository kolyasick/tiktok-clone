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

</script>

<template>
  <div
    v-if="showTag"
    class="absolute w-full bottom-16 left-0 right-0 flex items-center dark:bg-neutral-800 bg-gray-50 border border-gray-300 dark:border-neutral-700 rounded-t-md px-4 py-1 z-10"
  >
    <div v-if="replyComment" class="flex gap-3 relative w-full">
      <NuxtLink
        :to="
          $localePath({
            name: 'profile-name',
            params: { name: $authStore.profile?.name },
          })
        "
      >
        <img
          :src="'/upload/avatars/' + replyComment?.profile?.avatar"
          class="xl:w-10 w-8 aspect-square rounded-full object-cover"
          :alt="replyComment?.profile?.name"
        />
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="
              $localePath({
                name: 'profile-name',
                params: { name: $authStore.profile?.name },
              })
            "
            class="font-semibold dark:text-white hover:underline"
            >{{ replyComment?.profile?.name }}</NuxtLink
          >
          <span class="text-gray-500 dark:text-gray-400 text-xs">{{
            formatRelativeTime(replyComment.createdAt)
          }}</span>
        </div>
        <p class="text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
          {{ replyComment?.text }}
        </p>
      </div>
    </div>
    <button
      type="button"
      @click="removeTag"
      class="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    >
      <IconsClose class="w-5 aspect-square dark:text-white text-black" />
    </button>
  </div>
  <div
    class="absolute bottom-0 left-0 rounded-b-xl right-0 p-4 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900"
  >
    <form @submit.prevent="addComment" class="flex gap-2 items-center relative">
      <div class="flex-1 relative">
        <input
          ref="commentInput"
          v-model="commentText"
          type="text"
          :placeholder="$t(showTag ? 'reply' : 'addComment')"
          class="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F02C56]"
        />
      </div>
    </form>
  </div>
</template>
