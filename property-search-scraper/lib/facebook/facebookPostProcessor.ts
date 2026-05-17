import {
  getPostStoragePaths,
  savePostData,
} from "../ioOperations/ioOperations";
import { FacebookMetadataFileKeys } from "../types/facebookMetadataFileType";
import type { PostScrapeType } from "../types/facebookTypes";
import { FacebookMetadataRepository } from "./facebookMetadataRepository";

export class FacebookPostProcessor {
  constructor(
    private readonly metadataRepository = new FacebookMetadataRepository()
  ) {}

  async process(post: PostScrapeType): Promise<void> {
    try {
      const paths = getPostStoragePaths(post.postId);
      await this.metadataRepository.upsertPostAttempt({
        postId: post.postId,
        localPath: paths.postDir,
        scrapedAt: Date.now(),
        postedAt: null,
        sourceGroupId: post.groupId,
        postUrl: post.permaLinkConstructed || post.permalink,
      });

      await this.metadataRepository.markStepCompleted(
        post.postId,
        FacebookMetadataFileKeys.textContentScraped
      );
      await this.metadataRepository.markStepCompleted(
        post.postId,
        FacebookMetadataFileKeys.mediaLinksScraped
      );

      await savePostData(post.postId, post);
    } catch (e) {
      await this.metadataRepository.markStepFailed(post.postId, {
        step: FacebookMetadataFileKeys.textContentScraped,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }
}
