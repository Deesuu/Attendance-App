const express = require('express');
const router = express.Router();
const {
  checkIn,
  getAttendanceHistory,
  getTodayStats,
  getAllAttendance
} = require('../controllers/attendanceController');
const { validateCheckIn } = require('../middleware/validation');
const { generateTokenEndpoint } = require('../utils/crypto');

router.get('/token', generateTokenEndpoint);
router.post('/checkin', validateCheckIn, checkIn);
router.get('/history/:employeeId', getAttendanceHistory);
router.get('/today/stats', getTodayStats);
router.get('/all', getAllAttendance);

module.exports = router;