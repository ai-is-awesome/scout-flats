import type { ZoloCenterSearchApiType } from "../../../types/zolo/zolo_types";
import { DATA_PATHS } from "../../config/json-data-paths";
import readJson from "../../../utils/read_json";
import writeJson from "../../../utils/write_json";
import { ZoloSearchCenterApiJsonType } from "../../../types/output_types/zolo/zolo_search_center_json_type";
import { getZoloCenterById, mutateZoloAccomodation } from "../../providers/zolo/helpers";

export function append_data_to_zolo_json(data: ZoloCenterSearchApiType) {

    const existingData = readJson(DATA_PATHS.zolo.center_search_data_path) as ZoloSearchCenterApiJsonType
    for (const center of data.result[0]?.centers || []) {
        if (getZoloCenterById(center.basicData.id, existingData.data)) {
            console.log("Center already exists, mutating: ", center.basicData.name)
            mutateZoloAccomodation(existingData.data, center);

        } else {
            console.log("Saving new center: ", center.basicData.name)
            existingData.data.push({ ...center, updatedAt: new Date().toISOString() });
        }
    }

    existingData.lastUpdatedAt = new Date().toISOString();
    writeJson(DATA_PATHS.zolo.center_search_data_path, existingData);
}

