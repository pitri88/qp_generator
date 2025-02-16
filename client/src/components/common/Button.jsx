import React from 'react';
import { theme } from '../../styles/theme';

export function Button({ children, variant = 'primary', onClick, disabled, fullWidth, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${fullWidth ? 'w-full' : ''}`}
      style={{
        opacity: disabled ? 0.7 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto'
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, padding = '1.5rem' }) {
  return (
    <div className="card" style={{ padding }}>
      {children}
    </div>
  );
}

export function FormInput({ label, type = 'text', error, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input type={type} className="form-input" {...props} />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

export function Alert({ children, type = 'error' }) {
  return (
    <div className={`alert alert-${type}`}>
      {children}
    </div>
  );
}

export function LoadingSpinner() {
  return <div className="loading-spinner"></div>;
} 