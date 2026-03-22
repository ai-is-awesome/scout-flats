import { useCallback } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";

export const useAdminFetch = () => {
  const { apiKey, clearApiKey } = useAdminAuth();

  const adminFetch = useCallback(
    async (url: string, options: RequestInit) => {
      const resp = await fetch(url, {
        ...options,
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (resp.status === 401) {
        clearApiKey();
        return null;
      }
      return resp;
    },
    [apiKey, clearApiKey]
  );
  return { adminFetch };
};
