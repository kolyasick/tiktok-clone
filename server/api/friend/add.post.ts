import prisma from "~/lib/prisma";

interface IBody {
  friendId: number;
}

export default defineEventHandler(async (event) => {
  const {  friendId } = await readBody<IBody>(event);

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

  const isFriendshipExist = await prisma.follows.findFirst({
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
      userId: user.id,
      friendId: friendId,
      status: "pending",
      isFollowing: true,
      isFriend: false,
    },
  });

  return friendShip;
});
