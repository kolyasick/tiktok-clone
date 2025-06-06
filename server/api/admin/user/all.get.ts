import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { limit } = getQuery<{ limit?: string }>(event);
  const session = await getUserSession(event);

  if (!session) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }
  const users = await prisma.profile.findMany({
    where: {
      NOT: {
        userId: session.user?.id,
      },
    },
    include: {
      user: {
        include: {
          role: true,
          block: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit ? parseInt(limit) : undefined,
  });

  return users || [];
});
