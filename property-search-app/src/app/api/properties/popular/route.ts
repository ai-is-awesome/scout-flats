import { prisma } from "@/lib/types/zolo_api_types/db";

export const GET = async (request: Request) => {
  const popularLocalities = [""];
  prisma.property.findMany({});
};


