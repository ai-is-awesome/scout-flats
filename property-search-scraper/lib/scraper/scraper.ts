import { FILE_PATHS } from "../config";
import {
  createPersistentBrowser,
  type Config as BrowserOptions,
} from "./browser";
import type { BrowserContext, Page } from "patchright";
import { getPosts } from "../facebook/facebookScraper";
import { humanScroll, humanWander } from "./cursor";
import {
  getPostStoragePaths,
  savePostData,
} from "../ioOperations/ioOperations";
import { FacebookMetadataRepository } from "../facebook/facebookMetadataRepository";
import { FacebookMetadataFileKeys } from "../types/facebookMetadataFileType";

const DEFAULT_SCROLL_ROUNDS = 5;

export type GroupScrapeConfig = {
  groupUrl: string;
  scrollRounds: number;
};

export type Config = {
  browserOptions: BrowserOptions;
  /** When true, every group is scraped for `defaultScrollRounds` rounds, ignoring per-group settings. */
  useConstantScrollRoundsForAllGroups: boolean;
  defaultScrollRounds: number;
  groupScrapeConfig: GroupScrapeConfig[];
};

export const defaultConfig: Config = {
  browserOptions: {
    sessionPath: FILE_PATHS.facebook.sessionPath,
  },
  useConstantScrollRoundsForAllGroups: false,
  defaultScrollRounds: DEFAULT_SCROLL_ROUNDS,
  groupScrapeConfig: [
    {
      groupUrl: "https://www.facebook.com/groups/838402552906457/",
      scrollRounds: 10,
    },
  ],
};

export class FacebookScrapingPipeline {
  config: Config;
  browserContext: BrowserContext | null = null;
  metadataRepository = new FacebookMetadataRepository();

  constructor(config: Config) {
    this.config = config;
  }

  async run(): Promise<void> {
    await this.ensureBrowser();
    const ctx = this.browserContext!;

    for (const groupCfg of this.config.groupScrapeConfig) {
      const rounds = this.resolveScrollRounds(groupCfg.scrollRounds);
      const page = ctx.pages()[0] ?? (await ctx.newPage());
      await this.scrapeGroup(page, groupCfg.groupUrl, rounds);
    }
  }

  async instantiateBrowser(): Promise<void> {
    this.browserContext = await createPersistentBrowser(
      this.config.browserOptions
    );
  }

  private async ensureBrowser(): Promise<void> {
    if (this.browserContext === null) await this.instantiateBrowser();
  }

  private resolveScrollRounds(groupRounds: number): number {
    if (this.config.useConstantScrollRoundsForAllGroups) {
      return this.config.defaultScrollRounds || DEFAULT_SCROLL_ROUNDS;
    }
    return (
      groupRounds || this.config.defaultScrollRounds || DEFAULT_SCROLL_ROUNDS
    );
  }

  private async scrapeGroup(
    page: Page,
    groupUrl: string,
    scrollRounds: number
  ): Promise<void> {
    console.log(
      `\nScraping group: ${groupUrl} for ${scrollRounds} scroll rounds`
    );
    await page.goto(groupUrl);

    const groupName = await this.extractGroupName(page);
    console.log(`Group: ${groupName}`);

    const seen = new Set<string>();
    for (let round = 0; round < scrollRounds; round++) {
      console.log(`\n── Round ${round + 1} / ${scrollRounds} ──`);
      await this.scrapeRound(page, groupName, seen);
      await humanWander(page);
      await humanScroll(page);
    }

    console.log(`\nTotal unique posts seen in ${groupUrl}: ${seen.size}`);
  }

  /**
   * h1 has two child nodes — first is "Notifications", second is the
   * group name. Falls back to whichever node is non-empty.
   */
  private async extractGroupName(page: Page): Promise<string> {
    const name = await page
      .locator("h1")
      .first()
      .evaluate((el) => {
        const parts = Array.from(el.childNodes)
          .map((n) => (n.textContent ?? "").trim())
          .filter(Boolean);
        return parts[1] ?? parts[0] ?? "";
      });
    return name || "Unknown group";
  }

  private async scrapeRound(
    page: Page,
    groupName: string,
    seen: Set<string>
  ): Promise<void> {
    const posts = await getPosts(page, groupName);
    console.log(`Found ${posts.length} hydrated posts`);

    for (const details of posts) {
      if (!details.postId || !details.groupId) {
        console.log("Skipping as unable to find post id or group id");
        continue;
      }
      if (seen.has(details.postId)) {
        console.log("Post is already seen, skipping");
        continue;
      }
      seen.add(details.postId);

      console.log(
        JSON.stringify(
          {
            ...details,
            postTextContent: details.postTextContent.slice(0, 100),
          },
          null,
          2
        )
      );
      try {
        const paths = getPostStoragePaths(details.postId);
        await this.metadataRepository.upsertPostAttempt({
          postId: details.postId,
          localPath: paths.postDir,
          scrapedAt: Date.now(),
          postedAt: null,
          sourceGroupId: details.groupId,
          postUrl: details.permaLinkConstructed || details.permalink,
        });
        await this.metadataRepository.markStepCompleted(
          details.postId,
          FacebookMetadataFileKeys.textContentScraped
        );
        await this.metadataRepository.markStepCompleted(
          details.postId,
          FacebookMetadataFileKeys.mediaLinksScraped
        );
        await savePostData(details.postId, details);
      } catch (e) {
        console.log("Error: ", e);
        await this.metadataRepository.markStepFailed(details.postId, {
          step: FacebookMetadataFileKeys.textContentScraped,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }
}
