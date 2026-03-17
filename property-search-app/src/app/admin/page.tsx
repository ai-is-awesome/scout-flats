"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import { useEffect } from "react";

const Page = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  useEffect(() => {
    const apiKey = localStorage.getItem("internalApiKey");
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  if (!apiKey) {
    return (
      <div className="bg-gray-100 flex flex-col items-center min-h-screen">
        <div className=" w-1/2 mx-auto mt-48 min-h-[300px] bg-white rounded-lg shadow-sm px-12 py-12">
          <div className="flex flex-col  gap-6">
            <p className="text-lg font-bold">No API key found</p>
            <Input type="text" placeholder="Enter API key" />
            <Button type="submit" className="w-content">
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <div>API key: {apiKey}</div>;
};

export default Page;
