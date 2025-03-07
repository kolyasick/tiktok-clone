import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      role: true,
    },
  });

  return user;
});
