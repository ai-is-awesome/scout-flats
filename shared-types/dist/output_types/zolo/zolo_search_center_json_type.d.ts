import { ZoloAccomodation } from "../../zolo/zolo_types";
export type ZoloSearchCenterApiJsonType = {
    data: ZoloAccomodationWithUpdatedAt[];
    lastUpdatedAt: string;
};
export type ZoloAccomodationWithUpdatedAt = ZoloAccomodation & {
    updatedAt: string;
};
//# sourceMappingURL=zolo_search_center_json_type.d.ts.map