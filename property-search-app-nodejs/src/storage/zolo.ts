import {
  ZoloAccomodation,
  ZoloAccomodationWithUpdatedAt,
  ZoloCenterSearchApiType,
  ZoloPriceEndpointApi,
  ZoloPricingJsonObject,
  ZoloPricingJsonObjectWithZoloCode,
  ZoloPricingJsonType,
  ZoloRoomPricingApiObject,
  ZoloSearchCenterApiJsonType,
  combine_zolo_center_search_and_pricing_data,
} from "@property-search/shared-types";
import readJson from "../utils/read_json";
import writeJson from "../utils/write_json";
import { pbcopy } from "../utils/clipboard";
import { DATA_PATHS } from "./paths";

// ─── Lookup helpers ───────────────────────────────────────────────────────────

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

// ─── Mutation helpers ─────────────────────────────────────────────────────────

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

// ─── Read ─────────────────────────────────────────────────────────────────────

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
  } else {
    return readJson(
      DATA_PATHS.zolo.property_pricing_data_path
    ) as ZoloPricingJsonType;
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function append_data_to_zolo_json(data: ZoloCenterSearchApiType) {
  const existingData = readJson(
    DATA_PATHS.zolo.center_search_data_path
  ) as ZoloSearchCenterApiJsonType;

  for (const center of data.result[0]?.centers || []) {
    if (getZoloCenterById(center.basicData.id, existingData.data)) {
      console.log("Center already exists, mutating: ", center.basicData.name);
      mutateZoloAccomodation(existingData.data, center);
    } else {
      console.log("Saving new center: ", center.basicData.name);
      existingData.data.push({ ...center, updatedAt: new Date().toISOString() });
    }
  }

  existingData.lastUpdatedAt = new Date().toISOString();
  writeJson(DATA_PATHS.zolo.center_search_data_path, existingData);
}

export function append_data_to_zolo_property_pricing_json(
  data: ZoloPriceEndpointApi,
  zoloCode: string
) {
  const existingData = readJson(
    DATA_PATHS.zolo.property_pricing_data_path
  ) as ZoloPricingJsonType;

  for (const result of data.result) {
    if (getZoloCenterByZoloCode(zoloCode, existingData.data)) {
      console.log("Center already exists, mutating: ", result.centerId);
      mutateZoloPricing(existingData, zoloCode, result);
    } else {
      console.log("Saving new center: ", result.centerId);
      existingData.data.push({
        zoloCode: zoloCode,
        data: [{ ...result, updatedAt: new Date().toISOString() }],
      });
    }
  }

  existingData.lastUpdatedAt = new Date().toISOString();
  writeJson(DATA_PATHS.zolo.property_pricing_data_path, existingData);
}

// ─── Integrity check ──────────────────────────────────────────────────────────

export function verify_file_integrity() {
  const centers_data = load_zolo_data_from_json("center_search");
  const pricing_data = load_zolo_data_from_json("property_pricing");
  let errors = 0;

  for (const center of centers_data.data) {
    const zolo_code = center.basicData.zoloCode;
    const idx = pricing_data.data.findIndex(
      (item) => item.zoloCode === zolo_code
    );
    if (idx === -1) {
      console.log("Zolo code not found in pricing data: ", zolo_code);
      errors++;
    }
  }

  console.log("File integrity verified with ", errors, " errors");
}

// ─── Clipboard utility ────────────────────────────────────────────────────────

export function copy_zolo_pricing_data_to_clipboard(zoloCode: string) {
  const data = getZoloPricingByZoloCode(
    zoloCode,
    load_zolo_data_from_json("property_pricing").data
  );
  if (data) {
    pbcopy(JSON.stringify(data));
    console.log("Zolo pricing data copied to clipboard");
  }
}

// ─── Analytics ────────────────────────────────────────────────────────────────

type RoomInfo = {
  rooms: string[];
  zoloCode: string;
};

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

export const runJsonAnalytics = () => {
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
      return {
        sharingType: item.sharingType,
        variantCount: variants.length,
        roomVariantTypeListLengths: item.roomVariantTypeList?.length ?? 0,
      };
    });
    results.push({ zoloCode: zolo_code, name, pricingShape });
  }

  writeJson(DATA_PATHS.analytics.zolo_pricing_shape_analytics_path, results);
  return results;
};
