import api from '@/shared/api/axios';

export interface PosCategory {
  id: string;
  name: string;
  display_order: number;
}

export interface PosMenu {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: string;
  category?: PosCategory;
}

export interface CartItem {
  cart_id: string; // Unique ID for the cart line (useful if same menu has different notes)
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  note: string;
  image: string | null;
}

export interface OrderPayload {
  payment_method: 'tunai' | 'qris' | 'kartu';
  discount?: number;
  order_type: 'dine_in' | 'takeaway';
  table_number?: string | null;
  customer_name?: string | null;
  items: {
    menu_id: string;
    quantity: number;
    note?: string;
  }[];
}

export const getPosMenus = async (): Promise<PosMenu[]> => {
  const res = await api.get('/pos/menus');
  return res.data.data;
};

export const createOrder = async (payload: OrderPayload) => {
  const res = await api.post('/pos/transactions', payload);
  return res.data;
};
