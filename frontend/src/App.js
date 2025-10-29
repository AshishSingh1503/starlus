import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetch(`${process.env.REACT_APP_API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Token invalid');
      })
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          logout();
        }
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="App" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '18px', marginBottom: '10px'}}>Loading...</div>
          <div style={{width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} token={token} onLogout={logout} />
      ) : (
        <Login onLogin={login} />
      )}
    </div>
  );
}

export default App;