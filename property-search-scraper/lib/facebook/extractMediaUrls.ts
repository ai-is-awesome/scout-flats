import type { Locator, Page } from "patchright";
import { humanClick } from "../scraper/cursor";
import { randomizeTime } from "../scraper/utils";

/**
 * Single piece of media surfaced from a post's lightbox. `image` carries
 * a direct fbcdn image URL (download immediately, server-side); `video`
 * carries the FB permalink form
 * `https://www.facebook.com/<actorId>/videos/pcb.<postId>/<videoId>` —
 * which is what the page URL becomes when the photo viewer lands on a
 * video frame. Hand that permalink to yt-dlp later in the pipeline; the
 * actual segmented stream URLs aren't accessible from the DOM.
 */
export type Media =
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export type OrderedMedia = Media & { order: number };

/**
 * All media-extraction concerns for an FB group post: locating the first
 * media tile, opening the lightbox, walking it, and closing it. Kept
 * separate from facebookScraper.ts (which owns text/permalink) so each
 * file is small enough to reason about against a real DOM dump.
 */
export class ExtractFacebookMediaUrls {
  /**
   * Main entry. Given a post locator, opens the lightbox, walks all
   * frames, closes. Returns [] when the post has no media or the
   * lightbox never opens. Always attempts to restore feed state on the
   * way out so the caller's iteration over remaining posts can proceed.
   */
  static async fromPost(post: Locator): Promise<OrderedMedia[]> {
    const firstMedia = await this.getFirstMediaLocator(post);
    if ((await firstMedia.count()) === 0) return [];

    const page = post.page();
    const beforeUrl = page.url();

    const opened = await this.openLightbox(firstMedia, page, beforeUrl);
    if (!opened) return [];

    let media: Media[] = [];
    try {
      media = await this.extractFromOpenLightbox(page);
    } catch (e) {
      console.warn("ExtractFacebookMediaUrls: extraction failed", e);
    }

    await this.closeLightbox(page, beforeUrl);

    return media.map((m, i) => ({ ...m, order: i }));
  }

  /**
   * First clickable photo anchor inside a post. FB puts the descriptor
   * in different places depending on post type:
   *   - regular photo / multi-photo commerce: a[aria-label^="May be..."]
   *   - single-image commerce: a:has(img[alt^="..."])
   * Both shapes matched so the caller doesn't need to branch.
   */

  static async getFirstMediaLocator(post: Locator): Promise<Locator> {
    const labels = ["May be an image", "No photo description"];
    const selector = labels
      .flatMap((label) => [
        `a[aria-label^='${label}']`,
        `a:has(img[alt^='${label}'])`,
      ])
      .join(", ");
    return post.locator(selector).first();
  }

  /**
   * Reads media from a lightbox that's already open. Handles three
   * shapes (all selectors confirmed against real lightbox HTML dumps;
   * do not swap without re-confirming):
   *   (a) Multi-photo commerce — [aria-label^="Thumbnail "] strip
   *   (b) Photo viewer with Next button — img/video hero, walked
   *   (c) Single-image commerce — img[data-imgperflogname="feedImage"]
   *
   * Known gap: paths (a) and (c) don't detect video tiles. Commerce
   * listings rarely have video; extend with a play-button / nested
   * <video> check if needed.
   */
  static async extractFromOpenLightbox(page: Page): Promise<Media[]> {
    try {
      await page.waitForSelector(
        [
          '[aria-label^="Thumbnail "] img',
          'img[data-imgperflogname="feedImage"]',
          'img[data-visualcompletion="media-vc-image"]',
          'div[aria-label="Photo viewer"] video',
        ].join(", "),
        { timeout: 5_000 }
      );
    } catch {
      return [];
    }

    // (a) Commerce multi-photo: read each Thumbnail N tile in order.
    const thumbnails = page.locator('[aria-label^="Thumbnail "] img');
    const thumbCount = await thumbnails.count();
    if (thumbCount > 0) {
      console.log("thumbnails found, doing media links the thumbnail way");
      const urls: string[] = [];
      for (let i = 0; i < thumbCount; i++) {
        const src = await thumbnails.nth(i).getAttribute("src");
        if (src) urls.push(src);
      }
      return Array.from(new Set(urls)).map((url) => ({ type: "image", url }));
    }

    // (b) Photo-viewer: cycle Next, detect img vs video per frame.
    const heroImgCount = await page
      .locator('img[data-visualcompletion="media-vc-image"]')
      .count();
    const heroVideoCount = await page
      .locator('div[aria-label="Photo viewer"] video')
      .count();
    if (heroImgCount > 0 || heroVideoCount > 0) {
      return await this.walkPhotoViewer(page);
    }

    // (c) Commerce single-image: just the hero feedImage.
    const hero = page.locator('img[data-imgperflogname="feedImage"]').first();
    if ((await hero.count()) > 0) {
      const src = await hero.getAttribute("src");
      return src ? [{ type: "image", url: src }] : [];
    }

    return [];
  }

