import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../utils/api';
import { getDeviceId } from '../utils/deviceId';

const Dashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttendanceData();
    fetchTodayStats();
    fetchEmployeeInfo();

    const interval = setInterval(() => {
      fetchTodayStats();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchEmployeeInfo = async () => {
    try {
      const deviceId = getDeviceId();
      const response = await api.post('/employees/verify', { deviceId });
      if (response.data.success) {
        setEmployeeInfo(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch employee info:', error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const deviceId = getDeviceId();
      const response = await api.get(`/attendance/history/${deviceId}?limit=10`);
      if (response.data.success) {
        setAttendance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to load attendance history');
    }
  };

  const fetchTodayStats = async () => {
    try {
      const response = await api.get('/attendance/today/stats');
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {employeeInfo?.name || 'Employee'}
              </h1>
              <p className="text-sm text-gray-600">
                ID: {employeeInfo?.employeeId || 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500">Total Check-ins Today</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.details?.reduce((sum, d) => sum + d.checkIns, 0) || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500">Active Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.presentToday || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalEmployees || 0}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Attendance
          </h2>
          {attendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No attendance records found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600">Date & Time</th>
                    <th className="px-4 py-2 text-left text-gray-600">Type</th>
                    <th className="px-4 py-2 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-600">
                        {format(new Date(record.timestamp), 'MMM d, HH:mm')}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.checkInType === 'IN' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.checkInType}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;