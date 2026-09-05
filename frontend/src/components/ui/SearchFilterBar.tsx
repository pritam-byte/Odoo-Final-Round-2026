import React from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Button } from './Button';

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (val: string) => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryAction?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  primaryActionLabel,
  onPrimaryAction,
  secondaryAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
        {/* Search Bar Input */}
        <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: '380px' }}>
          <div className="search-bar-icon">
            <Search size={15} strokeWidth={1.75} />
          </div>
          <input
            type="text"
            className="search-bar-input"
            style={{ width: '100%' }}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        {/* Filter Dropdown */}
        {filterOptions.length > 0 && (
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              className="select-filter"
              value={selectedFilter}
              onChange={(e) => onFilterChange?.(e.target.value)}
              style={{ paddingRight: '28px', appearance: 'none' }}
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.75}
              style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--color-text-muted)' }}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {secondaryAction}
        {primaryActionLabel && (
          <Button
            variant="primary"
            onClick={onPrimaryAction}
            leftIcon={<Plus size={16} strokeWidth={2.2} />}
          >
            {primaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
