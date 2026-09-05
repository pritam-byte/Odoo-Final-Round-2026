import React from 'react';

export interface FormFieldProps {
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = () => {
  return (
    <div className="formfield">
      <h3>FormField</h3>
    </div>
  );
};

export default FormField;
