import prisma from "~/server/composables/prisma";

interface IQuery {
  user1Id: string;
  user2Id: string;
}

export default defineEventHandler(async (event) => {
  const { user1Id, user2Id } = getQuery<IQuery>(event);

  if (!user1Id || !user2Id) {
    throw createError({
      statusCode: 400,
      message: "User ids are required",
    });
  }

  const parsedUserId = parseInt(user1Id, 10);
  const parsedFriendId = parseInt(user2Id, 10);

  const room = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          user1Id: parsedUserId,
          user2Id: parsedFriendId,
        },
        {
          user1Id: parsedUserId,
          user2Id: parsedFriendId,
        },
      ],
    },
    include: {
      messages: {
        include: {
          sender: true,
        },
      },
    },
  });

  return room;
});
