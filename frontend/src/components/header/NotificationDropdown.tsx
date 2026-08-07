"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Bell, BellRing, CheckCheck } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    if (!isOpen) setHasUnread(false);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
        onClick={toggleDropdown}
      >
        {hasUnread ? (
          <>
            <span className="absolute right-2 top-2 z-10 h-2 w-2 rounded-full bg-brand-500">
              <span className="absolute inline-flex w-full h-full bg-brand-400 rounded-full opacity-75 animate-ping"></span>
            </span>
            <BellRing className="w-5 h-5 text-brand-500" />
          </>
        ) : (
          <Bell className="w-5 h-5" />
        )}
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[120px] sm:right-0 mt-3 flex h-auto max-h-[400px] w-[320px] flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between px-3 pb-3 mb-2 pt-2 border-b border-gray-100 dark:border-gray-800">
          <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Notifikasi
          </h5>
          <button
            onClick={() => setHasUnread(false)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
          >
            <CheckCheck className="w-3 h-3" />
            Tandai dibaca
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto px-1 py-4 text-center items-center justify-center min-h-[200px]">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Belum ada notifikasi baru</p>
          <p className="text-xs text-gray-500 mt-1">Anda sudah melihat semuanya.</p>
        </div>
      </Dropdown>
    </div>
  );
}
