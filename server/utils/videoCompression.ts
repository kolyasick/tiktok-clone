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
            "-c:v libx264", // Use H.264 codec
            "-crf 28", // Constant Rate Factor (18-28 is good, higher = more compression)
            "-preset medium", // Encoding speed preset
            "-c:a aac", // Use AAC audio codec
            "-b:a 128k", // Audio bitrate
            "-movflags +faststart", // Enable fast start for web playback
            "-vf scale=720:-2", // Scale to 720p height while maintaining aspect ratio
            "-max_muxing_queue_size 1024", // Prevent queue overflow errors
          ])
          .on("start", (commandLine) => {
            console.log("FFmpeg started with command:", commandLine);
          })
          .on("progress", (progress) => {
            console.log("Processing: " + progress.currentKbps + "done");
          })
          .on("end", async () => {
            try {
              const compressedBuffer = await readFile(tempOutputPath);
              await Promise.all([unlink(tempInputPath), unlink(tempOutputPath)]);
              console.log("Temporary files cleaned up");

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
