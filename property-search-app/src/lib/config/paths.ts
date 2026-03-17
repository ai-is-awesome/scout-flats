import path from "path";
const PROJECT_ROOT = process.cwd();

export const ZOLO_JSON_PATHS = {
  ZOLO_CENTER_SEARCH_JSON_FILEDATA_PATH: path.join(
    PROJECT_ROOT,
    "src/data/zolo_center_search_api_data.json"
  ),

  ZOLO_PROPERTY_PRICING_JSON_FILEDATA_PATH: path.join(
    PROJECT_ROOT,
    "src/data/zolo_property_pricing_api_data.json"
  ),
};

export enum ENV_MODES {
  DEV = "DEV",
  PROD = "PROD",
}
