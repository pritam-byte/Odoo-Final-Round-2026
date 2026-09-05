import React from 'react';

export interface ConvertToDocumentButtonProps {
  children?: React.ReactNode;
}

export const ConvertToDocumentButton: React.FC<ConvertToDocumentButtonProps> = () => {
  return (
    <div className="converttodocumentbutton">
      <h3>ConvertToDocumentButton</h3>
    </div>
  );
};

export default ConvertToDocumentButton;
