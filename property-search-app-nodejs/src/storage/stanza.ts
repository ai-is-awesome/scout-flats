import {
  readJson,
  StanzaLivingJsonType,
  StanzaLivingPropertiesSearchApiResponse,
  StanzaLivingPropertySearchType,
} from "@property-search/shared-types";
import { DATA_PATHS } from "./paths";
import writeJson from "../utils/write_json";

export function readStanzaPropertyListingData() {
  const data = readJson(
    DATA_PATHS.stanzaLiving.stanzaPropertyListingDataPath
  ) as StanzaLivingJsonType;
  return data;
}

export function writeStanzaPropertyListingDataToJsonFile(
  data: StanzaLivingPropertySearchType[]
) {
  const jsonData: StanzaLivingJsonType = {
    data,
    lastUpdatedAt: new Date().toISOString(),
  };
  writeJson(DATA_PATHS.stanzaLiving.stanzaPropertyListingDataPath, jsonData);
}

export function appendStanzaPropertyListingDataToJsonFile(
  newData: StanzaLivingPropertiesSearchApiResponse
) {
  const existingData = readStanzaPropertyListingData();
  for (const property of newData.residenceResponseShortDTOs) {
    const id = property.residenceId;
    const existingIdx = existingData.data.findIndex(
      (item) => item.residenceId === id
    );

    if (existingIdx !== -1) {
      console.log(`Property with id ${id} already exists. Skipping...`);
      continue;
    }
    existingData.data.push(property);
  }
  writeStanzaPropertyListingDataToJsonFile(existingData.data);
}

export class StanzaJsonData {
  jsonData: StanzaLivingJsonType;
  stanza: {
    jsonData: StanzaLivingJsonType;
    uniqueLocalities: string[];
  };
  constructor() {
    this.jsonData = readJson(
      DATA_PATHS.stanzaLiving.stanzaPropertyListingDataPath
    );

    this.stanza  = {
      jsonData: this.jsonData,
      uniqueLocalities: this.getUniqueLocalities(),
    };
  }

  getJsonData() {
    return this.jsonData;
  }

  private getUniqueLocalities() {
    const localitiesSet = new Set<string>();
    for (const property of this.jsonData.data) {
      if (property.micromarketName) {
        localitiesSet.add(property.micromarketName);
      }
    }
    return Array.from(localitiesSet);
  }
}
