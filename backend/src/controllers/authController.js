const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    if (global.useMemoryDB) {
      // In-memory storage
      const users = global.memoryDB.users;
      
      // Check if user exists
      for (let [id, user] of users) {
        if (user.email === email || user.username === username) {
          return res.status(400).json({
            error: 'User with this email or username already exists'
          });
        }
      }
      
      const userId = Date.now().toString();
      const bcrypt = require('bcrypt');
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
      
      logger.info(`New user registered: ${email}`);
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          username,
          email
        }
      });
    } else {
      // MongoDB storage
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email or username already exists'
        });
      }

      const user = await User.create({ username, email, password });
      const token = generateToken(user._id);
      
      logger.info(`New user registered: ${email}`);
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (global.useMemoryDB) {
      // In-memory storage
      const users = global.memoryDB.users;
      let foundUser = null;
      
      for (let [id, user] of users) {
        if (user.email === email) {
          foundUser = user;
          break;
        }
      }
      
      if (!foundUser) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
      
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(password, foundUser.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }
      
      const token = generateToken(foundUser._id);
      
      logger.info(`User logged in: ${email}`);
      
      res.json({
        success: true,
        token,
        user: {
          id: foundUser._id,
          username: foundUser.username,
          email: foundUser.email
        }
      });
    } else {
      // MongoDB storage
      const user = await User.findOne({ email, isActive: true });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          error: 'Invalid email or password'
        });
      }

      user.lastLogin = new Date();
      await user.save();
      
      const token = generateToken(user._id);
      
      logger.info(`User logged in: ${email}`);
      
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    if (global.useMemoryDB) {
      const users = global.memoryDB.users;
      const user = users.get(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin
        }
      });
    } else {
      res.json({
        user: {
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          lastLogin: req.user.lastLogin
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };