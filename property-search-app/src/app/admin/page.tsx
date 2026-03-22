"use client";

import AdminAuthGuard from "@/features/admin/components/admin-auth-guard";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";

const Page = () => {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
};

export default Page;
