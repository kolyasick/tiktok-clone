import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  const comments = await prisma.comment.findMany({
    where: {
      videoId: id,
      parentId: null,
    },
    include: {
      profile: true,
      likes: true,
      _count: {
        select: {
          replies: true,
        },
      },
    },
    take: 50,
  });

  return comments.map((c) => {
    return {
      ...c,
      repliesCount: c._count?.replies || 0,
      hasReplies: c._count?.replies > 0,
      _count: undefined,
      likes: c.likes?.filter((like) => like.reaction === 1),
      dislikes: c.likes?.filter((like) => like.reaction === -1),
    };
  });
});
