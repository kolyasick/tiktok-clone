import prisma from "~/lib/prisma";

interface IBody {
  ids: number[];
  isReaded?: boolean;
}
export default defineEventHandler(async (event) => {
  const { ids, isReaded } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!ids.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Chat id required",
    });
  }

  await prisma.message.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      isReaded,
    },
  });
});
