import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  const comments = await prisma.comment.findMany({
    where: {
      videoId: id,
    },
    include: {
      profile: true,
      likes: true,
    },
  });

  return comments.map((c) => {
    return {
      ...c,
      likes: c.likes?.filter((like) => like.reaction === 1),
      dislikes: c.likes?.filter((like) => like.reaction === -1),
    };
  });
});
