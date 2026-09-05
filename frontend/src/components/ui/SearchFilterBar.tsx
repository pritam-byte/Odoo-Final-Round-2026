import React from 'react';

export interface SearchFilterBarProps {
  children?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = () => {
  return (
    <div className="searchfilterbar">
      <h3>SearchFilterBar</h3>
    </div>
  );
};

export default SearchFilterBar;
