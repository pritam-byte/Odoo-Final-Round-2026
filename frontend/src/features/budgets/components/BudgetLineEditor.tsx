import React from 'react';

export interface BudgetLineEditorProps {
  children?: React.ReactNode;
}

export const BudgetLineEditor: React.FC<BudgetLineEditorProps> = () => {
  return (
    <div className="budgetlineeditor">
      <h3>BudgetLineEditor</h3>
    </div>
  );
};

export default BudgetLineEditor;
