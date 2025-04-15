import prisma from "~/lib/prisma";

type Body = {
  reaction: number;
};

export default defineEventHandler(async (event) => {
  const { reaction } = await readBody<Body>(event);
  const { id } = event.context.params as { id: string };

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  try {
    const existLike = await prisma.commentLike.findFirst({
      where: {
        profileId: user.id,
        commentId: parseInt(id),
      },
    });

    if (existLike) {
      const likeUpdate = await prisma.commentLike.update({
        where: { id: existLike.id },
        data: {
          reaction,
        },
      });

      return likeUpdate;
    }

    const newLike = await prisma.commentLike.create({
      data: {
        reaction,
        profileId: user.id,
        commentId: parseInt(id),
      },
    });

    return newLike;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Internal server error",
    });
  }
});
