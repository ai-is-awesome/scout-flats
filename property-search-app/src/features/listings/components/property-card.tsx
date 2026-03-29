import {
  Star,
  MapPin,
  Utensils,
  Wifi,
  Shield,
  Dumbbell,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ListingItem } from "@/features/listings/types";

const genderIcon: Record<string, string> = {
  male: "♂",
  female: "♀",
  unisex: "⚤",
};

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  Gym: <Dumbbell className="h-3.5 w-3.5" />,
  CCTV: <Shield className="h-3.5 w-3.5" />,
  Security: <Shield className="h-3.5 w-3.5" />,
};

function providerBadgeClass(provider: ListingItem["provider"]) {
  if (provider === "zolo") return "bg-primary text-primary-foreground";
  if (provider === "colive") return "bg-accent text-accent-foreground";
  return "bg-secondary text-secondary-foreground";
}

function providerLabel(provider: ListingItem["provider"]) {
  if (provider === "zolo") return "Zolo";
  if (provider === "colive") return "Colive";
  return "Partner";
}

const PropertyCard = ({ property }: { property: ListingItem }) => {
  const prices = property.pricing.map((p) => p.price).filter((n) => n > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const lowestOriginal =
    property.pricing.find((p) => p.price === lowestPrice)?.originalPrice ??
    lowestPrice;

  return (
    <div className="group bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in-up">
      <div className="relative h-48 bg-muted overflow-hidden">
        {property.images[0] ? (
          <img
            src={property.images[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-[5]">
          <div className="text-center">
            <div className="text-4xl mb-1">🏠</div>
            <span className="text-xs">{property.name}</span>
          </div>
        </div>

        <Badge
          className={`absolute top-3 left-3 z-20 text-xs font-semibold ${providerBadgeClass(property.provider)}`}
        >
          {providerLabel(property.provider)}
        </Badge>

        {property.discount && (
          <Badge className="absolute top-3 right-3 z-20 bg-success text-success-foreground text-xs font-semibold">
            {property.discount.percentage}% OFF
          </Badge>
        )}

        <div className="absolute bottom-3 left-3 z-20 flex gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-card/90 text-card-foreground text-xs font-medium backdrop-blur-sm">
            {genderIcon[property.gender]} {property.gender}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-card/90 text-card-foreground text-xs font-medium backdrop-blur-sm">
            {property.typeLabel}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-heading font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {property.area}, {property.city}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning/10">
            <Star className="h-3.5 w-3.5 text-warning fill-warning" />
            <span className="text-sm font-semibold text-card-foreground">
              {property.rating}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({property.reviewCount} reviews)
          </span>
        </div>

        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-card-foreground">
              ₹{lowestPrice.toLocaleString("en-IN")}
            </span>
            {lowestOriginal > lowestPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{lowestOriginal.toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {property.pricing.map((p) => (
              <span
                key={`${p.occupancy}-${p.price}`}
                className="text-xs px-2 py-0.5 rounded-full bg-card text-muted-foreground border border-border"
              >
                {p.occupancy}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {property.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              {amenityIcons[a] || (
                <span className="h-3.5 w-3.5 inline-flex items-center justify-center">
                  •
                </span>
              )}
              {a}
            </span>
          ))}
          {property.amenities.length > 4 && (
            <span className="text-xs text-primary font-medium">
              +{property.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.highlights.slice(0, 3).map((h) => (
            <Badge key={h} variant="secondary" className="text-xs font-normal">
              {h}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {property.availableFrom}
          </div>
          {property.foodIncluded && (
            <div className="flex items-center gap-1 text-xs text-success font-medium">
              <Utensils className="h-3.5 w-3.5" />
              Food Included
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
