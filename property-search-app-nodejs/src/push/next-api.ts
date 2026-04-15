import { ZoloCombinedCenterSearchAndPricingType } from "@property-search/shared-types";

const NEXT_APP_URL = "http://localhost:3000/api/ingest/zolo";
const API_KEY = process.env.API_KEY || "";

export const push_zolo_data_to_next = async (
  data: ZoloCombinedCenterSearchAndPricingType[]
) => {
  const response = await fetch(NEXT_APP_URL, {
    method: "POST",
    body: JSON.stringify({ data }),
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
