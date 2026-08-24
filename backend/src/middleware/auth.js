const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

const generateToken = (employeeId) => {
  return jwt.sign(
    { employeeId, type: 'attendance' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    const verification = verifyToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const employee = await Employee.findOne({ 
      employeeId: verification.data.employeeId 
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    if (!employee.isRegistered) {
      return res.status(403).json({
        success: false,
        message: 'Employee not registered',
        code: 'NOT_REGISTERED'
      });
    }

    req.employee = employee;
    req.employeeId = employee.employeeId;
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

const authorizeHR = (req, res, next) => {
  if (!req.employee) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.employee.role === 'hr' || req.employee.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'HR authorization required'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorizeHR
};