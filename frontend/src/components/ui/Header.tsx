import React, { useState, useEffect } from 'react';
import { Search, Clock, Bell, Layers } from 'lucide-react';

export interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  user = { name: 'Pritam Admin', email: 'admin@odoo-flow.com', role: 'Administrator' },
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

  return (
    <header className="top-navbar">
      {/* Brand / Logo (Left) */}
      <div className="navbar-left">
        <a href="#/dashboard" className="brand-logo" title="Odoo Flow ERP">
          <div className="brand-logo-icon">
            <Layers size={18} strokeWidth={2.2} />
          </div>
          <div>
            <span className="brand-word">Odoo</span> <span className="brand-secondary">Flow</span>
          </div>
        </a>
      </div>

      {/* Search Bar, Live Clock & User Avatar (Center-Right & Far Right) */}
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

        {/* Circular User Avatar */}
        <div
          className="navbar-avatar"
          title={`${user.name} (${user.role || 'User'}) - Click to view profile / logout`}
          onClick={onLogout}
        >
          {getInitials(user.name)}
        </div>
      </div>
    </header>
  );
};

export default Header;
