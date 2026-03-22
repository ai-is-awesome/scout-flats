import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Props = {
  onSave: (key: string) => void;
};

export function AdminApiKeyForm({ onSave }: Props) {
  const [apiKey, setApiKey] = useState<string>("");
  return (
    <div className="bg-gray-100 flex flex-col items-center min-h-screen">
      <div className="w-1/2 mx-auto mt-48 bg-white rounded-lg shadow-sm px-12 py-12">
        <div className="flex flex-col gap-6">
          <p className="text-lg font-bold">No API key found</p>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter API key"
          />
          <Button onClick={() => onSave(apiKey)}>Save</Button>
        </div>
      </div>
    </div>
  );
}
