import React from 'react';

export interface PortalDocumentDetailPageProps {
  children?: React.ReactNode;
}

export const PortalDocumentDetailPage: React.FC<PortalDocumentDetailPageProps> = () => {
  return (
    <div className="portaldocumentdetailpage">
      <h3>PortalDocumentDetailPage</h3>
    </div>
  );
};

export default PortalDocumentDetailPage;
