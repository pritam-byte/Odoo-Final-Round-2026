import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  LogOut,
  X,
  Menu,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '../features/auth/schemas';
import { getStoredUser, CURRENT_USER } from '../lib/auth';
import { getMyScopedDocuments, getMyPayments, PortalDocument, PortalPayment } from '../features/portal/api';
import { BrandLogo } from '../components/ui/BrandLogo';

export interface PortalLayoutProps {
  children?: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string, docId?: string) => void;
  user?: UserAccount | null;
  onLogout?: () => void;
}

export interface PortalNotification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: 'invoice' | 'bill' | 'payment' | 'system';
  targetDocId?: string;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  activeNav = 'dashboard',
  onNavigate,
  user,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  const currentUser = user || getStoredUser() || CURRENT_USER;
  const pType = currentUser.partnerType || 'Both';

  // Automatically close mobile menu on tab change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeNav]);

  // Persona-tailored initial notifications
  const [notifications, setNotifications] = useState<PortalNotification[]>(() => {
    if (pType === 'Vendor') {
      return [
        {
          id: 'n1',
          title: 'Supply Bill Disbursed',
          description: 'Payment voucher of ₹980.00 confirmed for BILL/2026/0012.',
          timeAgo: '10m ago',
          read: false,
          type: 'bill',
          targetDocId: 'bill_202',
        },
        {
          id: 'n2',
          title: 'New Procurement Order',
          description: 'Raw Timber Plank Lot added to your supply bill register.',
          timeAgo: '2h ago',
          read: false,
          type: 'bill',
          targetDocId: 'bill_201',
        },
      ];
    } else if (pType === 'Customer') {
      return [
        {
          id: 'n1',
          title: 'Payment Receipt Issued',
          description: 'Payment of ₹1,250.00 confirmed for INV/2026/0001.',
          timeAgo: '15m ago',
          read: false,
          type: 'invoice',
          targetDocId: 'inv_101',
        },
        {
          id: 'n2',
          title: 'Furniture Order Invoice Ready',
          description: 'Invoice INV/2026/0002 for Solid Walnut Coffee Table is paid.',
          timeAgo: '1d ago',
          read: false,
          type: 'invoice',
          targetDocId: 'inv_102',
        },
      ];
    } else {
      return [
        {
          id: 'n1',
          title: 'Invoice Payment Received',
          description: 'Payment receipt generated for INV/2026/0001 (₹1,250.00).',
          timeAgo: '15m ago',
          read: false,
          type: 'invoice',
          targetDocId: 'inv_101',
        },
        {
          id: 'n2',
          title: 'Vendor Bill Disbursed',
          description: 'Settlement voucher generated for BILL/2026/0012 (₹980.00).',
          timeAgo: '1h ago',
          read: false,
          type: 'bill',
          targetDocId: 'bill_202',
        },
      ];
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: PortalNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setIsNotifOpen(false);
    if (notif.targetDocId) {
      onNavigate?.('detail', notif.targetDocId);
    }
  };

  // Close dropdowns on outside click or ESC
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
  const [allScopedDocs, setAllScopedDocs] = useState<PortalDocument[]>(() => getMyScopedDocuments());
  const [allPayments, setAllPayments] = useState<PortalPayment[]>(() => getMyPayments());

  useEffect(() => {
    const refreshData = () => {
      setAllScopedDocs(getMyScopedDocuments());
      setAllPayments(getMyPayments());
    };
    window.addEventListener('odoo:accounting_updated', refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('odoo:accounting_updated', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, [pType]);

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
          <button
            type="button"
            className="mobile-menu-toggle btn-ghost"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
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
          <BrandLogo
            height={38}
            onClick={() => onNavigate?.('dashboard')}
            className="brand-logo"
          />
        </div>

        {/* Right Section: Search, Notification Bell, User Profile, Logout */}
        <div className="navbar-center-right">
          {/* Search Bar with Popover Suggestions */}
          <div className="search-bar-wrapper header-search-wrapper" ref={searchContainerRef} style={{ position: 'relative' }}>
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
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
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

          {/* Notification Bell Icon & Popover */}
          <div style={{ position: 'relative' }} ref={notifContainerRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="btn-ghost"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isNotifOpen ? 'var(--color-surface-active)' : 'transparent',
                color: isNotifOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.15s ease',
              }}
              title="Notifications"
            >
              <Bell size={18} strokeWidth={1.85} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-warning)',
                    color: '#ffffff',
                    fontSize: '10px',
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
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 16px 10px',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      style={{
                        fontSize: '11px',
                        color: 'var(--color-primary)',
                        fontWeight: 600,
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          borderBottom: '1px solid var(--color-border-light)',
                          backgroundColor: n.read ? 'transparent' : 'rgba(15, 118, 110, 0.04)',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = n.read
                            ? 'transparent'
                            : 'rgba(15, 118, 110, 0.04)')
                        }
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor:
                              n.type === 'invoice'
                                ? 'var(--color-primary-light)'
                                : 'var(--color-warning-bg)',
                            color:
                              n.type === 'invoice'
                                ? 'var(--color-primary)'
                                : 'var(--color-warning-text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          {n.type === 'invoice' ? <Receipt size={13} /> : <FileText size={13} />}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: n.read ? 600 : 700, color: 'var(--color-text-primary)' }}>
                              {n.title}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                              {n.timeAgo}
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3 }}>
                            {n.description}
                          </p>
                        </div>

                        {!n.read && (
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              marginTop: '6px',
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div
            className="header-user-card"
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
        {isMobileMenuOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* Left Sidebar */}
        <aside className={`left-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                    setIsMobileMenuOpen(false);
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
        <main className="main-content">
          {children}

          <footer className="page-footer">
            <p>© {new Date().getFullYear()} Urban Furniture Inc. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
