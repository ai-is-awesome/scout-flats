import axios from "axios";
import type { CenterPricingConfig, CenterSearchConfig } from "./endpoints";
import { zolo_urls } from "./endpoints";
import { ZoloCenterSearchApiType, ZoloPriceEndpointApi, ZoloRoomPricingApiResult } from "../../../types/zolo/zolo_types";



const fetch_zolo_center_search_data = async (config: CenterSearchConfig, sleepTime: number = 1000): Promise<ZoloCenterSearchApiType | null> => {
    const url = zolo_urls.get_center_search_url(config);
    console.log("Fetching URL: ", url)
    try {
        const response = await axios.get(url);
        if (response.status !== 200) {
            return null;
        }
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        return response.data
    } catch (error) {
        console.error(error);
        throw error;
    }
};


const fetch_zolo_property_pricing_data = async (config: CenterPricingConfig): Promise<ZoloPriceEndpointApi | null> => {
    const url = zolo_urls.get_property_pricing_url(config);
    console.log("Fetching URL: ", url)
    return null;
}


export { fetch_zolo_center_search_data, fetch_zolo_property_pricing_data };
