import prisma from "~/lib/prisma";

type Query = {
  userId: string;
};

export default defineEventHandler(async (event) => {
  const { userId } = getQuery<Query>(event);

  const user = await prisma.profile.update({
    where: {
      id: parseInt(userId),
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return user.online;
});
