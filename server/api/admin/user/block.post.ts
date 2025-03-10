import prisma from "~/server/composables/prisma";

interface IBody {
  userId: number;
  reason: string;
  info: string;
}

export default defineEventHandler(async (event) => {
  const { userId, reason, info } = await readBody<IBody>(event);

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isBlocked: true,
    },
  });

  const block = await prisma.block.create({
    data: {
      userId,
      reason,
      info,
    },
  });

  return block;
});
