import path from "path";

export const PROJECT_ROOT = process.cwd();
export const DATA_PATH = path.join(PROJECT_ROOT, "data");


export const DATA_PATHS = {
    zolo: {
        center_search_data_path: path.join(DATA_PATH, "zolo", "zolo_center_search_api_data.json"),
        property_pricing_data_path: path.join(DATA_PATH, "zolo", "zolo_property_pricing_api_data.json")
    }
};
