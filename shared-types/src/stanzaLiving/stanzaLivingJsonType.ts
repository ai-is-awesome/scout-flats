import {
  StanzaLivingPropertiesSearchApiResponse,
  StanzaLivingPropertySearchType,
} from "./stanzaLivingApiResponse";

export type StanzaLivingJsonType = {
  data: StanzaLivingPropertySearchType[];
  lastUpdatedAt: string;
};
