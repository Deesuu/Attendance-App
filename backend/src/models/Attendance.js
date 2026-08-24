const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Early'],
    default: 'Present'
  },
  checkInType: {
    type: String,
    enum: ['IN', 'OUT'],
    default: 'IN'
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  deviceId: {
    type: String,
    required: true
  },
  qrToken: {
    type: String,
    required: true
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

attendanceSchema.index({ employeeId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);