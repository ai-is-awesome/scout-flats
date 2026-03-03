import { ZoloAccomodation } from "../../zolo/zolo_types"

export type ZoloSearchCenterApiJsonType = {
    data: ZoloAccomodationWithUpdatedAt[];
    lastUpdatedAt: string;
}


export type ZoloAccomodationWithUpdatedAt = ZoloAccomodation & { updatedAt: string }
