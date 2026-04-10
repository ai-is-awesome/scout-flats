import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { OccupancyType } from "@/data/properties";

interface FilterBarProps {
  activeProvider: string;
  activeGender: string;
  activeType: string;
  activeOccupancy: string;
  priceRange: [number, number];
  onProviderChange: (v: string) => void;
  onGenderChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onOccupancyChange: (v: string) => void;
  onPriceRangeChange: (v: [number, number]) => void;
}

const FilterChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "bg-secondary text-secondary-foreground hover:bg-muted"
    }`}
  >
    {label}
  </button>
);

const FilterGroup = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
      {label}
    </span>
    <div className="flex gap-1.5 flex-wrap">{children}</div>
  </div>
);

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pg", label: "PG" },
  { value: "hostel", label: "Hostel" },
  { value: "coliving", label: "Co-living" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "studio", label: "Studio" },
];

const OCCUPANCY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "single", label: "Private" },
  { value: "double", label: "2 Sharing" },
  { value: "triple", label: "3 Sharing" },
  { value: "quad", label: "4 Sharing" },
];

const formatPrice = (v: number) =>
  v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `₹${v}`;

const FilterBar = ({
  activeProvider,
  activeGender,
  activeType,
  activeOccupancy,
  priceRange,
  onProviderChange,
  onGenderChange,
  onTypeChange,
  onOccupancyChange,
  onPriceRangeChange,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Provider */}
        <FilterGroup label="Provider">
          {["all", "zolo", "colive"].map((p) => (
            <FilterChip
              key={p}
              label={
                p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)
              }
              active={activeProvider === p}
              onClick={() => onProviderChange(p)}
            />
          ))}
        </FilterGroup>

        {/* Gender */}
        <FilterGroup label="Gender">
          {["all", "male", "female", "unisex"].map((g) => (
            <FilterChip
              key={g}
              label={
                g === "all" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)
              }
              active={activeGender === g}
              onClick={() => onGenderChange(g)}
            />
          ))}
        </FilterGroup>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {/* Type */}
        <FilterGroup label="Type">
          {TYPE_OPTIONS.map((t) => (
            <FilterChip
              key={t.value}
              label={t.label}
              active={activeType === t.value}
              onClick={() => onTypeChange(t.value)}
            />
          ))}
        </FilterGroup>

        {/* Occupancy */}
        <FilterGroup label="Sharing">
          {OCCUPANCY_OPTIONS.map((o) => (
            <FilterChip
              key={o.value}
              label={o.label}
              active={activeOccupancy === o.value}
              onClick={() => onOccupancyChange(o.value)}
            />
          ))}
        </FilterGroup>
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Budget
        </span>
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <span className="text-sm font-medium text-foreground w-12">
            {formatPrice(priceRange[0])}
          </span>
          <Slider
            min={0}
            max={30000}
            step={500}
            value={priceRange}
            onValueChange={(v) => onPriceRangeChange(v as [number, number])}
            className="flex-1"
          />
          <span className="text-sm font-medium text-foreground w-12">
            {formatPrice(priceRange[1])}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
