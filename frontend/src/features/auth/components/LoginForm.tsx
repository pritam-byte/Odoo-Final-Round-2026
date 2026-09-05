import React, { useState } from 'react';
import { LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
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

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState('');

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
    } else {
      setError(res.message);
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Login ID or registered Email.');
      return;
    }

    setForgotSubmitted(true);
  };

  if (showForgotPassword) {
    return (
      <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <KeyRound size={24} />
          </div>
          <h2 className="card-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
            Account Recovery
          </h2>
          <p className="card-subtitle">
            Recover your account access credentials
          </p>
        </div>

        {forgotError && (
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
            <span>{forgotError}</span>
          </div>
        )}

        {forgotSubmitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                color: 'var(--color-text, #1e293b)',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px', fontSize: '14px', color: '#059669' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>Reset Instructions Dispatched</span>
              </div>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
                If an account matching <strong style={{ color: 'var(--color-text)' }}>{forgotIdentifier}</strong> exists in our system, password reset instructions and security verification steps have been sent to the registered email address.
              </p>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-bg, #f8fafc)',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.5',
              }}
            >
              <strong style={{ color: 'var(--color-text)' }}>Enterprise Support:</strong> If you do not receive an email or are using an internal staff account, please contact your system administrator or reach out to <code>admin@urbanfurniture.com</code>.
            </div>

            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => {
                setIdentifier(forgotIdentifier);
                setShowForgotPassword(false);
                setForgotSubmitted(false);
                setForgotError('');
              }}
              style={{ padding: '10px', marginTop: '6px', gap: '8px' }}
            >
              <ArrowLeft size={15} />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Enter your registered <strong>Login ID</strong> or <strong>Email Address</strong>. We will dispatch secure password recovery instructions.
            </p>

            <div className="form-group">
              <label className="form-label">Login ID or Registered Email</label>
              <input
                type="text"
                placeholder="e.g. admin01 or your-email@company.com"
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                className="form-input"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ padding: '10px', marginTop: '6px', gap: '8px' }}
            >
              <Mail size={16} />
              <span>Send Reset Instructions</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotError('');
                setForgotSubmitted(false);
              }}
              style={{ gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="card-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
          Sign In to Urban Furniture
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label">Password</label>
            <button
              type="button"
              onClick={() => {
                setForgotIdentifier(identifier);
                setShowForgotPassword(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>
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
