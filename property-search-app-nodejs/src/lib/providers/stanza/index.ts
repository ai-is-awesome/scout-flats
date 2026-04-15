import { fetchStanzaLivingData } from "./fetch";
import { StanzaPropertySearchApiConfig, stanzaUrls } from "../../../utils/urls";

export const fetchData = () => {
  const config: StanzaPropertySearchApiConfig = {
    cityId: 11,
    pageNumber: 1,
    pageSize: 10,
  };
  fetchStanzaLivingData(config);
};
