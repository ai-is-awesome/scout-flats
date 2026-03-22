// limit of 5 and  offset keeps increasing by 5, timeout of 10 seconds If results are less than limit then return

import {
  fetch_zolo_center_search_data,
  fetch_zolo_property_pricing_data,
} from "./fetch";
import { CenterPricingConfig, CenterSearchConfig } from "./endpoints";
import {
  append_data_to_zolo_json,
  append_data_to_zolo_property_pricing_json,
} from "../../ingestion/save_json/zolo_save_json";
import { load_zolo_data_from_json } from "./helpers";
import { combine_zolo_center_search_and_pricing_data } from "@property-search/shared-types";
import { push_json_data_to_zolo_api } from "../../api-client/push_zolo";

export async function run_zolo_center_search() {
  let limit = 5;
  let offset = 0;
  let terminate = false;

  for (let i = 0; i < 300; i++) {
    if (terminate) {
      break;
    }
    const config: CenterSearchConfig = {
      limit: limit,
      offset: offset,
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

  // const code = "ZOLFR"
  // const date = "1762378808"
  // const config: CenterPricingConfig = { zoloCode: code, dateOfJoining: date }
  // const data = await fetch_zolo_property_pricing_data(config)
  // if (data) {
  //     console.log(data.result[0].centerId, data.result[0].discountedPrice.discountedPrice, data.result[1]?.centerId)

  // }
}



export async function run_push_zolo_json_to_next_api() {
  const center_search_data = load_zolo_data_from_json("center_search");
  const pricing_data = load_zolo_data_from_json("property_pricing");
  const combined_data = combine_zolo_center_search_and_pricing_data(
    center_search_data,
    pricing_data
  );
  if (combined_data) {
    const response = await push_json_data_to_zolo_api(combined_data);
    console.log(response);
  }
}
