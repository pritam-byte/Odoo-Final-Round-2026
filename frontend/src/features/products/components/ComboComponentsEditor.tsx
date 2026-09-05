import React from 'react';

export interface ComboComponentsEditorProps {
  children?: React.ReactNode;
}

export const ComboComponentsEditor: React.FC<ComboComponentsEditorProps> = () => {
  return (
    <div className="combocomponentseditor">
      <h3>ComboComponentsEditor</h3>
    </div>
  );
};

export default ComboComponentsEditor;
