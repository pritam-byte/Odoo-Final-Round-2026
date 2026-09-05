import React, { useState, useEffect } from 'react';

export interface HeaderProps {
  userName?: string;
  avatarUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ userName = 'Admin User', avatarUrl }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--navbar-height)',
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--color-gray-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'var(--sidebar-width)' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-purple)' }}>Odoo</span>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>ERP</span>
      </div>

      {/* Right controls: Search bar, Live clock, User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg style={{ position: 'absolute', left: '12px', width: '16px', height: '16px', color: 'var(--color-gray-medium)' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search records, docs, actions..."
            style={{
              padding: '7px 14px 7px 36px',
              borderRadius: 'var(--pill-radius)',
              border: '1px solid var(--color-gray-border)',
              backgroundColor: 'var(--color-gray-bg)',
              fontSize: '0.875rem',
              width: '260px',
              outline: 'none',
              color: 'var(--color-charcoal-dark)'
            }}
          />
        </div>

        {/* Live Clock */}
        <div style={{ fontSize: '0.85rem', color: 'var(--color-gray-medium)', fontWeight: 500, minWidth: '70px', textAlign: 'right' }}>
          {time}
        </div>

        {/* Circular Avatar */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-brand-purple)',
          color: 'var(--color-white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer'
        }} title={userName}>
          {avatarUrl ? <img src={avatarUrl} alt={userName} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : userName.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Header;
