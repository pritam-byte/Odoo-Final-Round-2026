import React from 'react';

export interface RecentActivityListProps {
  children?: React.ReactNode;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = () => {
  return (
    <div className="recentactivitylist">
      <h3>RecentActivityList</h3>
    </div>
  );
};

export default RecentActivityList;
