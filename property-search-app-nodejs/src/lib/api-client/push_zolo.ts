import { ZoloCombinedCenterSearchAndPricingType } from "@property-search/shared-types"
import { api_urls } from "../../utils/urls"
import { ApiRequest } from "./request"


export const push_json_data_to_zolo_api = async (data: ZoloCombinedCenterSearchAndPricingType[]) => {
    const url = api_urls.zolo_push_url
    const response = await ApiRequest.post(url, { data })
    return response
}

