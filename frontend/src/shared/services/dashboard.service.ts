import api from '@/shared/api/axios';

export interface DashboardSummary {
  today_revenue: number;
  this_month_revenue: number;
  total_transactions_all_time: number;
  today_reservations_count: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopMenu {
  menu_name: string;
  total_quantity: number;
  total_revenue: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get('/owner/dashboard/summary');
  return res.data.data;
};

export const getSalesChart = async (period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<ChartData[]> => {
  const res = await api.get('/owner/dashboard/sales-chart', { params: { period } });
  return res.data.data;
};

export const getTopMenus = async (): Promise<TopMenu[]> => {
  const res = await api.get('/owner/dashboard/top-menus');
  return res.data.data;
};
