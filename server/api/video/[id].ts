import prisma from "~/lib/prisma";

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
      profile: {
        select: {
          name: true,
          avatar: true,
        },
      },
      likes: {
        select: {
          profileId: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    omit: {
      blockReason: true,
      createdAt: true,
      isBlocked: true,
      randomSort: true,
      statusId: true,
      updatedAt: true,
    },
  });

  if (!video) {
    throw createError({
      status: 404,
      statusMessage: "Video not found",
    });
  }

  return {
    ...video,
    commentsCount: video._count?.comments || 0,
    _count: undefined,
  };
});
