import { ServerFile } from "nuxt-file-storage";
import prisma from "~/server/composables/prisma";

type IBody = {
  name?: string;
  avatar?: ServerFile;
  online?: boolean;
};

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };
  const { name, avatar, online } = await readBody<IBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  if (name) {
    const isNameExist = await prisma.profile.findUnique({
      where: {
        name,
      },
    });

    if (isNameExist) {
      throw createError({
        statusCode: 400,
        statusMessage: "Username already exist",
      });
    }
  }

  const file = avatar ? await storeFileLocally(avatar, 6, "/avatars") : undefined;
  const parsedId = parseInt(id);

  const profile = await prisma.profile.update({
    where: {
      id: parsedId,
    },
    data: {
      name,
      avatar: file,
      online,
    },
  });

  return profile;
});
