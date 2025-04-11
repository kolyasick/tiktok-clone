import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const {
    offset = 0,
    limit = 5,
    excludeId,
    userId,
  } = getQuery<{ offset: string; limit: string; excludeId: string; userId?: string }>(event);

  const videos = await prisma.video.findMany({
    where: {
      id: {
        not: excludeId ? excludeId : undefined,
      },
      profileId: userId ? parseInt(userId) : undefined,
    },

    skip: Number(offset),
    take: Number(limit),
    include: {
      profile: true,
      likes: {
        include: {
          profile: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return videos.map((video) => {
    return {
      ...video,
      commentsCount: video._count?.comments || 0, 
      _count: undefined,
    };
  });
});
