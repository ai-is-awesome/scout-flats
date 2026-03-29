import { prisma } from "@/lib/types/zolo_api_types/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  const localities = await prisma.property.findMany({
    where: { localityKey: { not: null } },
    distinct: ["localityKey"],
    select: { localityKey: true, locality: true, city: true, id: true },
    orderBy: { localityKey: "asc" },
  });
  return NextResponse.json(localities);
};
