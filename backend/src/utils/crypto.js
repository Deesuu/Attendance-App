const CryptoJS = require('crypto-js');
const crypto = require('crypto');

const SECRET_KEY = process.env.QR_SECRET_KEY || 'default_secret_key_change_me';
const TOKEN_EXPIRY = parseInt(process.env.TOKEN_EXPIRY_SECONDS) || 5;

const generateQRToken = () => {
  const timestamp = Date.now();
  const randomNonce = crypto.randomBytes(8).toString('hex');
  const payload = `${timestamp}:${randomNonce}`;
  const encrypted = CryptoJS.AES.encrypt(payload, SECRET_KEY).toString();
  return encrypted;
};

const validateQRToken = (encryptedToken) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    const payload = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!payload) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr);

    if (isNaN(timestamp)) {
      return { valid: false, error: 'Invalid timestamp in token' };
    }

    const currentTime = Date.now();
    const timeDiff = (currentTime - timestamp) / 1000;

    if (timeDiff > TOKEN_EXPIRY) {
      return { 
        valid: false, 
        error: `Token expired. Age: ${timeDiff.toFixed(1)}s (max: ${TOKEN_EXPIRY}s)` 
      };
    }

    if (timeDiff < 0) {
      return { valid: false, error: 'Token from the future' };
    }

    return { valid: true, timestamp };
  } catch (error) {
    return { valid: false, error: `Decryption failed: ${error.message}` };
  }
};

const generateTokenEndpoint = (req, res) => {
  const token = generateQRToken();
  res.json({
    success: true,
    token: token,
    expiresIn: TOKEN_EXPIRY
  });
};

module.exports = {
  generateQRToken,
  validateQRToken,
  generateTokenEndpoint
};