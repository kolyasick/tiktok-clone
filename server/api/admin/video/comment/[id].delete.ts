import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Id parameter is required",
    });
  }

  const video = await prisma.comment.delete({
    where: {
      id: parseInt(id),
    },
  });

  return video;
});
