import prisma from "~/server/composables/prisma";

interface IBody {
  userId: number;
  friendId: number;
}
export default defineEventHandler(async (event) => {
  const { userId, friendId } = await readBody<IBody>(event);

  if (!userId || !friendId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ids are required",
    });
  }

  const findFriendShip = await prisma.friendship.findFirst({
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
  });

  const friendShip = await prisma.friendship.update({
    where: {
      id: findFriendShip?.id,
    },
    data: {
      status: "reply",
    },
  });

  return friendShip;
});
