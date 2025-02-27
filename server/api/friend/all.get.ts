import prisma from "~/server/composables/prisma";

interface IQuery {
  userId: string;
}

export default defineEventHandler(async (event) => {
  const { userId } = getQuery<IQuery>(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User id is required",
    });
  }

  const friends = await prisma.friendship.findMany({
    where: {
      OR: [
        {
          userId: userId,
          status: "accepted",
        },
        {
          friendId: userId,
          status: "accepted",
        },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  const filteredFriends = friends.map((friendship) => {
    if (friendship.userId === userId) {
      return friendship.friend;
    } else {
      return friendship.user;
    }
  });

  return filteredFriends || [];
});
