import { ServerFile } from "nuxt-file-storage";
import prisma from "~/lib/prisma";
import { compressVideo } from "~/server/utils/videoCompression";

interface IBody {
  title: string;
  file: ServerFile;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!body.title || !body.file) {
    throw createError({
      statusCode: 400,
      statusMessage: "Title, file and user id are required",
    });
  }

  const ext = body.file.name.split(".").pop();
  if (ext?.toLocaleLowerCase() !== "mp4") {
    throw createError({
      statusCode: 400,
      statusMessage: "Only .mp4 format",
    });
  }

  try {
    const fileData = body.file.content as string;
    const base64Data = fileData.replace(/^data:video\/mp4;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const { compressedVideo, thumbnail } = await compressVideo(buffer);

    const compressedFile = {
      ...body.file,
      content: `data:video/mp4;base64,${compressedVideo.toString("base64")}`,
    };

    const file = await storeFileLocally(compressedFile, 6, "/videos");
    const previewFile: ServerFile = {
      name: `preview_${body.file.name.replace(/\.[^/.]+$/, ".jpg")}`, // Добавляем префикс и меняем расширение
      content: `data:image/jpeg;base64,${thumbnail.toString("base64")}`,
      size: thumbnail.length.toString(),
      type: "image/jpeg",
      lastModified: Date.now().toString(),
    };

    const preview = await storeFileLocally(previewFile, 6, "/videos/thumbnail");
    const status = await prisma.status.findFirst({
      where: {
        title: "new",
      },
    });

    const video = await prisma.video.create({
      data: {
        title: body.title,
        profileId: user.id,
        url: file,
        statusId: status!.id,
        preview: preview,
      },
    });

    if (!video.id) {
      throw createError({
        statusCode: 500,
        statusMessage: "Error creating video",
      });
    }

    return video;
  } catch (error) {
    console.error("Error processing video:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error processing video",
    });
  }
});
