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
  UserCheck,
  Settings,
} from 'lucide-react';
import { UserRole } from '../../features/auth/schemas';

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
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath = '/dashboard',
  onNavigate,
  userRole = 'Admin',
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
          label: 'Sales & Orders',
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
            ],
          },
        ]
      : []),
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
  );
};

export default Sidebar;
