import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function compressVideo(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tempInputPath = join(tmpdir(), `input-${Date.now()}.mp4`);
    const tempOutputPath = join(tmpdir(), `output-${Date.now()}.mp4`);

    writeFile(tempInputPath, inputBuffer)
      .then(() => {
        ffmpeg(tempInputPath)
          .outputOptions([
            "-c:v libx264", // Кодек H.264
            "-crf 23", // Более высокое качество (18-23 для HD)
            "-preset faster", // Более быстрый пресет
            "-tune fastdecode", // Оптимизация для быстрого декодирования
            "-x264-params ref=4:deblock=-1,-1", // Оптимизации кодирования
            "-c:a aac", // Аудио кодек
            "-b:a 128k", // Битрейт аудио
            "-movflags +faststart", // Быстрый старт для веба
            "-vf scale=1080:-2:flags=lanczos", // Масштабирование с лучшим алгоритмом
            "-max_muxing_queue_size 1024", // Предотвращение ошибок
            "-threads 0", // Использовать все доступные ядра CPU
            "-pix_fmt yuv420p", // Универсальный формат пикселей
          ])
          .on("start", (commandLine) => {
            console.log("starting upload");
          })
          .on("progress", (progress) => {
            console.log(
              `Processing: ${Math.round(progress.percent ?? progress.currentKbps)}% done`
            );
          })
          .on("end", async () => {
            try {
              const compressedBuffer = await readFile(tempOutputPath);
              await Promise.all([unlink(tempInputPath), unlink(tempOutputPath)]);
              resolve(compressedBuffer);
            } catch (error) {
              console.error("Error in compression end handler:", error);
              reject(error);
            }
          })
          .on("error", (err) => {
            console.error("FFmpeg error:", err);
            reject(err);
          })
          .save(tempOutputPath);
      })
      .catch((error) => {
        console.error("Error writing input file:", error);
        reject(error);
      });
  });
}
