<script setup lang="ts">
import type { IComment } from "~/types/user.type";
import CommentItem from "./CommentItem.vue";

type Props = {
  replies: IComment[];
  discussionId: number;
};

const props = defineProps<Props>();
const emits = defineEmits(["like", "dislike", "reply"]);

const handleLike = (comment: IComment) => {
  emits("like", comment);
};

const handleDislike = (comment: IComment) => {
  emits("dislike", comment);
};

const handleReply = (comment: IComment, discussionId: number) => {
  emits("reply", comment, discussionId);
};
</script>

<template>
  <div class="ml-12 mt-4 space-y-4">
    <div v-for="reply in replies" :key="reply.id">
      <CommentItem
        :comment="reply"
        :discussion-id="discussionId"
        @like="handleLike"
        @dislike="handleDislike"
        @reply="handleReply"
      />
    </div>
  </div>
</template>
