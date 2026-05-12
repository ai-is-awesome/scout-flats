const defaultScrollRounds = 5;

type Config = {
  useConstantScrollRoundsForAllGroups: boolean;
  defaultScrollRounds: number;
  groupScrapeConfig: {
    groupUrl: string;
    scrollRounds: number;
  }[];
};

const config: Config = {
  useConstantScrollRoundsForAllGroups: false,
  defaultScrollRounds: 5,
  groupScrapeConfig: [
    {
      groupUrl: "https://www.facebook.com/groups/838402552906457/",
      scrollRounds: 1,
    },
  ],
};

async function facebookScraperPipeline(config: Config) {
  let scrollRounds = config.useConstantScrollRoundsForAllGroups
    ? config.defaultScrollRounds
    : null;

  for (const {
    groupUrl,
    scrollRounds: groupScrollRounds,
  } of config.groupScrapeConfig) {
    if (!scrollRounds) {
      scrollRounds = groupScrollRounds || defaultScrollRounds;
    }
    console.log(
      `Scraping group: ${groupUrl} for ${scrollRounds} scroll rounds`
    );
  }
}
