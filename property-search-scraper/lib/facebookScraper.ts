import type { Page, Locator } from "patchright";

const SCROLL_FRACTION = { min: 0.5, max: 0.9 };
const SETTLE_MS = { min: 4000, max: 10000 };
const IDLE_PROBABILITY = 0.03;
const IDLE_MS = { min: 15_000, max: 30_000 };

/**
 * Returns top-level, content-bearing post Locators on a feed page.
 * Filters out:
 *   - nested articles (a post sharing another post creates inner [role="article"])
 *   - non-content cards (suggestions, "people you may know", etc.) which lack story_message
 */
export async function getPosts(page: Page): Promise<Locator[]> {
  await page.waitForSelector('[role="article"]', { timeout: 15_000 });

  const all = await page.locator('[role="article"]').all();

  const result: Locator[] = [];
  for (const post of all) {
    const ancestor = await post
      .locator('xpath=ancestor::*[@role="article"][1]')
      .count();
    if (ancestor > 0) continue;

    const hasBody = await post
      .locator('[data-ad-rendering-role="story_message"]')
      .count();
    if (hasBody === 0) continue;

    result.push(post);
  }
  return result;
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
