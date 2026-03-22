import { loadZoloDataFromJson } from "@/lib/zolo/loadJsonOutput";
import { NextResponse } from "next/server";
import { ENV_MODES } from "@/lib/config/paths";
import { combine_zolo_center_search_and_pricing_data } from "@property-search/shared-types";
export const GET = async (request: Request) => {
  if (process.env.ENV === ENV_MODES.PROD) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const key = process.env.INTERNAL_API_KEY;
  if ("Bearer " + key !== request.headers.get("Authorization")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await loadZoloDataFromJson("centerSearch");
  const pricingData = await loadZoloDataFromJson("propertyPricing");
  const combinedData = combine_zolo_center_search_and_pricing_data(
    data,
    pricingData
  );
  return NextResponse.json({ combinedData });
};
