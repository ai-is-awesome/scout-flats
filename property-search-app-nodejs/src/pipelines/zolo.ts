import { combine_zolo_center_search_and_pricing_data } from "@property-search/shared-types";
import {
  fetch_zolo_center_search_data,
  fetch_zolo_property_pricing_data,
} from "../providers/zolo/api";
import { CenterPricingConfig, CenterSearchConfig } from "../providers/zolo/endpoints";
import {
  append_data_to_zolo_json,
  append_data_to_zolo_property_pricing_json,
  load_zolo_data_from_json,
} from "../storage/zolo";
import { push_zolo_data_to_next } from "../push/next-api";

export async function run_zolo_center_search() {
  let limit = 5;
  let offset = 0;

  for (let i = 0; i < 300; i++) {
    const config: CenterSearchConfig = {
      limit,
      offset,
      propertyCategory: "STANDARD,SELECT",
      cityKey: "bangalore",
    };
    const data = await fetch_zolo_center_search_data(config, 3000);
    if (data) {
      console.log("Offset: ", offset);
      append_data_to_zolo_json(data);
      if (data.result[0]?.centers.length < limit) {
        break;
      }
    }
    offset += limit;
  }
}

export async function run_zolo_property_pricing() {
  const center_search_data = load_zolo_data_from_json("center_search");

  for (const center of center_search_data.data) {
    const zolo_code = center.basicData.zoloCode;
    console.log(zolo_code);
    const config: CenterPricingConfig = { zoloCode: zolo_code };

    const data = await fetch_zolo_property_pricing_data(config, 1000);
    console.log("Calling api with config: ", config);
    if (data) {
      append_data_to_zolo_property_pricing_json(data, zolo_code);
    }
  }
}

export async function run_push_zolo_to_next() {
  const center_search_data = load_zolo_data_from_json("center_search");
  const pricing_data = load_zolo_data_from_json("property_pricing");
  const combined_data = combine_zolo_center_search_and_pricing_data(
    center_search_data,
    pricing_data
  );
  if (combined_data) {
    const response = await push_zolo_data_to_next(combined_data);
    console.log(response);
  }
}
