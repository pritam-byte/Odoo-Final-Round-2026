import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Boxes,
  Building2,
} from 'lucide-react';
import { UserRole } from '../../features/auth/schemas';

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
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    accounting: true,
    sales: true,
    purchases: true,
    master: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleItemClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate?.(path);
  };

  return (
    <aside className="emerald-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand-header">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-icon">UF</div>
          <div>
            <div className="sidebar-brand-text">Urban Furniture</div>
            <div className="sidebar-brand-sub">Accounting & ERP</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {/* Dashboard */}
        <div
          className={`sidebar-nav-item ${currentPath === '/dashboard' || currentPath === '/' ? 'active' : ''}`}
          onClick={(e) => handleItemClick(e, '/dashboard')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={17} strokeWidth={1.8} />
            <span>Dashboard</span>
          </div>
          {(currentPath === '/dashboard' || currentPath === '/') && <div className="sidebar-active-dot" />}
        </div>

        {/* Master Data Section */}
        <div>
          <div
            className="sidebar-nav-item"
            onClick={() => toggleSection('master')}
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Boxes size={17} strokeWidth={1.8} />
              <span>Master Data</span>
            </div>
            {openSections.master ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {openSections.master && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                className={`sidebar-sub-item ${currentPath === '/contacts' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/contacts')}
              >
                <Users size={14} />
                <span>Contacts</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath === '/products' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/products')}
              >
                <Package size={14} />
                <span>Products</span>
              </div>
            </div>
          )}
        </div>

        {/* Sales Section */}
        <div>
          <div
            className="sidebar-nav-item"
            onClick={() => toggleSection('sales')}
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={17} strokeWidth={1.8} />
              <span>Sales</span>
            </div>
            {openSections.sales ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {openSections.sales && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                className={`sidebar-sub-item ${currentPath === '/sales/orders' || currentPath === '/orders' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/sales/orders')}
              >
                <span>Sales Orders</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath === '/sales/invoices' || currentPath === '/invoices' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/sales/invoices')}
              >
                <span>Customer Invoices</span>
              </div>
            </div>
          )}
        </div>

        {/* Purchases Section */}
        <div>
          <div
            className="sidebar-nav-item"
            onClick={() => toggleSection('purchases')}
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wallet size={17} strokeWidth={1.8} />
              <span>Purchases</span>
            </div>
            {openSections.purchases ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {openSections.purchases && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                className={`sidebar-sub-item ${currentPath === '/purchase/orders' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/purchase/orders')}
              >
                <span>Purchase Orders</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath === '/purchase/bills' || currentPath === '/bills' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/purchase/bills')}
              >
                <span>Vendor Bills</span>
              </div>
            </div>
          )}
        </div>

        {/* Accounting Section (Chart of Accounts, Journals, Entries, Reports) */}
        <div>
          <div
            className="sidebar-nav-item"
            onClick={() => toggleSection('accounting')}
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Receipt size={17} strokeWidth={1.8} />
              <span>Accounting</span>
            </div>
            {openSections.accounting ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
          {openSections.accounting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                className={`sidebar-sub-item ${currentPath === '/accounts' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/accounts')}
              >
                <BookOpen size={14} />
                <span>Chart of Accounts</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath === '/journals' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/journals')}
              >
                <Receipt size={14} />
                <span>Journals</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath === '/journal-entries' || currentPath === '/accounting' ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/journal-entries')}
              >
                <FileText size={14} />
                <span>Journal Entries</span>
              </div>
              <div
                className={`sidebar-sub-item ${currentPath.startsWith('/reports') ? 'active' : ''}`}
                onClick={(e) => handleItemClick(e, '/reports/pnl')}
              >
                <PieChart size={14} />
                <span>Reports</span>
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Budgets */}
        <div
          className={`sidebar-nav-item ${currentPath === '/analytics' || currentPath === '/budgets' ? 'active' : ''}`}
          onClick={(e) => handleItemClick(e, '/analytics')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PieChart size={17} strokeWidth={1.8} />
            <span>Budgets & Analytics</span>
          </div>
        </div>

        {/* Admin section */}
        {userRole === 'Admin' && (
          <div
            className={`sidebar-nav-item ${currentPath === '/users' ? 'active' : ''}`}
            onClick={(e) => handleItemClick(e, '/users')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck size={17} strokeWidth={1.8} />
              <span>User Management</span>
            </div>
            <span style={{ fontSize: '10px', backgroundColor: '#047857', color: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
              Admin
            </span>
          </div>
        )}

        {/* Settings */}
        <div
          className={`sidebar-nav-item ${currentPath === '/settings' ? 'active' : ''}`}
          onClick={(e) => handleItemClick(e, '/settings')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </div>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sidebar-text-muted)', fontSize: '12px' }}>
          <Building2 size={15} />
          <span style={{ fontWeight: 600, color: '#ffffff' }}>Urban Spaces Ltd.</span>
        </div>
        <div style={{ fontSize: '11px', color: '#5b8279' }}>
          Urban Spaces / Better Tomorrows
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
