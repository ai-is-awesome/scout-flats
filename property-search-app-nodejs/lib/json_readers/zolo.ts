import { ZoloSearchCenterApiJsonType } from "../../types/output_types/zolo/zolo_search_center_json_type";
import readJson from "../../utils/read_json";
import { DATA_PATH, DATA_PATHS } from "../config/json-data-paths";

export function read_zolo_center_search_data() {
    const data = readJson(DATA_PATHS.zolo.center_search_data_path) as ZoloSearchCenterApiJsonType
    return data
}