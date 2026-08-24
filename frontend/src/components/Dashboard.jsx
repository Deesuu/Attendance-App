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
      <div style={{
        minHeight: '100vh',
        background: '#f5efe6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="animate-spin" style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid #e8ddd0',
          borderTopColor: '#6b4c2a'
        }}></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5efe6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto'
      }}>
        {/* Welcome Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '30px 40px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
          border: '1px solid #e8ddd0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#4a3520',
                margin: 0
              }}>
                Welcome, {employeeInfo?.name || 'Employee'}
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#8b7a66',
                margin: '4px 0 0'
              }}>
                ID: {employeeInfo?.employeeId || 'N/A'}
              </p>
            </div>
            <div style={{
              textAlign: 'right'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#8b7a66',
                fontWeight: '500',
                margin: 0
              }}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
              border: '1px solid #e8ddd0',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#8b7a66',
                fontWeight: '500',
                margin: 0
              }}>
                Total Check-ins Today
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#4a3520',
                margin: '4px 0 0'
              }}>
                {stats.details?.reduce((sum, d) => sum + d.checkIns, 0) || 0}
              </p>
            </div>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
              border: '1px solid #e8ddd0',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#8b7a66',
                fontWeight: '500',
                margin: 0
              }}>
                Active Employees
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#4a3520',
                margin: '4px 0 0'
              }}>
                {stats.presentToday || 0}
              </p>
            </div>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
              border: '1px solid #e8ddd0',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#8b7a66',
                fontWeight: '500',
                margin: 0
              }}>
                Total Employees
              </p>
              <p style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#4a3520',
                margin: '4px 0 0'
              }}>
                {stats.totalEmployees || 0}
              </p>
            </div>
          </div>
        )}

        {/* Recent Attendance Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '30px 40px',
          boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
          border: '1px solid #e8ddd0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#4a3520',
              margin: 0
            }}>
              Recent Attendance
            </h2>
            <span style={{
              background: '#f5efe6',
              color: '#6b4c2a',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {attendance.length} records
            </span>
          </div>
          
          {attendance.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#b8a692'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px', opacity: '0.5' }}>◻</div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#8b7a66' }}>
                No attendance records found
              </p>
              <p style={{ fontSize: '14px', marginTop: '4px', color: '#b8a692' }}>
                Your check-ins will appear here
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    background: '#f5efe6',
                    borderRadius: '6px'
                  }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#6b4c2a',
                      fontWeight: '600',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Date & Time
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: '#6b4c2a',
                      fontWeight: '600',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Type
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      color: '#6b4c2a',
                      fontWeight: '600',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => (
                    <tr key={index} style={{
                      borderTop: '1px solid #f0e8de',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{
                        padding: '12px 16px',
                        color: '#4a3520'
                      }}>
                        {format(new Date(record.timestamp), 'MMM d, HH:mm')}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: record.checkInType === 'IN' ? '#e6f0ea' : '#fde8e8',
                          color: record.checkInType === 'IN' ? '#2d6a4f' : '#9c2e2e'
                        }}>
                          {record.checkInType}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#e6f0ea',
                          color: '#2d6a4f'
                        }}>
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

        {/* Quick Actions */}
        <div style={{
          marginTop: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          <button
            onClick={() => navigate('/checkin')}
            style={{
              background: '#6b4c2a',
              color: '#ffffff',
              padding: '14px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(107, 76, 42, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#5a3d22';
              e.target.style.boxShadow = '0 4px 12px rgba(107, 76, 42, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#6b4c2a';
              e.target.style.boxShadow = '0 2px 8px rgba(107, 76, 42, 0.3)';
            }}
          >
            Check In
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              background: '#f5efe6',
              color: '#4a3520',
              padding: '14px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '15px',
              border: '2px solid #e8ddd0',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e8ddd0';
              e.target.style.borderColor = '#6b4c2a';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f5efe6';
              e.target.style.borderColor = '#e8ddd0';
            }}
          >
            Register Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;