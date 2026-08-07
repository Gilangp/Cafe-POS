"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopMenus } from '@/shared/services/dashboard.service';
import RecentOrders from './RecentOrders';

export default function RecentOrdersData() {
  const { data, isLoading } = useQuery({
    queryKey: ['topMenus'],
    queryFn: getTopMenus,
  });

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 animate-pulse h-[300px]" />
    );
  }

  return <RecentOrders data={data ?? []} />;
}
