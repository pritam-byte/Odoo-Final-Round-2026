import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';

export interface CreateUserData {
  name: string;
  loginId: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
  confirmPassword: string;
}

export const CreateUserPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    loginId: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserData, string>>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateUserData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleChange = (role: 'user' | 'admin') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof CreateUserData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.loginId.trim()) newErrors.loginId = 'Login ID is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
    // Backend integration will connect here later
    console.log('Create User payload:', formData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      loginId: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setSubmitted(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--button-radius)',
    border: '1px solid var(--color-gray-border)',
    backgroundColor: 'var(--color-white)',
    fontSize: '0.875rem',
    color: 'var(--color-charcoal-dark)',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title" style={{ margin: '0 0 6px 0' }}>Create User</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Fill in the details below to add a new user to the organization.
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="ds-card" style={{ padding: '36px 40px' }}>
        {/* App Logo Header inside Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: '24px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--color-gray-border)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 22px',
            backgroundColor: 'var(--color-gray-bg)',
            borderRadius: 'var(--button-radius)',
            border: '1px solid var(--color-gray-border)'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-purple)' }}>Odoo</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal-dark)' }}>ERP</span>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-medium)', marginTop: '8px' }}>
            User Account Setup
          </span>
        </div>

        {submitted ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            backgroundColor: 'var(--color-primary-teal-light)',
            borderRadius: 'var(--card-radius)',
            border: '1px solid var(--color-primary-teal)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-teal)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '1.25rem'
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-primary-teal-text)' }}>User Created Successfully!</h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--color-primary-teal-text)' }}>
              User <strong>{formData.name}</strong> ({formData.loginId}) has been registered with <strong>{formData.role === 'admin' ? 'Administrator' : 'User'}</strong> role.
            </p>
            <Button variant="primary" onClick={handleReset}>
              Create Another User
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <FormField label="Name" required error={errors.name}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? 'var(--color-danger-red)' : 'var(--color-gray-border)'
                }}
              />
            </FormField>

            {/* Login id */}
            <FormField label="Login id" required error={errors.loginId}>
              <input
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                placeholder="Enter login username"
                style={{
                  ...inputStyle,
                  borderColor: errors.loginId ? 'var(--color-danger-red)' : 'var(--color-gray-border)'
                }}
              />
            </FormField>

            {/* E-mail id */}
            <FormField label="E-mail id" required error={errors.email}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                style={{
                  ...inputStyle,
                  borderColor: errors.email ? 'var(--color-danger-red)' : 'var(--color-gray-border)'
                }}
              />
            </FormField>

            {/* Role */}
            <FormField label="Role" required>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginTop: '4px',
                marginBottom: '4px'
              }}>
                {/* User Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.925rem',
                  fontWeight: 500,
                  color: 'var(--color-charcoal-dark)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={() => handleRoleChange('user')}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--color-primary-teal)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>User</span>
                </label>

                {/* Administrator Option */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.925rem',
                  fontWeight: 500,
                  color: 'var(--color-charcoal-dark)'
                }}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={() => handleRoleChange('admin')}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--color-primary-teal)',
                      cursor: 'pointer'
                    }}
                  />
                  <span>Administrator</span>
                </label>
              </div>
            </FormField>

            {/* Password */}
            <FormField label="Password" required error={errors.password}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor: errors.password ? 'var(--color-danger-red)' : 'var(--color-gray-border)'
                }}
              />
            </FormField>

            {/* Re-Enter Password */}
            <FormField label="Re-Enter Password" required error={errors.confirmPassword}>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  ...inputStyle,
                  borderColor: errors.confirmPassword ? 'var(--color-danger-red)' : 'var(--color-gray-border)'
                }}
              />
            </FormField>

            {/* Action Buttons: Create and Cancel */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '12px',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--color-gray-border)'
            }}>
              <Button
                type="submit"
                variant="primary"
                icon={(
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                )}
              >
                Create
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateUserPage;
