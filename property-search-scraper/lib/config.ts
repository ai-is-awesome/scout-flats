import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "..");

export const FILE_PATHS = {
  facebook: {
    facebookMetaDataFilePath: path.join(
      projectRoot,
      "data",
      "facebookScrapingMetaData.json"
    ),
    scrapedDataDir: path.join(
      projectRoot,
      "data",
      "facebookScrapedData",
      "posts"
    ),
    sessionPath: "./fb-session",
  },
};

export const BINARIES = {
  ytDlp: "D:\\myStuff\\youtube-dlp\\yt-dlp.exe",
};
