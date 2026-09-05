import React from 'react';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  children
}) => {
  return (
    <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-charcoal-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-danger-red)' }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-gray-medium)' }}>
          {hint}
        </span>
      )}
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-danger-red)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
