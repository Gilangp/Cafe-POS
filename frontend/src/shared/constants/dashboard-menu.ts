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
      { title: 'POS', icon: Calculator, href: '/dashboard/pos', roles: ['owner', 'kasir', 'multi_role'] },
      { title: 'Reservasi', icon: CalendarCheck, href: '/dashboard/reservasi', roles: ['owner', 'admin', 'kasir', 'multi_role'] },
      { title: 'Menu', icon: Utensils, href: '/dashboard/menu', roles: ['owner', 'admin', 'kasir', 'dapur_barista', 'multi_role'] },
      { title: 'Kategori Menu', icon: Tags, href: '/dashboard/kategori-menu', roles: ['owner', 'admin'] },
      { title: 'Inventory', icon: Package, href: '/dashboard/inventory', roles: ['owner', 'admin', 'dapur_barista', 'multi_role'] },
      { title: 'Daftar Pesanan', icon: ClipboardList, href: '/dashboard/daftar-pesanan', roles: ['owner', 'dapur_barista', 'multi_role'] },
      { title: 'Status Pesanan', icon: Clock, href: '/dashboard/status-pesanan', roles: ['owner', 'dapur_barista', 'multi_role'] },
    ]
  },
  {
    title: 'Konten Website',
    roles: ['owner', 'admin'],
    items: [
      { title: 'Landing Page', icon: MonitorPlay, href: '/dashboard/cms/landing', roles: ['owner', 'admin'] },
      { title: 'Banner', icon: ImageIcon, href: '/dashboard/cms/banner', roles: ['owner', 'admin'] },
      { title: 'Artikel', icon: FileText, href: '/dashboard/cms/artikel', roles: ['owner', 'admin'] },
      { title: 'Galeri', icon: ImageIcon, href: '/dashboard/cms/galeri', roles: ['owner', 'admin'] },
      { title: 'Promo', icon: Ticket, href: '/dashboard/cms/promo', roles: ['owner', 'admin'] },
      { title: 'FAQ', icon: HelpCircle, href: '/dashboard/cms/faq', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Laporan',
    roles: ['owner', 'admin'],
    items: [
      { title: 'Penjualan', icon: TrendingUp, href: '/dashboard/laporan/penjualan', roles: ['owner', 'admin'] },
      { title: 'Reservasi', icon: CalendarClock, href: '/dashboard/laporan/reservasi', roles: ['owner', 'admin'] },
      { title: 'Inventory', icon: Archive, href: '/dashboard/laporan/inventory', roles: ['owner', 'admin'] },
    ]
  },
  {
    title: 'Manajemen',
    roles: ['owner', 'admin'],
    items: [
      { title: 'User', icon: Users, href: '/dashboard/manajemen/user', roles: ['owner', 'admin'] },
      { title: 'Role', icon: Shield, href: '/dashboard/manajemen/role', roles: ['owner'] },
      { title: 'Permission', icon: Key, href: '/dashboard/manajemen/permission', roles: ['owner'] },
    ]
  },
  {
    title: 'Pengaturan',
    roles: ['owner'],
    items: [
      { title: 'Pengaturan Website', icon: Settings, href: '/dashboard/pengaturan/website', roles: ['owner'] },
      { title: 'Profil Coffee Shop', icon: Store, href: '/dashboard/pengaturan/profil', roles: ['owner'] },
      { title: 'Backup', icon: Database, href: '/dashboard/pengaturan/backup', roles: ['owner'] },
      { title: 'Aktivitas Sistem', icon: Activity, href: '/dashboard/pengaturan/aktivitas', roles: ['owner'] },
    ]
  }
];
