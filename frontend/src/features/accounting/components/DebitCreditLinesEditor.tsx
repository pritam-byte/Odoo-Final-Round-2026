import React from 'react';

export interface DebitCreditLinesEditorProps {
  children?: React.ReactNode;
}

export const DebitCreditLinesEditor: React.FC<DebitCreditLinesEditorProps> = () => {
  return (
    <div className="debitcreditlineseditor">
      <h3>DebitCreditLinesEditor</h3>
    </div>
  );
};

export default DebitCreditLinesEditor;
