export type FacebookMetadataFileType = {
  facebookPostsAttemptedScrape: PostScraped[];
};

export type PostScraped = {
  postId: string;
  localPath: string;
  scrapedAt: number;
  postedAt: number | null;
  stepsCompleted: FacebookMetadataFileKeys[];
  isRealEstateRelated: boolean | null;
  sourceGroupId: string;
  errors: FacebookPostScrapeError[];
  postUrl?: string;
};

export type FacebookPostScrapeError = {
  step: FacebookMetadataFileKeys;
  error: string;
};

export enum FacebookMetadataFileKeys {
  textContentScraped = "textContentScraped",
  mediaLinksScraped = "mediaLinksScraped",
  downloadableVideoLinksScraped = "downloadableVideoLinksScraped",
  aiTagsGenerated = "aiTagsGenerated",
  imagesDownloaded = "imagesDownloaded",
  videosDownloaded = "videosDownloaded",
  pushedToDb = "pushedToDb",
}
