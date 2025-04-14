import prisma from "~/server/composables/prisma";

interface IQuery {
  userId: string;
}

export default defineEventHandler(async (event) => {
  const { userId } = getQuery<IQuery>(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  const parsedUserId = parseInt(userId);

  const friends = await prisma.follows.findMany({
    where: {
      OR: [
        {
          userId: parsedUserId,
        },
        {
          friendId: parsedUserId,
        },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  const filteredFriends = friends.map((friendship) => {
    if (friendship.userId === parsedUserId) {
      return friendship.friend;
    } else {
      return friendship.user;
    }
  });

  return friends || [];
});
