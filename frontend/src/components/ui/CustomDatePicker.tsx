import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface CustomDatePickerProps {
  value: string; // ISO format 'YYYY-MM-DD' or empty
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  size?: 'sm' | 'md' | 'lg';
  allowClear?: boolean;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
  className = '',
  style,
  width = 'auto',
  size = 'md',
  allowClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value) : null;
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

  const [viewYear, setViewYear] = useState<number>(() =>
    isValidDate ? parsedDate.getFullYear() : new Date().getFullYear()
  );
  const [viewMonth, setViewMonth] = useState<number>(() =>
    isValidDate ? parsedDate.getMonth() : new Date().getMonth()
  );

  useEffect(() => {
    if (isValidDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mm}-${dd}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setViewYear(yyyy);
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startingDay = firstDayOfMonth(viewYear, viewMonth);

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

  const formattedDisplay = isValidDate
    ? parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : value || placeholder;

  return (
    <div
      ref={containerRef}
      className={`custom-datepicker-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        width: width,
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
          color: isValidDate ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
          backgroundColor: disabled ? 'var(--color-bg)' : '#ffffff',
          border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-sm)',
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary-border)' : 'var(--shadow-subtle)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
          minWidth: '140px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarIcon size={15} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>{formattedDisplay}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {allowClear && isValidDate && !disabled && (
            <span
              onClick={handleClear}
              title="Clear date"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px',
                borderRadius: '50%',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
            >
              <X size={13} />
            </span>
          )}
        </div>
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 1100,
            width: '280px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '12px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {/* Header Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={handlePrevMonth}
              className="btn-ghost"
              style={{ padding: '4px 6px', borderRadius: 'var(--radius-sm)' }}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="btn-ghost"
              style={{ padding: '4px 6px', borderRadius: 'var(--radius-sm)' }}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              marginBottom: '6px',
            }}
          >
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span
                key={d}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  padding: '2px 0',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}
          >
            {/* Blank leading days */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`blank-${i}`} style={{ height: '28px' }} />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const mm = String(viewMonth + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dateKey = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === dateKey;
              const isToday =
                new Date().toISOString().split('T')[0] === dateKey;

              const isOutOfRange = Boolean(
                (minDate && dateKey < minDate) || (maxDate && dateKey > maxDate)
              );

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isOutOfRange}
                  onClick={() => !isOutOfRange && handleSelectDate(day)}
                  style={{
                    height: '28px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected
                      ? 'var(--color-primary)'
                      : isToday
                      ? 'var(--color-primary-light)'
                      : 'transparent',
                    color: isSelected
                      ? '#ffffff'
                      : isOutOfRange
                      ? 'var(--color-text-light)'
                      : isToday
                      ? 'var(--color-primary)'
                      : 'var(--color-text-primary)',
                    cursor: isOutOfRange ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !isOutOfRange) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !isOutOfRange) {
                      e.currentTarget.style.backgroundColor = isToday
                        ? 'var(--color-primary-light)'
                        : 'transparent';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={handleSelectToday}
              style={{
                fontSize: '11px',
                color: 'var(--color-primary)',
                fontWeight: 600,
                background: 'none',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            {allowClear && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  fontWeight: 500,
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
