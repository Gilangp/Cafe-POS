import { 
  LayoutDashboard, Calculator, CalendarCheck, Utensils, Tags, Package, 
  ClipboardList, Clock, MonitorPlay, FileText, 
  Ticket, TrendingUp, 
  Users, Store, Database, Activity, Scale, Settings
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { LucideProps } from 'lucide-react';

export type Role = 'owner' | 'admin' | 'kasir' | 'dapur_barista' | 'multi_role';

export interface MenuItem {
  title: string;
  href?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  roles: string[];
  items?: MenuItem[];
}

export const DASHBOARD_MENU: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['owner', 'admin'],
  },
  {
    title: 'Operasional',
    roles: ['owner', 'admin', 'kasir', 'dapur_barista', 'multi_role'],
    items: [
      { title: 'Kasir (POS)', icon: Calculator, href: '/dashboard/kasir', roles: ['owner', 'kasir', 'multi_role'] },
      { title: 'Dapur / Barista', icon: Clock, href: '/dashboard/barista', roles: ['owner', 'admin', 'dapur_barista', 'multi_role'] },
      { title: 'Riwayat Pesanan', icon: ClipboardList, href: '/dashboard/admin/orders', roles: ['owner', 'admin', 'kasir', 'multi_role'] },
      { title: 'Reservasi', icon: CalendarCheck, href: '/dashboard/admin/reservations', roles: ['owner', 'admin', 'kasir', 'multi_role'] },
      { title: 'Menu', icon: Utensils, href: '/dashboard/admin/menu', roles: ['owner', 'admin'] },
      { title: 'Kategori', icon: Tags, href: '/dashboard/admin/categories', roles: ['owner', 'admin'] },
      { title: 'Inventory', icon: Package, href: '/dashboard/admin/inventory', roles: ['owner', 'admin', 'multi_role'] },
    ]
  },
  {
    title: 'Konten Website',
    roles: ['owner', 'admin'],
    items: [
      { title: 'CMS Terpadu', icon: MonitorPlay, href: '/dashboard/admin/cms', roles: ['owner', 'admin'] },
      { title: 'Promo', icon: Ticket, href: '/dashboard/admin/promotions', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Laporan',
    roles: ['owner', 'admin'],
    items: [
      { title: 'Penjualan', icon: FileText, href: '/dashboard/admin/reports', roles: ['owner', 'admin'] },
      { title: 'Analitik', icon: TrendingUp, href: '/dashboard/admin/analytics', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Manajemen',
    roles: ['owner', 'admin'],
    items: [
      { title: 'Karyawan', icon: Users, href: '/dashboard/admin/employees', roles: ['owner', 'admin'] },
      { title: 'Suplier', icon: Store, href: '/dashboard/admin/suppliers', roles: ['owner', 'admin'] },
      { title: 'Pembelian (PO)', icon: Package, href: '/dashboard/admin/procurement/purchase-orders', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Pengaturan',
    roles: ['owner'],
    items: [
      { title: 'Pengaturan Umum', icon: Settings, href: '/dashboard/admin/settings', roles: ['owner'] },
      { title: 'Konversi Satuan', icon: Scale, href: '/dashboard/admin/unit-conversions', roles: ['owner'] },
      { title: 'Audit Log', icon: Activity, href: '/dashboard/admin/audit', roles: ['owner'] },
      { title: 'Backup & Restore', icon: Database, href: '/dashboard/admin/backup', roles: ['owner'] },
    ]
  }
];
