import prisma from "~/server/composables/prisma";

interface IBody {
  userId: number;
  reason: string;
  until: Date;
  info: string;
}

export default defineEventHandler(async (event) => {
  const { userId, reason, info, until } = await readBody<IBody>(event);

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
      until,
    },
  });

  return block;
});
