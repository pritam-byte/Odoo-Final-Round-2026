import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  PieChart,
  ShoppingCart,
  Package,
  FileText,
  UserCheck,
  Settings,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../features/auth/schemas';

export interface NavChildItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface NavSectionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string; // Direct link if no children
  children?: NavChildItem[]; // Collapsible sub-items
  badge?: string | number;
}

export interface NavGroup {
  title?: string;
  items: NavSectionItem[];
}

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  userRole?: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = '/dashboard',
  onNavigate,
  userRole = 'Admin',
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sales: true,
    purchases: false,
    accounting: true,
    reports: false,
    master: false,
    admin: false,
  });

  const navGroups: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={17} strokeWidth={1.75} />,
          path: '/dashboard',
        },
        {
          id: 'analytics-overview',
          label: 'Analytics',
          icon: <PieChart size={17} strokeWidth={1.75} />,
          path: '/analytics',
        },
      ],
    },
    {
      title: 'Operations & Finance',
      items: [
        {
          id: 'sales',
          label: 'Sales & Invoicing',
          icon: <ShoppingCart size={17} strokeWidth={1.75} />,
          children: [
            {
              id: 'sales-orders',
              label: 'Sales Orders',
              path: '/sales/orders',
            },
            {
              id: 'customer-invoices',
              label: 'Customer Invoices',
              path: '/sales/invoices',
            },
          ],
        },
        {
          id: 'purchases',
          label: 'Purchases & Bills',
          icon: <Truck size={17} strokeWidth={1.75} />,
          children: [
            {
              id: 'purchase-orders',
              label: 'Purchase Orders',
              path: '/purchase/orders',
            },
            {
              id: 'vendor-bills',
              label: 'Vendor Bills',
              path: '/purchase/bills',
            },
            {
              id: 'purchase-payments',
              label: 'Payments & Due',
              path: '/payments',
            },
          ],
        },
        {
          id: 'accounting',
          label: 'Accounting & Ledger',
          icon: <BookOpen size={17} strokeWidth={1.75} />,
          children: [
            {
              id: 'journal-entries',
              label: 'Journal Entries',
              path: '/journal-entries',
            },
            {
              id: 'chart-of-accounts',
              label: 'Chart of Accounts',
              path: '/accounts',
            },
            {
              id: 'journals-config',
              label: 'Journals',
              path: '/journals',
            },
            {
              id: 'analytic-accounts',
              label: 'Analytic Accounts',
              path: '/analytics',
            },
            {
              id: 'analytical-budgets',
              label: 'Analytical Budgets',
              path: '/budgets',
            },
          ],
        },
        {
          id: 'reports',
          label: 'Financial Reports',
          icon: <FileText size={17} strokeWidth={1.75} />,
          children: [
            {
              id: 'pnl-report',
              label: 'Profit & Loss',
              path: '/reports/pnl',
            },
            {
              id: 'balance-sheet-report',
              label: 'Balance Sheet',
              path: '/reports/balance-sheet',
            },
            {
              id: 'budget-report',
              label: 'Budget Performance',
              path: '/reports/budget',
            },
          ],
        },
        {
          id: 'master',
          label: 'Master Catalog',
          icon: <Package size={17} strokeWidth={1.75} />,
          children: [
            {
              id: 'catalog-products',
              label: 'Products & Services',
              path: '/products',
            },
            {
              id: 'catalog-contacts',
              label: 'Contacts & CRM',
              path: '/contacts',
            },
          ],
        },
      ],
    },
    ...(userRole === 'Admin'
      ? [
          {
            title: 'Administration',
            items: [
              {
                id: 'users',
                label: 'User Management',
                icon: <UserCheck size={17} strokeWidth={1.75} />,
                path: '/users',
                badge: 'Admin',
              },
              {
                id: 'settings',
                label: 'System Settings',
                icon: <Settings size={17} strokeWidth={1.75} />,
                path: '/settings',
              },
            ],
          },
        ]
      : [
          {
            title: 'System',
            items: [
              {
                id: 'settings',
                label: 'Settings',
                icon: <Settings size={17} strokeWidth={1.75} />,
                path: '/settings',
              },
            ],
          },
        ]),
  ];

  // Automatically open the accordion group that contains the currently active page
  useEffect(() => {
    navGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (c) =>
              currentPath === c.path ||
              (c.path === '/sales/orders' && (currentPath === '/orders' || currentPath === '/sales/orders')) ||
              (c.path === '/sales/invoices' && (currentPath === '/invoices' || currentPath === '/sales/invoices')) ||
              (c.path === '/purchase/orders' && (currentPath === '/purchase-orders' || currentPath === '/purchase/orders')) ||
              (c.path === '/purchase/bills' && (currentPath === '/vendor-bills' || currentPath === '/bills' || currentPath === '/purchase/bills')) ||
              (c.path === '/journal-entries' && (currentPath === '/accounting' || currentPath === '/journal-entries')) ||
              (c.path === '/products' && (currentPath === '/stock' || currentPath === '/products')) ||
              (c.path === '/reports/pnl' && (currentPath === '/reports' || currentPath === '/reports/pnl'))
          );
          if (hasActiveChild) {
            setExpandedSections((prev) => ({ ...prev, [item.id]: true }));
          }
        }
      });
    });
  }, [currentPath]);

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate?.(path);
    onCloseMobile?.();
  };

  const isChildActive = (childPath: string) => {
    if (currentPath === childPath) return true;
    if (childPath === '/sales/orders' && (currentPath === '/orders' || currentPath === '/sales/orders')) return true;
    if (childPath === '/sales/invoices' && (currentPath === '/invoices' || currentPath === '/sales/invoices')) return true;
    if (childPath === '/purchase/orders' && (currentPath === '/purchase-orders' || currentPath === '/purchase/orders')) return true;
    if (childPath === '/purchase/bills' && (currentPath === '/vendor-bills' || currentPath === '/bills' || currentPath === '/purchase/bills')) return true;
    if (childPath === '/journal-entries' && (currentPath === '/accounting' || currentPath === '/journal-entries')) return true;
    if (childPath === '/products' && (currentPath === '/stock' || currentPath === '/products')) return true;
    if (childPath === '/reports/pnl' && (currentPath === '/reports' || currentPath === '/reports/pnl')) return true;
    return false;
  };

  const isParentActive = (item: NavSectionItem) => {
    if (item.path) {
      if (currentPath === item.path) return true;
      if (item.path !== '/dashboard' && currentPath.startsWith(item.path)) return true;
    }
    if (item.children) {
      return item.children.some((c) => isChildActive(c.path));
    }
    return false;
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside className={`left-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        {navGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && <div className="sidebar-divider" />}
            <div className="sidebar-group">
              {group.title && (
                <span className="sidebar-group-title">{group.title}</span>
              )}
              {group.items.map((item) => {
                const isExpanded = !!expandedSections[item.id];
                const isSectionActive = isParentActive(item);

                // 1. Expandable Parent Item
                if (item.children && item.children.length > 0) {
                  return (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        className={`sidebar-item ${isSectionActive ? 'active' : ''}`}
                        onClick={(e) => toggleSection(item.id, e)}
                      >
                        <span className="sidebar-item-icon">{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        <span className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`}>
                          <ChevronDown size={14} />
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="sidebar-child-list">
                          {item.children.map((child) => {
                            const active = isChildActive(child.path);
                            return (
                              <a
                                key={child.id}
                                href={`#${child.path}`}
                                className={`sidebar-sub-item ${active ? 'active' : ''}`}
                                onClick={(e) => handleItemClick(e, child.path)}
                              >
                                <span className="sidebar-sub-item-bullet" />
                                <span style={{ flex: 1 }}>{child.label}</span>
                                {child.badge && (
                                  <span className="badge-pill" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                    {child.badge}
                                  </span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. Direct Link Item (e.g. Dashboard, Users, Settings)
                const directActive = item.path ? isChildActive(item.path) : false;
                return (
                  <a
                    key={item.id}
                    href={`#${item.path}`}
                    className={`sidebar-item ${directActive ? 'active' : ''}`}
                    onClick={(e) => handleItemClick(e, item.path || '/dashboard')}
                  >
                    <span className="sidebar-item-icon">{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span className="badge-pill badge-overdue" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
