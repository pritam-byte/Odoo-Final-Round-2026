import React from 'react';

export interface DocumentLineItemsProps {
  children?: React.ReactNode;
}

export const DocumentLineItems: React.FC<DocumentLineItemsProps> = () => {
  return (
    <div className="documentlineitems">
      <h3>DocumentLineItems</h3>
    </div>
  );
};

export default DocumentLineItems;
