import { chromium } from "patchright";
import { getPosts, humanScroll, humanWander } from "./lib/facebookScraper";

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

  // h1 has two child nodes — first is "Notifications", second is the group name.
  const groupName =
    (await page
      .locator("h1")
      .first()
      .evaluate((el) => {
        const parts = Array.from(el.childNodes)
          .map((n) => (n.textContent ?? "").trim())
          .filter(Boolean);
        return parts[1] ?? parts[0] ?? "";
      })) || "Unknown group";
  console.log(`Group: ${groupName}`);

  const seen = new Set<string>();
  for (let round = 0; round < SCROLL_ROUNDS; round++) {
    console.log(`\n── Round ${round + 1} ──`);
    const posts = await getPosts(page, groupName);
    console.log(`Found ${posts.length} hydrated posts`);

    for (const details of posts) {
      if (seen.has(details.postId)) {
        console.log("Post is already seen, skipping");
        continue;
      }
      seen.add(details.postId);

      console.log(JSON.stringify(details, null, 2));
    }

    await humanWander(page);
    await humanScroll(page);
  }

  console.log(`\nTotal unique posts seen: ${seen.size}`);
}

main().catch((e) => {
  console.error(e);
});
