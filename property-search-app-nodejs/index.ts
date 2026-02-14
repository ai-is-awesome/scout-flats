import { DATA_PATHS, PROJECT_ROOT } from "./lib/config/json-data-paths";
import { run_zolo_center_search, run_zolo_property_pricing } from "./lib/providers/zolo";
import { fetch_zolo_center_search_data } from "./services/zolo_services/zolo_fetch_data";
import readJson from "./utils/read_json";
import { zolo_urls } from "./utils/urls";


async function main() {
    const data = await fetch_zolo_center_search_data({ offset: 0, limit: 10, propertyCategory: "STANDARD,SELECT", cityKey: "bangalore" })
    console.log(data)
}

// main();


run_zolo_property_pricing()
