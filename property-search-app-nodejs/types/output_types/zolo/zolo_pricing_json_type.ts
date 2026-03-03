import { ZoloRoomPricingApiObject } from "../../zolo/zolo_types"

export type ZoloPricingJsonType = {
    data: ZoloPricingJsonObjectWithZoloCode[]
    lastUpdatedAt: string
}

export type ZoloPricingJsonObject = ZoloRoomPricingApiObject & { updatedAt: string }

export type ZoloPricingJsonObjectWithZoloCode = { zoloCode: string, data: ZoloPricingJsonObject[] }

