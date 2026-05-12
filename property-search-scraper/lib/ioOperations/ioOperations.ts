import path from "path";
import fs from "fs/promises";
import { FILE_PATHS } from "../config";
import { JsonFileHandler } from "../io/io";
import type { PostScrapeType } from "../types/facebookTypes";

export type PostStoragePaths = {
  postDir: string;
  postDataJsonPath: string;
  mediaDir: string;
  imagesDir: string;
  videosDir: string;
};

export function getPostStoragePaths(postId: string): PostStoragePaths {
  const postDir = path.join(FILE_PATHS.facebook.scrapedDataDir, postId);
  const mediaDir = path.join(postDir, "media");
  return {
    postDir,
    postDataJsonPath: path.join(postDir, "postData.json"),
    mediaDir,
    imagesDir: path.join(mediaDir, "images"),
    videosDir: path.join(mediaDir, "videos"),
  };
}

export async function ensurePostDirs(
  postId: string
): Promise<PostStoragePaths> {
  const paths = getPostStoragePaths(postId);
  await fs.mkdir(paths.imagesDir, { recursive: true });
  await fs.mkdir(paths.videosDir, { recursive: true });
  return paths;
}

export async function savePostData(
  postId: string,
  data: PostScrapeType
): Promise<PostStoragePaths> {
  const paths = await ensurePostDirs(postId);
  await JsonFileHandler.writeJson(paths.postDataJsonPath, data);
  return paths;
}

export async function loadPostData(
  postId: string
): Promise<PostScrapeType | null> {
  const { postDataJsonPath } = getPostStoragePaths(postId);
  return JsonFileHandler.readJson<PostScrapeType>(postDataJsonPath);
}
