type FacebookMetadataFileType = {
  facebookPostsAttemptedScrape: PostScraped[];
};

type PostScraped = {
  postId: string;
  localPath: string;
  scrapedAt: number;
  postedAt: number | null;
  stepsCompleted: FacebookMetadataFileKeys[];
  isRealEstateRelated: boolean | null;
  sourceGroupId: string;
  errors: string[];
  postUrl?: string;
};

type FacebookPostScrapeError = {
  step: FacebookMetadataFileKeys;
  error: string;
};

enum FacebookMetadataFileKeys {
  textContentScraped = "textContentScraped",
  mediaLinksScraped = "mediaLinksScraped",
  downloadableVideoLinksScraped = "downloadableVideoLinksScraped",
  aiTagsGenerated = "aiTagsGenerated",
  mediaDownloaded = "mediaDownloaded",
  pushedToDb = "pushedToDb",
}
