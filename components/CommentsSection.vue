<script setup lang="ts">
import type { IComment, IVideo } from "~/types/user.type";

const { $authStore, $generalStore } = useNuxtApp();

type Props = {
  videoId: string;
  isVisible: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["close", "addComment"]);

const isCimmentsLoading = ref(false);
const isFormLoading = ref(false);

const comments = ref<IComment[]>([]);

onMounted(async () => {
  try {
    isCimmentsLoading.value = true;
    const data = await $fetch<IComment[]>(`/api/video/${props.videoId}/comment`);
    if (data) {
      comments.value = data.map((comment) => ({
        ...comment,
        liked: comment.likes?.some((like) => like.profileId === $authStore.profile?.id),
        disliked: comment.dislikes?.some((like) => like.profileId === $authStore.profile?.id),
      }));
    }
  } catch (e) {
    console.error(e);
  } finally {
    isCimmentsLoading.value = false;
  }
});

const commentText = ref("");

const addComment = async () => {
  if (commentText.value.trim()) {
    try {
      isFormLoading.value = true;
      const comment = await $fetch<IComment>("/api/comment/add", {
        method: "POST",
        body: {
          text: commentText.value,
          videoId: props.videoId,
          senderId: $authStore.profile?.id!,
        },
      });
      comments.value.push(comment);
      emits("addComment", comment);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      isFormLoading.value = false;
    }
  }
  commentText.value = "";
};

const likeComment = async (comment: IComment) => {
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    return;
  }

  try {
    const reaction = comment.liked ? 0 : 1;
    comments.value =
      comments.value?.map((c) => {
        if (c.id === comment.id) {
          const updatedComment = {
            ...c,
            liked: reaction === 1,
            disliked: false,
            likes:
              reaction === 1
                ? [
                    ...(c.likes || []),
                    {
                      id: Date.now(),
                      profileId: $authStore.profile!.id,
                      commentId: comment.id,
                      reaction: 1,
                    },
                  ]
                : c.likes?.filter((like) => like.profileId !== $authStore.profile?.id),
            dislikes:
              reaction === 1
                ? c.dislikes?.filter((dislike) => dislike.profileId !== $authStore.profile?.id)
                : c.dislikes,
          };
          return updatedComment;
        }
        return c;
      }) || [];

    await $fetch(`/api/comment/${comment.id}/like`, {
      method: "POST",
      body: {
        reaction,
        senderId: $authStore.profile?.id,
      },
    });
  } catch (error) {
    console.error("Error liking comment:", error);
  }
};

const dislikeComment = async (comment: IComment) => {
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    return;
  }

  try {
    const reaction = comment.disliked ? 0 : -1;

    comments.value =
      comments.value?.map((c) => {
        if (c.id === comment.id) {
          const updatedComment = {
            ...c,
            liked: false,
            disliked: reaction === -1,
            likes:
              reaction === -1
                ? c.likes?.filter((like) => like.profileId !== $authStore.profile?.id)
                : c.likes,
            dislikes:
              reaction === -1
                ? [
                    ...(c.dislikes || []),
                    {
                      id: Date.now(),
                      profileId: $authStore.profile!.id,
                      commentId: comment.id,
                      reaction: -1,
                    },
                  ]
                : c.dislikes?.filter((dislike) => dislike.profileId !== $authStore.profile?.id),
          };
          return updatedComment;
        }
        return c;
      }) || [];

    await $fetch(`/api/comment/${comment.id}/like`, {
      method: "POST",
      body: {
        reaction,
        senderId: $authStore.profile?.id,
      },
    });
  } catch (error) {
    console.error("Error disliking comment:", error);
  }
};
</script>

<template>
  <div
    id="commentsSection"
    class="overflow-y-scroll absolute rounded-xl bottom-0 h-2/3 max-w-full w-full z-20 bg-white dark:bg-neutral-900 shadow-lg"
  >
    <div class="p-4 border-b dark:border-neutral-800 flex items-center justify-between">
      <h2 class="xl:text-xl text-lg font-semibold dark:text-white">
        {{ $t("comments") }}
        <span class="text-gray-400 font-normal">
          {{ comments.length }}
        </span>
      </h2>
      <button
        @click="$emit('close')"
        class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full"
      >
        <IconsClose class="w-6 h-6" />
      </button>
    </div>

    <div
      v-if="isCimmentsLoading"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <IconsLoader class="w-20 h-20 animate-spin" />
    </div>

    <div v-else class="p-4 overflow-y-auto h-[calc(100%-150px)]">
      <div v-if="comments?.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-4">
        {{ $t("noComments") }}
      </div>
      <div v-else class="space-y-4">
        <div v-for="comment in comments" :key="comment.id" class="flex gap-3 relative">
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
              <span class="text-gray-500 dark:text-gray-400 text-xs">{{
                formatRelativeTime(comment.createdAt)
              }}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-300 break-words whitespace-pre-wrap">
              {{ comment.text }}
            </p>
            <div class="flex items-start gap-2 mt-1">
              <button
                @click="likeComment(comment)"
                class="hover:text-gray-400 flex items-center gap-1"
              >
                <IconsLike class="w-6 h-6" :class="{ 'text-red-500': comment.liked }" />
                <span class="text-xs">{{ comment.likes?.length || "" }}</span>
              </button>
              <button
                @click="dislikeComment(comment)"
                class="hover:text-gray-400 flex items-center gap-1"
              >
                <IconsDislike class="w-6 h-6" :class="{ 'text-red-500': comment.disliked }" />
                <span class="text-xs">{{ comment.dislikes?.length || "" }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-0 left-0 rounded-b-xl right-0 p-4 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900"
    >
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
    </div>
  </div>
</template>

<style scoped></style>
