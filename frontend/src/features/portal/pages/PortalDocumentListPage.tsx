import React from 'react';

export interface PortalDocumentListPageProps {
  children?: React.ReactNode;
}

export const PortalDocumentListPage: React.FC<PortalDocumentListPageProps> = () => {
  return (
    <div className="portaldocumentlistpage">
      <h3>PortalDocumentListPage</h3>
    </div>
  );
};

export default PortalDocumentListPage;
