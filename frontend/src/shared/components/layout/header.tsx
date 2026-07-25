'use client';

import * as React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSidebarStore } from '@/store/sidebar.store';
import { cn } from '@/shared/utils/utils';
import { Menu, Search, Bell, Moon, Sun, LogOut, User, Settings, Lock } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import Link from 'next/link';

export const Header = () => {
  const { isCollapsed, toggleMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'Reservasi Baru: Table 04', time: '5m lalu', isNew: true },
    { id: 2, text: 'Stok Espresso Blend Hampir Habis', time: '1j lalu', isNew: true },
  ];

  return (
    <header 
      className={cn(
        "h-16 fixed top-0 right-0 z-30 transition-all duration-300",
        "bg-[#FAF3E7]/90 dark:bg-[#14201A]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/10 flex items-center px-4 md:px-6 shadow-sm",
        isCollapsed ? "md:left-[80px]" : "md:left-[260px]",
        "left-0"
      )}
    >
      <div className="flex items-center justify-between w-full">
        {/* Mobile menu button & Search */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMobile}
            className="md:hidden text-primary dark:text-cream-400 hover:text-accent transition-colors p-1"
          >
            <Menu size={24} />
          </button>
          
          <button className="hidden md:flex items-center gap-2 text-sm text-primary/60 dark:text-cream-400 hover:text-primary dark:hover:text-cream-100 transition-colors bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-black/5 dark:border-white/10 shadow-sm w-72 justify-between focus-within:ring-2 focus-within:ring-accent">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <span>Cari (Menu, Artikel...)</span>
            </div>
            <kbd className="hidden sm:inline-flex bg-primary/5 dark:bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-medium font-mono text-primary/60 dark:text-white/40">
              ⌘ K
            </kbd>
          </button>
          
          <button className="md:hidden text-primary/60 dark:text-cream-400 hover:text-accent p-2">
            <Search size={20} />
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-primary/60 dark:text-cream-400 hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-primary/60 dark:text-cream-400 hover:text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors relative"
            >
              <Bell size={20} />
              {notifications.some(n => n.isNew) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-[#FAF3E7] dark:ring-dark-card" />
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1E2B24] border border-black/5 dark:border-white/10 shadow-card-shadow rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-black/5 dark:border-white/10 flex justify-between items-center bg-[#FAF3E7]/50 dark:bg-black/20">
                  <h3 className="font-heading font-bold text-sm text-primary dark:text-cream-100">Notifikasi</h3>
                  <button className="text-xs text-accent font-medium hover:underline">Tandai dibaca</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-black/5 dark:border-white/10 last:border-0 hover:bg-[#FAF3E7]/50 dark:hover:bg-white/5 cursor-pointer">
                      <p className="text-sm font-medium text-primary dark:text-cream-100">{n.text}</p>
                      <p className="text-xs text-primary/50 dark:text-cream-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-2 md:pl-4 ml-1 border-l border-black/10 dark:border-white/10 hover:opacity-80 transition-opacity"
            >
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-heading font-bold leading-tight text-primary dark:text-cream-100">{user?.name || 'Owner NEMU Space'}</span>
                <span className="text-xs font-medium text-accent uppercase tracking-wider">{user?.role || 'Owner'}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-[#9e7641] text-primary flex items-center justify-center font-bold text-lg shrink-0 shadow-sm border border-accent/20">
                {(user?.name || 'O').charAt(0).toUpperCase()}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1E2B24] border border-black/5 dark:border-white/10 shadow-card-shadow rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-black/5 dark:border-white/10 md:hidden bg-[#FAF3E7]/50 dark:bg-black/20">
                  <p className="font-heading font-bold text-primary dark:text-cream-100 truncate">{user?.name || 'Owner NEMU Space'}</p>
                  <p className="text-xs text-accent font-medium uppercase tracking-wider truncate mt-0.5">{user?.role || 'Owner'}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link href="/dashboard/profil" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary/70 dark:text-cream-400 hover:text-primary dark:hover:text-cream-100 hover:bg-[#FAF3E7] dark:hover:bg-white/5 rounded-xl transition-colors">
                    <User size={16} className="text-accent" /> Profil
                  </Link>
                  <Link href="/dashboard/pengaturan-akun" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary/70 dark:text-cream-400 hover:text-primary dark:hover:text-cream-100 hover:bg-[#FAF3E7] dark:hover:bg-white/5 rounded-xl transition-colors">
                    <Settings size={16} className="text-accent" /> Pengaturan Akun
                  </Link>
                  <Link href="/dashboard/ubah-password" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary/70 dark:text-cream-400 hover:text-primary dark:hover:text-cream-100 hover:bg-[#FAF3E7] dark:hover:bg-white/5 rounded-xl transition-colors">
                    <Lock size={16} className="text-accent" /> Ubah Password
                  </Link>
                </div>
                <div className="p-2 border-t border-black/5 dark:border-white/10 bg-red-50/50 dark:bg-danger/10">
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 dark:hover:bg-danger/20 rounded-xl transition-colors font-bold">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
