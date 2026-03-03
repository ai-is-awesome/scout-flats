export type ZoloAmenity = {
    name: string;
    isAvailable: boolean;
    imageName: string;
    displayName: string;
};
export type ZoloCenterSearchApiType = {
    error: number;
    message: string;
    count: number;
    api_element: string;
    result: {
        centers: ZoloAccomodation[];
        localityKeys: LocalityKeys;
    }[];
};
export type LocalityKeys = Record<string, string>;
export type ZoloAccomodation = {
    basicData: {
        id: string;
        name: string;
        gender: string;
        zoloCode: string;
        addressLine1: string;
        addressLine2: string;
        locality: string;
        localityKey: string;
        cityKey: string;
        city: string;
        approved: number;
        propertyState: string;
        description: string;
        localName: string;
        propertyCategory: string;
        averageRating: number;
        amenities: ZoloAmenity[];
        location: number[];
        amenitiesBaseUrl: string;
        seo: SEO;
        isNew: boolean;
        minRent: number;
        maxRent: number;
        distance: number | null;
        isRental: boolean;
        rentalDiscount: {
            maxRentalDiscount: number;
            rental_discount_type: "PERCENTAGE";
        };
        gstPercentage: number;
        gstAmount: number;
        totalAmountIncGst: number;
        preTaxMinRent: number;
        isShortStayProperty: boolean;
    };
    images: Image[];
};
export type SEO = {
    tags: {
        longDescription: string;
        meta: string;
        title: string;
    };
};
export type Image = {
    url: string;
    title: string;
    alt: string;
    order: number;
    category: "Cover_Photo" | "room";
};
export type ZoloPriceEndpointApi = {
    error: number;
    message: string;
    count: number;
    result: ZoloRoomPricingApiObject[];
};
export type ZoloRoomPricingApiObject = {
    sharingType: string;
    sharingCapacity: number;
    centerId: string;
    variantGrouping: string;
    minRent: number;
    roomTypes: string | null;
    minSharingTypePrice: number;
    discountedPrice: ZoloRoomDiscountedPrice;
    variants: [
        {
            availableBeds: number;
            availableBedsText: string;
            startingAmount: number;
            roomName: string;
            baseUrl: string;
            fileExtension: string;
            discountedPrice: ZoloRoomDiscountedPrice;
            gstAmount: 0;
            gstPercentage: number;
            totalAmountIncGst: number;
            preTaxDiscountedPrice: number;
            roomVariantTypeList: [
                {
                    roomVariantType: string;
                    isHidden: boolean;
                    centerVariant: null;
                    stayType: string;
                    packagesList: [
                        {
                            name: string;
                            displayName: string;
                            duration: string;
                            durationValue: number;
                            description: string;
                            price: number;
                            extraAdultPrice: number;
                            discountedPrice: number;
                            discountOffered: number;
                            additivePrice: null;
                            additiveOffered: null;
                            isBasePackage: boolean;
                            gstAmount: number;
                            gstPercentage: number;
                            totalAmountIncGst: number;
                            discountedAmountIncGst: number;
                            discountGstAmount: number;
                            additiveAmountIncGst: number;
                            additiveGstAmount: number;
                            preTaxPrice: number;
                            preTaxDiscountedPrice: number;
                            preTaxAdditivePrice: number;
                            couponDetails: string | null;
                            couponDiscount: number | null;
                            showOnline: boolean;
                            lineItemId: string | null;
                            id: number;
                            actualShortStayPriceInGst: number;
                            actualShortStayPrice: number;
                            details: string[];
                        }
                    ];
                }
            ];
        }
    ];
};
export type ZoloRoomDiscountedPrice = {
    maxRentalDiscount: number;
    discountedPrice: number;
    rentalPromoCode: string;
    noOfMonths: number;
    discountPercent: number;
    gstAmount: number;
    gstPercentage: number;
    totalAmountIncGst: number;
    preTaxDiscountedPrice: number;
};
//# sourceMappingURL=zolo_types.d.ts.map