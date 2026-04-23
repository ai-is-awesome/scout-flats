import { StanzaLivingPropertiesSearchApiResponse } from "@property-search/shared-types";
import { fetchStanzaLivingData } from "../providers/stanza/api";
import { StanzaPropertySearchApiConfig } from "../providers/stanza/endpoints";
import {
  appendStanzaPropertyListingDataToJsonFile,
  readStanzaPropertyListingData,
} from "../storage/stanza";
import { push_stanza_data_to_next } from "../push/next-api";

export async function run_stanza_pipeline() {
  let totalPages = -1;
  let currentPageNumber = 1;
  while (true) {
    console.log(
      "Current page : ",
      currentPageNumber,
      "Total Pages",
      totalPages
    );
    const config: StanzaPropertySearchApiConfig = {
      cityId: 11,
      pageNumber: currentPageNumber,
      pageSize: 10,
    };
    const data: StanzaLivingPropertiesSearchApiResponse =
      await fetchStanzaLivingData(config);

    if (totalPages === -1) {
      totalPages = data.totalPages;
    }
    appendStanzaPropertyListingDataToJsonFile(data);
    if (currentPageNumber >= totalPages) {
      console.log(
        "Current page number: ",
        currentPageNumber,
        "Breaking the loop"
      );
      break;
    }
    currentPageNumber += 1;
  }
}

export async function run_push_stanza_to_next() {
  console.log("hitting");
  const jsonData = readStanzaPropertyListingData();
  const response = await push_stanza_data_to_next(jsonData.data);
  console.log(response);
}
