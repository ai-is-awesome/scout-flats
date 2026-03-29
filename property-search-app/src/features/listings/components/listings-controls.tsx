"use client";

import { useEffect, useState } from "react";
import { Map, List, SlidersHorizontal } from "lucide-react";
import FilterBar from "@/features/listings/components/filter-bar";
import type { ListingFilters } from "@/features/listings/types";
import { filtersToSearchParams } from "@/features/listings/types";
import { useRouter } from "next/navigation";

type ListingsControlsProps = {
  initialFilters: ListingFilters;
  resultCount: number;
};

export function ListingsControls({
  initialFilters,
  resultCount,
}: ListingsControlsProps) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const navigate = (next: ListingFilters) => {
    const params = filtersToSearchParams(next);
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      p.set(k, v);
    }
    const qs = p.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const patch = (partial: Partial<ListingFilters>) => {
    navigate({ ...filters, ...partial });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-heading font-semibold text-xl text-foreground">
            {resultCount} Properties
            {initialFilters.q ? (
              <span className="text-muted-foreground font-normal text-base ml-2">
                near &quot;{initialFilters.q}&quot;
              </span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors md:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
        <div className="flex items-center bg-secondary rounded-lg p-1">
          <button
            type="button"
            onClick={() => patch({ view: "list" })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              filters.view === "list"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => patch({ view: "map" })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              filters.view === "map"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
      </div>

      <div className={`${showFilters ? "block" : "hidden"} md:block`}>
        <FilterBar
          activeProvider={filters.provider}
          activeGender={filters.gender}
          activeType={filters.type}
          activeOccupancy={filters.occupancy}
          priceRange={[filters.priceMin, filters.priceMax]}
          onProviderChange={(v) =>
            patch({ provider: v as ListingFilters["provider"] })
          }
          onGenderChange={(v) =>
            patch({ gender: v as ListingFilters["gender"] })
          }
          onTypeChange={(v) => patch({ type: v })}
          onOccupancyChange={(v) =>
            patch({ occupancy: v as ListingFilters["occupancy"] })
          }
          onPriceRangeChange={(v) =>
            patch({ priceMin: v[0], priceMax: v[1] })
          }
        />
      </div>
    </div>
  );
}
