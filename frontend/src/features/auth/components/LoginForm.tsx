import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../../../components/ui/BrandLogo';
import { loginUser } from '../../../lib/auth';
import { UserAccount } from '../schemas';

export interface LoginFormProps {
  onSuccess?: (user: UserAccount) => void;
  onNavigateToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onNavigateToSignup }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Login ID or Email.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await loginUser(identifier, password);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess?.(res.user);
    } else if (res.notFound) {
      setError('User not found in database. Redirecting you to Sign Up...');
      setTimeout(() => {
        onNavigateToSignup?.();
      }, 900);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <BrandLogo height={48} />
        </div>
        <h2 className="card-title" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
          Sign In
        </h2>
        <p className="card-subtitle">
          Enter your login credentials to access your account
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
        <div className="form-group">
          <label className="form-label">Login ID or Email</label>
          <input
            type="text"
            placeholder="e.g. login id or email address"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          style={{ padding: '10px', marginTop: '6px' }}
          disabled={loading}
        >
          <LogIn size={16} />
          <span>{loading ? 'Signing In...' : 'Sign In'}</span>
        </button>

        {/* Quick Demo Credentials */}
        <div style={{ marginTop: '12px', padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-subtle, rgba(0,0,0,0.03))', border: '1px dashed var(--color-border, #e2e8f0)', fontSize: '12px' }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Database Administrator Credentials:
          </div>
          <button
            type="button"
            onClick={() => {
              setIdentifier('admin01');
              setPassword('Admin@1234');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-primary-subtle, #cbd5e1)',
              backgroundColor: 'var(--color-card, #fff)',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--color-primary)',
              fontWeight: 500,
            }}
          >
            <span>👤 <strong>admin01</strong> / Admin@1234</span>
            <span style={{ fontSize: '11px', textDecoration: 'underline' }}>Auto-Fill</span>
          </button>
        </div>
      </form>

      {onNavigateToSignup && (
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={onNavigateToSignup}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            Create an Account &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
