import { MapPin } from "lucide-react";
import type { ListingItem } from "@/features/listings/types";

function minPrice(p: ListingItem): number {
  const prices = p.pricing.map((x) => x.price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : 0;
}

function isZolo(p: ListingItem) {
  return p.provider === "zolo";
}

const MapView = ({ properties }: { properties: ListingItem[] }) => {
  return (
    <div className="relative w-full h-[600px] bg-muted rounded-xl border border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted">
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-foreground"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {properties.map((property, i) => {
          const x = 10 + ((i * 37 + 13) % 80);
          const y = 10 + ((i * 29 + 7) % 75);
          return (
            <div
              key={property.id}
              className="absolute group cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-elevated text-xs font-semibold transition-transform group-hover:scale-110 ${
                    isZolo(property)
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  <MapPin className="h-3 w-3" />₹
                  {minPrice(property).toLocaleString("en-IN")}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                  <div className="bg-card border border-border rounded-lg shadow-elevated p-3 min-w-[180px]">
                    <p className="font-heading font-semibold text-sm text-card-foreground">
                      {property.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {property.area}
                    </p>
                    <p className="text-xs font-medium text-primary mt-1">
                      From ₹{minPrice(property).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-xs text-muted-foreground">
        🗺️ Interactive map — integrate with Google Maps or Leaflet for full
        experience
      </div>
    </div>
  );
};

export default MapView;
