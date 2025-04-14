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

  const isFriendshipExist = await prisma.follows.findFirst({
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

  if (isFriendshipExist) {
    if (isFriendshipExist.status === "rejected") {
      const updateFriend = await prisma.follows.update({
        where: {
          id: isFriendshipExist.id,
        },
        data: {
          status: "pending",
          isFollowing: true,
          isFriend: false,
        },
      });
      return updateFriend;
    }
    return isFriendshipExist;
  }

  const friendShip = await prisma.follows.create({
    data: {
      userId: userId,
      friendId: friendId,
      status: "pending",
      isFollowing: true,
      isFriend: false,
    },
  });

  return friendShip;
});
