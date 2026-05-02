import { chromium } from "patchright";

async function main() {
  const ctx = await chromium.launchPersistentContext("./fb-session", {
    channel: "chrome", // use system Chrome, not bundled Chromium — better fingerprint
    headless: false, // headful is significantly less detectable
    viewport: null, // don't override; let Chrome pick its natural size
  });

  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto("https://facebook.com");

  console.log("Log in manually in the opened window. Then close it.");
  // Wait until the user closes the browser window
  await new Promise<void>((resolve) => ctx.on("close", () => resolve()));
}

main();
