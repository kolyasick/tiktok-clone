import prisma from "~/lib/prisma";

interface IBody {
  user1Id: number;
  user2Id: number;
}
export default defineEventHandler(async (event) => {
  const { user1Id, user2Id } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!user1Id || !user2Id) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ids are required",
    });
  }

  const isChatExist = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          user1Id: user1Id,
          user2Id: user2Id,
        },
        {
          user1Id: user2Id,
          user2Id: user1Id,
        },
      ],
    },
  });

  if (!isChatExist) {
    const chatRoom = await prisma.chat.create({
      data: {
        user1Id,
        user2Id,
      },
    });

    return chatRoom;
  }

  const chatRoom = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          user1Id: user1Id,
          user2Id: user2Id,
        },
        {
          user1Id: user2Id,
          user2Id: user1Id,
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

  return chatRoom;
});
