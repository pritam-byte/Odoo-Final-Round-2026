import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Building,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export interface SignupFormProps {
  onSuccess?: (user: { name: string; email: string; role: string; company?: string }) => void;
  onNavigateToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onNavigateToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Finance & Accounting');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--color-danger)' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'var(--color-warning)' };
    return { score: 3, label: 'Strong', color: 'var(--color-primary)' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !company.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the Master Services Agreement to continue.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser = {
        name,
        email,
        role: `${role} Lead`,
        company,
      };
      setSuccessMessage(`Account created for ${company}! Initializing ledger...`);
      setTimeout(() => {
        onSuccess?.(newUser);
      }, 700);
    }, 900);
  };

  return (
    <div className="auth-card auth-card-wide">
      {/* Card Header */}
      <div className="auth-card-header">
        <h2 className="auth-card-title">Create your workspace</h2>
        <p className="auth-card-subtitle">
          Start your 14-day full enterprise trial • No credit card required
        </p>
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

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Name & Work Email in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField
            label="Full Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leadingIcon={<User size={16} strokeWidth={1.75} />}
            required
          />

          <FormField
            label="Work Email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leadingIcon={<Mail size={16} strokeWidth={1.75} />}
            required
          />
        </div>

        {/* Company & Department / Role in 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField
            label="Company / Legal Entity"
            placeholder="Acme Global Inc."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            leadingIcon={<Building size={16} strokeWidth={1.75} />}
            required
          />

          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">
              Primary Module Focus
            </label>
            <div className="input-with-icon-wrapper">
              <div className="input-leading-icon">
                <Briefcase size={16} strokeWidth={1.75} />
              </div>
              <select
                id="signup-role"
                className="form-input has-leading-icon select-filter"
                style={{ width: '100%', height: '42px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Finance & Accounting">Finance & Accounting</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="Inventory & Stock">Inventory & Stock</option>
                <option value="Executive Management">Executive & Multi-entity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <FormField
              label="Create Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leadingIcon={<Lock size={16} strokeWidth={1.75} />}
              showPasswordToggle
              required
            />
            {password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: 'var(--color-border)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(strength.score / 3) * 100}%`,
                      backgroundColor: strength.color,
                      transition: 'width 0.2s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leadingIcon={<Lock size={16} strokeWidth={1.75} />}
            showPasswordToggle
            required
          />
        </div>

        {/* Terms agreement checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
            />
            <span>
              I agree to the{' '}
              <a href="#/terms" style={{ fontWeight: 600 }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#/privacy" style={{ fontWeight: 600 }}>
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          leftIcon={<UserPlus size={18} strokeWidth={2} />}
        >
          Create Enterprise Workspace
        </Button>
      </form>

      {/* Divider */}
      <div className="auth-divider">or signup with SSO</div>

      {/* Single Sign-on Options */}
      <div className="auth-social-buttons">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName('Google SSO User');
            setEmail('pritam@google.com');
            setCompany('Google Partner Ltd.');
          }}
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.053 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          }
        >
          Google Workspace
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setName('Microsoft 365 User');
            setEmail('pritam@microsoft.com');
            setCompany('Microsoft Global');
          }}
          leftIcon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
            </svg>
          }
        >
          Microsoft Entra
        </Button>
      </div>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <a
          href="#/login"
          onClick={(e) => {
            e.preventDefault();
            onNavigateToLogin?.();
          }}
          style={{ fontWeight: 600 }}
        >
          Sign in here
        </a>
      </div>

      {/* Trust Badges */}
      <div className="auth-trust-bar">
        <div className="trust-item">
          <ShieldCheck size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>GDPR Compliant</span>
        </div>
        <div className="trust-item">
          <CheckCircle2 size={14} strokeWidth={1.75} style={{ color: 'var(--color-primary)' }} />
          <span>Automatic Backups</span>
        </div>
        <div className="trust-item">
          <StatusBadge status="completed" label="14-Day Free Trial" />
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

