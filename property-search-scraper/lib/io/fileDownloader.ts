import fs from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import type { ReadableStream as NodeReadableStream } from "stream/web";

export async function downloadFile(
  url: string,
  destPath: string
): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `downloadFile: ${url} returned ${res.status} ${res.statusText}`
    );
  }
  if (!res.body) {
    throw new Error(`downloadFile: ${url} returned empty body`);
  }

  await pipeline(
    Readable.fromWeb(res.body as NodeReadableStream<Uint8Array>),
    fs.createWriteStream(destPath)
  );
}
