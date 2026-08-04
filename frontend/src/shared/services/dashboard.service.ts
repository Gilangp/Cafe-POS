import api from '@/shared/api/axios';

// Interfaces
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

export interface LowStockItem {
  id: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
}

export interface TodayReservation {
  id: number;
  customer_name: string;
  time: string;
  number_of_people: number;
  status: string;
}

// Owner Endpoints
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


// Admin Endpoints
export const getAdminDashboardSummary = async (): Promise<any> => {
  // Ganti dengan endpoint yang benar jika ada
  const res = await api.get('/reports/sales'); 
  return res.data.data;
};

export const getLowStockItems = async (): Promise<LowStockItem[]> => {
  const res = await api.get('/reports/inventory?status=low_stock');
  return res.data.data;
};


// Cashier Endpoints
export const getCashierSummary = async (): Promise<{ transaction_count: number; total_revenue: number; }> => {
  const res = await api.get('/pos/summary');
  return res.data.data;
};

export const getTodayReservations = async (): Promise<TodayReservation[]> => {
  const res = await api.get('/pos/reservations/today');
  return res.data.data;
};
