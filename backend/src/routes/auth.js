const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.get('/profile', auth, getProfile);

module.exports = router;