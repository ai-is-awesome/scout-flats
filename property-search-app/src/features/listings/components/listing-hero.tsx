"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/features/listings/components/search-bar";
import heroBg from "../../../../public/hero-bg.jpg";

type ListingHeroProps = {
  initialQuery: string;
};

export function ListingHero({ initialQuery }: ListingHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (query: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (query) {
      next.set("q", query);
    } else {
      next.delete("q");
    }
    const s = next.toString();
    router.push(s ? `/?${s}` : "/");
  };

  return (
    <section className="relative h-64 md:h-80 overflow-hidden">
      <img
        src={heroBg.src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/60" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-card mb-2 text-center">
          Find Your Perfect PG & Hostel
        </h1>
        <p className="text-card/80 text-sm md:text-base mb-6 text-center max-w-lg">
          Compare prices, discounts & amenities across Zolo and Colive properties
          near you.
        </p>
        <SearchBar
          defaultQuery={initialQuery}
          onSearch={handleSearch}
          className="w-full max-w-xl"
        />
      </div>
    </section>
  );
}
