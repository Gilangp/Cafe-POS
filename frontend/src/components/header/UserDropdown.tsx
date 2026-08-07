"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/shared/services/auth.service";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { User, Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed API side", error);
    } finally {
      logout();
      toast.success("Berhasil keluar dari sistem.");
      router.push("/login");
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 text-gray-700 dark:text-gray-400 dropdown-toggle hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-full lg:rounded-xl transition-colors"
      >
        <div className="relative overflow-hidden rounded-full h-10 w-10 flex-shrink-0 bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-600 font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="hidden lg:flex flex-col items-start text-left">
          <span className="block font-semibold text-sm text-gray-900 dark:text-gray-100 max-w-[120px] truncate">
            {user.name}
          </span>
          <span className="block text-xs font-medium text-brand-600 dark:text-brand-400">
            {user.role}
          </span>
        </div>

        <ChevronDown
          className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[260px] flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
          <span className="block font-bold text-gray-900 dark:text-white truncate">
            {user.name}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {user.email}
          </span>
          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            {user.role}
          </div>
        </div>

        <ul className="flex flex-col gap-1 pb-2 border-b border-gray-100 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-xl text-sm hover:bg-gray-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
            >
              <User className="w-4 h-4" />
              Profil Saya
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-xl text-sm hover:bg-gray-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Pengaturan Akun
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-xl text-sm hover:bg-gray-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Pusat Bantuan
            </DropdownItem>
          </li>
        </ul>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-red-600 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Keluar (Logout)
        </button>
      </Dropdown>
    </div>
  );
}
