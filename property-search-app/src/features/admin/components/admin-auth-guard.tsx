import { useEffect, useState } from "react";
import { AdminApiKeyForm } from "./api-key-form";
import { AdminAuthContext } from "../context/AdminAuthContext";

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  useEffect(() => {
    const apiKey = localStorage.getItem("internalApiKey");
    setIsLoading(false);
    if (apiKey) {
      setApiKey(apiKey);
    }
  }, []);

  const saveKey = (key: string) => {
    localStorage.setItem("internalApiKey", key);
    setApiKey(key);
  };

  const clearApiKey = () => {
    localStorage.removeItem("internalApiKey");
    setApiKey(null);
  };

  if (!apiKey) return <AdminApiKeyForm onSave={saveKey} />;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminAuthContext.Provider value={{ apiKey, clearApiKey }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthGuard;
