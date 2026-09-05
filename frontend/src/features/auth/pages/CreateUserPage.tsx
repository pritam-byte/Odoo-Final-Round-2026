import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { UserRole, CreateUserInput } from '../schemas';
import { createNewUserApi } from '../api';

export interface CreateUserPageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateUserPage: React.FC<CreateUserPageProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    loginId: '',
    email: '',
    role: 'Accountant',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide full name.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await createNewUserApi(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onSuccess?.();
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Users List</span>
        </button>
      )}

      <div className="card-panel" style={{ padding: '36px' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="card-title" style={{ fontSize: '20px' }}>
                Create New User
              </h1>
              <span className="badge-pill badge-overdue" style={{ fontSize: '11px', padding: '2px 8px' }}>
                Admin Action
              </span>
            </div>
            <p className="card-subtitle">
              Provision a new account on behalf of a team member or client.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div
            style={{
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-primary-border)',
              marginTop: '16px'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Check size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 6px 0' }}>
              User Created Successfully!
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-primary-hover)', margin: 0 }}>
              User <strong>{formData.name}</strong> ({formData.loginId}) has been registered with <strong>{formData.role}</strong> role.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alice Smith"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Login ID (3–20 characters)</label>
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="e.g. asmith_ops"
                className="form-input"
                minLength={3}
                maxLength={20}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Unique system username between 3 and 20 alphanumeric characters.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. alice.smith@company.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role & Access Permissions</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {(['User', 'Accountant', 'Admin'] as const).map((r) => {
                  const isSelected = formData.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                      style={{ justifyContent: 'center' }}
                    >
                      <span>{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Re-Enter Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '-8px' }}>
              Must be at least 6 characters.
            </span>

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
              {onCancel && (
                <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ gap: '6px' }} disabled={loading}>
                <UserPlus size={16} />
                <span>{loading ? 'Creating in Database...' : 'Create User'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
