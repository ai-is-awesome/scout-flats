import axios from "axios";
import type { CenterSearchConfig } from "../../utils/urls";
import { zolo_urls } from "../../utils/urls";

const fetch_zolo_center_search_data = async (config: CenterSearchConfig) => {
  const centerSearchConfig: Partial<CenterSearchConfig> = {
    propertyCategory: "STANDARD,SELECT",
  };
  const url = zolo_urls.get_center_search_url(config);
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { fetch_zolo_center_search_data };
