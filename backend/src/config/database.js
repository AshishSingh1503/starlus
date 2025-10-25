const mongoose = require('mongoose');
const logger = require('./logger');

// In-memory database for local development
const connectDB = async () => {
  try {
    // Try MongoDB connection first
    const conn = await mongoose.connect('mongodb://localhost:27017/starlus-local', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000
    });
    
    logger.info(`Database Connected: ${conn.connection.host}`);
    global.useMemoryDB = false;
  } catch (error) {
    logger.warn('MongoDB not available, using in-memory storage');
    // Fallback to in-memory storage for local development
    global.memoryDB = {
      users: new Map(),
      notebooks: new Map(),
      notes: new Map()
    };
    global.useMemoryDB = true;
  }
};

module.exports = connectDB;