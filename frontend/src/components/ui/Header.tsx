import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, Layers, LogOut, Shield, Briefcase, User as UserIcon } from 'lucide-react';

export interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  user = { name: 'Pritam Admin', email: 'admin@odoo-flow.com', role: 'Admin' },
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
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
        <span style={{ fontSize: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Shield size={10} /> Admin
        </span>
      );
    }
    if (role === 'Accountant') {
      return (
        <span style={{ fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <Briefcase size={10} /> Accountant
        </span>
      );
    }
    return (
      <span style={{ fontSize: '10px', backgroundColor: '#ccfbf1', color: '#0f766e', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        <UserIcon size={10} /> User
      </span>
    );
  };

  return (
    <header className="top-navbar">
      {/* Brand / Logo (Left) */}
      <div className="navbar-left">
        <a href="#/dashboard" className="brand-logo" title="Urban Furniture ERP">
          <div className="brand-logo-icon">
            <Layers size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span className="brand-word">Urban</span> <span className="brand-secondary">Furniture</span>
          </div>
        </a>
      </div>

      {/* Search Bar, Live Clock, User Profile & Logout */}
      <div className="navbar-center-right">
        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <div className="search-bar-icon">
            <Search size={15} strokeWidth={1.75} />
          </div>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search documents, accounts, orders..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Live Clock */}
        <div className="navbar-clock" title="Current Local Time (Live)">
          <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Notification Icon */}
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '6px', borderRadius: '50%', color: 'var(--color-text-secondary)' }}
          title="Notifications"
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>

        {/* User Card with Role and Sign Out */}
        <div
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
