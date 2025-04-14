import prisma from "~/lib/prisma";

type Body = {
  reaction: number;
  senderId: number;
};

export default defineEventHandler(async (event) => {
  const { reaction, senderId } = await readBody<Body>(event);
  const { id } = event.context.params as { id: string };

  try {
    const existLike = await prisma.commentLike.findFirst({
      where: {
        profileId: senderId,
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
        profileId: senderId,
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
