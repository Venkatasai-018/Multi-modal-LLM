import React, { useState } from 'react';
import './Auth.css';

const API_URL = 'http://localhost:8000';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!isLogin) {
      // Signup validation
      if (formData.password !== formData.confirmPassword) {
        setMessage({ text: 'Passwords do not match', type: 'error' });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const body = isLogin
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, password: formData.password, email: formData.email || null };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // Save session
          localStorage.setItem('session_id', data.session_id);
          localStorage.setItem('username', data.username);
          setMessage({ text: 'Login successful!', type: 'success' });
          setTimeout(() => onLogin(data.session_id, data.username), 1000);
        } else {
          // Signup successful, switch to login
          setMessage({ text: 'Account created! Please login.', type: 'success' });
          setTimeout(() => {
            setIsLogin(true);
            setFormData({ ...formData, password: '', confirmPassword: '' });
          }, 1500);
        }
      } else {
        setMessage({ text: data.detail || 'Operation failed', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Cannot connect to server', type: 'error' });
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🤖 Multi-modal LLM</h1>
          <p>Your intelligent document assistant</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setMessage({ text: '', type: '' });
            }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setMessage({ text: '', type: '' });
            }}
          >
            Sign Up
          </button>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {!isLogin && (
              <small className="password-hint">At least 6 characters</small>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (isLogin ? 'Logging in...' : 'Creating account...') : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
