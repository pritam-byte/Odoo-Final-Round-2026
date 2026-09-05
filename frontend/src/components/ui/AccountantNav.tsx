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
            className="dropdown-menu"
            style={{
              top: 'calc(100% + 6px)',
              left: 0,
              width: '210px',
            }}
          >
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/sales/orders')}
            >
              <span className="dropdown-item-icon"><ShoppingCart size={15} strokeWidth={1.75} /></span>
              <span>Sales Orders</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/sales/invoices')}
            >
              <span className="dropdown-item-icon"><Receipt size={15} strokeWidth={1.75} /></span>
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
            className="dropdown-menu"
            style={{
              top: 'calc(100% + 6px)',
              left: 0,
              width: '210px',
            }}
          >
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/purchase/orders')}
            >
              <span className="dropdown-item-icon"><Truck size={15} strokeWidth={1.75} /></span>
              <span>Purchase Orders</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/purchase/bills')}
            >
              <span className="dropdown-item-icon"><Receipt size={15} strokeWidth={1.75} /></span>
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
            className="dropdown-menu"
            style={{
              top: 'calc(100% + 6px)',
              left: 0,
              width: '240px',
            }}
          >
            <div className="dropdown-header">Master Data</div>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/contacts')}
            >
              <span className="dropdown-item-icon"><Users size={15} strokeWidth={1.75} /></span>
              <span>Contacts / CRM</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/products')}
            >
              <span className="dropdown-item-icon"><Package size={15} strokeWidth={1.75} /></span>
              <span>Products & Services</span>
            </button>

            <div className="dropdown-divider" />
            <div className="dropdown-header">Ledger & Journals</div>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/accounts')}
            >
              <span className="dropdown-item-icon"><Receipt size={15} strokeWidth={1.75} /></span>
              <span>Chart of Accounts</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/journals')}
            >
              <span className="dropdown-item-icon"><BookOpen size={15} strokeWidth={1.75} /></span>
              <span>Journals</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/journal-entries')}
            >
              <span className="dropdown-item-icon"><FileSpreadsheet size={15} strokeWidth={1.75} /></span>
              <span>Journal Entries</span>
            </button>

            <div className="dropdown-divider" />
            <div className="dropdown-header">Analytics & Budgeting</div>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/analytics')}
            >
              <span className="dropdown-item-icon"><PieChart size={15} strokeWidth={1.75} /></span>
              <span>Analytic Accounts</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/budgets')}
            >
              <span className="dropdown-item-icon"><Target size={15} strokeWidth={1.75} /></span>
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
            className="dropdown-menu"
            style={{
              top: 'calc(100% + 6px)',
              left: 0,
              width: '230px',
            }}
          >
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/reports/pnl')}
            >
              <span className="dropdown-item-icon"><TrendingUp size={15} strokeWidth={1.75} /></span>
              <span>Profit & Loss (P&L)</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/reports/balance-sheet')}
            >
              <span className="dropdown-item-icon"><Scale size={15} strokeWidth={1.75} /></span>
              <span>Balance Sheet</span>
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleDropdownSelect('/reports/budget')}
            >
              <span className="dropdown-item-icon"><Target size={15} strokeWidth={1.75} /></span>
              <span>Budget Variance Report</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantNav;
