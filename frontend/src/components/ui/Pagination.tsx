import React from 'react';

export interface PaginationProps {
  children?: React.ReactNode;
}

export const Pagination: React.FC<PaginationProps> = () => {
  return (
    <div className="pagination">
      <h3>Pagination</h3>
    </div>
  );
};

export default Pagination;
