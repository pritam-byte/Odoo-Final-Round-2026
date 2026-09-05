import React from 'react';

export interface HeaderProps {
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="header">
      <h3>Header</h3>
    </div>
  );
};

export default Header;
