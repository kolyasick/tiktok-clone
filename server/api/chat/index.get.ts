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

  const rooms = await prisma.chat.findMany({
    where: {
      OR: [
        {
          user1Id: parsedUserId,
        },
        {
          user2Id: parsedUserId,
        },
      ],
    },
    include: {
      messages: {
        include: {
          sender: true,
        },
      },
      user1: true,
      user2: true,
    },
  });

  const filteredRooms = rooms.map((room) => {
    return {
      ...room,
      companion: room.user1Id === parsedUserId ? room.user2 : room.user1,
    };
  });

  filteredRooms.forEach((room) => {
    // @ts-ignore
    delete room.user1;

    // @ts-ignore
    delete room.user2;
  });

  return filteredRooms;
});
