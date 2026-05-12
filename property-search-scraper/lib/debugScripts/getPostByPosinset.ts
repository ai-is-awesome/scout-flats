import { Page } from "patchright";
import {
  extractMediaUrlsFromLightbox,
  getFirstMediaLocator,
  getHTMLPostDetails,
} from "../facebook/facebookScraper";
import { fbSelectors } from "../facebook/selectors";

export const getPostByPosinset = async (page: Page, num: number) => {
  const locator = page.locator(`[aria-posinset="${num}"]`).first();
  const details = await getHTMLPostDetails(locator);
  console.log("details : ", details);
};

export const getMediaLinksFromPosinset = async (page: Page, num: number) => {
  const locator = page.locator(fbSelectors.postByPosinset(num)).first();
  const mediaLocator = await getFirstMediaLocator(locator);
  await mediaLocator.click();
  await page.waitForTimeout(2000);
  const urls = await extractMediaUrlsFromLightbox(page);
  console.log("Media URLs from lightbox: ", urls);
};
