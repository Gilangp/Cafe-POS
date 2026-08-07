"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/shared/services/dashboard.service';
import { EcommerceMetrics } from './EcommerceMetrics';

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
      <div className="mt-5">
        <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
        <div className="h-8 mt-2 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
      </div>
    </div>
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
      <div className="mt-5">
        <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
        <div className="h-8 mt-2 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export const EcommerceMetricsData = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isError || !data) {
    // Optionally render a specific error state
    // For now, rendering the component with zeros
    return <EcommerceMetrics customers={0} orders={0} customerGrowth={0} orderGrowth={0} />;
  }

  // Using today_reservations_count as a proxy for new customers for now
  // Using total_transactions_all_time for total orders
  // Growth percentages are placeholders
  const customerGrowth = 5.5; // Placeholder
  const orderGrowth = -1.2; // Placeholder

  return (
    <EcommerceMetrics
      customers={data.today_reservations_count}
      orders={data.total_transactions_all_time}
      customerGrowth={customerGrowth}
      orderGrowth={orderGrowth}
    />
  );
};
