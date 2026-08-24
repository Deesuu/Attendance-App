const { isValidDeviceId } = require('../utils/deviceId');

const validateCheckIn = (req, res, next) => {
  const { employeeId, deviceId, latitude, longitude, qrToken } = req.body;

  if (!employeeId || !deviceId || !qrToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: employeeId, deviceId, qrToken'
    });
  }

  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid device ID format'
    });
  }

  if (employeeId.length < 3 || employeeId.length > 20) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID must be between 3 and 20 characters'
    });
  }

  next();
};

const validateRegistration = (req, res, next) => {
  const { employeeId, name, email, deviceId } = req.body;

  if (!employeeId || !name || !email || !deviceId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: employeeId, name, email, deviceId'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  if (!isValidDeviceId(deviceId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid device ID format'
    });
  }

  next();
};

module.exports = {
  validateCheckIn,
  validateRegistration
};