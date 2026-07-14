'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Monitor, Package,
  UtensilsCrossed, Users, BarChart3, Settings,
  Coffee, ChevronLeft, ChevronRight, CalendarCheck,
  Megaphone, Star, Truck, FileText, MapPin, Building2,
} from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navGroups = [
  {
    label: 'Operasional',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/pos', label: 'Point of Sale', icon: Monitor },
      { href: '/admin/kds', label: 'Kitchen Display', icon: UtensilsCrossed },
      { href: '/admin/orders', label: 'Semua Order', icon: ShoppingCart },
      { href: '/admin/reservations', label: 'Reservasi', icon: CalendarCheck },
    ],
  },
  {
    label: 'Katalog & Stok',
    items: [
      { href: '/admin/menu', label: 'Menu & Produk', icon: Coffee },
      { href: '/admin/inventory', label: 'Inventori', icon: Package },
      { href: '/admin/suppliers', label: 'Supplier', icon: Truck },
    ],
  },
  {
    label: 'Pelanggan',
    items: [
      { href: '/admin/crm', label: 'Pelanggan (CRM)', icon: Users },
      { href: '/admin/memberships', label: 'Membership', icon: Star },
      { href: '/admin/promotions', label: 'Promosi', icon: Megaphone },
    ],
  },
  {
    label: 'Bisnis',
    items: [
      { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
      { href: '/admin/employees', label: 'Karyawan', icon: Users },
      { href: '/admin/branches', label: 'Cabang', icon: Building2 },
      { href: '/admin/reports', label: 'Laporan', icon: FileText },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { href: '/admin/cms', label: 'CMS Konten', icon: FileText },
      { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
];

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative z-30 flex flex-col h-full
          bg-[#12100E] text-white shadow-2xl
          transition-all duration-300 ease-in-out shrink-0
          ${open ? 'w-64 translate-x-0' : 'w-0 lg:w-16 -translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        {/* Logo Area */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[72px] ${!open && 'lg:justify-center lg:px-0'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/40">
            <Coffee size={18} className="text-primary" />
          </div>
          {open && (
            <div>
              <span className="font-serif text-lg font-bold tracking-wider">Velvra</span>
              <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70 -mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {open && (
                <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!open ? item.label : undefined}
                    className={`
                      flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                      transition-all duration-200 group relative
                      ${active
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }
                      ${!open && 'lg:justify-center lg:px-0'}
                    `}
                  >
                    <item.icon size={18} className={`shrink-0 ${active ? 'text-primary' : ''}`} />
                    {open && <span>{item.label}</span>}
                    {active && open && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-10 w-10 mx-auto mb-4 rounded-full border border-white/10 text-white/50 hover:border-primary/50 hover:text-primary transition-all"
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </aside>
    </>
  );
}
