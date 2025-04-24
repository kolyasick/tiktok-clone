import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { limit, offset } = getQuery<{ limit: string; offset: string }>(event);

  const comments = await prisma.comment.findMany({
    where: {
      videoId: id,
      parentId: null,
    },
    // include: {
    //   profile: true,
    //   likes: true,
    //   _count: {
    //     select: {
    //       discussionReplies: true,
    //     },
    //   },
    // },
    select: {
      createdAt: true,
      text: true,
      id: true,
      profile: {
        select: {
          name: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          profileId: true,
          reaction: true,
        },
      },
      _count: {
        select: {
          discussionReplies: true,
        },
      },
    },
    skip: Number(offset),
    take: Number(limit),
    orderBy: {
      createdAt: "desc",
    },
  });

  return comments.map((c) => {
    return {
      ...c,
      repliesCount: c._count?.discussionReplies || 0,
      hasReplies: c._count?.discussionReplies > 0,
      _count: undefined,
      likes: c.likes?.filter((like) => like.reaction === 1),
      dislikes: c.likes?.filter((like) => like.reaction === -1),
    };
  });
});
