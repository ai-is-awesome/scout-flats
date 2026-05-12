import type { Page, Locator } from "patchright";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import type { PostDetailsWithoutMedia } from "../types/facebookTypes";
import { humanClick } from "../scraper/cursor";
import {
  constructFBProfileUrl,
  extractAuthorId,
  extractGroupId,
  extractPostId,
} from "./facebokUtils";
import { randomizeTime } from "../scraper/utils";

/**
 * Finds hydrated posts on the feed, expands "See more" where present, and
 * returns extracted PostDetails (no media) for each. Anchored on
 * [aria-posinset]. Sentinels (DOM rows without rendered content) are
 * filtered out via story_message + boundingBox checks. One bad post
 * doesn't kill the batch — extraction errors are logged and skipped.
 */
export async function getPosts(
  page: Page,
  groupName: string
): Promise<PostDetailsWithoutMedia[]> {
  const groupId = extractGroupId(page.url());
  console.log("Group ID : ", groupId);
  if (!groupId) {
    console.warn("Could not extract group ID from URL");
    process.exit(1);
  }

  await page.waitForSelector("[aria-posinset]", { timeout: 15_000 });

  const all = await page.locator("[aria-posinset]").all();
  console.log("Found posts with aria-posinset:", all.length);

  const result: PostDetailsWithoutMedia[] = [];
  for (const post of all) {
    // Hydration check 1: must have a story_message child with non-empty text
    console.log("Aria Posinset", await post.getAttribute("aria-posinset"));
    const body = post.locator('[data-ad-rendering-role="story_message"]');
    if ((await body.count()) === 0) continue;
    const text = await body.first().textContent();
    if (!text || text.trim().length === 0) continue;

    // Hydration check 2: must have real visual height (zero-height = placeholder)
    const box = await post.boundingBox();
    if (!box || box.height < 50) continue;

    try {
      await expandSeeMore(post);
      const details = await getHTMLPostDetails(post, groupName, groupId);

      result.push(details);
    } catch (e) {
      console.error("getPosts: extraction failed for one post:", e);
    }
  }
  return result;
}

/**
 * Extracts everything except mediaUrls from a single post Locator.
 * Caller responsibilities:
 *   - call expandSeeMore(post) first if the post might be truncated
 *   - extract groupName once from the page-level h1 and pass it in
 *     (h1 has two text nodes — first is "Notifications", second is the group name)
 */
