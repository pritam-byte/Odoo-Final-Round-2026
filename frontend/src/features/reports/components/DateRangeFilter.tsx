import React from 'react';

export interface DateRangeFilterProps {
  children?: React.ReactNode;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = () => {
  return (
    <div className="daterangefilter">
      <h3>DateRangeFilter</h3>
    </div>
  );
};

export default DateRangeFilter;
