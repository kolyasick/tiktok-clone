import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = getQuery<{ id: string }>(event);

  const comments = await prisma.comment.findMany({
    where: {
      parentId: parseInt(id),
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
