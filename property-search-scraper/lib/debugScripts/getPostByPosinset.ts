import { Page } from "patchright";
import { getHTMLPostDetails } from "../facebook/facebookScraper";
import { ExtractFacebookMediaUrls } from "../facebook/extractMediaUrls";
import { fbSelectors } from "../facebook/selectors";

export const getPostByPosinset = async (page: Page, num: number) => {
  const locator = page.locator(`[aria-posinset="${num}"]`).first();
  // const details = await getHTMLPostDetails(locator);
  // console.log("details : ", details);
  return locator;
};

export const getMediaLinksFromPosinset = async (page: Page, num: number) => {
  const locator = page.locator(fbSelectors.postByPosinset(num)).first();
  const urls = await ExtractFacebookMediaUrls.fromPost(locator);
  console.log("Media URLs from lightbox: ", urls);
};
