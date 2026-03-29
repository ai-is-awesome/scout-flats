import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAdminFetch } from "../../hooks/useAdminFetch";
import Table from "@/components/ui/table";
import { POPULAR_LOCALITY_KEYS } from "@/lib/constants/popular-localities";
import { matchPopularLocalities } from "@/lib/localities/match-popular-localities";

export const DatabaseMode = () => {
  const modes = ["localities", "properties"];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string>("localities");
  const { adminFetch } = useAdminFetch();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (currentMode === "localities") {
      adminFetch("/api/admin/properties/localities", { method: "GET" })
        .then((res) => (res ? res.json() : null))
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    } else if (currentMode === "properties") {
      fetch("/api/admin/properties/properties")
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }
  }, [currentMode, adminFetch]);

  const normalizedData = Array.isArray(data) ? data : [];
  const { popularLocalityKeys, missingTopAreas } = matchPopularLocalities(
    normalizedData,
    [...POPULAR_LOCALITY_KEYS]
  );

  console.log("popular locality keys", popularLocalityKeys);
  if (missingTopAreas.length > 0) {
    console.log("topAreas not found in data", missingTopAreas);
  }

  console.log(
    "locality data",
    (data as any[])
      ?.map((item) => {
        return {
          localityKey: item.localityKey,
          locality: item.locality,
          city: item.city,
          id: item.id,
        };
      })
      .sort((a, b) => a.localityKey.localeCompare(b.localityKey))
  );

  const columns = [
    { id: "localityKey", header: "localityKey" },
    { id: "locality", header: "locality" },
    { id: "city", header: "city" },
  ];

  const ComponentToRender = {
    localities: <Table columns={columns} data={normalizedData} />,
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col p-20">
      <div className="bg-gray-300 p-2 rounded-md">
        {modes.map((button) => (
          <Button key={button} variant="default" className="w-fit">
            {button}
          </Button>
        ))}
      </div>
      {ComponentToRender[currentMode as keyof typeof ComponentToRender]}
    </div>
  );
};
