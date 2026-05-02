// src/test-stealth.ts
import { chromium } from "patchright";

(async () => {
  const ctx = await chromium.launchPersistentContext("./fb-session", {
    channel: "chrome",
    headless: false,
    viewport: null,
  });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto("https://bot.sannysoft.com");
  await page.waitForTimeout(15000);
  await ctx.close();
})();
