import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [empRes, attRes, statsRes] = await Promise.all([
        api.get('/employees/all'),
        api.get('/attendance/all?limit=200'),
        api.get('/attendance/today/stats')
      ]);

      if (empRes.data.success) setEmployees(empRes.data.data);
      if (attRes.data.success) setAttendance(attRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data);
    } catch (error) {
      console.error('Admin dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter(e =>
    e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendance = attendance.filter(a =>
    a.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      padding: '30px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>

        {/* Header */}
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
            gap: '12px'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#4a3520',
                margin: 0
              }}>
                VeriStaff Admin Dashboard
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#8b7a66',
                margin: '4px 0 0'
              }}>
                Overview of all employees and attendance records
              </p>
            </div>
            <a href="/" style={{
              fontSize: '13px',
              color: '#6b4c2a',
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: '2px solid #6b4c2a',
              paddingBottom: '2px'
            }}>
              Back to Tablet
            </a>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <StatCard label="Total Registered" value={employees.length} />
            <StatCard label="Present Today" value={stats.presentToday || 0} />
            <StatCard label="Total Check-ins" value={attendance.length} />
            <StatCard
              label="Present Rate"
              value={`${employees.length > 0 ? Math.round((stats.presentToday / employees.length) * 100) : 0}%`}
            />
          </div>
        )}

        {/* Tabs + Search */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px 30px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
          border: '1px solid #e8ddd0',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setActiveTab('employees')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'employees' ? '#6b4c2a' : '#f5efe6',
              color: activeTab === 'employees' ? '#ffffff' : '#4a3520'
            }}
          >
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'attendance' ? '#6b4c2a' : '#f5efe6',
              color: activeTab === 'attendance' ? '#ffffff' : '#4a3520'
            }}
          >
            Attendance ({attendance.length})
          </button>

          <input
            type="text"
            placeholder="Search by ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '2px solid #e8ddd0',
              fontSize: '14px',
              marginLeft: 'auto',
              background: '#faf6f0',
              color: '#4a3520',
              outline: 'none'
            }}
          />

          <button
            onClick={loadAllData}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              border: '2px solid #e8ddd0',
              cursor: 'pointer',
              background: '#ffffff',
              color: '#6b4c2a'
            }}
          >
            Refresh
          </button>
        </div>

        {/* Employees Table */}
        {activeTab === 'employees' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
            border: '1px solid #e8ddd0',
            overflowX: 'auto'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#4a3520',
              marginBottom: '16px'
            }}>
              All Registered Employees
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5efe6' }}>
                  <th style={thStyle}>Employee ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f0e8de' }}>
                    <td style={tdStyle}><strong>{emp.employeeId}</strong></td>
                    <td style={tdStyle}>{emp.name}</td>
                    <td style={tdStyle}>{emp.email}</td>
                    <td style={tdStyle}>{emp.department || '-'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#e6f0ea',
                        color: '#2d6a4f'
                      }}>
                        {emp.role || 'employee'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {emp.registrationDate ? format(new Date(emp.registrationDate), 'MMM d, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#8b7a66' }}>
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Attendance Table */}
        {activeTab === 'attendance' && (
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
            border: '1px solid #e8ddd0',
            overflowX: 'auto'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#4a3520',
              marginBottom: '16px'
            }}>
              All Attendance Records
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5efe6' }}>
                  <th style={thStyle}>Employee ID</th>
                  <th style={thStyle}>Date & Time</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((rec, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f0e8de' }}>
                    <td style={tdStyle}><strong>{rec.employeeId}</strong></td>
                    <td style={tdStyle}>{format(new Date(rec.timestamp), 'MMM d, yyyy HH:mm')}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: rec.checkInType === 'IN' ? '#e6f0ea' : '#fde8e8',
                        color: rec.checkInType === 'IN' ? '#2d6a4f' : '#9c2e2e'
                      }}>
                        {rec.checkInType}
                      </span>
                    </td>
                    <td style={tdStyle}>{rec.status}</td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: '#8b7a66' }}>
                      {rec.location?.latitude ? `${rec.location.latitude.toFixed(4)}, ${rec.location.longitude.toFixed(4)}` : '-'}
                    </td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#8b7a66' }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
    border: '1px solid #e8ddd0',
    textAlign: 'center'
  }}>
    <p style={{ fontSize: '13px', color: '#8b7a66', margin: 0, fontWeight: '500' }}>{label}</p>
    <p style={{ fontSize: '28px', fontWeight: '700', color: '#4a3520', margin: '6px 0 0' }}>{value}</p>
  </div>
);

const thStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  color: '#6b4c2a',
  fontWeight: '600',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '12px 16px',
  color: '#4a3520'
};

export default AdminDashboard;