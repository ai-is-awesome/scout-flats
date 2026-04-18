type LocalityRow = {
  localityKey?: string | null;
  name?: string | null;
};

type MatchPopularLocalitiesResult = {
  popularLocalityKeys: string[];
  missingTopAreas: string[];
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

export function matchPopularLocalities(
  rows: LocalityRow[],
  topAreas: string[]
): MatchPopularLocalitiesResult {
  return topAreas.reduce<MatchPopularLocalitiesResult>(
    (acc, area) => {
      const areaNorm = normalize(area);
      const match = rows.find((row) => {
        return (
          normalize(row.localityKey) === areaNorm ||
          normalize(row.name) === areaNorm
        );
      });

      if (match?.localityKey) {
        acc.popularLocalityKeys.push(match.localityKey);
      } else {
        acc.missingTopAreas.push(area);
      }

      return acc;
    },
    { popularLocalityKeys: [], missingTopAreas: [] }
  );
}
