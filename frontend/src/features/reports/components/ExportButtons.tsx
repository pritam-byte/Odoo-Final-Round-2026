import React from 'react';

export interface ExportButtonsProps {
  children?: React.ReactNode;
}

export const ExportButtons: React.FC<ExportButtonsProps> = () => {
  return (
    <div className="exportbuttons">
      <h3>ExportButtons</h3>
    </div>
  );
};

export default ExportButtons;
