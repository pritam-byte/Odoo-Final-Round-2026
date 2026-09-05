import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  PieChart,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = '/dashboard',
  onNavigate,
}) => {
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
          id: 'analytics',
          label: 'Analytics',
          icon: <PieChart size={17} strokeWidth={1.75} />,
          path: '/analytics',
        },
      ],
    },
    {
      title: 'Finance & Accounting',
      items: [
        {
          id: 'accounting',
          label: 'Journal Entries',
          icon: <BookOpen size={17} strokeWidth={1.75} />,
          path: '/accounting',
        },
        {
          id: 'accounts',
          label: 'Chart of Accounts',
          icon: <Receipt size={17} strokeWidth={1.75} />,
          path: '/accounts',
        },
        {
          id: 'payments',
          label: 'Payments & Due',
          icon: <Wallet size={17} strokeWidth={1.75} />,
          path: '/payments',
        },
        {
          id: 'reports',
          label: 'Financial Reports',
          icon: <FileText size={17} strokeWidth={1.75} />,
          path: '/reports',
        },
      ],
    },
    {
      title: 'Operations & CRM',
      items: [
        {
          id: 'orders',
          label: 'Sales Orders',
          icon: <ShoppingCart size={17} strokeWidth={1.75} />,
          path: '/orders',
        },
        {
          id: 'stock',
          label: 'Inventory & Stock',
          icon: <Package size={17} strokeWidth={1.75} />,
          path: '/stock',
        },
        {
          id: 'contacts',
          label: 'Contacts / CRM',
          icon: <Users size={17} strokeWidth={1.75} />,
          path: '/contacts',
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: <Settings size={17} strokeWidth={1.75} />,
          path: '/settings',
        },
        {
          id: 'help',
          label: 'Help & Docs',
          icon: <HelpCircle size={17} strokeWidth={1.75} />,
          path: '/help',
        },
      ],
    },
  ];

  const handleItemClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate?.(path);
  };

  return (
    <aside className="left-sidebar">
      {navGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && <div className="sidebar-divider" />}
          <div className="sidebar-group">
            {group.title && (
              <span className="sidebar-group-title">{group.title}</span>
            )}
            {group.items.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <a
                  key={item.id}
                  href={`#${item.path}`}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleItemClick(e, item.path)}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span className="badge-pill badge-neutral" style={{ fontSize: '11px', padding: '1px 6px' }}>
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
  );
};

export default Sidebar;
