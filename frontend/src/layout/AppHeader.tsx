"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuthStore } from "@/store/auth.store";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { Search, Menu, X, ChevronRight, Calculator } from "lucide-react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user } = useAuthStore();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const generateBreadcrumb = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) return null;
    
    return (
      <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 font-medium">
        <Link href="/dashboard" className="hover:text-brand-600 transition-colors">Home</Link>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          
          return (
             <React.Fragment key={path}>
               <ChevronRight className="w-4 h-4 text-gray-400" />
               {isLast ? (
                 <span className="text-gray-900 dark:text-gray-100">{formattedPath}</span>
               ) : (
                 <span className="hover:text-gray-900 transition-colors cursor-pointer">{formattedPath}</span>
               )}
             </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <header 
      className={`sticky top-0 z-40 flex w-full transition-all duration-300 h-[80px] ${
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm" 
          : "bg-white dark:bg-gray-900 border-b border-gray-100 lg:border-transparent lg:dark:border-transparent"
      }`}
    >
      <div className="flex items-center justify-between w-full px-4 lg:px-8">
        
        {/* Left Section: Toggle & Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggle}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <button
            onClick={handleToggle}
            className="hidden lg:flex p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {generateBreadcrumb()}

          {/* Mobile Logo */}
          <Link href="/dashboard" className="lg:hidden ml-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
          </Link>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          
          {/* Search Bar */}
          <div className="hidden lg:block relative w-[240px] xl:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or type command..."
              className="w-full h-10 pl-10 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-sm outline-none text-gray-700 dark:text-gray-200"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-[10px] font-medium text-gray-400 shadow-sm">
              ⌘K
            </div>
          </div>

          {/* Quick Action POS (Kasir/Admin/Owner) */}
          {user?.role && ["Kasir", "Admin", "Owner"].includes(user.role) && (
            <Link href="/pos" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors rounded-xl font-medium text-sm border border-brand-100 dark:border-brand-500/20">
              <Calculator className="w-4 h-4" />
              <span>Buka POS</span>
            </Link>
          )}

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden sm:block mx-1"></div>

          <div className="flex items-center gap-2">
            <ThemeToggleButton />
            <NotificationDropdown />
            <div className="ml-2">
              <UserDropdown />
            </div>
          </div>
        </div>
        
      </div>
    </header>
  );
};

export default AppHeader;
