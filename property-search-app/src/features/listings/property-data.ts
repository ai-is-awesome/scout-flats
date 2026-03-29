import type { ListingItem } from "./types";

export type PropertyType =
  | "pg"
  | "hostel"
  | "coliving"
  | "1bhk"
  | "2bhk"
  | "studio";
export type Provider = "zolo" | "colive";
export type Gender = "male" | "female" | "unisex";
export type OccupancyType = "single" | "double" | "triple" | "quad";

export interface Property {
  id: string;
  name: string;
  provider: Provider;
  type: PropertyType;
  gender: Gender;
  address: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  pricing: {
    occupancy: OccupancyType;
    price: number;
    originalPrice: number;
  }[];
  discount?: {
    label: string;
    percentage: number;
  };
  foodIncluded: boolean;
  availableFrom: string;
  highlights: string[];
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Zolo Crest",
    provider: "zolo",
    type: "pg",
    gender: "male",
    address: "23, 5th Cross, HSR Layout",
    area: "HSR Layout",
    city: "Bangalore",
    pincode: "560102",
    lat: 12.9141,
    lng: 77.6368,
    rating: 4.3,
    reviewCount: 128,
    images: [],
    amenities: ["WiFi", "AC", "Laundry", "Gym", "Power Backup", "CCTV"],
    pricing: [
      { occupancy: "single", price: 12500, originalPrice: 15000 },
      { occupancy: "double", price: 8500, originalPrice: 10000 },
      { occupancy: "triple", price: 6500, originalPrice: 8000 },
    ],
    discount: { label: "Early Bird", percentage: 17 },
    foodIncluded: true,
    availableFrom: "Immediate",
    highlights: ["Near Tech Park", "Fully Furnished", "Meals Included"],
  },
  {
    id: "2",
    name: "Colive Clover",
    provider: "colive",
    type: "coliving",
    gender: "female",
    address: "44, Outer Ring Road, Marathahalli",
    area: "Marathahalli",
    city: "Bangalore",
    pincode: "560037",
    lat: 12.9563,
    lng: 77.7013,
    rating: 4.5,
    reviewCount: 89,
    images: [],
    amenities: ["WiFi", "AC", "Housekeeping", "Parking", "Security"],
    pricing: [
      { occupancy: "single", price: 14000, originalPrice: 16000 },
      { occupancy: "double", price: 9500, originalPrice: 11000 },
    ],
    discount: { label: "First Month", percentage: 12 },
    foodIncluded: false,
    availableFrom: "1st Mar 2026",
    highlights: ["Metro Nearby", "Premium Interiors", "Community Events"],
  },
  {
    id: "3",
    name: "Zolo Haven",
    provider: "zolo",
    type: "pg",
    gender: "unisex",
    address: "12, Koramangala 4th Block",
    area: "Koramangala",
    city: "Bangalore",
    pincode: "560034",
    lat: 12.9352,
    lng: 77.6245,
    rating: 4.1,
    reviewCount: 203,
    images: [],
    amenities: ["WiFi", "Laundry", "Power Backup", "CCTV", "TV"],
    pricing: [
      { occupancy: "single", price: 11000, originalPrice: 13000 },
      { occupancy: "double", price: 7500, originalPrice: 9000 },
      { occupancy: "triple", price: 5500, originalPrice: 7000 },
    ],
    discount: { label: "Summer Deal", percentage: 15 },
    foodIncluded: true,
    availableFrom: "Immediate",
    highlights: ["Food Included", "Near Jyoti Nivas College", "Vibrant Area"],
  },
  {
    id: "4",
    name: "Colive Amber",
    provider: "colive",
    type: "coliving",
    gender: "male",
    address: "78, Whitefield Main Road",
    area: "Whitefield",
    city: "Bangalore",
    pincode: "560066",
    lat: 12.9698,
    lng: 77.75,
    rating: 4.6,
    reviewCount: 67,
    images: [],
    amenities: ["WiFi", "AC", "Gym", "Cafeteria", "Gaming Room", "Parking"],
    pricing: [
      { occupancy: "single", price: 16000, originalPrice: 18000 },
      { occupancy: "double", price: 11000, originalPrice: 13000 },
    ],
    foodIncluded: true,
    availableFrom: "15th Mar 2026",
    highlights: ["Premium Location", "Rooftop Lounge", "Smart Lock Access"],
  },
  {
    id: "5",
    name: "Zolo Garnet",
    provider: "zolo",
    type: "hostel",
    gender: "female",
    address: "56, Electronic City Phase 1",
    area: "Electronic City",
    city: "Bangalore",
    pincode: "560100",
    lat: 12.8456,
    lng: 77.6603,
    rating: 3.9,
    reviewCount: 156,
    images: [],
    amenities: ["WiFi", "Laundry", "Power Backup", "Hot Water"],
    pricing: [
      { occupancy: "double", price: 6000, originalPrice: 7500 },
      { occupancy: "triple", price: 4500, originalPrice: 6000 },
      { occupancy: "quad", price: 3500, originalPrice: 5000 },
    ],
    discount: { label: "Budget Friendly", percentage: 25 },
    foodIncluded: true,
    availableFrom: "Immediate",
    highlights: ["Most Affordable", "Near Infosys Campus", "Free Meals"],
  },
  {
    id: "6",
    name: "Colive Orchid",
    provider: "colive",
    type: "coliving",
    gender: "unisex",
    address: "32, Indiranagar 100ft Road",
    area: "Indiranagar",
    city: "Bangalore",
    pincode: "560038",
    lat: 12.9784,
    lng: 77.6408,
    rating: 4.7,
    reviewCount: 45,
    images: [],
    amenities: ["WiFi", "AC", "Gym", "Pool", "Concierge", "Co-working"],
    pricing: [
      { occupancy: "single", price: 22000, originalPrice: 25000 },
      { occupancy: "double", price: 15000, originalPrice: 17000 },
    ],
    foodIncluded: false,
    availableFrom: "Immediate",
    highlights: ["Luxury Living", "Infinity Pool", "Indiranagar Nightlife"],
  },
  {
    id: "7",
    name: "Zolo Studio Nest",
    provider: "zolo",
    type: "studio",
    gender: "unisex",
    address: "15, BTM Layout 2nd Stage",
    area: "BTM Layout",
    city: "Bangalore",
    pincode: "560076",
    lat: 12.9166,
    lng: 77.6101,
    rating: 4.2,
    reviewCount: 34,
    images: [],
    amenities: ["WiFi", "AC", "Kitchenette", "Power Backup", "CCTV"],
    pricing: [{ occupancy: "single", price: 18000, originalPrice: 20000 }],
    discount: { label: "New Launch", percentage: 10 },
    foodIncluded: false,
    availableFrom: "Immediate",
    highlights: [
      "Fully Furnished Studio",
      "Private Kitchen",
      "Near Silk Board",
    ],
  },
  {
    id: "8",
    name: "Colive 1BHK Prime",
    provider: "colive",
    type: "1bhk",
    gender: "unisex",
    address: "88, Sarjapur Road",
    area: "Sarjapur Road",
    city: "Bangalore",
    pincode: "560035",
    lat: 12.91,
    lng: 77.685,
    rating: 4.4,
    reviewCount: 22,
    images: [],
    amenities: ["WiFi", "AC", "Washing Machine", "Parking", "Security"],
    pricing: [
      { occupancy: "single", price: 20000, originalPrice: 23000 },
      { occupancy: "double", price: 14000, originalPrice: 16000 },
    ],
    foodIncluded: false,
    availableFrom: "1st Apr 2026",
    highlights: ["Separate Living Room", "Balcony", "Gated Community"],
  },
  {
    id: "9",
    name: "Zolo 2BHK Haven",
    provider: "zolo",
    type: "2bhk",
    gender: "unisex",
    address: "42, Bellandur Main Road",
    area: "Bellandur",
    city: "Bangalore",
    pincode: "560103",
    lat: 12.926,
    lng: 77.678,
    rating: 4.0,
    reviewCount: 18,
    images: [],
    amenities: ["WiFi", "AC", "Full Kitchen", "Parking", "Gym", "Power Backup"],
    pricing: [
      { occupancy: "single", price: 25000, originalPrice: 28000 },
      { occupancy: "double", price: 17000, originalPrice: 20000 },
    ],
    foodIncluded: false,
    availableFrom: "Immediate",
    highlights: ["Spacious 2BHK", "Lake View", "Near Tech Parks"],
  },
];

function mockTypeLabel(t: PropertyType): string {
  switch (t) {
    case "pg":
      return "PG";
    case "hostel":
      return "Hostel";
    case "coliving":
      return "Co-living";
    case "1bhk":
      return "1 BHK";
    case "2bhk":
      return "2 BHK";
    case "studio":
      return "Studio";
    default:
      return "PG";
  }
}

/** Map mock `Property` to `ListingItem` for shared `PropertyCard` / `MapView`. */
export function mockPropertyToListingItem(p: Property): ListingItem {
  return {
    id: p.id,
    name: p.name,
    provider: p.provider,
    gender: p.gender,
    typeLabel: mockTypeLabel(p.type),
    area: p.area,
    city: p.city,
    pincode: p.pincode,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    amenities: p.amenities,
    pricing: p.pricing.map((pr) => ({
      occupancy: pr.occupancy,
      price: pr.price,
      originalPrice: pr.originalPrice,
    })),
    discount: p.discount,
    foodIncluded: p.foodIncluded,
    availableFrom: p.availableFrom,
    highlights: p.highlights,
  };
}
