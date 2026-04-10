export type PricingRow = {
  occupancy: string;
  price: number;
  originalPrice: number;
};

const OCCUPANCY_ORDER = ["single", "double", "triple", "quad"] as const;

function sortPricingRows(rows: PricingRow[]): PricingRow[] {
  const orderIndex = new Map<string, number>(
    OCCUPANCY_ORDER.map((k, i) => [k, i])
  );
  return [...rows].sort((a, b) => {
    const ia = orderIndex.get(a.occupancy);
    const ib = orderIndex.get(b.occupancy);
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return a.occupancy.localeCompare(b.occupancy);
  });
}

/** One row per `occupancy`, using the minimum `price` (and that row's `originalPrice`). */
export function aggregatePricingByOccupancy(rows: PricingRow[]): PricingRow[] {
  const best = new Map<string, PricingRow>();
  for (const row of rows) {
    const prev = best.get(row.occupancy);
    if (!prev || row.price < prev.price) {
      best.set(row.occupancy, row);
    }
  }
  return sortPricingRows([...best.values()]);
}
