import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Import apiClient directly where it's used to avoid top-level import issue if preferred,
      // but top-level import is better. Let's assume we do top-level import.
      const apiClient = (await import('../../lib/apiClient')).default;
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        if (response.data.user) {
          localStorage.setItem('user_info', JSON.stringify(response.data.user));
        }
        navigate('/dashboard');
      } else if (response.data && response.data.data?.accessToken) {
        // Fallback for nested data pattern
        localStorage.setItem('access_token', response.data.data.accessToken);
        navigate('/dashboard');
      } else {
         alert('Login failed. No token received.');
      }
    } catch (error) {
      console.error('Login error', error);
      alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
        </form>
        
        <p className="login-footer">
          Don't have an account? <a href="#">Contact admin</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
