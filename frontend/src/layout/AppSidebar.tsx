"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  Calculator,
  MonitorPlay,
  CalendarDays,
  Coffee,
  PackageSearch,
  LayoutTemplate,
  FileText,
  Image as ImageIcon,
  Tag,
  PieChart,
  Users,
  Settings,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles: string[];
  subItems?: { name: string; path: string; roles: string[] }[];
};

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/dashboard",
    roles: ["Owner", "Admin", "Kasir", "Dapur/Barista"],
  },
  {
    name: "Point of Sale",
    icon: <Calculator className="w-5 h-5" />,
    path: "/pos",
    roles: ["Owner", "Admin", "Kasir"],
  },
  {
    name: "Kitchen Display",
    icon: <MonitorPlay className="w-5 h-5" />,
    path: "/kds",
    roles: ["Owner", "Admin", "Dapur/Barista"],
  },
  {
    name: "Manajemen Order",
    icon: <CalendarDays className="w-5 h-5" />,
    roles: ["Owner", "Admin"],
    subItems: [
      { name: "Reservasi Meja", path: "/dashboard/reservations", roles: ["Owner", "Admin"] },
      { name: "Riwayat Transaksi", path: "/dashboard/transactions", roles: ["Owner", "Admin"] },
    ],
  },
  {
    name: "Katalog & Menu",
    icon: <Coffee className="w-5 h-5" />,
    roles: ["Owner", "Admin"],
    subItems: [
      { name: "Daftar Menu", path: "/dashboard/menus", roles: ["Owner", "Admin"] },
      { name: "Kategori Menu", path: "/dashboard/categories", roles: ["Owner", "Admin"] },
    ],
  },
  {
    name: "Inventory",
    icon: <PackageSearch className="w-5 h-5" />,
    roles: ["Owner", "Admin"],
    subItems: [
      { name: "Stok Bahan Baku", path: "/dashboard/inventory", roles: ["Owner", "Admin"] },
      { name: "Supplier", path: "/dashboard/suppliers", roles: ["Owner", "Admin"] },
      { name: "Purchase Order", path: "/dashboard/purchase-orders", roles: ["Owner", "Admin"] },
    ],
  },
];

const cmsAndSettingsItems: NavItem[] = [
  {
    name: "Content (CMS)",
    icon: <LayoutTemplate className="w-5 h-5" />,
    roles: ["Owner", "Admin"],
    subItems: [
      { name: "Promosi", path: "/dashboard/promotions", roles: ["Owner", "Admin"] },
      { name: "Artikel", path: "/dashboard/articles", roles: ["Owner", "Admin"] },
      { name: "Galeri", path: "/dashboard/galleries", roles: ["Owner", "Admin"] },
    ],
  },
  {
    name: "Laporan Bisnis",
    icon: <PieChart className="w-5 h-5" />,
    path: "/dashboard/reports",
    roles: ["Owner", "Admin"],
  },
  {
    name: "Manajemen User",
    icon: <Users className="w-5 h-5" />,
    path: "/dashboard/users",
    roles: ["Owner"],
  },
  {
    name: "Pengaturan Sistem",
    icon: <Settings className="w-5 h-5" />,
    path: "/dashboard/settings",
    roles: ["Owner", "Admin"],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userRole = user?.role || "Kasir";

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname || pathname.startsWith(`${path}/`), [pathname]);

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : cmsAndSettingsItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType as "main" | "others", index });
              submenuMatched = true;
            }
          });
        }
      });
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    const filteredItems = items.filter((item) => item.roles.includes(userRole));
    
    return (
      <ul className="flex flex-col gap-3">
        {filteredItems.map((nav, index) => {
          const hasActiveSub = openSubmenu?.type === menuType && openSubmenu?.index === index;
          
          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-colors ${
                    hasActiveSub ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${hasActiveSub ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="font-medium text-sm whitespace-nowrap">{nav.name}</span>
                    )}
                  </div>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        hasActiveSub ? "rotate-180 text-brand-600 dark:text-brand-400" : "text-gray-400"
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    href={nav.path}
                    className={`menu-item group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                      isActive(nav.path) ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                  >
                    <span className={`${isActive(nav.path) ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}>
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="font-medium text-sm whitespace-nowrap">{nav.name}</span>
                    )}
                  </Link>
                )
              )}
              
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: hasActiveSub ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px" }}
                >
                  <ul className="mt-2 space-y-1 ml-9 border-l border-gray-200 dark:border-gray-800 pl-4">
                    {nav.subItems.filter(sub => sub.roles.includes(userRole)).map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`block px-2 py-2 text-sm rounded-lg transition-colors ${
                            isActive(subItem.path)
                              ? "text-brand-600 font-semibold bg-brand-50/50 dark:bg-brand-500/5 dark:text-brand-400"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-100 dark:border-gray-800 shadow-sm
        ${isExpanded || isMobileOpen ? "w-[290px] px-4" : isHovered ? "w-[290px] px-4 shadow-2xl" : "w-[90px] px-3"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-6 flex items-center h-[80px] ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start px-2"}`}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm shadow-brand-500/20">
            N
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
              NEMU <span className="font-light text-gray-500 dark:text-gray-400">Space</span>
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar pb-8 pt-4">
        <nav className="mb-8 px-2">
          <div className="flex flex-col gap-6">
            <div>
              <h2 className={`mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Operasional" : <MoreHorizontal className="w-5 h-5" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {(userRole === "Owner" || userRole === "Admin") && (
              <div>
                <h2 className={`mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                  {isExpanded || isHovered || isMobileOpen ? "Manajemen & CMS" : <MoreHorizontal className="w-5 h-5" />}
                </h2>
                {renderMenuItems(cmsAndSettingsItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
