const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  verifyEmployee,
  getAllEmployees
} = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');
const { authenticate, authorizeHR } = require('../middleware/auth');

router.post('/register', validateRegistration, registerEmployee);
router.post('/verify', verifyEmployee);
router.get('/all', authenticate, authorizeHR, getAllEmployees);

module.exports = router;