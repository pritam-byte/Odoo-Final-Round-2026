import React from 'react';

export interface SidebarProps {
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="sidebar">
      <h3>Sidebar</h3>
    </div>
  );
};

export default Sidebar;
