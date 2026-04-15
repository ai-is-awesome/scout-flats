import { readJson, StanzaLivingJsonType } from "@property-search/shared-types";
import { DATA_PATHS } from "../config/json-data-paths";

export function read_stanza_property_listing_data() {
  const data = readJson(
    DATA_PATHS.stanzaLiving.stanzaPropertyListingDataPath
  ) as StanzaLivingJsonType;
  return data;
}
