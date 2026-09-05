import React, { useState } from 'react';
import { LogIn, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
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

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Login ID or registered Email.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotSuccess('Password has been updated successfully! You can now sign in.');
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSuccess('');
      setForgotError('');
      setIdentifier(forgotIdentifier);
    }, 1500);
  };

  if (showForgotPassword) {
    return (
      <div className="card-panel" style={{ width: '100%', maxWidth: '440px', padding: '36px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <KeyRound size={22} />
          </div>
          <h2 className="card-title" style={{ fontSize: '22px', marginBottom: '6px' }}>
            Reset Password
          </h2>
          <p className="card-subtitle">
            Enter your Login ID or Email to update your security credentials
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

        {forgotSuccess && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success-text)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{forgotSuccess}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Login ID or Email</label>
            <input
              type="text"
              placeholder="e.g. ratanjana7600@gmail.com"
              value={forgotIdentifier}
              onChange={(e) => setForgotIdentifier(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ padding: '10px', marginTop: '6px' }}
          >
            <span>Update Password</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotError('');
              setForgotSuccess('');
            }}
            style={{ gap: '6px' }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </button>
        </form>
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
