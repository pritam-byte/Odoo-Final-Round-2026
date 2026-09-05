import React, { useState } from 'react';
import { LogIn, AlertCircle, ShieldCheck, Briefcase, User } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Login ID or Email.');
      return;
    }

    setLoading(true);
    const res = loginUser(identifier, password);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess?.(res.user);
    } else {
      setError(res.message);
    }
  };

  const handleQuickDemoLogin = (loginId: string) => {
    setError('');
    const res = loginUser(loginId);
    if (res.success && res.user) {
      onSuccess?.(res.user);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="card-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
          Sign In to Urban Furniture
        </h2>
        <p className="card-subtitle">
          Enter your credentials or choose a quick role to access your dashboard
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

      {/* Quick Role Selectors for Live Testing */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
          Quick Demo Sign-In (1-Click)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleQuickDemoLogin('admin_pritam')}
            title="Login as System Administrator"
            style={{ flexDirection: 'column', gap: '4px', padding: '8px 4px' }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--color-danger)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>Admin</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleQuickDemoLogin('sarah_finance')}
            title="Login as Accountant"
            style={{ flexDirection: 'column', gap: '4px', padding: '8px 4px' }}
          >
            <Briefcase size={16} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>Accountant</span>
          </button>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => handleQuickDemoLogin('jdoe_client')}
            title="Login as Customer User"
            style={{ flexDirection: 'column', gap: '4px', padding: '8px 4px' }}
          >
            <User size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>User Portal</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', gap: '10px' }}>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
          Or sign in manually
        </span>
        <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--color-border)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Login ID or Email</label>
          <input
            type="text"
            placeholder="e.g. admin_pritam or user@company.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
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
