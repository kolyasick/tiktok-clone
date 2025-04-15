import { ServerFile } from "nuxt-file-storage";
import prisma from "~/lib/prisma";

type IBody = {
  name?: string;
  avatar?: ServerFile;
  online?: boolean;
  bio?: string;
};

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };
  const { name, avatar, online, bio } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (parseInt(id || "") !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Id parameter is required",
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
        message: "Username already exist",
      });
    }
  }

  const file = avatar
    ? await storeFileLocally(avatar, 6, "/avatars")
    : undefined;

  const profile = await prisma.profile.update({
    where: {
      id: user.id,
    },
    data: {
      name,
      avatar: file,
      online,
      bio,
    },
  });

  return profile;
});
