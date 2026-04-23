import { prisma } from "@/lib/types/zolo_api_types/db";

export const runDbQuery = async () => {
  return prisma.property.findMany({
    where: {
      source: "STANZA",
    },
    select: { name: true },
  });
};

async function main() {
  try {
    const result = await runDbQuery();
    console.log("runDbQuery: result", result);
  } finally {
    await prisma.$disconnect();
    console.log("Prisma disconnected!");
  }
}

main();
