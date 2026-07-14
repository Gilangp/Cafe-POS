'use client';

import { Menu, Bell, Search, ChevronDown, Building2 } from 'lucide-react';
import { useState } from 'react';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const [branch, setBranch] = useState('Sudirman Flagship');
  const branches = ['Sudirman Flagship', 'Kemang Artisan Bar', 'Senayan City'];

  return (
    <header className="flex items-center justify-between gap-4 bg-white border-b border-gray-200 px-6 py-4 shadow-sm shrink-0">
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
          <div className="absolute left-0 top-full mt-2 hidden group-focus-within:block w-52 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1">
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
            placeholder="Cari order, pelanggan, produk..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D] transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-[#FAF6F0] px-3 py-2 text-sm font-semibold text-gray-700 hover:border-[#BA935D] transition-all">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#BA935D] text-[11px] font-bold text-white">
            A
          </div>
          <span className="hidden sm:block">Admin</span>
          <ChevronDown size={13} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
