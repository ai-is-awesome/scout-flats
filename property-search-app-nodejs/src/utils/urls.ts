export interface CenterSearchConfig {
  offset: number;
  limit: number;
  propertyCategory: string;
  cityKey: string;
}

export const zolo_urls = {
  get_center_search_url: function (_config?: CenterSearchConfig): string {
    return `https://api.zolostays.com/api/v7/centers/search?offset=${_config?.offset}&limit=${_config?.limit}&propertyCategory=${_config?.propertyCategory}&cityKey=${_config?.cityKey}`;
  },
};

export type StanzaPropertySearchApiConfig = {
  cityId: number;
  pageNumber: number;
  pageSize: number;
};

export const stanzaUrls = {
  get_stanza_search_url: function (_config?: StanzaPropertySearchApiConfig) {
    return `https://www.stanzaliving.com/api/residence/search?city=${_config?.cityId}&pageNo=${_config?.pageNumber}&pageSize=${_config?.pageSize}`;
  },
};

export const api_urls = {
  zolo_push_url: "http://localhost:3000/api/ingest/zolo",
};
