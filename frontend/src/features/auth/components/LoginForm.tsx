import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';

export interface LoginFormProps {
  onSuccess?: (user: { name: string; email: string; role: string }) => void;
  onNavigateToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToSignup,
}) => {
  const [email, setEmail] = useState('admin@odoo-flow.com');
  const [password, setPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const demoAccounts = [
    { label: 'Admin', email: 'admin@odoo-flow.com', password: 'admin123', name: 'Pritam Admin', role: 'Administrator' },
    { label: 'Accountant', email: 'accountant@odoo-flow.com', password: 'accountant123', name: 'Farish Accountant', role: 'Chief Accountant' },
    { label: 'Sales Manager', email: 'sales@odoo-flow.com', password: 'sales123', name: 'Ratan Sales', role: 'Sales Director' },
    { label: 'Portal Client', email: 'portal@clientcorp.com', password: 'client123', name: 'Alice Client', role: 'Portal Customer' },
  ];

  const handleSelectDemo = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Find matching demo or create user
      const matched = demoAccounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
      const loggedUser = matched
        ? { name: matched.name, email: matched.email, role: matched.role }
        : { name: email.split('@')[0], email, role: 'Staff Member' };

      setSuccessMessage(`Welcome back, ${loggedUser.name}! Loading your workspace...`);
      setTimeout(() => {
        onSuccess?.(loggedUser);
      }, 600);
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setIsForgotPasswordOpen(false);
      setResetSent(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div className="auth-card">
      {/* Card Header */}
      <div className="auth-card-header">
        <h2 className="auth-card-title">Sign in to your account</h2>
        <p className="auth-card-subtitle">
          Access your enterprise ledger, journals, sales, and analytics
        </p>
      </div>

      {/* Demo Credentials Quick Switcher */}
      <div className="demo-accounts-box">
        <div className="demo-accounts-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={13} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
            <span>1-Click Demo Profiles</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>Click to fill</span>
        </div>
        <div className="demo-pills-row">
          {demoAccounts.map((acc) => (
            <button
              key={acc.label}
              type="button"
              className={`demo-pill ${email === acc.email ? 'active' : ''}`}
              onClick={() => handleSelectDemo(acc)}
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger-text)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} strokeWidth={2} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FormField
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leadingIcon={<Mail size={16} strokeWidth={1.75} />}
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '0', fontSize: '12px', color: 'var(--color-primary)' }}
              onClick={() => {
                setResetEmail(email);
                setIsForgotPasswordOpen(true);
              }}
            >
              Forgot password?
            </button>
          </div>

          <FormField
            id="login-password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leadingIcon={<Lock size={16} strokeWidth={1.75} />}
            showPasswordToggle
            required
          />
        </div>

        {/* Remember me row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me on this browser</span>
          </label>
          <StatusBadge status="active" label="Encrypted" />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<LogIn size={18} strokeWidth={2} />}
        >
          Sign In to Workspace
        </Button>
      </form>

      {/* Divider */}
      <div className="auth-divider">or continue with</div>

      {/* Single Sign-on Options */}
      <div className="auth-social-buttons">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmail('pritam.enterprise@google.com');
            setPassword('oauth_sso_verified');
          }}
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.053 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          }
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmail('pritam.corp@microsoft.com');
            setPassword('oauth_sso_verified');
          }}
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
          }
        >
          Microsoft
        </Button>
      </div>

      {/* Switch to Signup */}
      <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Don't have an enterprise account?{' '}
        <a
          href="#/signup"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToSignup?.();
          }}
          style={{ fontWeight: 600 }}
        >
          Create an account
        </a>
      </div>

      {/* Security & Compliance Trust Badges */}
      <div className="auth-trust-bar">
        <div className="trust-item">
          <ShieldCheck size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>SOC-2 Type II</span>
        </div>
        <div className="trust-item">
          <CheckCircle2 size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>ISO 27001</span>
        </div>
        <div className="trust-item">
          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>99.99%</span>
          <span>SLA</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        title="Reset Account Password"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResetPassword}>
              Send Recovery Link
            </Button>
          </>
        }
      >
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Enter your verified work email address below and we'll send you instructions to securely reset your credentials.
          </p>

          <FormField
            label="Registered Work Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            leadingIcon={<Mail size={16} strokeWidth={1.75} />}
            placeholder="name@company.com"
            required
          />

          {resetSent && (
            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} strokeWidth={2} />
              <span>Password reset link sent to {resetEmail}!</span>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default LoginForm;
