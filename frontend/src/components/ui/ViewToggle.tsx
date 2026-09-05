import React from 'react';
import { List, LayoutGrid } from 'lucide-react';

export interface ViewToggleProps {
  viewMode: 'list' | 'kanban';
  onViewChange: (mode: 'list' | 'kanban') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '2px',
        gap: '2px',
      }}
    >
      <button
        type="button"
        title="List View"
        onClick={() => onViewChange('list')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px 8px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
          color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          boxShadow: viewMode === 'list' ? 'var(--shadow-subtle)' : 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <List size={16} strokeWidth={2} />
      </button>

      <button
        type="button"
        title="Kanban View"
        onClick={() => onViewChange('kanban')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px 8px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
          color: viewMode === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          boxShadow: viewMode === 'kanban' ? 'var(--shadow-subtle)' : 'none',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <LayoutGrid size={16} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ViewToggle;
