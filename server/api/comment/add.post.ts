import prisma from "~/server/composables/prisma";

interface IBody {
  senderId: number;
  videoId: string;
  text: string;
  discussionId?: number;
  commentId?: number;
}
export default defineEventHandler(async (event) => {
  const { videoId, senderId, text, discussionId, commentId } = await readBody<IBody>(event);

  if (!videoId || !senderId || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Video id, senderId and text required",
    });
  }

  const comment = await prisma.comment.create({
    data: {
      videoId,
      profileId: senderId,
      text,
      discussionId,
      parentId: commentId,
    },
    include: {
      profile: true,
      likes: true,
      _count: {
        select: {
          discussionReplies: true,
        },
      },
    },
  });

  const mappedComment = {
    ...comment,
    repliesCount: comment._count?.discussionReplies || 0,
    hasReplies: comment._count?.discussionReplies > 0,
    _count: undefined,
    likes: comment.likes?.filter((like) => like.reaction === 1),
    dislikes: comment.likes?.filter((like) => like.reaction === -1),
  };

  return mappedComment;
});
