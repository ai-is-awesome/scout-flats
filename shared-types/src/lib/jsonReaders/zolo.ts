import {
  ZoloCombinedCenterSearchAndPricingType,
  ZoloPricingJsonType,
  ZoloSearchCenterApiJsonType,
} from "../../../src/index";

export function combine_zolo_center_search_and_pricing_data(
  center_search_data: ZoloSearchCenterApiJsonType,
  pricing_data: ZoloPricingJsonType
): ZoloCombinedCenterSearchAndPricingType[] | null {
  const combined_data: ZoloCombinedCenterSearchAndPricingType[] = [];
  for (const center of center_search_data.data) {
    const zolo_code = center.basicData.zoloCode;
    const pricing_info = pricing_data.data.find(
      (item) => item.zoloCode === zolo_code
    );
    if (pricing_info) {
      combined_data.push({
        ...center,
        detailed_pricing_info: pricing_info.data,
      });
    } else {
      throw new Error(
        `Error: Cannot find pricing data for zolo code: ${zolo_code}`
      );
    }
  }
  return combined_data.length > 0 ? combined_data : null;
}
