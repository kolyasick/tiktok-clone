import prisma from "~/lib/prisma";

interface IBody {
  videoId: string;
  text: string;
  discussionId?: number;
  commentId?: number;
}
export default defineEventHandler(async (event) => {
  const { videoId, text, discussionId, commentId } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!videoId || !user.id || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Video id, senderId and text required",
    });
  }

  const comment = await prisma.comment.create({
    data: {
      videoId,
      profileId: user.id,
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
