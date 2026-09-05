import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Search,
  Clock,
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  LogOut,
  X,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '../features/auth/schemas';
import { getStoredUser, CURRENT_USER } from '../lib/auth';
import { getMyScopedDocuments, getMyPayments, PortalDocument, PortalPayment } from '../features/portal/api';

export interface PortalLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string, docId?: string) => void;
  user?: UserAccount | null;
  onLogout?: () => void;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  activeNav = 'dashboard',
  onNavigate,
  user,
  onLogout,
}) => {
  const [time, setTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = user || getStoredUser() || CURRENT_USER;

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close search dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const pType = currentUser.partnerType || 'Both';

  const navItems = [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: <LayoutDashboard size={17} strokeWidth={1.75} />,
    },
    ...(pType === 'Vendor'
      ? []
      : [
          {
            id: 'invoices',
            label: 'My Invoices',
            icon: <FileText size={17} strokeWidth={1.75} />,
          },
        ]),
    ...(pType === 'Customer'
      ? []
      : [
          {
            id: 'bills',
            label: pType === 'Vendor' ? 'My Supply Bills' : 'My Bills',
            icon: <Receipt size={17} strokeWidth={1.75} />,
          },
        ]),
    {
      id: 'payments',
      label: 'Payment History',
      icon: <Wallet size={17} strokeWidth={1.75} />,
    },
  ];

  // Search Results Computation
  const cleanQuery = searchQuery.trim().toLowerCase();
  const allScopedDocs = getMyScopedDocuments();
  const allPayments = getMyPayments();

  const matchingInvoices: PortalDocument[] = cleanQuery
    ? allScopedDocs.filter(
        (d) =>
          d.type === 'invoice' &&
          (d.number.toLowerCase().includes(cleanQuery) ||
            d.date.includes(cleanQuery) ||
            d.lines.some((l) => l.product.toLowerCase().includes(cleanQuery)) ||
            (d.partnerName && d.partnerName.toLowerCase().includes(cleanQuery)))
      )
    : [];

  const matchingBills: PortalDocument[] = cleanQuery
    ? allScopedDocs.filter(
        (d) =>
          d.type === 'bill' &&
          (d.number.toLowerCase().includes(cleanQuery) ||
            d.date.includes(cleanQuery) ||
            d.lines.some((l) => l.product.toLowerCase().includes(cleanQuery)) ||
            (d.partnerName && d.partnerName.toLowerCase().includes(cleanQuery)))
      )
    : [];

  const matchingPayments: PortalPayment[] = cleanQuery
    ? allPayments.filter(
        (p) =>
          p.reference.toLowerCase().includes(cleanQuery) ||
          p.documentNumber.toLowerCase().includes(cleanQuery) ||
          p.date.includes(cleanQuery) ||
          (p.note && p.note.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingNavs = cleanQuery
    ? navItems.filter((item) => item.label.toLowerCase().includes(cleanQuery))
    : [];

  const totalMatches =
    matchingInvoices.length +
    matchingBills.length +
    matchingPayments.length +
    matchingNavs.length;

  const handleSelectDoc = (doc: PortalDocument) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate?.('detail', doc.id);
  };

  const handleSelectPayment = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate?.('payments');
  };

  const handleSelectNav = (navId: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate?.(navId);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-navbar">
        {/* Brand Left */}
        <div className="navbar-left">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('dashboard')}>
            <div className="brand-logo-icon">
              <Layers size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="brand-word">Urban</span> <span className="brand-secondary">Furniture</span>
            </div>
          </div>
        </div>

        {/* Right Section: Search with Dropdown Suggestions, Clock, User Profile, Logout */}
        <div className="navbar-center-right">
          {/* Search Bar with Popover Suggestions */}
          <div className="search-bar-wrapper" ref={searchContainerRef} style={{ position: 'relative' }}>
            <div className="search-bar-icon">
              <Search size={15} strokeWidth={1.75} />
            </div>
            <input
              type="text"
              className="search-bar-input"
              placeholder={
                pType === 'Vendor'
                  ? 'Search supply bills, payments...'
                  : pType === 'Customer'
                  ? 'Search invoices, furniture, payments...'
                  : 'Search invoices, bills, payments...'
              }
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              style={{ width: '300px' }}
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
                  padding: '2px',
                  borderRadius: '50%',
                  color: 'var(--color-text-muted)',
                }}
                title="Clear Search"
              >
                <X size={14} />
              </button>
            )}

            {/* Custom UI Dropdown Suggestions Menu */}
            {isSearchOpen && cleanQuery.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '380px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-dropdown)',
                  zIndex: 3000,
                  maxHeight: '440px',
                  overflowY: 'auto',
                  padding: '8px',
                  animation: 'fadeIn 0.15s ease',
                }}
              >
                {/* Header info */}
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
                  <span>{totalMatches} result{totalMatches === 1 ? '' : 's'}</span>
                </div>

                {totalMatches === 0 ? (
                  <div
                    style={{
                      padding: '24px 16px',
                      textAlign: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: '13px',
                    }}
                  >
                    No matching invoices, bills, or payments found for "<strong>{searchQuery}</strong>".
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {/* 1. Invoices Group */}
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
                            onClick={() => handleSelectDoc(inv)}
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
                                  {inv.number}
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
                                {inv.lines?.[0]?.product} {inv.lines.length > 1 ? `+${inv.lines.length - 1} more` : ''} • {inv.date}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                ₹{inv.total.toFixed(2)}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                                View &rarr;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. Supply Bills Group */}
                    {matchingBills.length > 0 && (
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
                          <Receipt size={12} />
                          <span>Vendor Supply Bills</span>
                        </div>
                        {matchingBills.map((bill) => (
                          <div
                            key={bill.id}
                            onClick={() => handleSelectDoc(bill)}
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
                                  {bill.number}
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
                                {bill.lines?.[0]?.product} • {bill.date}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                ₹{bill.total.toFixed(2)}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                                View &rarr;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. Payments & Receipts Group */}
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
                          <span>Payments & Vouchers</span>
                        </div>
                        {matchingPayments.map((pay) => (
                          <div
                            key={pay.id}
                            onClick={handleSelectPayment}
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
                                  ({pay.paymentMethod})
                                </span>
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                For {pay.documentNumber} • {pay.date}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                ₹{pay.amount.toFixed(2)}
                              </div>
                              <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 500 }}>
                                Receipts &rarr;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Navigation Pages Group */}
                    {matchingNavs.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: 'var(--color-text-muted)',
                            padding: '4px 8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          Quick Navigation
                        </div>
                        {matchingNavs.map((nav) => (
                          <div
                            key={nav.id}
                            onClick={() => handleSelectNav(nav.id)}
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
                              {nav.icon}
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {nav.label}
                              </span>
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

          <div className="navbar-clock" title="Current Local Time (Live)">
            <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
            <span>{time || 'Loading...'}</span>
          </div>

          {/* User Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px 4px 4px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="navbar-avatar" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {currentUser.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                {pType === 'Vendor'
                  ? 'Vendor Supplier'
                  : pType === 'Customer'
                  ? 'Customer Account'
                  : 'Customer + Vendor'}
              </span>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-ghost btn-sm"
                title="Sign Out of Portal"
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

      {/* Body: Left Sidebar + Main Content */}
      <div className="layout-body">
        {/* Left Sidebar */}
        <aside className="left-sidebar">
          <div className="sidebar-group">
            <span className="sidebar-group-title">My Self-Service</span>
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(item.id);
                  }}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default PortalLayout;
