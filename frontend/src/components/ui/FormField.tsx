import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  optional = false,
  helperText,
  error,
  leadingIcon,
  showPasswordToggle = false,
  type = 'text',
  id,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {optional && <span className="form-label-optional">(optional)</span>}
        </label>
      )}

      <div className="input-with-icon-wrapper">
        {leadingIcon && <div className="input-leading-icon">{leadingIcon}</div>}

        <input
          id={inputId}
          type={currentType}
          className={`form-input ${leadingIcon ? 'has-leading-icon' : ''} ${
            showPasswordToggle ? 'has-trailing-icon' : ''
          } ${error ? 'is-error' : ''}`}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            className="input-trailing-action"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error ? (
        <div className="form-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <div className="form-helper">{helperText}</div>
      ) : null}
    </div>
  );
};

export default FormField;
