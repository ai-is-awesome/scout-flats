import { prisma } from "@/lib/types/zolo_api_types/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  const localities = await prisma.locality.findMany({
    select: {
      id: true,
      localityKey: true,
      name: true,
      city: { select: { name: true, cityKey: true } },
    },
    orderBy: { localityKey: "asc" },
  });
  return NextResponse.json(localities);
};
