import React, { useState } from 'react';
import { Plus, ChevronDown, Check } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormField } from './FormField';

export interface Option {
  id: string;
  name: string;
  subtitle?: string;
}

export interface Many2OneSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string, name: string) => void;
  placeholder?: string;
  allowCreateInline?: boolean;
  createEntityName?: string;
  onCreateNew?: (name: string) => Option | void;
  required?: boolean;
  className?: string;
}

export const Many2OneSelect: React.FC<Many2OneSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  allowCreateInline = true,
  createEntityName = 'Record',
  onCreateNew,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const selectedOption = options.find((o) => o.id === value);

  const filteredOptions = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt: Option) => {
    onChange(opt.id, opt.name);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (onCreateNew) {
      const created = onCreateNew(newItemName.trim());
      if (created) {
        onChange(created.id, created.name);
      }
    }
    setNewItemName('');
    setIsCreateModalOpen(false);
    setIsOpen(false);
  };

  return (
    <div className={`form-group ${className}`} style={{ position: 'relative' }}>
      <label className="form-label">
        {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
      </label>

      {/* Dropdown trigger */}
      <div
        className="form-input"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-light)' }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown size={14} strokeWidth={2} style={{ color: 'var(--color-text-muted)' }} />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="card-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              maxHeight: '260px',
              padding: '6px',
              boxShadow: 'var(--shadow-dropdown)',
              zIndex: 60,
              gap: '4px',
            }}
          >
            {/* Search filter input */}
            <input
              type="text"
              className="form-input"
              style={{ padding: '6px 10px', fontSize: '13px', marginBottom: '4px' }}
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />

            <div style={{ overflowY: 'auto', maxHeight: '160px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="sidebar-item"
                    style={{
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      backgroundColor: opt.id === value ? 'var(--color-surface-active)' : 'transparent',
                    }}
                    onClick={() => handleSelect(opt)}
                  >
                    <div>
                      <div style={{ fontWeight: opt.id === value ? 700 : 500, fontSize: '13px' }}>{opt.name}</div>
                      {opt.subtitle && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{opt.subtitle}</div>
                      )}
                    </div>
                    {opt.id === value && <Check size={14} style={{ color: 'var(--color-primary)' }} />}
                  </button>
                ))
              ) : (
                <div style={{ padding: '8px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  No matches found
                </div>
              )}
            </div>

            {/* Inline Create Option */}
            {allowCreateInline && (
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4px', marginTop: '2px' }}>
                <button
                  type="button"
                  className="sidebar-item"
                  style={{ color: 'var(--color-primary)', fontWeight: 600, padding: '6px 10px' }}
                  onClick={() => {
                    setNewItemName(search);
                    setIsCreateModalOpen(true);
                  }}
                >
                  <Plus size={14} strokeWidth={2.2} />
                  <span>Create "{search || createEntityName}" on the fly</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inline Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={`Create New ${createEntityName}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSubmit}>
              Save & Select
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField
            label={`${createEntityName} Name`}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Enter ${createEntityName.toLowerCase()} name...`}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
};

export default Many2OneSelect;
