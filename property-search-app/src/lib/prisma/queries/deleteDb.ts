/**
 * Run: npm run deleteDb
 * Env is loaded in db.ts (tsx hoists imports, so config() here would run too late).
 */
import { prisma } from "@/lib/types/zolo_api_types/db";

export const deleteDb = async () => {
  await prisma.property.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.roomVariant.deleteMany();
  await prisma.pricingPlan.deleteMany();
  await prisma.promoOffer.deleteMany();
};

async function main() {
  await deleteDb();
  console.log("deleteDb: finished");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
