import React, { useState } from 'react';
import { X, KeyRound, Save } from 'lucide-react';
import { UserAccount, UserRole, UserStatus } from '../schemas';
import { RoleSelector } from './RoleSelector';
import { triggerPasswordReset } from '../api';

export interface UserEditModalProps {
  user: UserAccount;
  onClose: () => void;
  onSave: (updated: { name: string; email: string; role: UserRole; status: UserStatus }) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [resetMessage, setResetMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, role, status });
  };

  const handleResetPassword = () => {
    const res = triggerPasswordReset(user.id);
    setResetMessage(res.message);
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
        className="card-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          margin: '20px',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
          <div>
            <h3 className="card-title" style={{ fontSize: '18px' }}>
              Edit User: {user.name}
            </h3>
            <p className="card-subtitle">Manage role, permissions & account state</p>
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

        {resetMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px'
            }}
          >
            <KeyRound size={16} />
            <span>{resetMessage}</span>
          </div>
        )}

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

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <div style={{ display: 'flex', gap: '12px' }}>
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
              padding: '14px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '4px'
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block' }}>
                Password Management
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Plaintext password is encrypted and never exposed.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              className="btn btn-outline btn-sm"
              style={{ gap: '6px' }}
            >
              <KeyRound size={14} />
              <span>Send Reset Link</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
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
