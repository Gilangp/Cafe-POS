import { 
  LayoutDashboard, Calculator, CalendarCheck, Utensils, Tags, Package, 
  ClipboardList, Clock, MonitorPlay, Image as ImageIcon, FileText, 
  Ticket, HelpCircle, TrendingUp, CalendarClock, Archive, 
  Users, Shield, Key, Settings, Store, Database, Activity 
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
    roles: ['owner', 'admin', 'kasir', 'dapur_barista', 'multi_role'],
  },
  {
    title: 'Operasional',
    roles: ['owner', 'admin', 'kasir', 'dapur_barista', 'multi_role'],
    items: [
      { title: 'POS (Kasir)', icon: Calculator, href: '/dashboard/pos', roles: ['owner', 'kasir', 'multi_role'] },
      { title: 'KDS (Dapur)', icon: Clock, href: '/dashboard/admin/kds', roles: ['owner', 'admin', 'dapur_barista', 'multi_role'] },
      { title: 'Riwayat Pesanan', icon: ClipboardList, href: '/dashboard/admin/orders', roles: ['owner', 'admin', 'kasir', 'multi_role'] },
      { title: 'Reservasi', icon: CalendarCheck, href: '/dashboard/admin/reservations', roles: ['owner', 'admin', 'kasir', 'multi_role'] },
      { title: 'Menu', icon: Utensils, href: '/dashboard/admin/menu', roles: ['owner', 'admin'] },
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
      { title: 'User & Karyawan', icon: Users, href: '/dashboard/admin/users', roles: ['owner', 'admin'] },
      { title: 'CRM & Member', icon: Shield, href: '/dashboard/admin/memberships', roles: ['owner', 'admin'] },
      { title: 'Daftar Suplier', icon: Package, href: '/dashboard/admin/suppliers', roles: ['owner', 'admin'] },
      { title: 'Pembelian (PO)', icon: TrendingUp, href: '/dashboard/admin/procurement', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Pengaturan',
    roles: ['owner', 'admin'],
    items: [
      { title: 'Pengaturan Umum', icon: Settings, href: '/dashboard/admin/settings', roles: ['owner', 'admin'] },
      { title: 'Aktivitas Sistem', icon: Activity, href: '/dashboard/admin/audit', roles: ['owner'] },
      { title: 'Backup', icon: Database, href: '/dashboard/admin/backup', roles: ['owner'] },
    ]
  }
];
