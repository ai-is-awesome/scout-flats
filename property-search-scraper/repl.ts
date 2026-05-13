import { chromium } from "patchright";
import {
  getMediaLinksFromPosinset,
  getPostByPosinset,
} from "./lib/debugScripts/getPostByPosinset";
import { testMediaLinksFromPosinset } from "./lib/debugScripts/testMediaLinkExtraction/testMediaLinksFromPosinset";

/**
 * Selector-iteration scratchpad. Connects to the already-running Patchright
 * browser launched by `scrape.ts` (which exposes CDP on :9222 and idles
 * after scraping), grabs the active page, and runs whatever experiment
 * you put inside `experiment(page)`.
 *
 * Usage:
 *   1. Run `npx tsx scrape.ts` once. Wait until it prints
 *      "Browser kept open on http://localhost:9222".
 *   2. Edit the `experiment` function below.
 *   3. Run `npx tsx repl.ts` (re-run as many times as you want — same browser).
 */

async function experiment(page: import("patchright").Page) {
  // ── three-pronged video-URL investigation ───────────────────────────
  //
  // (1) Inspect <video> elements, including srcObject (MSE MediaSource).
  // (2) Dump ALL fbcdn resources from the perf buffer — broader than
  //     before since FB may not use exactly /t42 or video.xx.fbcdn.net.
  // (3) Attach a live response listener and ask the caller to play/seek
  //     the video for ~10s. This catches segments even if FB clears the
  //     resource-timing buffer.

  // (3) wire up the listener BEFORE anything else, so we don't miss
  // requests fired during inspection.
  const captured = new Set<string>();
  page.on("response", (resp) => {
    const url = resp.url();
    if (/fbcdn\.net/.test(url) && !/\.(jpg|png|webp|svg|css|js)\b/.test(url)) {
      captured.add(`${resp.status()} ${resp.request().resourceType()} ${url}`);
    }
  });

  // (1) + (2) introspect current state
  const report = await page.evaluate(() => {
    const videos = Array.from(document.querySelectorAll("video")).map((v) => {
      const so = v.srcObject;
      let srcObjectInfo: unknown = null;
      if (so) {
        if (so instanceof MediaSource) {
          srcObjectInfo = {
            kind: "MediaSource",
            readyState: so.readyState,
            duration: so.duration,
            activeSourceBuffers: so.activeSourceBuffers.length,
            sourceBuffers: Array.from(so.sourceBuffers).map((sb) => ({
              mode: sb.mode,
              updating: sb.updating,
              buffered: Array.from({ length: sb.buffered.length }, (_, i) => [
                sb.buffered.start(i),
                sb.buffered.end(i),
              ]),
            })),
          };
        } else {
          srcObjectInfo = { kind: so.constructor?.name ?? "unknown" };
        }
      }
      return {
        src: v.src,
        currentSrc: v.currentSrc,
        srcObject: srcObjectInfo,
        duration: v.duration,
        paused: v.paused,
        readyState: v.readyState,
        size: `${v.videoWidth}x${v.videoHeight}`,
      };
    });

    const allFbcdn = performance
      .getEntriesByType("resource")
      .map((e) => e.name)
      .filter((url) => /fbcdn\.net/.test(url))
      .filter((url) => !/\.(jpg|png|webp|svg|css|js)\b/.test(url));

    return { videos, allFbcdn };
  });

  console.log(`<video> elements: ${report.videos.length}`);
  for (const [i, v] of report.videos.entries()) console.log(`  [${i}]`, v);

  console.log(
    `\nfbcdn resources in perf buffer (filtered): ${report.allFbcdn.length}`
  );
  for (const url of report.allFbcdn.slice(0, 20)) console.log("  ", url);

  // (3) live capture — please scrub / replay the video while this waits.
  console.log(
    "\nLive-capturing fbcdn responses for 10s. Scrub or replay the video now…"
  );
  await page.waitForTimeout(10_000);

  console.log(`\nLive-captured: ${captured.size}`);
  for (const line of captured) console.log("  ", line);
}

async function main() {
  const browser = await chromium.connectOverCDP("http://localhost:9222");
  const context = browser.contexts()[0];
  if (!context) throw new Error("No browser context found over CDP.");

  const pages = context.pages();
  if (pages.length === 0) throw new Error("No open pages in the context.");

  // Pick the page on facebook.com if there's more than one tab open;
  // otherwise just take the first.
  const page = pages.find((p) => p.url().includes("facebook.com")) ?? pages[0];
  console.log(`Attached to: ${page.url()}\n`);

  try {
    await testMediaLinksFromPosinset(page, 3);
  } catch (e) {
    console.error("Experiment error:", e);
  } finally {
    // Don't close the browser — it belongs to scrape.ts. Just disconnect.
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
});
