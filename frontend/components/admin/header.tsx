'use client';

import { Menu, Bell, Search, ChevronDown, Building2, LogOut, UserCheck, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const router = useRouter();
  const [branch, setBranch] = useState('Sudirman Flagship');
  const [sessionName, setSessionName] = useState('Admin Lead');
  const [sessionRole, setSessionRole] = useState('Super Admin');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const branches = ['Sudirman Flagship', 'Kemang Artisan Bar', 'Senayan City'];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('velvra_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setSessionName(parsed.name);
        if (parsed.role) setSessionRole(parsed.role);
      }
    } catch (e) {
      console.warn('Failed to parse session:', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('velvra_admin_session');
    router.push('/admin/login');
  };

  const initial = (sessionName[0] || 'A').toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 py-4 shadow-sm shrink-0 relative z-30">
      {/* Left: Hamburger + Branch Switcher */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Branch Switcher Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-[#FAF6F0] px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
            <Building2 size={15} className="text-[#BA935D]" />
            <span>{branch}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <div className="absolute left-0 top-full mt-2 hidden group-focus-within:block w-52 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1 animate-fadeIn">
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  b === branch ? 'bg-[#BA935D]/10 text-[#BA935D] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Cari order (#ORD-...), pelanggan, atau menu..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D] transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
        </button>

        {/* User Avatar Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-[#FAF6F0] px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[#BA935D] transition-all"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BA935D] text-[11px] font-bold text-white shadow-sm">
              {initial}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left leading-tight">
              <span className="text-xs font-bold text-gray-800">{sessionName}</span>
              <span className="text-[10px] text-[#BA935D] font-semibold uppercase">{sessionRole}</span>
            </div>
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {/* User Dropdown Box */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl z-50 animate-fadeIn">
              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-xs font-bold text-gray-800">{sessionName}</p>
                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <Shield size={12} className="text-[#BA935D]" /> {sessionRole}
                </p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserCheck size={14} className="text-gray-400" /> Profil & Sesi
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors mt-1"
              >
                <LogOut size={14} /> Keluar / Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