  /**
   * Click the first media tile and wait for the URL to change — that's
   * the universal signal that the lightbox opened, whether the tile
   * navigates to /photo/?fbid=... or /videos/pcb.../...
   */
  private static async openLightbox(
    firstMedia: Locator,
    page: Page,
    beforeUrl: string
  ): Promise<boolean> {
    try {
      await firstMedia.scrollIntoViewIfNeeded();
      await page.waitForTimeout(randomizeTime("small"));
      await humanClick(firstMedia);
      await page.waitForURL((url) => url.toString() !== beforeUrl, {
        timeout: 5_000,
      });
      return true;
    } catch (e) {
      console.warn("ExtractFacebookMediaUrls: failed to open lightbox", e);
      return false;
    }
  }

  /**
   * Close the lightbox. Primary: [aria-label='Close'] click — FB
   * restores the feed URL internally without a full navigation, so the
   * outer post locators stay valid. Fallback: page.goBack() + wait for
   * [aria-posinset] (the kept-as-fallback older approach).
   */
  private static async closeLightbox(
    page: Page,
    beforeUrl: string
  ): Promise<void> {
    const closeBtn = page.locator("[aria-label='Close']").first();
    const hasClose =
      (await closeBtn.count()) > 0 &&
      (await closeBtn.isVisible().catch(() => false));

    if (hasClose) {
      try {
        await closeBtn.click();
        await page
          .waitForURL((url) => url.toString() === beforeUrl, {
            timeout: 3_000,
          })
          .catch(() => {});
      } catch (e) {
        console.warn(
          "ExtractFacebookMediaUrls: Close button click failed, falling back to goBack",
          e
        );
      }
    }

    if (page.url() !== beforeUrl) {
      await page.goBack();
      await page
        .waitForSelector("[aria-posinset]", { timeout: 10_000 })
        .catch(() => {});
    }
  }

  /**
   * Walk the photo viewer by clicking Next until it vanishes or a frame
   * repeats. Image frames: read hero img src (fbcdn URL). Video frames:
   * read page.url() (the /videos/pcb... permalink — segments themselves
   * are MSE-fed and not DOM-reachable; yt-dlp resolves the permalink
   * downstream).
   *
   * Loop signal: URL change is the universal "frame advanced"
   * indicator. Hard cap at 20 as a belt-and-braces guard against
   * infinite-loop edge cases.
   */
  private static async walkPhotoViewer(page: Page): Promise<Media[]> {
    const seen = new Set<string>();
    const results: Media[] = [];
    const nextBtn = page.locator('div[role="button"][aria-label="Next photo"]');

    for (let i = 0; i < 20; i++) {
      const media = await this.readCurrentFrame(page);
      console.log("i: ", i);
      if (!media || seen.has(media.url)) {
        console.log(
          "Repeated media found, breaking",
          media,
          seen.has(media?.url || "")
        );
        break;
      }
      seen.add(media.url);
      results.push(media);

      if ((await nextBtn.count()) === 0) {
        console.log("No Next button found, breaking");
        break;
      }
      const visible = await nextBtn
        .first()
        .isVisible()
        .catch(() => false);
      if (!visible) {
        console.log("Next button is not visible, breaking");
        break;
      }

      const beforeUrl = page.url();
      await nextBtn
        .first()
        .click()
        .catch(() => {});

      await page
        .waitForFunction(
          (prev: string) =>
            typeof location !== "undefined" && location.href !== prev,
          beforeUrl,
          { timeout: 5_000 }
        )
        .catch(() => {});
    }

    return results;
  }

  /**
   * Inspect the photo viewer's current frame. Video: detected via URL
   * alone (the /videos/pcb... path is the permalink we want; no DOM
   * lookup needed). Image: read hero img src. Returns null when neither
   * shape is present — caller treats that as end-of-walk.
   */
  private static async readCurrentFrame(page: Page): Promise<Media | null> {
    const url = page.url();
    if (url.includes("/videos/")) {
      return { type: "video", url };
    }

    const heroImg = page
      .locator('img[data-visualcompletion="media-vc-image"]')
      .first();
    if ((await heroImg.count()) > 0) {
      const src = await heroImg.getAttribute("src");
      if (src) return { type: "image", url: src };
    }
    return null;
  }
}
