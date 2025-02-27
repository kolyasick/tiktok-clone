import prisma from "~/server/composables/prisma";

interface IQuery {
  userId: string;
  friendId: string;
}

export default defineEventHandler(async (event) => {
  const { userId, friendId } = getQuery<IQuery>(event);

  if (!userId || !friendId) {
    throw createError({
      statusCode: 400,
      message: "All parametres are required",
    });
  }

  const friendShip = await prisma.friendship.findFirst({
    where: {
      OR: [
        {
          userId: userId,
          friendId: friendId,
        },
        {
          userId: friendId,
          friendId: userId,
        },
      ],
    },
    include: {
      user: true,
    },
  });

  return friendShip;
});
