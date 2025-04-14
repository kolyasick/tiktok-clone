import { ServerFile } from "nuxt-file-storage";
import prisma from "~/lib/prisma";
import { compressVideo } from "~/server/utils/videoCompression";

interface IBody {
  title: string;
  file: ServerFile;
  userId: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IBody>(event);

  if (!body.title || !body.file || !body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Title, file and user id are required",
    });
  }

  try {
    const fileData = body.file.content as string;
    const base64Data = fileData.replace(/^data:video\/mp4;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const compressedBuffer = await compressVideo(buffer);

    const compressedFile = {
      ...body.file,
      content: `data:video/mp4;base64,${compressedBuffer.toString("base64")}`,
    };

    const file = await storeFileLocally(compressedFile, 6, "/videos");
    const status = await prisma.status.findFirst({
      where: {
        title: "new",
      },
    });

    const video = await prisma.video.create({
      data: {
        title: body.title,
        profileId: body.userId,
        url: file,
        statusId: status!.id,
        randomSort: Math.random(),
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
