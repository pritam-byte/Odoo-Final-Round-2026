import React from 'react';

export interface DocumentLinesProps {
  children?: React.ReactNode;
}

export const DocumentLines: React.FC<DocumentLinesProps> = () => {
  return (
    <div className="documentlines">
      <h3>DocumentLines</h3>
    </div>
  );
};

export default DocumentLines;
