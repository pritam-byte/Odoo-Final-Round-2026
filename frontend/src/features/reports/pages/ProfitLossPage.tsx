import React from 'react';

export interface ProfitLossPageProps {
  children?: React.ReactNode;
}

export const ProfitLossPage: React.FC<ProfitLossPageProps> = () => {
  return (
    <div className="profitlosspage">
      <h3>ProfitLossPage</h3>
    </div>
  );
};

export default ProfitLossPage;
