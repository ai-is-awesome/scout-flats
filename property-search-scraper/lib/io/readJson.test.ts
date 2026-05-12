import { read } from "node:fs";
import { FILE_PATHS } from "../config";
import { readJson } from "./readJson";

import { expect, test } from "vitest";
import { JsonFileHandler } from "./io";

test("readJson should read and parse JSON file correctly", async () => {
  const filePath = FILE_PATHS.facebook.facebookMetaDataFilePath;
  type ReturnType = { postsScraped: any[] };
  const result = {
    postsScraped: [],
  };

  const fileContents = await readJson<ReturnType>(filePath);
  expect(fileContents).toEqual(result);
});

test("readJson class method read should parse the file correctly", async () => {
  const filePath = FILE_PATHS.facebook.facebookMetaDataFilePath;
  const result = {
    postsScraped: [],
  };

  type ReturnType = { postsScraped: any[] };

  const fileContents = await JsonFileHandler.readJson<ReturnType>(filePath);
  expect(fileContents).toEqual(result);
});
