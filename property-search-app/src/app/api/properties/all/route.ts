import { prisma } from "@/lib/types/zolo_api_types/db";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  // name, price per month, discount, if available, pictures, address, area, pincode,

  const properties = await prisma.property.findMany({
    select: {
      id: true,
      name: true,
      locality: { select: { name: true, localityKey: true } },

      images: {
        orderBy: { imageOrder: "asc" },
        take: 3,
        select: {
          id: true,
          imageUrl: true,
          imageOrder: true,
          imageLabel: true,
        },
      },
    },
  });

  return NextResponse.json(properties);
};
