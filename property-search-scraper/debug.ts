import { chromium } from "patchright";
import * as fs from "fs";
import * as path from "path";
import { getHTMLPostDetails } from "./lib/facebook/facebookScraper";
const run = async () => {
  console.log("Runnings");
  const html = fs.readFileSync("debug.html", "utf-8");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  //   const tmpFile = path.resolve("/tmp/debug-post.html");
  //   fs.writeFileSync(tmpFile, html);
  //   await page.goto(`file://${tmpFile}`);
  const path =
    "file:///D:/myStuff/career/programming_projects/property-search-bangalore/property-search-scraper/debug.html";

  await page.goto(path);

  const post = page.locator('[aria-posinset="3"]').first();
  getHTMLPostDetails(post, "Debug Group", "debug Id").then((details) =>
    console.log({
      ...details,
      postTextContent: details.postTextContent.slice(0, 100),
    })
  );
};

run();
