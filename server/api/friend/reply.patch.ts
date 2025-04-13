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
      message: "User ids are required",
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

  // Проверяем, есть ли уже взаимная подписка
  const mutualFollow = await prisma.follows.findFirst({
    where: {
      userId: friendId,
      friendId: userId,
      status: "accepted",
    },
  });

  const friendShip = await prisma.follows.update({
    where: {
      id: findFriendShip.id,
    },
    data: {
      status: "accepted",
      isFollowing: true,
      isFriend: true,
    },
  });

  // Если есть взаимная подписка, обновляем и вторую запись
  if (mutualFollow) {
    await prisma.follows.update({
      where: {
        id: mutualFollow.id,
      },
      data: {
        isFriend: true,
      },
    });
  }

  return friendShip;
});
