import type { Metadata } from "next";
import { EcommerceMetricsData } from "@/components/ecommerce/EcommerceMetricsData";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChartData from "@/components/ecommerce/MonthlySalesChartData";
import RecentOrdersData from "@/components/ecommerce/RecentOrdersData";

export const metadata: Metadata = {
  title: "Dashboard | NEMU Space",
  description: "NEMU Space Management Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetricsData />
        <MonthlySalesChartData />
      </div>
      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget />
      </div>
      <div className="col-span-12 xl:col-span-7">
        <RecentOrdersData />
      </div>
    </div>
  );
}
