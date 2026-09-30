const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  verifyEmployee,
  getAllEmployees
} = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

router.post('/register', validateRegistration, registerEmployee);
router.post('/verify', verifyEmployee);
router.get('/all', getAllEmployees);

module.exports = router;