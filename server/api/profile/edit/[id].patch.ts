import { ServerFile } from "nuxt-file-storage";
import prisma from "~/server/composables/prisma";

type IBody = {
  name: string;
  avatar?: ServerFile;
};

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };
  const { name, avatar } = await readBody<IBody>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const file = avatar ? await storeFileLocally(avatar, 6, "/avatars") : undefined;
  
  const parsedId = parseInt(id);

  const profile = await prisma.profile.update({
    where: {
      userId: parsedId,
    },
    data: {
      name,
      avatar: file,
    },
  });

  return profile;
});
