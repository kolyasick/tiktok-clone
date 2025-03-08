import prisma from "~/server/composables/prisma";

type Query = {
  userId?: string;
  offset?: string;
  limit?: string;
};

export default defineEventHandler(async (event) => {
  const { userId, offset, limit } = getQuery<Query>(event);

  let videos;
  if (userId) {
    videos = await prisma.video.findMany({
      where: {
        profileId: parseInt(userId),
        status: {
          title: "published",
        },
      },
      include: {
        profile: true,
        comments: true,
        likes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    videos = await prisma.video.findMany({
      include: {
        profile: true,
        comments: true,
        likes: true,
      },
      where: {
        status: {
          title: "published",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: typeof offset === "string" ? parseInt(offset) : offset,
      take: typeof limit === "string" ? parseInt(limit) : limit,
    });
  }

  return videos ?? [];
});
