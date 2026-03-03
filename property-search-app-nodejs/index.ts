import { DATA_PATHS, PROJECT_ROOT } from "./lib/config/json-data-paths";
import { copy_zolo_pricing_data_to_clipboard, verify_file_integrity } from "./lib/json_readers/zolo";
import { run_zolo_center_search, run_zolo_property_pricing } from "./lib/providers/zolo";
import { zolo_urls } from "./lib/providers/zolo/endpoints";
import { load_zolo_data_from_json, ZoloPricingClass } from "./lib/providers/zolo/helpers";
import { fetch_zolo_center_search_data } from "./services/zolo_services/zolo_fetch_data";
import readJson from "./utils/read_json";



async function main() {
    const data = await fetch_zolo_center_search_data({ offset: 0, limit: 10, propertyCategory: "STANDARD,SELECT", cityKey: "bangalore" })
    console.log(data)
}

// main();


// run_zolo_property_pricing()

// verify_file_integrity()



// Get room info of pricing data
const ins = new ZoloPricingClass(load_zolo_data_from_json("property_pricing"))

const f = ins.get_room_info_of_all_centers()
console.log(f?.slice(0, 10))
