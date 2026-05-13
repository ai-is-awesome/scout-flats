import { BrowserContext, chromium } from "patchright";

export interface Config {
  sessionPath: string;
  launchOptions?: LaunchOpts;
}

type LaunchOpts = NonNullable<
  Parameters<typeof chromium.launchPersistentContext>[1]
>;

export async function createPersistentBrowser(
  c?: Config
): Promise<BrowserContext> {
  const sessionPath = c?.sessionPath ?? "";

  const launchOpts: LaunchOpts = {
    headless: c?.launchOptions?.headless ?? false,
    viewport: c?.launchOptions?.viewport ?? null,
    channel: "chrome",
    args: ["--remote-debugging-port=9222"],
  };

  const ctx = await chromium.launchPersistentContext(sessionPath, {
    channel: "chrome",
    ...launchOpts,
  });
  return ctx;
}
