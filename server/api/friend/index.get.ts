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

  const parsedUserId = parseInt(userId, 10);
  const parsedFriendId = parseInt(friendId, 10);

  const friendShip = await prisma.friendship.findFirst({
    where: {
      OR: [
        {
          userId: parsedUserId,
          friendId: parsedFriendId,
        },
        {
          userId: parsedFriendId,
          friendId: parsedUserId,
        },
      ],
    },
    include: {
      user: true,
    },
  });

  return friendShip;
});
