import {
  ZoloAccomodation,
  ZoloAccomodationWithUpdatedAt,
  ZoloPricingJsonObject,
  ZoloPricingJsonObjectWithZoloCode,
  ZoloPricingJsonType,
  ZoloRoomPricingApiObject,
  ZoloSearchCenterApiJsonType,
} from "@property-search/shared-types";
import readJson from "../../../utils/read_json";
import { DATA_PATHS } from "../../config/json-data-paths";
import { combine_zolo_center_search_and_pricing_data } from "@property-search/shared-types";
import writeJson from "../../../utils/write_json";

export function getZoloCenterById(
  id: string,
  data: ZoloAccomodation[] | ZoloAccomodationWithUpdatedAt[]
): ZoloAccomodation | null {
  for (const center of data) {
    if (center.basicData.id === id) {
      return center;
    }
  }

  return null;
}

export function getZoloCenterByZoloCode(
  zoloCode: string,
  data: ZoloPricingJsonObjectWithZoloCode[]
): ZoloPricingJsonObjectWithZoloCode | null {
  for (const center of data) {
    if (center.zoloCode === zoloCode) {
      return center;
    }
  }
  return null;
}

export function getZoloPricingByZoloCode(
  zoloCode: string,
  data: ZoloPricingJsonObjectWithZoloCode[]
): ZoloPricingJsonObjectWithZoloCode | null {
  for (const item of data) {
    if (item.zoloCode === zoloCode) {
      return item;
    }
  }
  return null;
}

export function mutateZoloAccomodation(
  listings: ZoloAccomodation[] | ZoloAccomodationWithUpdatedAt[],
  object: ZoloAccomodation | ZoloAccomodationWithUpdatedAt
) {
  for (let i = 0; i < listings.length; i++) {
    if (listings[i].basicData.id === object.basicData.id) {
      listings[i] = object;
      return;
    }
  }
}

// Use to mutate zolo pricing api call, adds zolo code and appends to the  existing data(replacing)
export function mutateZoloPricing(
  contents: ZoloPricingJsonType,
  zoloCode: string,
  result: ZoloRoomPricingApiObject
) {
  for (const item of contents.data) {
    if (item.zoloCode === zoloCode) {
      item.data.push({ ...result, updatedAt: new Date().toISOString() });
      return;
    }
  }
}

export function load_zolo_data_from_json(
  type: "center_search"
): ZoloSearchCenterApiJsonType;
export function load_zolo_data_from_json(
  type: "property_pricing"
): ZoloPricingJsonType;

export function load_zolo_data_from_json(
  type: "center_search" | "property_pricing"
) {
  if (type === "center_search") {
    return readJson(
      DATA_PATHS.zolo.center_search_data_path
    ) as ZoloSearchCenterApiJsonType;
  } else if (type === "property_pricing") {
    return readJson(
      DATA_PATHS.zolo.property_pricing_data_path
    ) as ZoloPricingJsonType;
  }
}

export class ZoloPricingClass {
  data: ZoloPricingJsonType;
  constructor(data: ZoloPricingJsonType) {
    this.data = data;
  }

  get_room_info_by_zolo_code(zoloCode: string): string[] | null {
    const filtered = getZoloPricingByZoloCode(zoloCode, this.data.data);
    return (
      filtered?.data.map((item: ZoloPricingJsonObject) => item.sharingType) ??
      null
    );
  }

  get_room_info_of_all_centers(): RoomInfo[] | null {
    const room_info: RoomInfo[] = [];
    for (let i = 0; i < this.data.data.length; i++) {
      console.log(this.data.data[i].zoloCode);
      const zolo_center = this.data.data[i];
      const rooms: string[] = [];
      for (let j = 0; j < zolo_center.data.length; j++) {
        console.log(zolo_center.data[j].sharingType);
        rooms.push(zolo_center.data[j].sharingType);
      }
      room_info.push({ rooms, zoloCode: zolo_center.zoloCode });
    }
    return room_info ?? null;
  }
}

const runJsonAnalytics = () => {
  const center_search_data = load_zolo_data_from_json("center_search");
  const pricing_data = load_zolo_data_from_json("property_pricing");
  const combined_data = combine_zolo_center_search_and_pricing_data(
    center_search_data,
    pricing_data
  );

  if (!combined_data) {
    return null;
  }
  const results = [];

  for (const center of combined_data) {
    const zolo_code = center.basicData.zoloCode;
    const name = center.basicData.name;

    const pricingShape = center.detailed_pricing_info.map((item) => {
      const variants = item.variants ?? [];
      const variantCount = variants.length;
      const roomVariantTypeListLengths = variants.map(
        (v) => (v.roomVariantTypeList ?? []).length
      );
      return {
        sharingType: item.sharingType,
        variantCount,
        roomVariantTypeListLengths: roomVariantTypeListLengths,
      };
    });

    const result = {
      zoloCode: zolo_code,
      name,
      pricingShape,
    };
    results.push(result);
  }
  writeJson(DATA_PATHS.analytics.zolo_pricing_shape_analytics_path, results);
  return results;
};

export const zoloHelperFunctions = {
  analytics: { runJsonAnalytics },
};

type RoomInfo = {
  rooms: string[];
  zoloCode: string;
};
