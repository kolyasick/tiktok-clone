import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { user: currentUser } = await getUserSession(event);

  if (!currentUser) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  const user = await prisma.profile.update({
    where: {
      id: currentUser.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return user.online;
});
