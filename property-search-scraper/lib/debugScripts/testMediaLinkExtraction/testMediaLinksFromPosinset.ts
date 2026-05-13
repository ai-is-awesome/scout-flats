import { ExtractFacebookMediaUrls } from "../../facebook/extractMediaUrls";
import { getPostByPosinset } from "../getPostByPosinset";

export async function testMediaLinksFromPosinset(page, num) {
  const locator = await getPostByPosinset(page, num);
  const urls = await ExtractFacebookMediaUrls.fromPost(locator);
  console.log("urls : ", urls);
}
