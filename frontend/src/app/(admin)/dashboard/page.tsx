import type { Metadata } from "next";
import DashboardRouter from "@/components/dashboard/DashboardRouter";

export const metadata: Metadata = {
  title: "Dashboard | NEMU Space",
  description: "NEMU Space Management Dashboard",
};

export default function DashboardPage() {
  return <DashboardRouter />;
}
