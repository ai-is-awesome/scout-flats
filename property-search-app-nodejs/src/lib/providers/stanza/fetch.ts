import axios from "axios";
import { StanzaPropertySearchApiConfig, stanzaUrls } from "../../../utils/urls";

export const fetchStanzaLivingData = async (
  config: StanzaPropertySearchApiConfig
) => {
  const url = stanzaUrls.get_stanza_search_url(config);
  axios.get(url).then((response) => console.log(response.data));
};
