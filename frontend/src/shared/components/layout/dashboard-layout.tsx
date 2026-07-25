'use client';

import * as React from 'react';
import { useSidebarStore } from '@/store/sidebar.store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { DashboardBreadcrumb } from './breadcrumb';
import { cn } from '@/shared/utils/utils';
import { AnimatePresence, motion } from 'framer-motion';

export const DashboardLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed, isMobileOpen, setMobile } = useSidebarStore();
  
  return (
    <div className="min-h-screen bg-[#FAF3E7] dark:bg-[#14201A] text-[#1E3D31] dark:text-[#F5EFE6] flex overflow-hidden font-sans">
      <Sidebar />

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1E3D31]/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobile(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-4/5 max-w-[280px] bg-primary dark:bg-dark-card shadow-2xl md:hidden overflow-y-auto transform transition-transform">
              <Sidebar className="flex static w-full h-full" isMobile={true} />
            </div>
          </>
        )}
      </AnimatePresence>

      <main 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen",
          isCollapsed ? "md:ml-[80px]" : "md:ml-[260px]"
        )}
      >
        <Header />
        
        <div className="flex-1 overflow-y-auto pt-16 h-[calc(100vh-64px)] custom-scrollbar">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
            <DashboardBreadcrumb />
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
