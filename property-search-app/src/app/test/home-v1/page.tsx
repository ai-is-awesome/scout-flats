"use client";

import { useState, useMemo } from "react";
import { Map, List, SlidersHorizontal } from "lucide-react";
import Header from "./components/header";
import SearchBar from "@/features/listings/components/search-bar";
import FilterBar from "@/features/listings/components/filter-bar";
import PropertyCard from "@/features/listings/components/property-card";
import MapView from "@/features/listings/components/map-view";
import {
  MOCK_PROPERTIES,
  mockPropertyToListingItem,
} from "@/features/listings/property-data";
import heroBg from "../../../../public/hero-bg.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const [provider, setProvider] = useState("all");
  const [gender, setGender] = useState("all");
  const [type, setType] = useState("all");
  const [occupancy, setOccupancy] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [showFilters, setShowFilters] = useState(true);

  const listingItems = useMemo(
    () => MOCK_PROPERTIES.map(mockPropertyToListingItem),
    []
  );

  const filtered = useMemo(() => {
    return listingItems.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.area.toLowerCase().includes(q) ||
        (p.pincode?.includes(q) ?? false) ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      const matchesProvider = provider === "all" || p.provider === provider;
      const matchesGender = gender === "all" || p.gender === gender;
      const matchesType = type === "all" || p.type === type;
      const matchesOccupancy =
        occupancy === "all" ||
        p.pricing.some((pr) => pr.occupancy === occupancy);
      const matchesPrice = p.pricing.some(
        (pr) => pr.price >= priceRange[0] && pr.price <= priceRange[1]
      );
      return (
        matchesSearch &&
        matchesProvider &&
        matchesGender &&
        matchesType &&
        matchesOccupancy &&
        matchesPrice
      );
    });
  }, [searchQuery, provider, gender, type, occupancy, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={heroBg.src}
          alt="City skyline"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-card mb-2 text-center">
            Find Your Perfect PG & Hostel
          </h1>
          <p className="text-card/80 text-sm md:text-base mb-6 text-center max-w-lg">
            Compare prices, discounts & amenities across Zolo and Colive
            properties near you.
          </p>
          <SearchBar onSearch={setSearchQuery} className="w-full max-w-xl" />
        </div>
      </section>

      {/* Controls */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-semibold text-xl text-foreground">
              {filtered.length} Properties
              {searchQuery && (
                <span className="text-muted-foreground font-normal text-base ml-2">
                  near "{searchQuery}"
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-muted transition-colors md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
          <div className="flex items-center bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "list"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === "map"
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
          <FilterBar
            activeProvider={provider}
            activeGender={gender}
            activeType={type}
            activeOccupancy={occupancy}
            priceRange={priceRange}
            onProviderChange={setProvider}
            onGenderChange={setGender}
            onTypeChange={setType}
            onOccupancyChange={setOccupancy}
            onPriceRangeChange={setPriceRange}
          />
        </div>

        {/* Content */}
        {view === "list" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {filtered.length === 0 && (
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
          <MapView properties={filtered} />
        )}
      </div>
    </div>
  );
};

export default Index;
