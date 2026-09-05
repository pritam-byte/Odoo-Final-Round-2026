import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loading = false,
  leftIcon,
  rightIcon,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const isBusy = isLoading || loading;
  const leadIcon = icon || leftIcon;
  const normalizedVariant = variant === 'secondary' ? 'outline' : variant;
  const variantClass = `btn-${normalizedVariant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const blockClass = fullWidth ? 'btn-block' : '';

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim()}
      disabled={disabled || isBusy}
      {...props}
    >
      {isBusy ? (
        <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        leadIcon
      )}
      {children}
      {!isBusy && rightIcon}
    </button>
  );
};

export default Button;
