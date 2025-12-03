import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login/LoginForm.css';
import API_BASE from '../../utils/api';

const LoginForm = ({ onBack, userType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload
    console.log('Login submitted');
    
    // Clear any previous errors
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ Login successful', data);
        console.log('🔍 User data from server:', data.user);
        console.log('🔍 User _id field:', data.user._id);
        if (data.user.userType === 'Admin') {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('currentUserId', data.user._id); // Add user-specific identifier
          navigate('/admin', { state: { user: data.user  } });
        } else if (data.user.userType === 'Teacher') {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('currentUserId', data.user._id); // Add user-specific identifier
          navigate('/teacher', { state: { user: data.user  } });
        } else if (data.user.userType === 'Student') {
          console.log('🔍 Navigating to student dashboard with user:', data.user);
          // Store user data in localStorage as backup
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('currentUserId', data.user._id); // Add user-specific identifier
          navigate('/student', { state: { user: data.user  } });
        }
        // TODO: Redirect or update app state here
      } else {
        // Handle API errors (401, 404, etc.)
        const errorMessage = data.error || 'Login failed. Please check your credentials and try again.';
        console.error('❌ Login failed:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (err) {
      // Handle network errors
      console.error('❌ Network error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  // Clear error when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="login-form-container">
      <h2>Login as {userType}</h2>
      <form className="login-form" onSubmit={handleLogin}>
        {error && (
          <div className="login-error-message" role="alert">
            {error}
          </div>
        )}
        <input
          type="text"
          placeholder="Username"
          className={`login-input ${error ? 'login-input-error' : ''}`}
          value={username}
          onChange={handleUsernameChange}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          className={`login-input ${error ? 'login-input-error' : ''}`}
          value={password}
          onChange={handlePasswordChange}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="btn btn-primary login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary back-button" 
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default LoginForm;