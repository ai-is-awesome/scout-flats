import { createContext, useContext } from "react";

type AdminAuthContextType = {
  apiKey: string | null;
  clearApiKey: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextType | null>(
  null
);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (ctx === null) {
    throw new Error("useAdminAuth must be used inside AdminAuthGuard");
  }
  return ctx;
}
