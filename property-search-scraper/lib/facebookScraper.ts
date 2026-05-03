import type { Page, Locator } from "patchright";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import type { PostDetailsWithoutMedia } from "./types/facebookTypes";

const SCROLL_FRACTION = { min: 0.5, max: 0.9 };
const SETTLE_MS = { min: 4000, max: 10000 };
const IDLE_PROBABILITY = 0.03;
const IDLE_MS = { min: 15_000, max: 30_000 };
const CLICK_PRE_DELAY_MS: [number, number] = [80, 200];

// One cursor per Page, lazily created. Cursor tracks previous position so
// movements feel continuous across calls instead of teleporting.
const cursorCache = new WeakMap<Page, Cursor>();

async function getCursor(page: Page): Promise<Cursor> {
  let cursor = cursorCache.get(page);
  if (!cursor) {
    // patchright Page is API-compatible with playwright-core's Page;
    // ghost-cursor-playwright's signature wants the latter.
    cursor = await createCursor(page as never);
    cursorCache.set(page, cursor);
  }
  return cursor;
}

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

function extractPostId(url: string): string {
  const m =
    url.match(/\/posts\/(\d+)/) ??
    url.match(/multi_permalinks=(\d+)/) ??
    url.match(/story_fbid=(\d+)/);
  return m?.[1] ?? "";
}

function extractGroupId(url: string): string {
  return url.match(/\/groups\/(\d+)/)?.[1] ?? "";
}

function extractAuthorId(profileUrl: string): string {
  return (
    profileUrl.match(/\/user\/(\d+)/)?.[1] ??
    profileUrl.match(/profile\.php\?id=(\d+)/)?.[1] ??
    ""
  );
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

/**
 * Drift the cursor to a random viewport point with a humanized Bezier path.
 * Call between scroll rounds to avoid the "frozen cursor" bot signal — real
 * users move their mouse while reading, even without clicking anything.
 */
export async function humanWander(page: Page): Promise<void> {
  const cursor = await getCursor(page);
  await cursor.actions.randomMove();
}

/**
 * Click a Locator with a humanized mouse path: drift to a random point inside
 * the target element (not always its center), pause briefly, then click.
 * Throws if the target isn't visible / has no bounding box.
 */
export async function humanClick(target: Locator): Promise<void> {
  const page = target.page();
  const cursor = await getCursor(page);

  const box = await target.boundingBox();
  if (!box) {
    throw new Error("humanClick: target has no bounding box (not visible?)");
  }

  await cursor.actions.click({
    target: box,
    waitBeforeClick: CLICK_PRE_DELAY_MS,
  });
}

/**
 * One scroll round with human-paced timing. Caller drives the loop.
 * Scrolls a random fraction of the viewport, then settles for 3-8s,
 * with a small chance of a longer idle pause.
 */
export async function humanScroll(page: Page): Promise<void> {
  const fraction = randomFloat(SCROLL_FRACTION.min, SCROLL_FRACTION.max);
  await page.evaluate((f) => {
    window.scrollBy(0, window.innerHeight * f);
  }, fraction);

  const randomWait = randomInt(SETTLE_MS.min, SETTLE_MS.max);
  await page.waitForTimeout(randomWait);
  console.log("Scrolled,  waiting for ", randomWait);

  if (Math.random() < IDLE_PROBABILITY) {
    console.log("[humanScroll] idle pause…");
    await page.waitForTimeout(randomInt(IDLE_MS.min, IDLE_MS.max));
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
