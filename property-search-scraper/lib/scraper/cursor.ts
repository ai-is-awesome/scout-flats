import type { Page, Locator } from "patchright";
import { createCursor, type Cursor } from "ghost-cursor-playwright";
import { randomFloat, randomInt } from "../utils";

const SCROLL_FRACTION = { min: 0.5, max: 0.9 };
const SETTLE_MS = { min: 4000, max: 10000 };
const IDLE_PROBABILITY = 0.03;
const IDLE_MS = { min: 15_000, max: 30_000 };
const CLICK_PRE_DELAY_MS: [number, number] = [80, 200];

// One cursor per Page, lazily created. Cursor tracks previous position so
// movements feel continuous across calls instead of teleporting.
const cursorCache = new WeakMap<Page, Cursor>();

export async function getCursor(page: Page): Promise<Cursor> {
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
  // console.log("Box : ", box);
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

// Need to fix hardcoded params

export async function humanScroll(page: Page): Promise<void> {
  const fraction = randomFloat(SCROLL_FRACTION.min, SCROLL_FRACTION.max);
  await page.evaluate((f) => {
    window.scrollBy(0, window.innerHeight * f);
  }, fraction);

  const randomWait = randomInt(SETTLE_MS.min, SETTLE_MS.max);
  await page.waitForTimeout(randomWait);
  // console.log("Scrolled,  waiting for ", randomWait);

  if (Math.random() < IDLE_PROBABILITY) {
    // console.log("[humanScroll] idle pause…");
    await page.waitForTimeout(randomInt(IDLE_MS.min, IDLE_MS.max));
  }
}
