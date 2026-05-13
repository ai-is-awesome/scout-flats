import type { Page, Locator } from "patchright";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import type {
  PostDetailsWithoutMedia,
  PostScrapeType,
} from "../types/facebookTypes";
import { humanClick } from "../scraper/cursor";
import {
  constructFBProfileUrl,
  extractAuthorId,
  extractGroupId,
  extractPostId,
} from "./facebokUtils";
import { randomizeTime } from "../scraper/utils";
import { ExtractFacebookMediaUrls } from "./extractMediaUrls";

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
): Promise<PostScrapeType[]> {
  const groupId = extractGroupId(page.url());
  console.log("Group ID : ", groupId);
  if (!groupId) {
    console.warn("Could not extract group ID from URL");
    process.exit(1);
  }

  await page.waitForSelector("[aria-posinset]", { timeout: 15_000 });

  const all = await page.locator("[aria-posinset]").all();
  console.log("Found posts with aria-posinset:", all.length);

  const result: PostScrapeType[] = [];
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
      const mediaUrls = await ExtractFacebookMediaUrls.fromPost(post);

      result.push({ ...details, mediaUrls });
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

