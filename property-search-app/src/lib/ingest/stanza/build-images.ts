import type { StanzaLivingPropertyImageApiType } from "@property-search/shared-types";

/**
 * Build Prisma PropertyImage create payload from Stanza images.
 * Featured image goes first, then by imageOrder.
 */
export function buildStanzaImagesCreate(
  propertyId: string,
  images: StanzaLivingPropertyImageApiType[]
) {
  const filtered = images.filter((img) => Boolean(img.imageUrl));
  const sorted = [...filtered].sort((a, b) => {
    if (a.featuredImage !== b.featuredImage) return a.featuredImage ? -1 : 1;
    return (a.imageOrder ?? 0) - (b.imageOrder ?? 0);
  });
  return sorted.map((img, index) => ({
    propertyId,
    imageUrl: img.imageUrl,
    imageOrder: index,
    imageLabel: img.imageTagName || img.imageUrlAltTag || undefined,
  }));
}
