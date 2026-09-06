import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Clock,
  Bell,
  LogOut,
  Shield,
  Briefcase,
  User as UserIcon,
  X,
  Menu,
  FileText,
  Receipt,
  Wallet,
  Users,
  Package,
  BookOpen,
  PieChart,
  Compass,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAccountingStore } from '../../features/accounting/store';
import { BrandLogo } from './BrandLogo';

export interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (path: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

interface StaffNotification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: 'invoice' | 'bill' | 'payment' | 'system';
  targetPath?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNavigate,
  user = { name: 'Pritam Admin', email: 'admin@urban-furniture.com', role: 'Admin' },
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Accounting Store Data
  const {
    invoices,
    bills,
    payments,
    salesOrders,
    purchaseOrders,
    contacts,
    products,
    accounts,
    budgets,
  } = useAccountingStore();

  // Notifications State
  const [notifications, setNotifications] = useState<StaffNotification[]>([
    {
      id: 'sn1',
      title: 'Customer Invoice Created',
      description: 'Invoice INV/2026/0001 for ₹90,000.00 posted to general ledger.',
      timeAgo: '12m ago',
      read: false,
      type: 'invoice',
      targetPath: '/invoices',
    },
    {
      id: 'sn2',
      title: 'Vendor Bill Received',
      description: 'BILL/2026/0001 from Open Wood Corp awaiting approval.',
      timeAgo: '45m ago',
      read: false,
      type: 'bill',
      targetPath: '/bills',
    },
    {
      id: 'sn3',
      title: 'Settlement Receipt Recorded',
      description: 'Bank payment received for customer dues (₹45,000.00).',
      timeAgo: '2h ago',
      read: false,
      type: 'payment',
      targetPath: '/payments',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close search/notifications dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsSearchOpen(true);
    onSearch?.(val);
  };

  const handleNavigatePath = (path: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleBadge = (role?: string) => {
    if (role === 'Admin') {
      return (
        <span
          style={{
            fontSize: '10px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Shield size={10} /> Admin
        </span>
      );
    }
    if (role === 'Accountant') {
      return (
        <span
          style={{
            fontSize: '10px',
            backgroundColor: '#fef3c7',
            color: '#b45309',
            padding: '1px 6px',
            borderRadius: '4px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Briefcase size={10} /> Accountant
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: '10px',
          backgroundColor: '#ccfbf1',
          color: '#0f766e',
          padding: '1px 6px',
          borderRadius: '4px',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
        }}
      >
        <UserIcon size={10} /> User
      </span>
    );
  };

  // Search filter computations
  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingInvoices = cleanQuery
    ? invoices.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(cleanQuery) ||
          inv.partnerName.toLowerCase().includes(cleanQuery) ||
          inv.reference.toLowerCase().includes(cleanQuery) ||
          inv.date.includes(cleanQuery) ||
          inv.lines.some((l) => l.productName.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const matchingBills = cleanQuery
    ? bills.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(cleanQuery) ||
          b.partnerName.toLowerCase().includes(cleanQuery) ||
          b.reference.toLowerCase().includes(cleanQuery) ||
          b.date.includes(cleanQuery) ||
          b.lines.some((l) => l.productName.toLowerCase().includes(cleanQuery))
      ).slice(0, 4)
    : [];

  const matchingPayments = cleanQuery
    ? payments.filter(
        (p) =>
          p.reference.toLowerCase().includes(cleanQuery) ||
          p.partnerName.toLowerCase().includes(cleanQuery) ||
          p.date.includes(cleanQuery) ||
          p.paymentVia.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingContacts = cleanQuery
    ? contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery) ||
          c.phone.includes(cleanQuery) ||
          c.address.city.toLowerCase().includes(cleanQuery) ||
          c.type.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingProducts = cleanQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          p.categoryName.toLowerCase().includes(cleanQuery) ||
          p.type.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const matchingSalesOrders = cleanQuery
    ? salesOrders.filter(
        (so) =>
          so.orderNumber.toLowerCase().includes(cleanQuery) ||
          so.partnerName.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const matchingPurchaseOrders = cleanQuery
    ? purchaseOrders.filter(
        (po) =>
          po.orderNumber.toLowerCase().includes(cleanQuery) ||
          po.partnerName.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const matchingAccounts = cleanQuery
    ? accounts.filter(
        (a) =>
          a.name.toLowerCase().includes(cleanQuery) ||
          a.code.toLowerCase().includes(cleanQuery) ||
          a.type.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const matchingBudgets = cleanQuery
    ? budgets.filter(
        (b) =>
          b.name.toLowerCase().includes(cleanQuery) ||
          b.analyticName.toLowerCase().includes(cleanQuery) ||
          b.state.toLowerCase().includes(cleanQuery)
      ).slice(0, 3)
    : [];

  const systemPages = [
    { label: 'Dashboard & Overview', path: '/dashboard', icon: <Compass size={14} />, desc: 'Real-time KPIs & metrics' },
    { label: 'Customer Invoices', path: '/invoices', icon: <FileText size={14} />, desc: 'Sales invoices & receivables' },
    { label: 'Vendor Bills', path: '/bills', icon: <Receipt size={14} />, desc: 'Supply procurement & payables' },
    { label: 'Payment History', path: '/payments', icon: <Wallet size={14} />, desc: 'Receipts & disbursement vouchers' },
    { label: 'Sales Orders', path: '/sales/orders', icon: <TrendingUp size={14} />, desc: 'Confirmed customer quotations' },
    { label: 'Purchase Orders', path: '/purchase/orders', icon: <Receipt size={14} />, desc: 'Procurement orders' },
    { label: 'Contacts & Partners', path: '/contacts', icon: <Users size={14} />, desc: 'Customer & vendor directory' },
    { label: 'Products & Inventory', path: '/products', icon: <Package size={14} />, desc: 'Furniture items & raw stock' },
    { label: 'Chart of Accounts', path: '/accounts', icon: <BookOpen size={14} />, desc: 'General ledger account master' },
    { label: 'Budgets & Analytics', path: '/budgets', icon: <PieChart size={14} />, desc: 'Cost centers & commitments' },
    { label: 'Profit & Loss Report', path: '/reports/pnl', icon: <PieChart size={14} />, desc: 'Financial performance statement' },
    { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: <PieChart size={14} />, desc: 'Assets & liabilities summary' },
    { label: 'User Management', path: '/users', icon: <Shield size={14} />, desc: 'Admin user roles & access' },
  ];

  const matchingPages = cleanQuery
    ? systemPages.filter(
        (p) => p.label.toLowerCase().includes(cleanQuery) || p.desc.toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalMatches =
    matchingInvoices.length +
    matchingBills.length +
    matchingPayments.length +
    matchingContacts.length +
    matchingProducts.length +
    matchingAccounts.length +
    matchingBudgets.length +
    matchingSalesOrders.length +
    matchingPurchaseOrders.length +
    matchingPages.length;

  return (
    <header className="top-navbar">
      {/* Brand / Logo (Left) */}
      <div className="navbar-left">
        {onToggleMobileMenu && (
          <button
            type="button"
            className="mobile-menu-toggle btn-ghost"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-primary)',
              display: 'none',
              cursor: 'pointer',
            }}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <BrandLogo
          height={38}
          onClick={() => handleNavigatePath('/dashboard')}
          className="brand-logo"
        />
      </div>

      {/* Search Bar, Live Clock, Notifications, User Profile & Logout */}
      <div className="navbar-center-right">
        {/* Search Bar Container */}
        <div className="search-bar-wrapper header-search-wrapper" ref={searchContainerRef} style={{ position: 'relative' }}>
          <div className="search-bar-icon">
            <Search size={15} strokeWidth={1.75} />
          </div>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search invoices, bills, payments, contacts, products..."
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={handleSearchChange}
            style={{ width: '320px' }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="btn-ghost"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '2px',
                borderRadius: '50%',
                color: 'var(--color-text-muted)',
              }}
              title="Clear Search"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Dropdown Suggestions Popover */}
          {isSearchOpen && cleanQuery.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '420px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 3000,
                maxHeight: '460px',
                overflowY: 'auto',
                padding: '8px',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              {/* Header Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px 8px',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span>Search Suggestions</span>
                <span>{totalMatches} match{totalMatches === 1 ? '' : 'es'}</span>
              </div>

              {totalMatches === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                    Try searching with document #, partner name, product, or account code.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '6px' }}>
                  {/* 1. Customer Invoices */}
                  {matchingInvoices.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <FileText size={12} />
                        <span>Customer Invoices</span>
                      </div>
                      {matchingInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => handleNavigatePath('/invoices')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                {inv.invoiceNumber}
                              </strong>
                              <span
                                className={`badge-pill ${
                                  inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'
                                }`}
                                style={{ fontSize: '10px', padding: '1px 6px' }}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {inv.partnerName} • {inv.date}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              ₹{inv.total.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                              Open &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 2. Vendor Bills */}
                  {matchingBills.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--brand-teal)',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Receipt size={12} />
                        <span>Vendor Bills</span>
                      </div>
                      {matchingBills.map((bill) => (
                        <div
                          key={bill.id}
                          onClick={() => handleNavigatePath('/bills')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                {bill.billNumber}
                              </strong>
                              <span
                                className={`badge-pill ${
                                  bill.status === 'Paid' ? 'badge-paid' : 'badge-pending'
                                }`}
                                style={{ fontSize: '10px', padding: '1px 6px' }}
                              >
                                {bill.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {bill.partnerName} • {bill.date}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              ₹{bill.total.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                              Open &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 3. Payments & Receipts */}
                  {matchingPayments.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--brand-purple)',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Wallet size={12} />
                        <span>Payment Records</span>
                      </div>
                      {matchingPayments.map((pay) => (
                        <div
                          key={pay.id}
                          onClick={() => handleNavigatePath('/payments')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                {pay.reference}
                              </strong>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                ({pay.paymentVia})
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {pay.partnerName} • {pay.date}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              ₹{pay.amount.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                              View &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4. Contacts & Partners */}
                  {matchingContacts.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#0284c7',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Users size={12} />
                        <span>Contacts & Partners</span>
                      </div>
                      {matchingContacts.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => handleNavigatePath('/contacts')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                                {c.name}
                              </strong>
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: c.type === 'customer' ? '#e0f2fe' : '#fef3c7',
                                  color: c.type === 'customer' ? '#0369a1' : '#b45309',
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {c.type}
                              </span>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {c.email || c.phone} {c.address?.city ? `• ${c.address.city}` : ''}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                            View &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 5. Products */}
                  {matchingProducts.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#059669',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Package size={12} />
                        <span>Products Master</span>
                      </div>
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleNavigatePath('/products')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                              {p.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {p.categoryName} • {p.type}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              ₹{p.salesPrice.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                              Manage &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 6. Chart of Accounts */}
                  {matchingAccounts.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#d97706',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <BookOpen size={12} />
                        <span>Chart of Accounts</span>
                      </div>
                      {matchingAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => handleNavigatePath('/accounts')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                              {acc.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Code: {acc.code} • Type: {acc.type}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                            View &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 7. Budgets */}
                  {matchingBudgets.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#9333ea',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <PieChart size={12} />
                        <span>Budgets & Analytics</span>
                      </div>
                      {matchingBudgets.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => handleNavigatePath('/budgets')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>
                              {b.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              Analytic: {b.analyticName} • Status: {b.state}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                              ₹{b.committedAmount.toFixed(2)}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                              Open &rarr;
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 8. System Navigation Pages */}
                  {matchingPages.length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--color-text-muted)',
                          padding: '4px 8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Compass size={12} />
                        <span>Navigation Pages</span>
                      </div>
                      {matchingPages.map((page) => (
                        <div
                          key={page.path}
                          onClick={() => handleNavigatePath(page.path)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ color: 'var(--color-primary)' }}>{page.icon}</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {page.label}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                {page.desc}
                              </span>
                            </div>
                          </div>
                          <ArrowRight size={14} color="var(--color-text-muted)" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Clock */}
        <div className="navbar-clock header-clock" title="Current Local Time (Live)">
          <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Notification Bell & Dropdown */}
        <div style={{ position: 'relative' }} ref={notifContainerRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="btn-ghost"
            style={{
              position: 'relative',
              padding: '6px',
              borderRadius: '50%',
              color: isNotifOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              backgroundColor: isNotifOpen ? 'var(--color-surface-active)' : 'transparent',
            }}
            title="Notifications"
          >
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-warning)',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 3000,
                padding: '8px 0',
                animation: 'fadeIn 0.15s ease',
              }}
            >
              {/* Notifications Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span
                      className="badge-pill badge-warning"
                      style={{ fontSize: '10px', padding: '1px 5px' }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p style={{ fontSize: '12px', margin: 0 }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
                        );
                        setIsNotifOpen(false);
                        if (notif.targetPath) handleNavigatePath(notif.targetPath);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                        backgroundColor: notif.read ? 'transparent' : 'var(--color-surface-active)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = notif.read
                          ? 'transparent'
                          : 'var(--color-surface-active)')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: notif.read ? 600 : 700,
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {notif.title}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {notif.timeAgo}
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.35 }}>
                        {notif.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card with Role and Sign Out */}
        <div
          className="header-user-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 8px 4px 4px',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="navbar-avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
            {getInitials(user.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {user.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {getRoleBadge(user.role)}
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn btn-ghost btn-sm"
              title="Sign Out of Session"
              style={{
                color: 'var(--color-danger)',
                padding: '4px 6px',
                borderRadius: 'var(--radius-full)',
                marginLeft: '4px',
              }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
