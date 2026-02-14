import { ZoloAccomodationWithUpdatedAt, ZoloSearchCenterApiJsonType } from "../../../types/output_types/zolo/zolo_search_center_json_type";
import { ZoloAccomodation, ZoloCenterSearchApiType } from "../../../types/zolo/zolo_types";

export function getZoloCenterById(id: string, data: ZoloAccomodation[] | ZoloAccomodationWithUpdatedAt[]): ZoloAccomodation | null {
    for (const center of data) {
        if (center.basicData.id === id) {
            return center;
        }

    }
    return null;
}




export function mutateZoloAccomodation(listings: ZoloAccomodation[] | ZoloAccomodationWithUpdatedAt[], object: ZoloAccomodation | ZoloAccomodationWithUpdatedAt) {
    for (let i = 0; i < listings.length; i++) {
        if (listings[i].basicData.id === object.basicData.id) {
            listings[i] = object;
            return;
        }
    }
}


