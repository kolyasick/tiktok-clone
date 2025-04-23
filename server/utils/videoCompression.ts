import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { writeFile, unlink, readFile } from "fs/promises";
import path, { join } from "path";
import { tmpdir } from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function compressVideo(inputBuffer: Buffer): Promise<{
  compressedVideo: Buffer;
  thumbnail: Buffer;
}> {
  const tempInputPath = join(tmpdir(), `input-${Date.now()}.mp4`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}.mp4`);
  const tempThumbnailPath = join(tmpdir(), `thumbnail-${Date.now()}.jpg`);

  try {
    await writeFile(tempInputPath, inputBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .screenshots({
          timestamps: ["00:00:00.000"],
          filename: path.basename(tempThumbnailPath),
          folder: path.dirname(tempThumbnailPath),
          size: "640x?",
        })
        //@ts-ignore
        .on("end", resolve)
        .on("error", reject);
    });

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .outputOptions([
          "-c:v libx264",
          "-crf 23",
          "-preset faster",
          "-tune fastdecode",
          "-x264-params ref=4:deblock=-1,-1",
          "-c:a aac",
          "-b:a 128k",
          "-movflags +faststart",
          "-vf scale=1080:-2:flags=lanczos",
          "-max_muxing_queue_size 1024",
          "-threads 0",
          "-pix_fmt yuv420p",
        ])
        //@ts-ignore
        .on("end", resolve)
        .on("error", reject)
        .save(tempOutputPath);
    });

    const [compressedBuffer, thumbnailBuffer] = await Promise.all([
      readFile(tempOutputPath),
      readFile(tempThumbnailPath),
    ]);

    return {
      compressedVideo: compressedBuffer,
      thumbnail: thumbnailBuffer,
    };
  } finally {
    await Promise.allSettled([
      unlink(tempInputPath).catch(() => {}),
      unlink(tempOutputPath).catch(() => {}),
      unlink(tempThumbnailPath).catch(() => {}),
    ]);
  }
}
