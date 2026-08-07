import api from '@/shared/api/axios';

export interface TicketItem {
  id: string;
  menu_name_snapshot: string;
  quantity: number;
  note: string | null;
  item_status: string;
}

export interface KdsTicket {
  id: string;
  ticket_number: string;
  status: 'diterima' | 'diproses' | 'siap' | 'disajikan' | 'dibatalkan';
  received_at: string;
  processed_at: string | null;
  ready_at: string | null;
  elapsed_minutes: number;
  transaction: {
    id: string;
    invoice_number: string;
    order_type: string;
    table_number: string | null;
    customer_name: string | null;
    created_at: string;
  };
  items: TicketItem[];
}

export const getActiveTickets = async (): Promise<KdsTicket[]> => {
  const res = await api.get('/kds/tickets');
  return res.data.data;
};

export const updateTicketStatus = async (id: string, status: 'diterima' | 'diproses' | 'siap' | 'disajikan' | 'dibatalkan'): Promise<any> => {
  const res = await api.patch(`/kds/tickets/${id}/status`, { status });
  return res.data.data;
};
