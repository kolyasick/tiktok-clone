import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const parsedId = parseInt(id, 10);

  const profile = await prisma.profile.findUnique({
    where: {
      userId: parsedId,
    },
  });

  if (!profile) {
    throw createError({
      status: 404,
      statusMessage: "User not found",
    });
  }

  return profile;
});
