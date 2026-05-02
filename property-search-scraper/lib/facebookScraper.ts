import type { Page, Locator } from "patchright";

const SCROLL_FRACTION = { min: 0.5, max: 0.9 };
const SETTLE_MS = { min: 4000, max: 10000 };
const IDLE_PROBABILITY = 0.03;
const IDLE_MS = { min: 15_000, max: 30_000 };

/**
 * Returns hydrated, content-bearing post Locators on a feed page.
 * Anchored on [aria-posinset] (FB's per-post position attribute).
 * Filters out unhydrated sentinels — posts that exist in the DOM but
 * haven't had their content rendered yet (FB virtualizes the feed).
 */
export async function getPosts(page: Page): Promise<Locator[]> {
  await page.waitForSelector("[aria-posinset]", { timeout: 15_000 });

  const all = await page.locator("[aria-posinset]").all();

  const result: Locator[] = [];
  for (const post of all) {
    // Hydration check 1: must have a story_message child with non-empty text
    const body = post.locator('[data-ad-rendering-role="story_message"]');
    if ((await body.count()) === 0) continue;
    const text = await body.first().textContent();
    if (!text || text.trim().length === 0) continue;

    // Hydration check 2: must have real visual height (zero-height = placeholder)
    const box = await post.boundingBox();
    if (!box || box.height < 50) continue;

    result.push(post);
  }
  return result;
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
    await seeMore.click();
    await post.page().waitForTimeout(300);
  }
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

  await page.waitForTimeout(randomInt(SETTLE_MS.min, SETTLE_MS.max));

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
