import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import apiClient from '../../lib/apiClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        
        // Store user info if provided, else create a mock user based on email (for Mock API)
        const userObj = response.data.user || {
          fullName: email.split('@')[0],
          email: email,
          role: 'SUPER_ADMIN'
        };
        localStorage.setItem('user_info', JSON.stringify(userObj));
        navigate('/dashboard');
        
      } else if (response.data && response.data.data?.accessToken) {
        // Fallback for nested data pattern
        localStorage.setItem('access_token', response.data.data.accessToken);
        
        const userObj = response.data.data.user || {
          fullName: email.split('@')[0],
          email: email,
          role: 'SUPER_ADMIN'
        };
        localStorage.setItem('user_info', JSON.stringify(userObj));
        navigate('/dashboard');
        
      } else {
        setErrorMessage('Login gagal. Token otentikasi tidak diterima.');
      }
    } catch (error) {
      console.error('Login error', error);
      const serverMsg = error.response?.data?.message;
      let displayMsg = 'Password atau email salah';
      
      if (typeof serverMsg === 'string') {
        const lower = serverMsg.toLowerCase();
        if (lower.includes('invalid') || lower.includes('password') || lower.includes('email') || lower.includes('credential')) {
          displayMsg = 'Password atau email salah';
        } else {
          displayMsg = serverMsg;
        }
      } else if (Array.isArray(serverMsg) && serverMsg.length > 0) {
        displayMsg = serverMsg.join(', ');
      }
      
      setErrorMessage(displayMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-blob blob-1"></div>
        <div className="login-blob blob-2"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="login-logo-icon"></div>
            <h1>POSAgilix</h1>
          </div>
          <p className="login-subtitle">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-group">
            <label>Email</label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" />
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>Password</label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                style={{ paddingRight: '44px' }}
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="login-button-icon animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="login-button-icon" />
              </>
            )}
          </button>

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={16} className="login-error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
        
        <p className="login-footer">
          Don't have an account? <a href="#">Contact admin</a>
        </p>
      </div>
      
      <div style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '500' }}>
        Agilix Console v{__APP_VERSION__}
      </div>
    </div>
  );
};

export default Login;
