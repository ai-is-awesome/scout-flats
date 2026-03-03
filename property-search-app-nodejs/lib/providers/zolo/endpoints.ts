export interface CenterSearchConfig {
    offset: number;
    limit: number;
    propertyCategory: string;
    cityKey: string;
}


export interface CenterPricingConfig {
    dateOfJoining?: string | null | undefined;
    zoloCode: string
}

export const zolo_urls = {
    get_center_search_url: function (_config?: CenterSearchConfig): string {
        return `https://api.zolostays.com/api/v7/centers/search?offset=${_config?.offset}&limit=${_config?.limit}&propertyCategory=${_config?.propertyCategory}&cityKey=${_config?.cityKey}`;
    },

    get_property_pricing_url: function (_config: CenterPricingConfig) {
        if (!_config.dateOfJoining) {
            _config.dateOfJoining = String(Math.floor(Date.now() / 1000))
        }
        return `https://api.zolostays.com/api/v5/center/${_config.zoloCode}/availability?dateOfJoining=${_config.dateOfJoining}`
    }
};
