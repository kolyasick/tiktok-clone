import prisma from "~/lib/prisma";

interface IBody {
  chatId: number;
  text: string;
  isReaded?: boolean;
}
export default defineEventHandler(async (event) => {
  const { chatId, text, isReaded } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!chatId || !user.id || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Chat id, senderId and text required",
    });
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: user.id,
      text,
      isReaded,
    },
    include: {
      sender: true,
    },
  });

  return message;
});
