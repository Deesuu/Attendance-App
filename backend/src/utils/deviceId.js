const crypto = require('crypto');

const generateDeviceHash = (deviceData) => {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(deviceData))
    .digest('hex');
};

const isValidDeviceId = (deviceId) => {
  return /^[a-f0-9]{64}$/.test(deviceId);
};

module.exports = {
  generateDeviceHash,
  isValidDeviceId
};