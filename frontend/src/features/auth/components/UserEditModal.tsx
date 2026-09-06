import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { UserAccount, UserRole, UserStatus } from '../schemas';
import { RoleSelector } from './RoleSelector';

export interface UserEditModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (updated: { name: string; email: string; role: UserRole; partnerType?: 'Customer' | 'Vendor' | 'Both'; status: UserStatus }) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [partnerType, setPartnerType] = useState<'Customer' | 'Vendor' | 'Both'>(user.partnerType || 'Customer');
  const [status, setStatus] = useState<UserStatus>(user.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      role,
      partnerType: role === 'User' ? partnerType : undefined,
      status,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(3px)'
      }}
    >
      <div
        className="card-panel custom-modal-box"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          margin: 'auto',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '18px', margin: 0 }}>
              Edit User: {user.name}
            </h3>
            <p className="card-subtitle" style={{ margin: '2px 0 0 0' }}>Manage role, permissions & account state</p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">Login ID (Permanent)</label>
            <input
              type="text"
              value={user.loginId}
              disabled
              className="form-input"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Role</label>
            <RoleSelector value={role} onChange={setRole} />
          </div>

          {role === 'User' && (
            <div
              className="form-group"
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <label className="form-label" style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700 }}>
                Portal Contact Scope (Strict Type)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {(
                  [
                    { id: 'Customer', label: '👤 Customer' },
                    { id: 'Vendor', label: '🚚 Vendor' },
                    { id: 'Both', label: '🔄 Both' },
                  ] as const
                ).map((opt) => {
                  const isSelected = partnerType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPartnerType(opt.id)}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                      style={{ justifyContent: 'center' }}
                    >
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: status === 'Active' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                Active (Can log in)
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: status === 'Inactive' ? 'var(--color-danger-text)' : 'var(--color-text-secondary)'
                }}
              >
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  style={{ accentColor: 'var(--color-danger)' }}
                />
                Inactive (Blocked immediately)
              </label>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
