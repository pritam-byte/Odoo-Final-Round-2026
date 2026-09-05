import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Users,
  Package,
  BookOpen,
  PieChart,
  Target,
  FileSpreadsheet,
  TrendingUp,
  Scale,
  Receipt,
  ShoppingCart,
  Truck,
} from 'lucide-react';

export interface AccountantNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const AccountantNav: React.FC<AccountantNavProps> = ({ currentRoute, onNavigate }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSalesActive = currentRoute.startsWith('/sales') || currentRoute.startsWith('/orders') || currentRoute.startsWith('/invoices');
  const isPurchaseActive = currentRoute.startsWith('/purchase') || currentRoute.startsWith('/bills');
  const isAccountActive = [
    '/contacts',
    '/products',
    '/analytics',
    '/budgets',
    '/accounts',
    '/journals',
    '/journal-entries',
  ].some((r) => currentRoute.startsWith(r));
  const isReportActive = currentRoute.startsWith('/reports') || currentRoute.startsWith('/pnl') || currentRoute.startsWith('/balance-sheet') || currentRoute.startsWith('/budget-report');

  const handleDropdownSelect = (route: string) => {
    setOpenDropdown(null);
    onNavigate(route);
  };

  return (
    <div
      ref={navRef}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-subtle)',
        padding: '4px',
        gap: '4px',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* 1. Sales Button / Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`btn ${isSalesActive ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => {
            setOpenDropdown(openDropdown === 'sales' ? null : 'sales');
          }}
        >
          <ShoppingCart size={15} strokeWidth={1.75} />
          <span>Sales</span>
          <ChevronDown size={13} strokeWidth={2} />
        </button>

        {openDropdown === 'sales' && (
          <div
            className="card-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '200px',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 40,
              gap: '2px',
            }}
          >
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/sales/orders')}
            >
              <ShoppingCart size={15} strokeWidth={1.75} />
              <span>Sales Orders</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/sales/invoices')}
            >
              <Receipt size={15} strokeWidth={1.75} />
              <span>Customer Invoices</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Purchase Button / Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`btn ${isPurchaseActive ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => {
            setOpenDropdown(openDropdown === 'purchase' ? null : 'purchase');
          }}
        >
          <Truck size={15} strokeWidth={1.75} />
          <span>Purchase</span>
          <ChevronDown size={13} strokeWidth={2} />
        </button>

        {openDropdown === 'purchase' && (
          <div
            className="card-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '200px',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 40,
              gap: '2px',
            }}
          >
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/purchase/orders')}
            >
              <Truck size={15} strokeWidth={1.75} />
              <span>Purchase Orders</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/purchase/bills')}
            >
              <Receipt size={15} strokeWidth={1.75} />
              <span>Vendor Bills</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Account Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`btn ${isAccountActive ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => {
            setOpenDropdown(openDropdown === 'account' ? null : 'account');
          }}
        >
          <BookOpen size={15} strokeWidth={1.75} />
          <span>Account</span>
          <ChevronDown size={13} strokeWidth={2} />
        </button>

        {openDropdown === 'account' && (
          <div
            className="card-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '240px',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 40,
              gap: '2px',
            }}
          >
            <div className="sidebar-group-title">Master Data</div>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/contacts')}
            >
              <Users size={15} strokeWidth={1.75} />
              <span>Contacts / CRM</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/products')}
            >
              <Package size={15} strokeWidth={1.75} />
              <span>Products & Services</span>
            </button>

            <div className="sidebar-divider" style={{ margin: '4px 0' }} />
            <div className="sidebar-group-title">Ledger & Journals</div>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/accounts')}
            >
              <Receipt size={15} strokeWidth={1.75} />
              <span>Chart of Accounts</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/journals')}
            >
              <BookOpen size={15} strokeWidth={1.75} />
              <span>Journals</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/journal-entries')}
            >
              <FileSpreadsheet size={15} strokeWidth={1.75} />
              <span>Journal Entries</span>
            </button>

            <div className="sidebar-divider" style={{ margin: '4px 0' }} />
            <div className="sidebar-group-title">Analytics & Budgeting</div>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/analytics')}
            >
              <PieChart size={15} strokeWidth={1.75} />
              <span>Analytic Accounts</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/budgets')}
            >
              <Target size={15} strokeWidth={1.75} />
              <span>Analytical Budgets</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Report Dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`btn ${isReportActive ? 'btn-primary' : 'btn-ghost'}`}
          style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => {
            setOpenDropdown(openDropdown === 'report' ? null : 'report');
          }}
        >
          <TrendingUp size={15} strokeWidth={1.75} />
          <span>Report</span>
          <ChevronDown size={13} strokeWidth={2} />
        </button>

        {openDropdown === 'report' && (
          <div
            className="card-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              width: '220px',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 40,
              gap: '2px',
            }}
          >
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/reports/pnl')}
            >
              <TrendingUp size={15} strokeWidth={1.75} />
              <span>Profit & Loss (P&L)</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/reports/balance-sheet')}
            >
              <Scale size={15} strokeWidth={1.75} />
              <span>Balance Sheet</span>
            </button>
            <button
              type="button"
              className="sidebar-item"
              onClick={() => handleDropdownSelect('/reports/budget')}
            >
              <Target size={15} strokeWidth={1.75} />
              <span>Budget Variance Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantNav;
