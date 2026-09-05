import React from 'react';

export interface ReportTableProps {
  children?: React.ReactNode;
}

export const ReportTable: React.FC<ReportTableProps> = () => {
  return (
    <div className="reporttable">
      <h3>ReportTable</h3>
    </div>
  );
};

export default ReportTable;
