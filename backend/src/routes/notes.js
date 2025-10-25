const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  uploadPdf,
  getPdf
} = require('../controllers/noteController');
const { validate, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// PDF route without auth middleware for direct browser access
router.get('/pdf/:filename', getPdf);

// Apply auth middleware to other routes
router.use(auth);

router.get('/', getNotes);
router.post('/', validate(schemas.note), createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/upload-pdf', upload.single('pdf'), uploadPdf);

module.exports = router;