import { ZoloPricingJsonObject, ZoloPricingJsonObjectWithZoloCode, ZoloPricingJsonType } from "../../../types/output_types/zolo/zolo_pricing_json_type";
import { ZoloAccomodationWithUpdatedAt, ZoloSearchCenterApiJsonType } from "../../../types/output_types/zolo/zolo_search_center_json_type";
import { ZoloAccomodation, ZoloCenterSearchApiType, ZoloPriceEndpointApi, ZoloRoomPricingApiObject } from "../../../types/zolo/zolo_types";
import readJson from "../../../utils/read_json";
import { DATA_PATHS } from "../../config/json-data-paths";

export function getZoloCenterById(id: string, data: ZoloAccomodation[] | ZoloAccomodationWithUpdatedAt[]): ZoloAccomodation | null {

    for (const center of data) {
        if (center.basicData.id === id) {
            return center;
        }
    }

    return null;
}


export function getZoloCenterByZoloCode(zoloCode: string, data: ZoloPricingJsonObjectWithZoloCode[]): ZoloPricingJsonObjectWithZoloCode | null {
    for (const center of data) {
        if (center.zoloCode === zoloCode) {
            return center
        }
    }
    return null;
}

export function getZoloPricingByZoloCode(zoloCode: string, data: ZoloPricingJsonObjectWithZoloCode[]): ZoloPricingJsonObjectWithZoloCode | null {
    for (const item of data) {
        if (item.zoloCode === zoloCode) {
            return item
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

// Use to mutate zolo pricing api call, adds zolo code and appends to the  existing data(replacing)
export function mutateZoloPricing(contents: ZoloPricingJsonType, zoloCode: string, result: ZoloRoomPricingApiObject) {
    for (const item of contents.data) {
        if (item.zoloCode === zoloCode) {
            item.data.push({ ...result, updatedAt: new Date().toISOString() });
            return;
        }
    }
}


export function load_zolo_data_from_json(type: "center_search"): ZoloSearchCenterApiJsonType
export function load_zolo_data_from_json(type: "property_pricing"): ZoloPricingJsonType



export function load_zolo_data_from_json(type: "center_search" | "property_pricing") {
    if (type === "center_search") {
        return readJson(DATA_PATHS.zolo.center_search_data_path) as ZoloSearchCenterApiJsonType
    } else if (type === "property_pricing") {
        return readJson(DATA_PATHS.zolo.property_pricing_data_path) as ZoloPricingJsonType
    }
}

export class ZoloPricingClass {
    data: ZoloPricingJsonType;
    constructor(data: ZoloPricingJsonType) {
        this.data = data;

    }

    get_room_info_by_zolo_code(zoloCode: string): string[] | null {
        const filtered = getZoloPricingByZoloCode(zoloCode, this.data.data);
        return filtered?.data.map(item => item.sharingType) ?? null;
    }

    get_room_info_of_all_centers(): RoomInfo[] | null {
        const room_info: RoomInfo[] = []
        for (let i = 0; i < this.data.data.length; i++) {
            console.log(this.data.data[i].zoloCode)
            const zolo_center = this.data.data[i]
            const rooms: string[] = []
            for (let j = 0; j < zolo_center.data.length; j++) {
                console.log(zolo_center.data[j].sharingType)
                rooms.push(zolo_center.data[j].sharingType)
            }
            room_info.push({ rooms, zoloCode: zolo_center.zoloCode })

        }
        return room_info ?? null;
    }
}



type RoomInfo = {
    rooms: string[]
    zoloCode: string
}