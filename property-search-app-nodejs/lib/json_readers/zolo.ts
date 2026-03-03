import { ZoloSearchCenterApiJsonType } from "../../types/output_types/zolo/zolo_search_center_json_type";
import readJson from "../../utils/read_json";
import { pbcopy } from "../../utils/utils";
import { DATA_PATH, DATA_PATHS } from "../config/json-data-paths";
import { getZoloPricingByZoloCode, load_zolo_data_from_json } from "../providers/zolo/helpers";

export function read_zolo_center_search_data() {
    const data = readJson(DATA_PATHS.zolo.center_search_data_path) as ZoloSearchCenterApiJsonType
    return data
}


export function verify_file_integrity() {
    const centers_data = load_zolo_data_from_json("center_search");
    const pricing_data = load_zolo_data_from_json("property_pricing")
    let errors = 0;
    for (const center of centers_data.data) {
        const zolo_code = center.basicData.zoloCode;
        const idx = pricing_data.data.findIndex(item => item.zoloCode === zolo_code)
        if (idx === -1) {
            console.log("Zolo code not found in pricing data: ", zolo_code)
            errors++;
        }
    }

    console.log("File integrity verified with ", errors, " errors")
}



export function copy_zolo_pricing_data_to_clipboard(zoloCode: string) {
    const data = getZoloPricingByZoloCode(zoloCode, load_zolo_data_from_json("property_pricing").data)
    if (data) {
        pbcopy(JSON.stringify(data))
        console.log("Zolo pricing data copied to clipboard")
    }
}