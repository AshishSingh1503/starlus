const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// In-memory storage
const users = new Map();

app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, 'debug-secret-key', { expiresIn: '7d' });
};

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Register attempt:', { username, email, password: '***' });
    
    // Check if user exists
    for (let [id, user] of users) {
      if (user.email === email || user.username === username) {
        return res.status(400).json({
          error: 'User with this email or username already exists'
        });
      }
    }
    
    const userId = Date.now().toString();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = {
      _id: userId,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.set(userId, user);
    const token = generateToken(userId);
    
    console.log('User registered successfully:', email);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        username,
        email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });
    
    let foundUser = null;
    for (let [id, user] of users) {
      if (user.email === email) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      console.log('User not found:', email);
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    
    if (!isValidPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }
    
    const token = generateToken(foundUser._id);
    
    console.log('User logged in successfully:', email);
    
    res.json({
      success: true,
      token,
      user: {
        id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Debug endpoint to see all users
app.get('/api/debug/users', (req, res) => {
  const userList = [];
  for (let [id, user] of users) {
    userList.push({
      id,
      username: user.username,
      email: user.email
    });
  }
  res.json(userList);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', users: users.size });
});

app.listen(3000, () => {
  console.log('Debug server running on http://localhost:3000');
  console.log('Health check: http://localhost:3000/health');
  console.log('Debug users: http://localhost:3000/api/debug/users');
});