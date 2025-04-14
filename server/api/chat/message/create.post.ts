import prisma from "~/server/composables/prisma";

interface IBody {
  senderId: number;
  chatId: number;
  text: string;
}
export default defineEventHandler(async (event) => {
  const { chatId, senderId, text } = await readBody<IBody>(event);

  if (!chatId || !senderId || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Chat id, senderId and text required",
    });
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId,
      text,
    },
  });

  return message;
});
