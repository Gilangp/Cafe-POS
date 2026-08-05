'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth.store';
import { useSidebarStore } from '@/store/sidebar.store';
import { cn } from '@/shared/utils/utils';
import { DASHBOARD_MENU, MenuItem } from '@/shared/constants/dashboard-menu';
import { ChevronDown, Menu as MenuIcon, Coffee } from 'lucide-react';

function hasAccess(userRolesStr: string, itemRoles: string[]) {
  if (!userRolesStr) return false;
  const userRoles = userRolesStr.split(',').map(r => r.trim().toLowerCase());
  return userRoles.some(r => itemRoles.includes(r));
}

const SidebarItem = ({ 
  item, 
  isCollapsed, 
  isActive, 
  onClick 
}: { 
  item: MenuItem; 
  isCollapsed: boolean; 
  isActive: boolean;
  onClick?: () => void;
}) => {
  const Icon = item.icon;

  return (
    <div className="group relative">
      <Link 
        href={item.href || '#'}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
          isActive 
            ? "bg-accent text-primary shadow-sm font-bold" 
            : "text-white/70 hover:bg-white/10 hover:text-white"
        )}
      >
        {Icon && <Icon className={cn("shrink-0", isActive ? "text-primary" : "text-white/70 group-hover:text-accent")} size={20} />}
        
        {!isCollapsed && (
          <span className="truncate tracking-wide">{item.title}</span>
        )}

        {isCollapsed && (
          <div className="absolute left-full ml-3 w-max px-2.5 py-1.5 bg-accent text-primary font-bold text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-md">
            {item.title}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-accent rotate-45" />
          </div>
        )}
      </Link>
    </div>
  );
};

const SidebarGroup = ({ 
  item, 
  isCollapsed, 
  pathname, 
  userRole 
}: { 
  item: MenuItem; 
  isCollapsed: boolean; 
  pathname: string;
  userRole: string;
}) => {
  const Icon = item.icon;
  const isActive = item.items?.some(child => pathname === child.href || pathname.startsWith(child.href + '/')) || false;
  const [isOpen, setIsOpen] = React.useState(isActive);
  
  React.useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  const toggle = () => setIsOpen(!isOpen);
  const visibleItems = item.items?.filter(child => hasAccess(userRole, child.roles)) || [];
  
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-2">
      {!isCollapsed ? (
        <button 
          onClick={toggle}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
            isActive 
              ? "text-accent font-bold" 
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && <Icon size={20} className={isActive ? "text-accent" : "text-white/70 group-hover:text-accent"} />}
            <span className="truncate uppercase text-xs tracking-widest font-semibold opacity-90">{item.title}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={cn("transition-transform duration-200 opacity-60", isOpen ? "rotate-180 text-accent" : "")} 
          />
        </button>
      ) : (
        <div className="flex justify-center py-3 relative group">
          <div className="w-8 h-px bg-white/10 group-hover:bg-accent/50 transition-colors" />
          <div className="absolute left-full ml-3 w-max px-2.5 py-1.5 bg-accent text-primary font-bold text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-md">
            {item.title}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-accent rotate-45" />
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isOpen && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 mt-1.5 space-y-1 relative">
              <div className="absolute left-[22px] top-0 bottom-2 w-px bg-white/10" />
              {visibleItems.map(child => (
                <SidebarItem 
                  key={child.href} 
                  item={child} 
                  isCollapsed={false} 
                  isActive={pathname === child.href || pathname.startsWith(child.href + '/')}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCollapsed && (
        <div className="space-y-1 mt-1">
          {visibleItems.map(child => (
            <SidebarItem 
              key={child.href} 
              item={child} 
              isCollapsed={true} 
              isActive={pathname === child.href || pathname.startsWith(child.href + '/')}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = ({ className, isMobile }: { className?: string, isMobile?: boolean }) => {
  const { isCollapsed, setCollapse, setMobile } = useSidebarStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const userRole = user?.role || 'owner';

  const currentWidth = isMobile ? '100%' : (isCollapsed ? 80 : 260);

  return (
    <motion.aside
      animate={{ width: currentWidth }}
      initial={false}
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      className={cn(
        "flex flex-col h-screen bg-primary dark:bg-[#14201A] border-r border-accent/20 shadow-2xl",
        !isMobile && "hidden md:flex fixed left-0 top-0 z-40",
        className
      )}
    >
      {/* Brand & Logo */}
      <div className={cn("h-16 flex items-center border-b border-white/10 shrink-0", isCollapsed && !isMobile ? "justify-center" : "px-4 justify-between")}>
        {(!isCollapsed || isMobile) && (
          <Link href="/" onClick={() => isMobile && setMobile(false)} className="flex items-center gap-3 overflow-hidden group focus:outline-none">
            <div className="bg-gradient-to-br from-accent to-[#9e7641] text-primary p-1.5 rounded-xl shrink-0 shadow-glow transition-transform group-hover:scale-105">
              <Coffee size={24} className="stroke-[2.2]" />
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col whitespace-nowrap"
            >
              <span className="font-heading font-extrabold text-lg text-white tracking-wide">
                NEMU <span className="text-accent font-light">Space</span>
              </span>
            </motion.div>
          </Link>
        )}
        {!isMobile && (
          <button 
            onClick={() => setCollapse(!isCollapsed)}
            className={cn("text-white/50 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5", isCollapsed && "p-2")}
            aria-label="Toggle Sidebar"
          >
            <MenuIcon size={24} />
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobile(false)} className="text-white/50 hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5">
             <MenuIcon size={24} />
          </button>
        )}
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
        {DASHBOARD_MENU.map((menuGroup, idx) => {
          if (!hasAccess(userRole, menuGroup.roles)) return null;
          if (menuGroup.items) {
            return <SidebarGroup key={idx} item={menuGroup} isCollapsed={isCollapsed} pathname={pathname} userRole={userRole} />;
          }
          return <SidebarItem key={idx} item={menuGroup} isCollapsed={isCollapsed} isActive={pathname === menuGroup.href} />;
        })}
      </div>
    </motion.aside>
  );
};
