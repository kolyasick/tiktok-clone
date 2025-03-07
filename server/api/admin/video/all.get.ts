import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { limit } = getQuery<{ limit: string }>(event);

  const videos = await prisma.video.findMany({
    include: {
      profile: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit ? parseInt(limit) : undefined,
  });

  return videos || [];
});
