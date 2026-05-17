import fs from "fs/promises";
import path from "path";
import { FILE_PATHS } from "../config";
import {
  FacebookMetadataFileKeys,
  type FacebookMetadataFileType,
  type FacebookPostScrapeError,
  type PostScraped,
} from "../types/facebookMetadataFileType";

const emptyMetadata = (): FacebookMetadataFileType => ({
  facebookPostsAttemptedScrape: [],
});

export type UpsertPostAttemptInput = {
  postId: string;
  localPath: string;
  scrapedAt: number;
  postedAt: number | null;
  sourceGroupId: string;
  postUrl?: string;
  isRealEstateRelated?: boolean | null;
};

export class FacebookMetadataRepository {
  constructor(
    private readonly filePath = FILE_PATHS.facebook.facebookMetaDataFilePath
  ) {}

  async getAll(): Promise<FacebookMetadataFileType> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as FacebookMetadataFileType;
    } catch (e) {
      if (isMissingFileError(e)) return emptyMetadata();
      throw e;
    }
  }

  async getPost(postId: string): Promise<PostScraped | null> {
    const metadata = await this.getAll();
    return (
      metadata.facebookPostsAttemptedScrape.find(
        (post) => post.postId === postId
      ) ?? null
    );
  }

  async upsertPostAttempt(input: UpsertPostAttemptInput): Promise<PostScraped> {
    const metadata = await this.getAll();
    const existing = metadata.facebookPostsAttemptedScrape.find(
      (post) => post.postId === input.postId
    );

    if (existing) {
      existing.localPath = input.localPath;
      existing.scrapedAt = input.scrapedAt;
      existing.postedAt = input.postedAt;
      existing.sourceGroupId = input.sourceGroupId;
      existing.postUrl = input.postUrl ?? existing.postUrl;
      existing.isRealEstateRelated =
        input.isRealEstateRelated ?? existing.isRealEstateRelated;
      await this.save(metadata);
      return existing;
    }

    const post: PostScraped = {
      postId: input.postId,
      localPath: input.localPath,
      scrapedAt: input.scrapedAt,
      postedAt: input.postedAt,
      stepsCompleted: [],
      isRealEstateRelated: input.isRealEstateRelated ?? null,
      sourceGroupId: input.sourceGroupId,
      errors: [],
      postUrl: input.postUrl,
    };

    metadata.facebookPostsAttemptedScrape.push(post);
    await this.save(metadata);
    return post;
  }

  async markStepCompleted(
    postId: string,
    step: FacebookMetadataFileKeys
  ): Promise<void> {
    await this.updatePost(postId, (post) => {
      if (!post.stepsCompleted.includes(step)) {
        post.stepsCompleted.push(step);
      }
    });
  }

  async markStepFailed(
    postId: string,
    error: FacebookPostScrapeError
  ): Promise<void> {
    await this.updatePost(postId, (post) => {
      post.errors.push(error);
    });
  }

  private async updatePost(
    postId: string,
    updater: (post: PostScraped) => void
  ): Promise<void> {
    const metadata = await this.getAll();
    const post = metadata.facebookPostsAttemptedScrape.find(
      (item) => item.postId === postId
    );
    if (!post) return;

    updater(post);
    await this.save(metadata);
  }

  private async save(metadata: FacebookMetadataFileType): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(metadata, null, 2));
  }
}

function isMissingFileError(e: unknown): boolean {
  return (
    typeof e === "object" && e !== null && "code" in e && e.code === "ENOENT"
  );
}
