const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'pdf'],
    default: 'text'
  },
  filename: String,
  originalName: String,
  filePath: String,
  fileSize: Number,
  tags: [String],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

noteSchema.index({ userId: 1, type: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ tags: 1 });

module.exports = mongoose.model('Note', noteSchema);