import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login/LoginForm.css';

const LoginForm = ({ onBack, userType }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload
    console.log('Login submitted');
    try {
      const response = await fetch(`/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, userType })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ Login successful', data);
        if (data.user.userType === 'Admin') {
          navigate('/admin');
        } else if (data.user.userType === 'Teacher') {
          navigate('/teacher');
        } else if (data.user.userType === 'Student') {
          navigate('/student');
      }
        // TODO: Redirect or update app state here
      } else {
        console.error('❌ Login failed:', data.error);
      }
    } catch (err) {
      console.error('❌ Network error:', err);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn btn-primary login-button">
          Login
        </button>
        <button type="button" className="btn btn-secondary back-button" onClick={onBack}>
          Back
        </button>
      </form>
    </div>
  );
};

export default LoginForm;