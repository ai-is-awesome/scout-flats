"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/features/listings/components/search-bar";
import heroBg from "../../../../public/hero-bg.jpg";

type ListingHeroProps = {
  initialLocality: string;
  localities: string[];
};

export function ListingHero({ initialLocality, localities }: ListingHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (locality: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("q");
    if (locality) {
      next.set("locality", locality);
    } else {
      next.delete("locality");
    }
    const s = next.toString();
    router.push(s ? `/?${s}` : "/");
  };

  return (
    <section className="relative z-20 h-64 md:h-80 overflow-visible">
      {/* overflow-hidden only on the background so the search dropdown can extend past the hero */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={heroBg.src}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-1">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-card mb-2 text-center">
          Find Your Perfect PG & Hostel
        </h1>
        <p className="text-card/80 text-sm md:text-base mb-6 text-center max-w-lg">
          Compare prices, discounts & amenities across Zolo and Colive
          properties near you.
        </p>
        <SearchBar
          suggestions={localities}
          defaultValue={initialLocality}
          onSearch={handleSearch}
          className="w-full max-w-xl"
        />
      </div>
    </section>
  );
}
