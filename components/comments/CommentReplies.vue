<script setup lang="ts">
import type { IComment } from "~/types/user.type";
import CommentItem from "./CommentItem.vue";

type Props = {
  replies: IComment[];
};

const props = defineProps<Props>();
const emits = defineEmits(["like", "dislike"]);

const handleLike = (comment: IComment) => {
  emits("like", comment);
};

const handleDislike = (comment: IComment) => {
  emits("dislike", comment);
};
</script>

<template>
  <div class="ml-12 mt-4 space-y-4">
    <div v-for="reply in replies" :key="reply.id">
      <CommentItem :comment="reply" @like="handleLike" @dislike="handleDislike" />
    </div>
  </div>
</template>
