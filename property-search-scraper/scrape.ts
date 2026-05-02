import { chromium } from "patchright";
import { getPosts, humanScroll } from "./lib/facebookScraper";

const TARGET_GROUP_URL = "https://www.facebook.com/groups/838402552906457/";
const SCROLL_ROUNDS = 5;

async function main() {
  const ctx = await chromium.launchPersistentContext("./fb-session", {
    channel: "chrome",
    headless: false,
    viewport: null,
  });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto(TARGET_GROUP_URL);

  const seen = new Set<string>();
  for (let round = 0; round < SCROLL_ROUNDS; round++) {
    console.log(`\n── Round ${round + 1} ──`);
    const posts = await getPosts(page);
    console.log(`Found ${posts.length} posts in viewport`);

    for (const post of posts) {
      const body = await post
        .locator('[data-ad-rendering-role="story_message"]')
        .first()
        .textContent();
      const snippet = body?.trim().slice(0, 80) ?? "(no body)";
      if (seen.has(snippet)) continue;
      seen.add(snippet);
      console.log(`• ${snippet}…`);
    }

    await humanScroll(page);
  }

  console.log(`\nTotal unique posts seen: ${seen.size}`);
  await ctx.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
