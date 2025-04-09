import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const video = await prisma.video.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
      likes: true,
      comments: true,
    },
  });

  if (!video) {
    throw createError({
      status: 404,
      statusMessage: "Video not found",
    });
  }

  return video;
});
