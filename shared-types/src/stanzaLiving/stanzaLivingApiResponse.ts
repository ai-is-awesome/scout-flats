export type StanzaLivingPropertiesSearchApiResponse = {
  page: number;
  records: number;
  totalPages: number;
  data: null;
  extraInfo: null;
  residenceResponseShortDTOs: StanzaLivingPropertySearchType[];
}[];

export type StanzaLivingAddressResponseApiType = {
  addressId: number;
  propertyLocationId: number | null;
  line1: string;
  line2: string;
  landmark: string;
  zipCode: string;
  cityId: number;
  cityName: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  mobile: string | null;
  displayAddressLine1: string;
  displayAddressLine2: string;
  displayAddress: string;
  residenceTypeId: number;
  propertyEntityType: string;
};

export type StanzaLivingFacilityApiType = {
  facilityId: number;
  name: string;
  iconImageUrl: string;
  enabled: boolean;
  facilityImgUrl: string | null;
  sequenceId: number;
  iconImageUrlAltTag: string | null;
};

export type StanzaLivingFeatureApiType = {
  featureId: number;
  name: string;
  iconImageUrl: string;
  enabled: boolean;
  featureImgUrl: string | null;
  sequenceId: number;
  iconImageUrlAltTag: string | null;
  dynamicUrlSlugs: string[];
};

export type StanzaLivingPricingType = {
  residenceOccupancyId: number;
  occupancyId: number;
  occupancyName: string;
  occupancyOccupancy: number;
  startingPrice: number;
  discountedPrice: number | null;
  inventoryPrice: number;
  soldOut: boolean;
  residenceOccupancyImgUrl: string;
  pricingPlan: string;
};

export type StanzaLivingPropertyImageApiType = {
  imageLibraryId: number;
  imageUrl: string;
  residenceId: number;
  residenceName: string | null;
  roomNumber: string | null;
  featuredImage: boolean;
  imageOrder: number;
  imageUrlAltTag: string;
  imageTag: string;
  imageTagName: string;
};

export type StanzaLivingPropertySearchType = {
  residenceId: number;
  name: string;
  slug: string;
  gender: "CO_ED";
  genderName: "Unisex";
  micromarketId: number;
  micromarketName: string;
  micromarketSlug: string;
  micromarketTransformationUuid: string;
  geoLocationId: null;
  geoLocationName: null;
  cityId: number;
  cityName: string;
  citySlug: string;
  cityTransformationUuid: number;
  startingPrice: number;
  inventoryPrice: number;
  pricingPlan: number;
  preBookingAmount: number;
  unlockDiscountAmount: number;
  discountPercentage: number;
  discountedPrice: null | number;
  preBookingMode: null;
  googleMapLink: string;
  latitude: number;
  virtualTourImage: string | null;
  videoLink: string | null;
  sortOrder: number;
  secondSortOrder: number;
  nextAvailableFrom: string | null;
  fomoTag: string | null;
  fomoTagName: string | null;
  fomoTagcolour: string | null;
  distanceFromPlace: number | null;
  distanceFromFilteredMicromarket: number | null;
  nearestMmNameForRecommendationsDistance: number | null;
  transformationUuid: string;
  transformationId: number;
  residenceAddressId: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string | null;
  rating: number;
  pulseRating: number;
  addressResponseDTO: StanzaLivingAddressResponseApiType[];
  residenceTypeId: number;
  propertyEntityType: "HOUSE";
  facilities: StanzaLivingFacilityApiType[];
  features: StanzaLivingFeatureApiType[];
  residenceOccupancies: StanzaLivingPricingType[];
  images: StanzaLivingPropertyImageApiType[];
};
