import React, { useState } from 'react';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister ? 'register' : 'login';
    const body = isRegister ? formData : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (isRegister) {
          setIsRegister(false);
          setError('Registration successful! Please login.');
        } else {
          onLogin(data.user, data.token);
        }
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Starlus Learning Platform</h1>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit">
            {isRegister ? 'Register' : 'Login'}
          </button>
          <button type="button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have account? Login' : 'Need account? Register'}
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

export default Login;