export async function getHTMLPostDetails(
  post: Locator,
  groupName: string = "",
  groupId: string | undefined = undefined
): Promise<PostDetailsWithoutMedia> {
  // 1. Author block — anchor with data-ad-rendering-role="profile_name"
  const authorAnchor = post
    .locator('[data-ad-rendering-role="profile_name"] a')
    .first();

  const authorName = (await authorAnchor.innerText()).trim();

  const authorProfileHref = (await authorAnchor.getAttribute("href")) ?? "";

  const authorId = extractAuthorId(authorProfileHref);
  const authorProfileUrl = constructFBProfileUrl(authorId);

  // Profile pic — <image xlink:href> inside the avatar SVG.
  // Playwright's getAttribute handles namespaced attrs by local name.
  const authorImgUrl =
    (await post
      .locator("svg image[*|href], svg image")
      .first()
      .getAttribute("xlink:href")) ?? "";

  // 2. Permalink — primary path: canonical timestamp/permalink anchor.
  //    Read the raw href now while the locator is stable; the tertiary
  //    fallback below navigates the page, so all locator-dependent reads
  //    (date, body) must happen before that.
  let permalink = "";
  const tsLink = post
    .locator(
      'a[href*="/posts/"], a[href*="multi_permalinks="], a[href*="permalink.php"], a[href*="story_fbid"]'
    )
    .first();
  const tsLinkCount = await tsLink.count();

  if (tsLinkCount > 0) {
    const rawHref = (await tsLink.getAttribute("href")) ?? "";
    permalink = absolutize(rawHref);
  }

  // Secondary: derive from a photo anchor's pcb.<id> (only present when
  // the post has attached photos/videos).
  if (!permalink) {
    const photoAnchor = post.locator('a[href*="pcb."]').first();
    if ((await photoAnchor.count()) > 0) {
      const photoHref = (await photoAnchor.getAttribute("href")) ?? "";
      const pcbMatch = photoHref.match(/pcb\.(\d+)/);
      const groupMatch = authorProfileHref.match(/\/groups\/(\d+)\//);
      if (pcbMatch && groupMatch) {
        permalink = `https://www.facebook.com/groups/${groupMatch[1]}/posts/${pcbMatch[1]}/`;
      }
    }
  }

  // 3. Date posted — innerText to bypass FB's CSS-reorder scrambling.
  //    The timestamp anchor lives near the permalink; if tsLink missed,
  //    try the aria-label="<full date>" anchor commonly used in comments
  //    and post headers.
  let datePosted = "";
  if (tsLinkCount > 0) {
    datePosted = (
      await tsLink.evaluate((el) => (el as HTMLElement).innerText)
    ).trim();
  } else {
    const datedAnchor = post.locator('a[aria-label*=":"]').first();
    if ((await datedAnchor.count()) > 0) {
      datePosted = (await datedAnchor.getAttribute("aria-label"))?.trim() ?? "";
    }
  }

  // 4. Body text — caller should have invoked expandSeeMore(post) already.
  //    Use innerText for the same CSS-reorder reason; textContent can leak
  //    decoy spans Facebook injects to confuse scrapers.
  const storyMessage = post
    .locator('[data-ad-rendering-role="story_message"]')
    .first();

  const postTextContent =
    (await storyMessage.count()) > 0
      ? (
          await storyMessage.evaluate((el) => (el as HTMLElement).innerText)
        ).trim()
      : "";

  // Tertiary permalink fallback — runs LAST because it navigates the page,
  // which would invalidate `post` for any subsequent reads. Click the
  // "Leave a comment" button; FB rewrites the URL to /permalink/<id>/
  // (or /posts/<id>/), then we navigate back.
  if (!permalink) {
    console.log("Gettnig perma link from clicking on comment!");
    permalink = await getPermalinkViaCommentClick(post);
  }

  const postId = extractPostId(permalink);

  const permaLinkConstructed =
    postId && groupId
      ? `https://www.facebook.com/groups/${groupId}/posts/${postId}/`
      : "";

  return {
    postId,
    groupId,
    groupName,
    authorDetails: {
      authorName,
      authorId,
      authorProfileUrl,
      //   authorImgUrl,
    },
    permalink,
    permaLinkConstructed,
    datePosted,
    scrapedAt: new Date().toISOString(),
    postTextContent,
  };
}

// ── URL helpers ──────────────────────────────────────────────────────────────

function absolutize(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://www.facebook.com${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Last-resort permalink extraction for posts where neither the header
 * timestamp anchor nor a `pcb.<id>` photo anchor is available (typically
 * text-only posts in the modern FB feed, where the header timestamp uses
 * an obfuscated href like `?...#?djg`). Clicks the post's "Leave a
 * comment" button, which causes FB to navigate to the canonical
 * `/groups/<slug>/permalink/<postId>/` URL; we read it from
 * `page.url()` and then go back so the feed loop can continue.
 *
 * Returns "" if the button isn't present or the URL never updates.
 * Always navigates back even on success, so the caller's iteration over
 * remaining posts is preserved.
 */
async function getPermalinkViaCommentClick(post: Locator): Promise<string> {
  const page = post.page();
  const commentBtn = post
    .locator('div[role="button"][aria-label="Leave a comment"]')
    .first();

  if ((await commentBtn.count()) === 0) return "";

  const beforeUrl = page.url();
  let permalink = "";

  try {
    await commentBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(randomizeTime("small"));
    await humanClick(commentBtn);

    await page.waitForURL(
      (url) =>
        url.toString() !== beforeUrl &&
        /\/(permalink|posts)\/\d+/.test(url.toString()),
      { timeout: 5_000 }
    );
    permalink = page.url();
  } catch (e) {
    console.warn("getPermalinkViaCommentClick: URL never updated", e);
  } finally {
    if (page.url() !== beforeUrl) {
      await page.goBack();
      // Wait for the feed to rehydrate so the outer getPosts loop can
      // continue processing subsequent post locators.
      await page
        .waitForSelector("[aria-posinset]", { timeout: 10_000 })
        .catch(() => {});
    }
  }

  return permalink;
}

/**
 * Clicks the "See more" expansion button inside a post if present, so the
 * full body text becomes available before extraction. Scoped to the post
 * to avoid hitting comment "View more replies" buttons. The strict
 * /^See more$/i regex avoids matching "See translation" or similar.
 */
export async function expandSeeMore(post: Locator): Promise<void> {
  const seeMore = post
    .locator('div[role="button"]')
    .filter({ hasText: /^See more$/i })
    .first();

  if (await seeMore.isVisible().catch(() => false)) {
    console.log("See more :", await seeMore.innerText());
    // Bring the button on-screen first — ghost-cursor can't click at
    // negative Y / outside the viewport. FB virtualization keeps posts
    // in the DOM after they scroll off, so this is common.
    await seeMore.scrollIntoViewIfNeeded();
    await post.page().waitForTimeout(randomizeTime("small")); // let the scroll settle
    await humanClick(seeMore);
    await post.page().waitForTimeout(300);
  }
}

/**
 * Returns the first clickable photo anchor inside a post. FB puts the
 * descriptor in different places depending on post type:
 *   - regular photo posts & multi-photo commerce listings:
 *       the <a> has aria-label="May be an image of …" / "No photo description…"
 *   - single-image commerce listings:
 *       the <a> has no aria-label; the alt lives on the inner <img>
 *
 * We match both shapes so the caller doesn't need to branch on post type.
 */
export async function getFirstMediaLocator(post: Locator): Promise<Locator> {
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

/**
 * Extracts all media (images + videos) from whatever page is currently
 * open after clicking the first media tile of a post. Handles three
 * shapes:
 *
 *   (a) Multi-photo commerce listing — thumbnail strip with
 *       [aria-label="Thumbnail 0"]…[aria-label="Thumbnail N-1"]; each
 *       contains an <img src> at _s960x960_tt6 resolution.
 *   (b) Regular FB photo viewer (/photo/?fbid=… or /videos/pcb.<id>/<vid>)
 *       — no thumbnail strip, only the current hero is in the DOM. We
 *       walk "Next photo" to enumerate; per-frame we detect <video> vs
 *       <img> and emit the right Media type.
 *   (c) Single-image commerce listing — just the hero
 *       img[data-imgperflogname="feedImage"].
 *
 * Caller navigates *to* the lightbox first (e.g., via
 * getFirstMediaLocator) and *back* when done.
 *
 * Known gap: paths (a) and (c) don't yet detect video tiles. Commerce
 * listings rarely have video, but if one slips through we'd miss it
 * silently — extend with a play-button / nested <video> check if needed.
 */
export async function extractMediaUrlsFromLightbox(
  page: Page
): Promise<Media[]> {
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

  // (a) Commerce multi-photo path: read each Thumbnail N tile in order.
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

  // (b) Photo-viewer path: cycle through Next, detecting img vs video
  //     per frame.
  const heroImgCount = await page
    .locator('img[data-visualcompletion="media-vc-image"]')
    .count();
  const heroVideoCount = await page
    .locator('div[aria-label="Photo viewer"] video')
    .count();
  if (heroImgCount > 0 || heroVideoCount > 0) {
    return await walkPhotoViewer(page);
  }

  // (c) Commerce single-image path: just the hero feedImage.
  const hero = page.locator('img[data-imgperflogname="feedImage"]').first();
  if ((await hero.count()) > 0) {
    const src = await hero.getAttribute("src");
    return src ? [{ type: "image", url: src }] : [];
  }

  return [];
}

/**
 * Walks FB's photo viewer by clicking "Next photo" until the button
 * vanishes or we revisit a previously seen frame. Each frame is either:
 *   - an image: hero is img[data-visualcompletion="media-vc-image"], we
 *     read its `src` (a direct fbcdn URL).
 *   - a video: hero is a <video> with empty `src` (MSE-fed). We read
 *     `page.url()` instead — when the viewer lands on a video, the URL
 *     becomes /<actorId>/videos/pcb.<postId>/<videoId>, which is the
 *     stable permalink yt-dlp can later resolve to playable segments.
 *
 * Loop signal: URL change is the universal "frame advanced" indicator —
 * each photo has a unique fbid in the URL, and image↔video transitions
 * always change it too. If URL doesn't change within 5s after Next
 * (e.g., Next click was a no-op at end-of-set), the next iteration's
 * `seen` check breaks the loop. Hard cap at 20 iterations as belt-and-
 * braces against any infinite-loop edge case.
 */
async function walkPhotoViewer(page: Page): Promise<Media[]> {
  const seen = new Set<string>();
  const results: Media[] = [];
  const nextBtn = page.locator('div[role="button"][aria-label="Next photo"]');

  for (let i = 0; i < 20; i++) {
    const media = await readCurrentFrame(page);
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

    // Wait for URL to change. Covers image→image (different fbid),
    // image→video (path becomes /videos/pcb...), and video→image.
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
 * Inspects the photo viewer's current frame and returns either an image
 * Media (with the fbcdn src) or a video Media (with the page URL as the
 * permalink). Returns null if neither hero shape is present — caller
 * should treat that as end-of-walk.
 */
async function readCurrentFrame(page: Page): Promise<Media | null> {
  // Video detection: URL alone. When the photo viewer lands on a video,
  // page.url() becomes /<actorId>/videos/pcb.<postId>/<videoId> — that IS
  // the video permalink we want, no DOM lookup needed.
  const url = page.url();
  if (url.includes("/videos/")) {
    return { type: "video", url };
  }

  // Image: read hero img src. Selector below was confirmed against a real
  // lightbox HTML dump; do not swap it without re-confirming.
  const heroImg = page
    .locator('img[data-visualcompletion="media-vc-image"]')
    .first();
  if ((await heroImg.count()) > 0) {
    const src = await heroImg.getAttribute("src");
    if (src) return { type: "image", url: src };
  }

  return null;
}
