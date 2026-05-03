import type { Page, Locator } from "patchright";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import type { PostDetailsWithoutMedia } from "../types/facebookTypes";
import { humanClick } from "../scraper/cursor";
import { extractAuthorId, extractGroupId, extractPostId } from "./facebokUtils";

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
  await page.waitForSelector("[aria-posinset]", { timeout: 15_000 });

  const all = await page.locator("[aria-posinset]").all();
  console.log("Found posts with aria-posinset:", all.length);

  const result: PostDetailsWithoutMedia[] = [];
  for (const post of all) {
    // Hydration check 1: must have a story_message child with non-empty text
    const body = post.locator('[data-ad-rendering-role="story_message"]');
    if ((await body.count()) === 0) continue;
    const text = await body.first().textContent();
    if (!text || text.trim().length === 0) continue;

    // Hydration check 2: must have real visual height (zero-height = placeholder)
    const box = await post.boundingBox();
    if (!box || box.height < 50) continue;

    try {
      await expandSeeMore(post);
      const details = await getHTMLPostDetails(post, groupName);

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
  groupName: string
): Promise<PostDetailsWithoutMedia> {
  // 1. Author block — anchor with data-ad-rendering-role="profile_name"
  const authorAnchor = post
    .locator('[data-ad-rendering-role="profile_name"] a')
    .first();

  const authorName = (await authorAnchor.innerText()).trim();

  const authorProfileHref = (await authorAnchor.getAttribute("href")) ?? "";
  const authorProfileUrl =
    "https://www.facebook.com" + authorProfileHref.split("?")[0];
  const authorId = extractAuthorId(authorProfileHref);

  // Profile pic — <image xlink:href> inside the avatar SVG.
  // Playwright's getAttribute handles namespaced attrs by local name.
  const authorImgUrl =
    (await post
      .locator("svg image[*|href], svg image")
      .first()
      .getAttribute("xlink:href")) ?? "";

  // 2. Permalink — try the canonical timestamp/permalink anchor first,
  //    then fall back to deriving from a photo anchor's pcb.<id>.
  let permalink = "";
  const tsLink = post
    .locator(
      'a[href*="/posts/"], a[href*="multi_permalinks="], a[href*="permalink.php"], a[href*="story_fbid"]'
    )
    .first();

  if ((await tsLink.count()) > 0) {
    const rawHref = (await tsLink.getAttribute("href")) ?? "";
    permalink = absolutize(rawHref);
  } else {
    // Fallback: extract pcb.<postId> from any attached photo/video anchor
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

  const postId = extractPostId(permalink);
  const groupId = extractGroupId(permalink);

  // 3. Date posted — innerText to bypass FB's CSS-reorder scrambling.
  //    The timestamp anchor lives near the permalink; if tsLink missed,
  //    try the aria-label="<full date>" anchor commonly used in comments
  //    and post headers.
  let datePosted = "";
  if ((await tsLink.count()) > 0) {
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
    await humanClick(seeMore);
    await post.page().waitForTimeout(300);
  }
}
