import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThreeDots } from 'react-loader-spinner';
import api from '../utils/api';
import { generateDeviceId, getDeviceId } from '../utils/deviceId';

const EmployeeRegistration = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { employeeId, name, email, department } = formData;

    if (!employeeId || !name || !email) {
      toast.error('Please fill all required fields');
      return;
    }

    const deviceId = getDeviceId() || generateDeviceId();

    setIsLoading(true);

    try {
      const payload = {
        employeeId: employeeId.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        department: department.trim(),
        deviceId
      };

      const response = await api.post('/employees/register', payload);

      if (response.data.success) {
        toast.success('Registration successful!');
        if (response.data.token) {
          localStorage.setItem('attendance_token', response.data.token);
        }
        setTimeout(() => {
          navigate('/checkin');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        maxWidth: '500px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
          border: '1px solid #e8ddd0'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-block',
              background: '#6b4c2a',
              padding: '10px 24px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}>
                Registration
              </span>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#4a3520',
              margin: '8px 0 4px'
            }}>
              Employee Registration
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#8b7a66',
              margin: 0
            }}>
              Register your device for attendance
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Employee ID <span style={{ color: '#9c2e2e' }}>*</span>
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g., EMP001"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: '#faf6f0',
                  color: '#4a3520',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b4c2a';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(107, 76, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ddd0';
                  e.target.style.background = '#faf6f0';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Full Name <span style={{ color: '#9c2e2e' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: '#faf6f0',
                  color: '#4a3520',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b4c2a';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(107, 76, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ddd0';
                  e.target.style.background = '#faf6f0';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Email <span style={{ color: '#9c2e2e' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: '#faf6f0',
                  color: '#4a3520',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b4c2a';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(107, 76, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ddd0';
                  e.target.style.background = '#faf6f0';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g., Engineering"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e8ddd0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  background: '#faf6f0',
                  color: '#4a3520',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b4c2a';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(107, 76, 42, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e8ddd0';
                  e.target.style.background = '#faf6f0';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
              />
            </div>

            <div style={{
              background: '#f5efe6',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #e8ddd0'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#8b7a66',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#5a8f6c'
                }}></span>
                <span style={{ fontWeight: '600', color: '#4a3520' }}>Device ID:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#4a3520',
                  background: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}>
                  {(getDeviceId() || generateDeviceId()).substring(0, 16)}...
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                background: '#6b4c2a',
                color: '#ffffff',
                padding: '14px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(107, 76, 42, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#5a3d22';
                  e.target.style.boxShadow = '0 4px 12px rgba(107, 76, 42, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#6b4c2a';
                e.target.style.boxShadow = '0 2px 8px rgba(107, 76, 42, 0.3)';
              }}
            >
              {isLoading ? (
                <ThreeDots color="#ffffff" height={30} width={30} />
              ) : (
                'Register Device'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#fdf6ed',
            borderRadius: '8px',
            border: '1px solid #e8d5b8'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#8b6914',
              textAlign: 'center',
              margin: 0
            }}>
              This registration is a one-time process. Your device will be locked to your account.
            </p>
          </div>

          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#8b7a66',
              margin: 0
            }}>
              Already registered? <a href="/checkin" style={{
                color: '#6b4c2a',
                fontWeight: '600',
                textDecoration: 'none',
                borderBottom: '2px solid #6b4c2a'
              }}>Check In</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegistration;