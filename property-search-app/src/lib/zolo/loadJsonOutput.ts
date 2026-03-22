import {
  ZoloPricingJsonType,
  ZoloSearchCenterApiJsonType,
  ZoloCombinedCenterSearchAndPricingType,
} from "@property-search/shared-types";
import { ZOLO_JSON_PATHS } from "../config/paths";
import { readJson } from "@property-search/shared-types";

type ZoloJsonFileType = "centerSearch" | "propertyPricing" | "combinedData";

export function loadZoloDataFromJson(
  type: "centerSearch"
): Promise<ZoloSearchCenterApiJsonType>;

export function loadZoloDataFromJson(
  type: "propertyPricing"
): Promise<ZoloPricingJsonType>;

export function loadZoloDataFromJson(
  type: "combinedData"
): Promise<ZoloCombinedCenterSearchAndPricingType>;

export async function loadZoloDataFromJson(type: ZoloJsonFileType) {
  let fileType: string;
  if (type === "centerSearch") {
    fileType = ZOLO_JSON_PATHS.ZOLO_CENTER_SEARCH_JSON_FILEDATA_PATH;
  } else if (type === "propertyPricing") {
    fileType = ZOLO_JSON_PATHS.ZOLO_PROPERTY_PRICING_JSON_FILEDATA_PATH;
  } else {
    throw new Error("Invalid file type");
  }
  const fileContents = await readJson(fileType);
  return fileContents;
}
