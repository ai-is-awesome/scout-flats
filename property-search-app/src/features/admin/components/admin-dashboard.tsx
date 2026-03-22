import { useEffect, useState } from "react";
import { useAdminFetch } from "../hooks/useAdminFetch";
import { Button } from "@/components/ui/button";
import DatabaseEntries from "./database-entries/database-entries";
import { JsonEntries } from "./json-entries/json-entries";
import { JsonAnalytics } from "./json-analytics";

export function AdminDashboard() {
  const { adminFetch } = useAdminFetch();
  const [data, setData] = useState<any>(null);

  const modeToComponent = {
    "zolo-json-data": JsonEntries,
    "zolo-property-pricing-data": DatabaseEntries,
    "zolo-json-analytics": JsonAnalytics,
  };

  useEffect(() => {
    adminFetch("/api/zolo_json_data", { method: "GET" })
      .then((resp) => (resp ? resp.json() : null))
      .then((json) => {
        if (json?.combinedData) setData(json.combinedData);
      })
      .catch(() => setData(null));
  }, [adminFetch]);

  const modes = [
    "zolo-json-data",
    "zolo-property-pricing-data",
    "zolo-json-analytics",
  ];

  const [mode, setMode] = useState<
    "zolo-json-data" | "zolo-property-pricing-data"
  >("zolo-json-data");
  const SelectedComponent = modeToComponent[mode];

  return (
    <div>
      {modes.map((m) => (
        <Button
          key={m}
          variant={mode === m ? "default" : "outline"}
          onClick={() =>
            setMode(m as "zolo-json-data" | "zolo-property-pricing-data")
          }
        >
          {m}
        </Button>
      ))}

      {SelectedComponent ? <SelectedComponent data={data} /> : null}
    </div>
  );
}
