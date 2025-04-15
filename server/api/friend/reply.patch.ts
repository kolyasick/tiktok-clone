import prisma from "~/lib/prisma";

interface IBody {
  userId: number;
  friendId: number;
}

export default defineEventHandler(async (event) => {
  const { userId, friendId } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!user.id || !friendId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ids are required",
    });
  }

  const findFriendShip = await prisma.follows.findFirst({
    where: {
      OR: [
        {
          userId: user.id,
          friendId: friendId,
        },
        {
          userId: friendId,
          friendId: user.id,
        },
      ],
    },
  });

  if (!findFriendShip) {
    throw createError({
      statusCode: 404,
      statusMessage: "Friendship not found",
    });
  }

  // Проверяем, есть ли уже взаимная подписка
  const mutualFollow = await prisma.follows.findFirst({
    where: {
      userId: friendId,
      friendId: user.id,
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
