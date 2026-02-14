// limit of 5 and  offset keeps increasing by 5, timeout of 10 seconds If results are less than limit then return

import { fetch_zolo_center_search_data, fetch_zolo_property_pricing_data } from "./fetch";
import { CenterPricingConfig, CenterSearchConfig } from "./endpoints";
import { append_data_to_zolo_json } from "../../ingestion/save_json/zolo_save_json";



export async function run_zolo_center_search() {
    let limit = 5;
    let offset = 0;
    let terminate = false

    for (let i = 0; i < 300; i++) {
        if (terminate) {
            break;
        }
        const config: CenterSearchConfig = {
            limit: limit,
            offset: offset,
            propertyCategory: "STANDARD,SELECT",
            cityKey: "bangalore"
        }
        const data = await fetch_zolo_center_search_data(config, 3000)
        if (data) {
            console.log("Offset: ", offset)
            append_data_to_zolo_json(data);
            if (data.result[0]?.centers.length < limit) {
                break;
            }
        }
        offset += limit;
    }

}



export async function run_zolo_property_pricing() {
    const code = "ZOLFR"
    const date = "1762378808"
    const config: CenterPricingConfig = { zoloCode: code, dateOfJoining: date }
    fetch_zolo_property_pricing_data(config)

}

