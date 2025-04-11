<script setup lang="ts">
import type { IComment, IVideo } from "~/types/user.type";
import CommentItem from "./comments/CommentItem.vue";
import CommentReplies from "./comments/CommentReplies.vue";
import CommentForm from "./comments/CommentForm.vue";
import { usePlural } from "~/composables/usePlural";

const { $authStore, $generalStore } = useNuxtApp();
const { plural } = usePlural();
const { t, locale } = useI18n();

type Props = {
  videoId: string;
  commentsCount: number;
  isVisible: boolean;
};

const props = defineProps<Props>();
const emits = defineEmits(["close", "addComment"]);

const isCimmentsLoading = ref(false);
const isFormLoading = ref(false);
const comments = ref<IComment[]>([]);
const openReplies = ref<Set<number>>(new Set());

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

const addComment = async (text: string) => {
  try {
    isFormLoading.value = true;
    const comment = await $fetch<IComment>("/api/comment/add", {
      method: "POST",
      body: {
        text,
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
          return updateCommentReactions(c, reaction);
        }

        if (c.replies) {
          const updatedReplies = c.replies.map((reply) => {
            if (reply.id === comment.id) {
              return updateCommentReactions(reply, reaction);
            }
            return reply;
          });
          return { ...c, replies: updatedReplies };
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
          return updateCommentReactions(c, reaction);
        }

        if (c.replies) {
          const updatedReplies = c.replies.map((reply) => {
            if (reply.id === comment.id) {
              return updateCommentReactions(reply, reaction);
            }
            return reply;
          });
          return { ...c, replies: updatedReplies };
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

const updateCommentReactions = (comment: IComment, reaction: number) => {
  const updatedComment = {
    ...comment,
    liked: reaction === 1,
    disliked: reaction === -1,
    likes:
      reaction === 1
        ? [
            ...(comment.likes || []),
            {
              id: Date.now(),
              profileId: $authStore.profile!.id,
              commentId: comment.id,
              reaction: 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
        : comment.likes?.filter((like) => like.profileId !== $authStore.profile?.id),
    dislikes:
      reaction === -1
        ? [
            ...(comment.dislikes || []),
            {
              id: Date.now(),
              profileId: $authStore.profile!.id,
              commentId: comment.id,
              reaction: -1,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
        : comment.dislikes?.filter((dislike) => dislike.profileId !== $authStore.profile?.id),
  };

  if (reaction === 1) {
    updatedComment.dislikes = updatedComment.dislikes?.filter(
      (dislike) => dislike.profileId !== $authStore.profile?.id
    );
  } else if (reaction === -1) {
    updatedComment.likes = updatedComment.likes?.filter((like) => like.profileId !== $authStore.profile?.id);
  }

  return updatedComment;
};

const toggleReplies = async (id: number) => {
  try {
    const comment = comments.value.find((c) => c.id === id);
    if (comment?.replies && openReplies.value.has(id)) {
      openReplies.value.delete(id);
      return;
    }

    const data = await $fetch<IComment[]>("/api/comment/replies", {
      query: {
        id,
      },
    });

    if (data) {
      const updatedComments = comments.value.map((comment) => {
        if (comment.id === id) {
          return {
            ...comment,
            replies: data.map((reply) => ({
              ...reply,
              liked: reply.likes?.some((like) => like.profileId === $authStore.profile?.id),
              disliked: reply.dislikes?.some((like) => like.profileId === $authStore.profile?.id),
            })),
          };
        }
        return comment;
      });
      comments.value = updatedComments;
      openReplies.value.add(id);
    }
  } catch (error) {
    console.log(error);
  }
};

const getRepliesText = (count: number) => {
  const repliesCount = count || 0;

  if (locale.value === "ru") {
    return plural(repliesCount, [t("replies.one"), t("replies.few"), t("replies.many")]);
  } else {
    return plural(repliesCount, [t("replies.one"), t("replies.many"), t("replies.many")]);
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
          {{ commentsCount }}
        </span>
      </h2>
      <button @click="$emit('close')" class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full">
        <IconsClose class="w-6 h-6" />
      </button>
    </div>

    <div v-if="isCimmentsLoading" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <IconsLoader class="w-20 h-20 animate-spin" />
    </div>

    <div v-else class="p-4 overflow-y-auto h-[calc(100%-150px)]">
      <div v-if="comments?.length === 0" class="text-center text-gray-500 dark:text-gray-400 mt-4">
        {{ $t("noComments") }}
      </div>
      <div v-else class="space-y-4">
        <div v-for="comment in comments" :key="comment.id">
          <CommentItem :comment="comment" @like="likeComment" @dislike="dislikeComment">
            <template #replies-button>
              <button
                v-if="comment.hasReplies"
                @click="toggleReplies(comment.id)"
                class="hover:text-gray-400 flex items-center gap-3 self-end mt-3"
              >
                <IconsArrow class="w-4 h-4 -rotate-90" :class="{ 'rotate-90': openReplies.has(comment.id) }" />
                <span class="text-sm font-semibold dark:text-gray-300">
                  {{ comment.repliesCount || comment.replies?.length || 0 }}
                </span>
                <span class="text-sm font-semibold dark:text-gray-300">
                  {{ getRepliesText(comment.repliesCount || comment.replies?.length || 0) }}
                </span>
              </button>
            </template>
          </CommentItem>

          <CommentReplies
            v-if="openReplies.has(comment.id) && comment.replies"
            :replies="comment.replies"
            @like="likeComment"
            @dislike="dislikeComment"
          />
        </div>
      </div>
    </div>

    <div
      class="absolute bottom-0 left-0 rounded-b-xl right-0 p-4 border-t dark:border-neutral-800 bg-white dark:bg-neutral-900"
    >
      <CommentForm :is-form-loading="isFormLoading" @submit="addComment" />
    </div>
  </div>
</template>

<style scoped></style>
