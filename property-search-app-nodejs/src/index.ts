import {
  run_zolo_center_search,
  run_zolo_property_pricing,
  run_push_zolo_to_next,
} from "./pipelines/zolo";
import { run_stanza_pipeline } from "./pipelines/stanza";
import {
  verify_file_integrity,
  copy_zolo_pricing_data_to_clipboard,
  ZoloPricingClass,
  load_zolo_data_from_json,
  runJsonAnalytics,
} from "./storage/zolo";
import { StanzaJsonData } from "./storage/stanza";

// ── Zolo pipeline ─────────────────────────────────────────────────────────────
// run_zolo_center_search();
// run_zolo_property_pricing();
// run_push_zolo_to_next();

// ── Stanza pipeline ───────────────────────────────────────────────────────────
// console.log("Running Stanza pipeline...");
// run_stanza_pipeline();

const ins = new StanzaJsonData();
console.log(ins.stanza.uniqueLocalities);

// ── Utilities ─────────────────────────────────────────────────────────────────
// verify_file_integrity();
// runJsonAnalytics();
// const ins = new ZoloPricingClass(load_zolo_data_from_json("property_pricing"));
// console.log(ins.get_room_info_of_all_centers());
