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
  const [revRes, resvRes] = await Promise.all([
    api.get('/reports/revenue'),
    api.get('/reports/reservations?from=' + new Date().toISOString().split('T')[0])
  ]);
  
  return {
    today_sales: revRes.data.data.today_revenue,
    today_reservations: resvRes.data.data.total_reservations
  };
};

export const getAdminTopMenus = async (): Promise<TopMenu[]> => {
  // Use /reports/sales which Admin has access to (unlike /owner/dashboard/top-menus)
  const res = await api.get('/reports/sales');
  return res.data.data.top_menus.map((item: any) => ({
    menu_name: item.menu_name,
    total_quantity: item.total_quantity,
    total_revenue: item.total_revenue
  }));
};

export const getLowStockItems = async (): Promise<LowStockItem[]> => {
  const res = await api.get('/reports/inventory');
  return res.data.data.low_stock_items.map((item: any) => ({
    id: item.id,
    name: item.name,
    current_stock: item.stock_quantity,
    minimum_stock: item.minimum_stock,
    unit: item.unit
  }));
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
