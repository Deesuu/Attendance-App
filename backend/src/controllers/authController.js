const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth');

const registerEmployee = async (req, res) => {
  try {
    const { employeeId, name, email, deviceId, department } = req.body;

    let employee = await Employee.findOne({ employeeId });
    if (employee) {
      if (!employee.isRegistered) {
        employee.deviceId = deviceId;
        employee.isRegistered = true;
        employee.registrationDate = new Date();
        await employee.save();

        const token = generateToken(employee.employeeId);

        return res.status(200).json({
          success: true,
          message: 'Employee registration completed',
          token: token,
          data: {
            employeeId: employee.employeeId,
            name: employee.name,
            email: employee.email,
            deviceId: employee.deviceId
          }
        });
      }

      return res.status(409).json({
        success: false,
        message: 'Employee already registered',
        code: 'EMPLOYEE_EXISTS'
      });
    }

    employee = new Employee({
      employeeId,
      name,
      email,
      deviceId,
      department,
      isRegistered: true,
      registrationDate: new Date()
    });

    await employee.save();

    const token = generateToken(employee.employeeId);

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      token: token,
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        deviceId: employee.deviceId,
        department: employee.department
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Duplicate ${field}. This value is already in use.`,
        code: 'DUPLICATE_KEY'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const verifyEmployee = async (req, res) => {
  try {
    const { employeeId, deviceId } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
        code: 'NOT_FOUND'
      });
    }

    if (!employee.isRegistered) {
      return res.status(403).json({
        success: false,
        message: 'Employee not registered. Complete registration first.',
        code: 'NOT_REGISTERED'
      });
    }

    if (employee.deviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'Device mismatch. Use your registered device.',
        code: 'DEVICE_MISMATCH'
      });
    }

    const token = generateToken(employee.employeeId);

    res.json({
      success: true,
      message: 'Employee verified',
      token: token,
      data: {
        employeeId: employee.employeeId,
        name: employee.name,
        department: employee.department
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find(
      { isRegistered: true },
      { __v: 0, _id: 0 }
    ).sort({ name: 1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees
    });

  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees'
    });
  }
};

module.exports = {
  registerEmployee,
  verifyEmployee,
  getAllEmployees
};