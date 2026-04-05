import { Suspense } from "react";
import Header from "@/components/layout/site-header";
import PropertyCard from "@/features/listings/components/property-card";
import MapView from "@/features/listings/components/map-view";
import { ListingHero } from "@/features/listings/components/listing-hero";
import { ListingsControls } from "@/features/listings/components/listings-controls";
import { getListings, getListingLocalities } from "@/features/listings/get-listings";
import { parseListingFilters } from "@/features/listings/types";

export const revalidate = 300;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseListingFilters(sp);
  const [properties, localities] = await Promise.all([
    getListings(filters),
    getListingLocalities(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <Suspense
        fallback={
          <div className="relative h-64 md:h-80 overflow-hidden bg-muted animate-pulse" />
        }
      >
        <ListingHero
          initialLocality={filters.locality}
          localities={localities}
        />
      </Suspense>

      <div className="relative z-0 container mx-auto px-4 py-6 space-y-4">
        <ListingsControls
          initialFilters={filters}
          resultCount={properties.length}
        />

        {filters.view === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {properties.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-heading font-semibold text-lg">
                  No properties found
                </p>
                <p className="text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        ) : (
          <MapView properties={properties} />
        )}
      </div>
    </div>
  );
}
