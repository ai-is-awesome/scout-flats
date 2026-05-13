import { expect, test } from "vitest";
import { downloadVideoWithYtDlp } from "./videoDownloader";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import fs from "fs";

test("Video Should download", async () => {
  const testUrl =
    "https://www.facebook.com/100003046295361/videos/pcb.1853317848725571/1280533530484175";

  const dir = await mkdtemp(path.join(tmpdir(), "yt-dlp-test-"));
  try {
    const outputTemplate = path.join(dir, "facebookVideo.%(ext)s");
    const finalPath = await downloadVideoWithYtDlp(testUrl, outputTemplate);

    expect(finalPath).toBeTruthy();
    expect(fs.existsSync(finalPath)).toBe(true);
    expect(fs.statSync(finalPath).size).toBeGreaterThan(0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}, 120_000);
