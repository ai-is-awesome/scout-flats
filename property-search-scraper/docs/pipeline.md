Pipeline is like this

1. We instantiate a browser with stealth plugin

```ts
export async function createPersistentBrowser(
  c?: Config
): Promise<BrowserContext> {
  const sessionPath = c?.sessionPath ?? "";

  const launchOpts: LaunchOpts = {
    headless: c?.launchOptions?.headless ?? false,
    viewport: c?.launchOptions?.viewport ?? null,
    channel: "chrome",
    args: ["--remote-debugging-port=9222"],
  };

  const ctx = await chromium.launchPersistentContext(sessionPath, {
    channel: "chrome",
    ...launchOpts,
  });
  return ctx;
}
```

Sommething like thihs maybe.

After the browser is being created,

We go and scroll, wait find hydration post (using aria-posinset and story message)
If that is available, we scrape post details, as we scrape a posts' details,

We need several things like video-id etc,

Then we run a gemini client and ask if this post is related to "selling of a rented apartment or not "

We ask several things like

1. If this is a post related to selling of a rented apartment then "is_valid_post" to true. If not, "is_valid_post" to false and skip every other field

1. If the flat is for male/female/both
   List of amenities in our system =
   ["gym", "ac", "lift", "parking", "swimming_pool"]
1. amenities in amenities list above

3) How many rooms available
4) BHK Size?(1,2,3, entire flat)
5) Move in date
6) Fully Furnished, unfurnished, semi furnished
7) Restrctions array
   ["no_alcohol", "no_smoking", "no_nonveg"]

If the property is valid
Then we need to download those images and videos. videos downloded by yt-dlp and image using a normal downloader,

After all these is done, we need to save post in our local system for now.
Once these posts are saved we need to update metadata

```ts
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
  errors: FacebookPostScrapeError[];
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
  imagesDownloaded = "imagesDownloaded",
  videosDownloaded = "videosDownloaded",
  pushedToDb = "pushedToDb",
}
```
