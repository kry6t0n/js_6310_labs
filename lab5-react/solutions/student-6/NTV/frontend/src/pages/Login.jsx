import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, authError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Если уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Очищаем ошибку при изменении режима
  useEffect(() => {
    clearError();
  }, [isRegister, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    // Валидация
    if (!username.trim() || !password.trim()) {
      // В режиме регистрации также проверяем email и confirmPassword
      if (isRegister && (!email.trim() || !confirmPassword.trim())) {
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      return;
    }

    // Проверяем совпадение паролей при регистрации
    if (isRegister && password !== confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (isRegister) {
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
    }

    try {
      let result;
      if (isRegister) {
        result = register(username, password, email);
      } else {
        result = login(username, password);
      }

      if (result.success) {
        // Навигация произойдет автоматически из-за useEffect
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    clearError();
    setEmail('');
    setConfirmPassword('');
  };

  // Демо-аккаунты для удобства тестирования
  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'engineer', password: 'engineer123', role: 'Network Engineer' },
    { username: 'user', password: 'user123', role: 'Regular User' }
  ];

  const fillDemoAccount = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    clearError();
  };

  return (
    <div className="login-container">
      <Link to="/" className="back-home">
        ← Back to Home
      </Link>
      
      <div className="login-background"></div>
      
      <div className="login-form-container">
        <div className="login-header">
          <div className="login-logo">🌐</div>
          <h1 className="login-title">Network Topology Visualizer</h1>
          <p className="login-subtitle">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {authError && (
          <div className="error-message">
            <strong>Error:</strong> {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={isLoading}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
                required={isRegister}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
                required={isRegister}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={switchMode} className="toggle-link">
              {isRegister ? ' Sign In' : ' Create Account'}
            </span>
          </p>
        </div>

        <div className="demo-accounts">
          <h4>Demo Accounts:</h4>
          <div className="demo-accounts-grid">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                type="button"
                className="demo-account-btn"
                onClick={() => fillDemoAccount(account)}
                disabled={isLoading}
              >
                <div className="demo-account-info">
                  <strong>{account.username}</strong>
                  <span>{account.role}</span>
                </div>
                <div className="demo-account-password">Click to fill</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
