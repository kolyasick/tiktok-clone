import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  await requireUserSession(event);
  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const parsedId = parseInt(id);

  const chat = await prisma.chat.findUnique({
    where: {
      id: parsedId,
    },
    select: {
      id: true,
      user1Id: true,
      user2Id: true,
      user1: {
        select: {
          id: true,
          avatar: true,
          name: true,
          lastSeen: true,
          online: true,
        },
      },
      user2: {
        select: {
          id: true,
          avatar: true,
          name: true,
          lastSeen: true,
          online: true,
        },
      },
      // messages: {
      //   select: {
      //     id: true,
      //     createdAt: true,
      //     isReaded: true,
      //     senderId: true,
      //     text: true,
      //     sender: {
      //       select: {
      //         avatar: true,
      //         name: true,
      //         lastSeen: true,
      //         online: true,
      //       },
      //     },
      //   },
      //   orderBy: {
      //     createdAt: "asc",
      //   },
      //   take: 20,
      // },
    },
  });

  if (chat?.user1Id !== user.id && chat?.user2Id !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  const mappedChat = {
    ...chat,
    messages: [],
    companion: chat?.user1Id === parseInt(user.id) ? chat?.user2 : chat?.user1,
  };

  delete mappedChat.user1;
  delete mappedChat.user2;

  return mappedChat;
});
