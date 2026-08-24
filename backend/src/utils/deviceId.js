const crypto = require('crypto');

const generateDeviceHash = (deviceData) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(deviceData))
    .digest('hex');
};

const isValidDeviceId = (deviceId) => {
  // Allow any non-empty string as device ID
  // This accepts both hex format and UUID format
  return deviceId && deviceId.length > 0 && typeof deviceId === 'string';
};

const generateDeviceId = () => {
  // Generate a 64-character hex string
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateDeviceHash,
  isValidDeviceId,
  generateDeviceId
};