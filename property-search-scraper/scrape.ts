import { chromium } from "patchright";
import { getPosts } from "./lib/facebook/facebookScraper";
import { humanScroll, humanWander } from "./lib/scraper/cursor";
import { extractGroupId } from "./lib/facebook/facebokUtils";
import { savePostData } from "./lib/ioOperations/ioOperations";

const TARGET_GROUP_URL = "https://www.facebook.com/groups/838402552906457/";
const SCROLL_ROUNDS = 1;

function updateMetadataFile() {}

async function main() {
  const ctx = await chromium.launchPersistentContext("./fb-session", {
    channel: "chrome",
    headless: false,
    viewport: null,
    args: ["--remote-debugging-port=9222"],
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
      if (!details.postId || !details.groupId) {
        console.log("Skipping as unable to find post id or group id");
        continue;
      }
      if (seen.has(details.postId)) {
        console.log("Post is already seen, skipping");
        continue;
      }

      seen.add(details.postId);

      console.log(
        JSON.stringify(
          {
            ...details,
            postTextContent: details.postTextContent.slice(0, 100),
          },
          null,
          2
        )
      );

      await savePostData(details.postId, details);
    }
    await humanWander(page);
    await humanScroll(page);
  }

  console.log(`\nTotal unique posts seen: ${seen.size}`);

  console.log(
    "\nScrape finished. Browser kept open on http://localhost:9222.\n" +
      "Attach a REPL with `npx tsx repl.ts`. Ctrl+C to quit."
  );
  // Suppress unused warning + keep ctx referenced so it isn't GC'd.
  void ctx;
  await new Promise<never>(() => {});
}

main().catch((e) => {
  console.error(e);
});

// >Flow is something like this, scrape a post > check if post id exists

// >ask ai if its real estate or not, ask about male /
// female requirement if mentioned, extract amenities, extract price and per month or not,
// ask if deposit is present or  not, ,

// if rea estate selling post, find the google maps link and phone numbmer if it exsits
// Save progress like steps completed  : [extractedBasicText, extractedMediaLinks, extractedPhoneNumber, extractedLocation, ]
// Run the yt-dlp and image downloaders later
// All  this goes in the meta data, once the pipeline is created,
//  put the data in the db!!!! that's it, credits and other things coming this week most likely
