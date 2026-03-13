import { SharingType } from "@/generated/prisma/enums";
import { ZoloAccomodation, ZoloCombinedCenterSearchAndPricingType } from "@property-search/shared-types";

const zoloTransformer = {
    get_trimmed_property_for_db: (property: ZoloCombinedCenterSearchAndPricingType) => {
        const { basicData, detailed_pricing_info } = property;
        const { name, addressLine1, id, gender, locality, localityKey, city, cityKey, propertyCategory, averageRating, }
            = basicData

        const price_details = detailed_pricing_info.map((pricing_info) => {
            const return_obj = {
                SharingType: pricing_info.sharingType,
                sharingCapacity: pricing_info.sharingCapacity,
                centerId: pricing_info.centerId,
                variantGrouping: pricing_info.variantGrouping,
                minRent: pricing_info.minRent,
                minSharingTypePrice: pricing_info.minSharingTypePrice,
            }
            return return_obj
        }
        )
        const trimmed_property = {
            basicData: { name, addressLine1, id, gender, locality, localityKey, city, cityKey, propertyCategory, averageRating },
            pricing_details: price_details
        }
        return trimmed_property;
    }
}

export default zoloTransformer;