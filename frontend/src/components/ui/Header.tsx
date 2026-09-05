import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, LogOut, Shield, Briefcase, User as UserIcon } from 'lucide-react';

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
    <header className="top-header">
      {/* Search Bar */}
      <div className="header-search-bar">
        <Search size={15} strokeWidth={1.75} className="header-search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Search accounts, entries, reports..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Right controls: Live Clock, Bell, User Card, Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <Clock size={14} strokeWidth={1.75} style={{ color: 'var(--color-teal)' }} />
          <span>{currentTime || 'Loading...'}</span>
        </div>

        {/* Bell Icon */}
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Notifications"
        >
          <Bell size={17} strokeWidth={1.75} />
        </button>

        {/* User Badge */}
        <div className="header-user-badge">
          <div className="avatar-circle">
            {getInitials(user.name) || 'UF'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
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
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                marginLeft: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
