import { expect, test } from "vitest";
import { downloadFile } from "./fileDownloader";
import fs from "fs";
import crypto from "crypto";

test("Should be able to download file in D directory", async () => {
  const randomString = crypto.randomBytes(8).toString("hex");
  const url =
    "https://unsplash.com/photos/ww89K_-BQHc/download?force=true&w=2400";
  const path = `D:/${randomString}.jpg`;

  try {
    await downloadFile(url, path);
    expect(fs.existsSync(path)).toBe(true);
  } finally {
    if (fs.existsSync(path)) fs.unlinkSync(path);
  }
});
