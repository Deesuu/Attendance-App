const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  deviceId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: null
  },
  department: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['employee', 'hr', 'admin'],
    default: 'employee'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

employeeSchema.index({ employeeId: 1, deviceId: 1 });

module.exports = mongoose.model('Employee', employeeSchema);