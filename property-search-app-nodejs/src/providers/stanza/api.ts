import axios from "axios";
import { StanzaPropertySearchApiConfig, stanzaUrls } from "./endpoints";

export const fetchStanzaLivingData = async (
  config: StanzaPropertySearchApiConfig
) => {
  const url = stanzaUrls.get_stanza_search_url(config);
  await new Promise((res) => setTimeout(res, 2000));
  const response = await axios.get(url);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch data from Stanza API. Status code: ${response.status}`
    );
  }

  return response.data;
};
