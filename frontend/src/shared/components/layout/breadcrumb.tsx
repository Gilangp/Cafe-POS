'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { DASHBOARD_MENU } from '@/shared/constants/dashboard-menu';

export const DashboardBreadcrumb = () => {
  const pathname = usePathname();

  // Simple breadcrumb generator based on pathname and menu constants
  const generateBreadcrumbs = () => {
    // Return early if we are strictly on /dashboard
    if (pathname === '/dashboard') {
      return [{ title: 'Dashboard', href: '/dashboard' }];
    }

    const paths = pathname.split('/').filter(p => p !== '');
    
    // We expect the first to be 'dashboard'
    if (paths[0] !== 'dashboard') return [];

    let currentLink = '';
    const breadcrumbs = [];

    // Dashboard root is always the first node
    breadcrumbs.push({ title: 'Dashboard', href: '/dashboard' });
    currentLink += '/dashboard';

    // We can try to map remaining paths to readable titles, 
    // or search in our DASHBOARD_MENU for titles
    for (let i = 1; i < paths.length; i++) {
      currentLink += `/${paths[i]}`;
      
      // Look up in our menu constants to get a nice title
      let matchedTitle = null;
      
      DASHBOARD_MENU.forEach(group => {
        if (group.href === currentLink) matchedTitle = group.title;
        if (group.items) {
          group.items.forEach(item => {
            if (item.href === currentLink || currentLink.startsWith(item.href + '/')) {
              matchedTitle = item.title;
            }
          });
        }
      });

      // If we are deeper than the defined menu (e.g., /dashboard/menu/tambah),
      // we format the raw path string
      if (!matchedTitle && i > 0) {
        matchedTitle = paths[i]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      breadcrumbs.push({
        title: matchedTitle || paths[i],
        href: currentLink
      });
    }

    // A hacky way to remove duplicates if the matching is overlapping
    const uniqueBreadcrumbs = breadcrumbs.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i);

    return uniqueBreadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm text-foreground/60 dark:text-cream-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.href} className="inline-flex items-center">
              {index > 0 && <ChevronRight size={14} className="mx-1 opacity-50" />}
              
              {isLast ? (
                <span className="font-semibold text-primary dark:text-cream-100 flex items-center gap-1.5">
                  {index === 0 && <Home size={14} />}
                  {crumb.title}
                </span>
              ) : (
                <Link 
                  href={crumb.href} 
                  className="hover:text-primary dark:hover:text-cream-100 transition-colors flex items-center gap-1.5"
                >
                  {index === 0 && <Home size={14} />}
                  {crumb.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
