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

  const findFriendShip = await prisma.follows.findFirst({
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

  if (!findFriendShip) {
    throw createError({
      statusCode: 404,
      message: "Friendship not found",
    });
  }

  // Если это запрос на подписку (pending), удаляем его
  if (findFriendShip.status === "pending") {
    await prisma.follows.delete({
      where: {
        id: findFriendShip.id,
      },
    });
    return null;
  }

  // Если это принятая подписка, обновляем статус
  const friendShip = await prisma.follows.update({
    where: {
      id: findFriendShip.id,
    },
    data: {
      status: "rejected",
      isFollowing: false,
      isFriend: false,
    },
  });

  // Если была взаимная подписка, обновляем и вторую запись
  if (findFriendShip.isFriend) {
    const mutualFollow = await prisma.follows.findFirst({
      where: {
        userId: friendId,
        friendId: userId,
      },
    });

    if (mutualFollow) {
      await prisma.follows.update({
        where: {
          id: mutualFollow.id,
        },
        data: {
          isFriend: false,
        },
      });
    }
  }

  return friendShip;
});
