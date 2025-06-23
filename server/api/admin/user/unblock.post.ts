import prisma from "~/lib/prisma";

interface IBody {
  userId: number;
}

export default defineEventHandler(async (event) => {
  const { userId } = await readBody<IBody>(event);

  try {
    const block = await prisma.block.delete({
      where: {
        userId,
      },
    });

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isBlocked: false,
      },
    });

    return block;
  } catch (e) {
    throw createError({
      status: 500,
      message: "Something went wrong",
    });
  }
});
