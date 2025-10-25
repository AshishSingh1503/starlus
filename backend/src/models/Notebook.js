const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  drawings: [{
    points: [{
      x: Number,
      y: Number
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  text: {
    type: String,
    default: ''
  },
  pageNumber: {
    type: Number,
    required: true
  }
});

const notebookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pages: [pageSchema],
  texts: [{
    id: Number,
    text: String,
    timestamp: String,
    page: Number
  }],
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

notebookSchema.index({ userId: 1, name: 1 });
notebookSchema.index({ lastModified: -1 });

module.exports = mongoose.model('Notebook', notebookSchema);