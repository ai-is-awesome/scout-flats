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
