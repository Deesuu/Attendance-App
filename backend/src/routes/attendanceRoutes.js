const express = require('express');
const router = express.Router();
const {
  checkIn,
  getAttendanceHistory,
  getTodayStats
} = require('../controllers/attendanceController');
const { validateCheckIn } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const { generateTokenEndpoint } = require('../utils/crypto');

router.get('/token', generateTokenEndpoint);
router.post('/checkin', validateCheckIn, checkIn);
router.get('/history/:employeeId', authenticate, getAttendanceHistory);
router.get('/today/stats', authenticate, getTodayStats);

module.exports = router;