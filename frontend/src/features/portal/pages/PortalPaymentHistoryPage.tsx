import React from 'react';

export interface PortalPaymentHistoryPageProps {
  children?: React.ReactNode;
}

export const PortalPaymentHistoryPage: React.FC<PortalPaymentHistoryPageProps> = () => {
  return (
    <div className="portalpaymenthistorypage">
      <h3>PortalPaymentHistoryPage</h3>
    </div>
  );
};

export default PortalPaymentHistoryPage;
