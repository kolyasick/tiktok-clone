import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  const comments = await prisma.comment.findMany({
    where: {
      videoId: id,
    },

    select: {
      profile: {
        select: {
          avatar: true,
          name: true,
        },
      },
      likes: {
        select: {
          profileId: true,
          createdAt: true,
          reaction: true,
          commentDislike: {
            select: {
              profileId: true,
              createdAt: true,
            },
          },
        },
      },
    },
    take: 50,
  });

  return comments.map((c) => {
    return {
      ...c,
      likes: c.likes?.filter((like) => like.reaction === 1),
      dislikes: c.likes?.filter((like) => like.reaction === -1),
    };
  });
});
