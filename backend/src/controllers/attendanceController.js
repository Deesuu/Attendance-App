const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { validateQRToken } = require('../utils/crypto');
const { isWithinGeofence } = require('../utils/geolocation');

const OFFICE_LAT = parseFloat(process.env.OFFICE_LATITUDE);
const OFFICE_LON = parseFloat(process.env.OFFICE_LONGITUDE);
const GEOFENCE_RADIUS = parseFloat(process.env.GEOFENCE_RADIUS_METERS) || 20;

const checkIn = async (req, res) => {
  try {
    const { 
      employeeId, 
      deviceId, 
      latitude, 
      longitude, 
      qrToken,
      checkInType = 'IN'
    } = req.body;

    const tokenValidation = validateQRToken(qrToken);
    if (!tokenValidation.valid) {
      return res.status(400).json({
        success: false,
        message: `QR token validation failed: ${tokenValidation.error}`,
        code: 'INVALID_TOKEN'
      });
    }

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
        code: 'EMPLOYEE_NOT_FOUND'
      });
    }

    if (employee.deviceId !== deviceId) {
      return res.status(403).json({
        success: false,
        message: 'Device not registered for this employee',
        code: 'DEVICE_MISMATCH'
      });
    }

    const deviceCheck = await Employee.findOne({ deviceId, employeeId: { $ne: employeeId } });
    if (deviceCheck) {
      return res.status(403).json({
        success: false,
        message: 'This device is already registered to another employee',
        code: 'DEVICE_ALREADY_USED'
      });
    }

    let locationData = null;
    if (latitude && longitude) {
      const geoCheck = isWithinGeofence(
        latitude, longitude,
        OFFICE_LAT, OFFICE_LON,
        GEOFENCE_RADIUS
      );

      if (!geoCheck.within) {
        return res.status(403).json({
          success: false,
          message: `Outside office geofence. Distance: ${geoCheck.distance.toFixed(1)}m (max: ${GEOFENCE_RADIUS}m)`,
          code: 'OUTSIDE_GEOFENCE',
          distance: geoCheck.distance
        });
      }

      locationData = {
        latitude,
        longitude,
        accuracy: req.body.accuracy || null
      };
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCheckIn = await Attendance.findOne({
      employeeId,
      timestamp: { $gte: fiveMinutesAgo },
      checkInType
    });

    if (recentCheckIn) {
      return res.status(409).json({
        success: false,
        message: `Already checked ${checkInType === 'IN' ? 'in' : 'out'} within last 5 minutes`,
        code: 'DUPLICATE_CHECKIN',
        lastCheckIn: recentCheckIn.timestamp
      });
    }

    const attendance = new Attendance({
      employeeId,
      timestamp: new Date(),
      status: 'Present',
      checkInType,
      location: locationData,
      deviceId,
      qrToken,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: `Successfully checked ${checkInType === 'IN' ? 'in' : 'out'}`,
      data: {
        employeeId,
        name: employee.name,
        timestamp: attendance.timestamp,
        checkInType,
        location: locationData
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;

    const query = { employeeId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance history'
    });
  }
};

const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Attendance.aggregate([
      {
        $match: {
          timestamp: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$employeeId',
          checkIns: {
            $sum: { $cond: [{ $eq: ['$checkInType', 'IN'] }, 1, 0] }
          },
          checkOuts: {
            $sum: { $cond: [{ $eq: ['$checkInType', 'OUT'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalEmployees = await Employee.countDocuments({ isRegistered: true });

    res.json({
      success: true,
      date: today,
      totalEmployees,
      presentToday: stats.length,
      details: stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s stats'
    });
  }
};

module.exports = {
  checkIn,
  getAttendanceHistory,
  getTodayStats
};