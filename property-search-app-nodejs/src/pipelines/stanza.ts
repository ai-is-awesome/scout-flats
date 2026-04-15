import { fetchStanzaLivingData } from "../providers/stanza/api";
import { StanzaPropertySearchApiConfig } from "../providers/stanza/endpoints";

export async function run_stanza_pipeline() {
  const config: StanzaPropertySearchApiConfig = {
    cityId: 11,
    pageNumber: 1,
    pageSize: 10,
  };
  await fetchStanzaLivingData(config);
}
