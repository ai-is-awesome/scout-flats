import {
  StanzaLivingPropertySearchType,
  ZoloCombinedCenterSearchAndPricingType,
} from "@property-search/shared-types";

const NEXT_APP_BASE_URL = "http://localhost:3000/api/ingest";
const API_KEY = process.env.API_KEY || "";

export const push_zolo_data_to_next = async (
  data: ZoloCombinedCenterSearchAndPricingType[]
) => {
  const response = await fetch(`${NEXT_APP_BASE_URL}/zolo`, {
    method: "POST",
    body: JSON.stringify({ data }),
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const push_stanza_data_to_next = async (
  data: StanzaLivingPropertySearchType[]
) => {
  const response = await fetch(`${NEXT_APP_BASE_URL}/stanza`, {
    method: "POST",
    body: JSON.stringify({ data }),
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  console.log("hitting");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
