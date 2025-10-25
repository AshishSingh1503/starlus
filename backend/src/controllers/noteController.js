const Note = require('../models/Note');
const logger = require('../config/logger');
const path = require('path');
const fs = require('fs').promises;

const getNotes = async (req, res, next) => {
  try {
    const { type, archived } = req.query;
    const filter = { userId: req.user._id };
    
    if (type) filter.type = type;
    if (archived !== undefined) filter.isArchived = archived === 'true';
    
    const notes = await Note.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    
    const note = await Note.create({
      title,
      content,
      userId: req.user._id,
      tags: tags || []
    });
    
    logger.info(`Note created: ${title} by user ${req.user._id}`);
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { title, content, tags, isArchived } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        ...(title && { title }),
        ...(content && { content }),
        ...(tags && { tags }),
        ...(isArchived !== undefined && { isArchived })
      },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Delete associated file if it's a PDF note
    if (note.type === 'pdf' && note.filePath) {
      try {
        await fs.unlink(note.filePath);
      } catch (fileError) {
        logger.warn(`Failed to delete file: ${note.filePath}`);
      }
    }
    
    logger.info(`Note deleted: ${note.title} by user ${req.user._id}`);
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const note = await Note.create({
      title: req.file.originalname,
      content: `PDF file: ${req.file.originalname}`,
      userId: req.user._id,
      type: 'pdf',
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size
    });
    
    logger.info(`PDF uploaded: ${req.file.originalname} by user ${req.user._id}`);
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const getPdf = async (req, res, next) => {
  try {
    // Check for token in query params or headers
    const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Verify token and get user
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    const note = await Note.findOne({
      filename: req.params.filename,
      userId: user._id,
      type: 'pdf'
    });
    
    if (!note) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    const filePath = path.join(__dirname, '../../uploads', req.params.filename);
    
    // Set proper headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + note.originalName + '"');
    
    res.sendFile(filePath);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    next(error);
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  uploadPdf,
  getPdf
};