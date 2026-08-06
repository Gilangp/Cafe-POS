"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesChart } from '@/shared/services/dashboard.service';
import MonthlySalesChart from './MonthlySalesChart';

export default function MonthlySalesChartData() {
  const { data, isLoading } = useQuery({
    queryKey: ['salesChart', 'weekly'],
    queryFn: () => getSalesChart('weekly'),
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 animate-pulse h-[280px]" />
    );
  }

  return <MonthlySalesChart data={data ?? []} />;
}
