const express = require('express');
const {
  getNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook
} = require('../controllers/notebookController');
const { validate, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getNotebooks);
router.get('/:id', getNotebook);
router.post('/', validate(schemas.notebook), createNotebook);
router.put('/:id', updateNotebook);
router.delete('/:id', deleteNotebook);

module.exports = router;