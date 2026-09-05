import React from 'react';

export interface DataTableProps {
  children?: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = () => {
  return (
    <div className="datatable">
      <h3>DataTable</h3>
    </div>
  );
};

export default DataTable;
