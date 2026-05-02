import { prisma } from "@/lib/types/zolo_api_types/db";

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_");
}

async function main() {
  // ── Cities ──
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      cityKey: true,
      name: true,
      _count: { select: { properties: true, localities: true } },
    },
  });
  console.log("\n=== Cities ===");
  console.table(
    cities.map((c) => ({
      id: c.id,
      key: c.cityKey,
      name: c.name,
      properties: c._count.properties,
      localities: c._count.localities,
    }))
  );

  // ── Localities: all, with property count ──
  const localities = await prisma.locality.findMany({
    select: {
      id: true,
      localityKey: true,
      name: true,
      cityId: true,
      city: { select: { cityKey: true } },
      _count: { select: { properties: true } },
    },
    orderBy: [{ cityId: "asc" }, { localityKey: "asc" }],
  });
  console.log(`\n=== Localities total: ${localities.length} ===`);

  // ── Find duplicates by normalized name ACROSS cities (cross-city) ──
  const byNormName = new Map<string, typeof localities>();
  for (const l of localities) {
    const key = norm(l.name);
    if (!byNormName.has(key)) byNormName.set(key, []);
    byNormName.get(key)!.push(l);
  }
  const nameDupes = [...byNormName.entries()].filter(([, arr]) => arr.length > 1);
  console.log(`\n=== Duplicates by normalized name (per city): ${nameDupes.length} groups ===`);
  for (const [normKey, arr] of nameDupes) {
    console.log(`\n  Group: ${normKey}`);
    console.table(
      arr.map((l) => ({
        id: l.id,
        localityKey: l.localityKey,
        name: l.name,
        city: l.city.cityKey,
        properties: l._count.properties,
      }))
    );
  }

  // ── Find duplicates by normalized localityKey within same city ──
  const byNormKey = new Map<string, typeof localities>();
  for (const l of localities) {
    const key = `${l.cityId}::${norm(l.localityKey)}`;
    if (!byNormKey.has(key)) byNormKey.set(key, []);
    byNormKey.get(key)!.push(l);
  }
  const keyDupes = [...byNormKey.entries()].filter(([, arr]) => arr.length > 1);
  console.log(`\n=== Duplicates by normalized localityKey (per city): ${keyDupes.length} groups ===`);
  for (const [normKey, arr] of keyDupes) {
    console.log(`\n  Group: ${normKey}`);
    console.table(
      arr.map((l) => ({
        id: l.id,
        localityKey: l.localityKey,
        name: l.name,
        city: l.city.cityKey,
        properties: l._count.properties,
      }))
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
