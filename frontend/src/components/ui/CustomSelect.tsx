import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface CustomSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  size?: 'sm' | 'md' | 'lg';
}

export function CustomSelect<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  icon,
  disabled = false,
  className = '',
  style,
  width = 'auto',
  size = 'md',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return '6px 10px';
      case 'lg':
        return '10px 14px';
      case 'md':
      default:
        return '8px 12px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return '12px';
      case 'lg':
        return '14px';
      case 'md':
      default:
        return '13px';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        width: typeof width === 'number' ? `${width}px` : width,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: getPadding(),
          fontSize: getFontSize(),
          fontWeight: 500,
          color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          backgroundColor: disabled ? 'var(--color-bg)' : '#ffffff',
          border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-border)' : 'var(--shadow-subtle)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {selectedOption?.icon || icon}
          <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                fontWeight: 600,
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1000,
            minWidth: '100%',
            maxWidth: '300px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '4px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={String(opt.value)}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: getFontSize(),
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {opt.icon}
                  <span>{opt.label}</span>
                  {opt.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isSelected ? '#ffffff' : 'var(--color-bg)',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}
                </div>
                {isSelected && <Check size={14} strokeWidth={2.5} style={{ color: 'var(--color-primary)' }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;

