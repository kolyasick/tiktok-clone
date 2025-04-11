<script setup lang="ts">
import type { IComment } from "~/types/user.type";

const { $authStore, $generalStore } = useNuxtApp();

type Props = {
  comment: IComment;
};

const props = defineProps<Props>();
const emits = defineEmits(["like", "dislike"]);

const likeComment = () => {
  emits("like", props.comment);
};

const dislikeComment = () => {
  emits("dislike", props.comment);
};
</script>

<template>
  <div class="flex gap-3 relative">
    <NuxtLink
      :to="
        $localePath({
          name: 'profile-name',
          params: { name: $authStore.profile?.name },
        })
      "
    >
      <img
        :src="'/upload/avatars/' + comment.profile?.avatar"
        class="xl:w-10 w-8 aspect-square rounded-full object-cover"
        :alt="comment.profile?.name"
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
          >{{ comment.profile?.name }}</NuxtLink
        >
        <span class="text-gray-500 dark:text-gray-400 text-xs">{{ formatRelativeTime(comment.createdAt) }}</span>
      </div>
      <p class="text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
        {{ comment.text }}
      </p>
      <div class="flex items-start gap-2 mt-1">
        <button @click="likeComment" class="hover:text-gray-400 flex items-center gap-1">
          <IconsLike class="w-6 h-6" :class="{ 'text-red-500': comment.liked }" />
          <span class="text-xs">{{ comment.likes?.length || "" }}</span>
        </button>
        <button @click="dislikeComment" class="hover:text-gray-400 flex items-center gap-1">
          <IconsDislike class="w-6 h-6" :class="{ 'text-red-500': comment.disliked }" />
          <span class="text-xs">{{ comment.dislikes?.length || "" }}</span>
        </button>
      </div>
      <slot name="replies-button"></slot>
    </div>
  </div>
</template>
