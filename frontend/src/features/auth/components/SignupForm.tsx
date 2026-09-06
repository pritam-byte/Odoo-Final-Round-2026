import React, { useState } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../../components/ui/BrandLogo';
import { registerAndLogin } from '../../../lib/auth';
import { UserRole, CreateUserInput, UserAccount } from '../schemas';

export interface SignupFormProps {
  onSuccess?: (user: UserAccount) => void;
  onNavigateToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onNavigateToLogin }) => {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    loginId: '',
    email: '',
    role: 'User',
    partnerType: 'Customer',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      partnerType: role === 'User' ? (prev.partnerType || 'Customer') : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await registerAndLogin(formData);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess?.(res.user);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="card-panel" style={{ width: '100%', maxWidth: '500px', padding: '36px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <BrandLogo height={48} />
        </div>
        <h2 className="card-title" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
          Create Account
        </h2>
        <p className="card-subtitle">
          Register to access your role-specific dashboard (User, Accountant, or Admin)
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        {/* Login ID */}
        <div className="form-group">
          <label className="form-label">Login ID (3–20 characters)</label>
          <input
            type="text"
            name="loginId"
            placeholder="e.g. jdoe_client"
            value={formData.loginId}
            onChange={handleChange}
            className="form-input"
            minLength={3}
            maxLength={20}
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="e.g. john.doe@company.com"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        {/* Role Selector */}
        <div className="form-group">
          <label className="form-label">Select Your Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {(['User', 'Accountant', 'Admin'] as const).map((r) => {
              const isSelected = formData.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{ justifyContent: 'center' }}
                  disabled={loading}
                >
                  <span>{r === 'User' ? 'Customer / Vendor' : r}</span>
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {formData.role === 'User' && 'User Portal: Access self-service customer invoices, vendor bills & direct settlement.'}
            {formData.role === 'Accountant' && 'Accountant: Access sales, purchases, COA, journals & financial reports.'}
            {formData.role === 'Admin' && 'Admin: Full access across all modules + User Management.'}
          </span>
        </div>

        {/* Partner Sub-Type for User Role */}
        {formData.role === 'User' && (
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px' }}>Account Type (Partner Category)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(['Customer', 'Vendor', 'Both'] as const).map((pType) => {
                const isSelected = (formData as any).partnerType ? (formData as any).partnerType === pType : pType === 'Customer';
                return (
                  <button
                    key={pType}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, partnerType: pType } as any))}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    style={{ justifyContent: 'center', fontSize: '12px', padding: '6px 4px' }}
                    disabled={loading}
                  >
                    <span>{pType === 'Both' ? 'Both (Dual)' : pType}</span>
                  </button>
                );
              })}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Choose whether you are purchasing goods (Customer), supplying raw materials (Vendor), or both.
            </span>
          </div>
        )}

        {/* Passwords */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          style={{ padding: '10px', marginTop: '6px' }}
          disabled={loading}
        >
          <UserPlus size={16} />
          <span>{loading ? 'Creating Account...' : 'Create Account & Sign In'}</span>
        </button>
      </form>

      {onNavigateToLogin && (
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Sign In &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default SignupForm;
