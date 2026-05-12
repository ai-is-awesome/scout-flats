import { Locator, Page } from "patchright";
import { getFirstMediaLocator } from "./facebookScraper";

class ExtractFacebookMediaUrls {
  static async extractMediaUrlsFromPage(postLocator: Locator): Promise<any> {
    const locator = await getFirstMediaLocator(postLocator);
    if (!locator) {
      throw new Error("No media locator found");
    }
    await locator.click();

    const page = locator.page();
    const result = await page.waitForSelector("[aria-label='Photo viewer']", {
      timeout: 5_000,
    });

    // Do  the scraping

    // Close the lightbox
    await page.locator("[aria-label='Close']").click();
  }
}
