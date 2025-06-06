import prisma from "~/lib/prisma";

interface IQuery {
  userId: string;
  friendId: string;
}

export default defineEventHandler(async (event) => {
  const { userId, friendId } = getQuery<IQuery>(event);

  if (!userId || !friendId) {
    throw createError({
      statusCode: 400,
      statusMessage: "All parametres are required",
    });
  }

  const parsedUserId = parseInt(userId);
  const parsedFriendId = parseInt(friendId);

  const friendShip = await prisma.follows.findFirst({
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
