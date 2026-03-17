import type { Image } from "@property-search/shared-types";

/**
 * Build Prisma PropertyImage create payload from Zolo accommodation images.
 */
export function buildPropertyImagesCreate(propertyId: string, images: Image[]) {
  const imgs = images.filter((img) => img.url !== null);
  return imgs.map((img, index) => ({
    propertyId,
    imageUrl: img.url,
    imageOrder: img.order ?? index,
    imageLabel: img.title || img.alt || undefined,
  }));
}
