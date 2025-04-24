<script setup lang="ts">
import type { IComment } from "~/types/user.type";
import { ref, computed } from "vue";

const { $authStore, $generalStore } = useNuxtApp();

type Props = {
  comment: IComment;
  discussionId?: number;
};

const props = defineProps<Props>();
const emits = defineEmits(["like", "dislike", "reply"]);

const isExpanded = ref(false);
const MAX_PREVIEW_LENGTH = 200; // Максимальная длина текста для предпросмотра

const likeComment = () => {
  emits("like", props.comment);
};

const dislikeComment = () => {
  emits("dislike", props.comment);
};

// Проверяем, нужно ли показывать кнопку "Показать больше"
const shouldShowToggle = computed(() => {
  return props.comment.text?.length > MAX_PREVIEW_LENGTH;
});

const previewText = computed(() => {
  if (!shouldShowToggle.value || isExpanded.value) {
    return props.comment.text;
  }
  return props.comment.text?.substring(0, MAX_PREVIEW_LENGTH) + "...";
});
</script>

<template>
  <div class="flex gap-3 relative">
    <NuxtLink
      :to="
        $localePath({
          name: 'profile-name',
          params: { name: comment.profile?.name },
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
              params: { name: comment.profile?.name },
            })
          "
          class="font-semibold dark:text-white hover:underline"
          >{{ comment.profile?.name }}</NuxtLink
        >
        <span class="text-gray-500 dark:text-gray-400 text-xs">{{
          useRelativeTime(comment.createdAt, $i18n.locale)
        }}</span>
      </div>
      <p class="text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
        {{ previewText }}
      </p>
      <button
        v-if="shouldShowToggle"
        @click="isExpanded = !isExpanded"
        class="text-[#F02C56] opacity-70 hover:opacity-100 dark:text-[#F02C56] dark:hover:text-[#F02C56] text-sm mt-1"
      >
        {{ isExpanded ? $t("showLess") : $t("showMore") }}
      </button>
      <div class="flex items-start gap-2 mt-1">
        <button @click="likeComment" class="hover:text-gray-400 flex items-center gap-1">
          <IconsLike class="w-6 h-6" :class="{ 'text-red-500': comment.liked }" />
          <span class="text-xs">{{ comment.likes?.length || "" }}</span>
        </button>
        <button @click="dislikeComment" class="hover:text-gray-400 flex items-center gap-1">
          <IconsDislike class="w-6 h-6" :class="{ 'text-red-500': comment.disliked }" />
          <span class="text-xs">{{ comment.dislikes?.length || "" }}</span>
        </button>
        <button
          @click="$emit('reply', comment, discussionId)"
          class="hover:text-gray-400 flex items-center gap-1 text-sm self-end text-gray-300 ml-2"
        >
          {{ $t("reply") }}
        </button>
      </div>
      <slot name="replies-button"></slot>
    </div>
  </div>
</template>
