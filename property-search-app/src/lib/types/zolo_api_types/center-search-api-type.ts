import { ZoloAmenity } from "./amenities";

export type CenterSearchApiType = {

    error: number;
    message: string;
    count: number;
    api_element: string;
    result: { centers: ZoloAccomodation[] }
}

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
        rentalDiscount: { maxRentalDiscount: number; rental_discount_type: "PERCENTAGE" }
        gstPercentage: number;
        gstAmount: number;
        totalAmountIncGst: number;
        preTaxMinRent: number;
        isShortStayProperty: boolean;

    },
    images: Image[]
}

export type SEO = {
    tags: {
        longDescription: string;
        meta: string;
        title: string;
    }
}




export type Image = {
    url: string;
    title: string;
    alt: string;
    order: number;
    category: "Cover_Photo" | "room"
}


