import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { BINARIES } from "../config";

/**
 * Runs yt-dlp to download a video URL to `outputPath`. The path is passed
 * as yt-dlp's `-o` template, so the caller controls the filename pattern
 * (e.g. `D:/videos/abc.%(ext)s` lets yt-dlp pick the extension; a fixed
 * `abc.mp4` forces that name).
 *
 * Returns the resolved on-disk path. Captured via
 * `--print-to-file after_move:filepath` into a tempfile — more reliable
 * than parsing stdout, which also contains progress lines with paths.
 *
 * Used for FB video posts: the in-page <video> is MSE-fed and segment
 * URLs aren't reachable from the DOM, so we capture the post-level
 * /videos/pcb.<id>/<vid> permalink during scraping and hand it here.
 */
export async function downloadVideoWithYtDlp(
  url: string,
  outputPath: string
): Promise<string> {
  const tmpDir = await mkdtemp(path.join(tmpdir(), "yt-dlp-"));
  const pathFile = path.join(tmpDir, "filepath.txt");

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(BINARIES.ytDlp, [
        "-o",
        outputPath,
        "--print-to-file",
        "after_move:filepath",
        pathFile,
        url,
      ]);

      proc.stdout.on("data", (chunk) => process.stdout.write(chunk));
      proc.stderr.on("data", (chunk) => process.stderr.write(chunk));

      proc.on("error", (err) =>
        reject(new Error(`yt-dlp failed to start for ${url}: ${err.message}`))
      );
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`yt-dlp exited with code ${code} for ${url}`));
      });
    });

    const finalPath = (await readFile(pathFile, "utf-8")).trim();
    if (!finalPath) {
      throw new Error(`yt-dlp succeeded but reported no output path for ${url}`);
    }
    return finalPath;
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
