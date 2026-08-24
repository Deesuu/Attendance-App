import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ThreeDots } from 'react-loader-spinner';
import api from '../utils/api';
import { generateDeviceId, getDeviceId } from '../utils/deviceId';

const MobileCheckin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [checkInType, setCheckInType] = useState('IN');
  const [deviceId, setDeviceId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const devId = getDeviceId() || generateDeviceId();
    setDeviceId(devId);

    getCurrentLocation();

    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('q');
    if (qrParam) {
      try {
        const data = JSON.parse(decodeURIComponent(qrParam));
        setQrData(data);
        toast.success('QR code detected');
      } catch (error) {
        toast.error('Invalid QR code format');
      }
    }
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLocationError(null);
        toast.success('Location captured');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError(`Location error: ${error.message}`);
        toast.error('Failed to get location. Enable GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();

    if (!employeeId.trim()) {
      toast.error('Enter your Employee ID');
      return;
    }

    if (!location) {
      toast.error('Wait for location to be captured');
      return;
    }

    if (!qrData?.token) {
      toast.error('No QR token detected. Scan the QR code.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        employeeId: employeeId.trim(),
        deviceId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        qrToken: qrData.token,
        checkInType
      };

      const response = await api.post('/attendance/checkin', payload);

      if (response.data.success) {
        toast.success(`Checked ${checkInType === 'IN' ? 'in' : 'out'} successfully`);
        setEmployeeId('');
        setCheckInType('IN');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      
      let errorMessage = 'Check-in failed. Try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      
      if (error.response?.data?.code === 'OUTSIDE_GEOFENCE') {
        toast.error(`You are ${error.response.data.distance?.toFixed(1)}m from the office. Move closer.`);
      } else if (error.response?.data?.code === 'DEVICE_MISMATCH') {
        toast.error('This device is not registered to you. Contact HR.');
      } else if (error.response?.data?.code === 'INVALID_TOKEN') {
        toast.error('QR code expired. Scan a fresh code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescanQR = () => {
    toast('Scan the QR code from the office tablet');
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-block',
              background: '#6b4c2a',
              padding: '8px 20px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.5px'
              }}>
                Check-in
              </span>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#4a3520',
              margin: '8px 0 4px'
            }}>
              Employee Check-in
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#8b7a66',
              margin: 0
            }}>
              Scan the QR code at the office entrance
            </p>
          </div>

          {/* GPS Status */}
          <div style={{
            background: '#f5efe6',
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid #e8ddd0',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: location ? '#5a8f6c' : '#d4a373'
                }}></div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4a3520'
                }}>
                  {location ? 'GPS Active' : 'Acquiring GPS...'}
                </span>
              </div>
              <button
                onClick={getCurrentLocation}
                style={{
                  fontSize: '12px',
                  color: '#6b4c2a',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                Refresh
              </button>
            </div>
            {location && (
              <p style={{
                fontSize: '12px',
                color: '#8b7a66',
                marginTop: '6px'
              }}>
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                {location.accuracy && ` (Accuracy: +/-${location.accuracy.toFixed(0)}m)`}
              </p>
            )}
            {locationError && (
              <p style={{
                fontSize: '12px',
                color: '#9c2e2e',
                marginTop: '6px'
              }}>
                {locationError}
              </p>
            )}
          </div>

          {/* QR Status */}
          <div style={{
            background: '#fdf6ed',
            padding: '14px 16px',
            borderRadius: '8px',
            border: '1px solid #e8d5b8',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520'
              }}>
                QR Code Status
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: qrData ? '#2d6a4f' : '#b45309'
              }}>
                {qrData ? 'Scanned' : 'Not scanned'}
              </span>
            </div>
            {qrData && (
              <p style={{
                fontSize: '11px',
                color: '#8b7a66',
                marginTop: '4px',
                fontFamily: 'monospace'
              }}>
                Token: {qrData.token.substring(0, 20)}...
              </p>
            )}
            {!qrData && (
              <button
                onClick={handleRescanQR}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b4c2a',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Scan QR Code
              </button>
            )}
          </div>

          {/* Check-in Form */}
          <form onSubmit={handleCheckIn} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee ID"
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

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520',
                marginBottom: '6px'
              }}>
                Check-in Type
              </label>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setCheckInType('IN')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '2px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: checkInType === 'IN' ? '#6b4c2a' : '#faf6f0',
                    borderColor: checkInType === 'IN' ? '#6b4c2a' : '#e8ddd0',
                    color: checkInType === 'IN' ? '#ffffff' : '#4a3520'
                  }}
                >
                  Check In
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInType('OUT')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '2px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: checkInType === 'OUT' ? '#6b4c2a' : '#faf6f0',
                    borderColor: checkInType === 'OUT' ? '#6b4c2a' : '#e8ddd0',
                    color: checkInType === 'OUT' ? '#ffffff' : '#4a3520'
                  }}
                >
                  Check Out
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !location || !qrData}
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
                opacity: (isLoading || !location || !qrData) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(107, 76, 42, 0.3)',
                marginTop: '4px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && location && qrData) {
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
                `Check ${checkInType === 'IN' ? 'In' : 'Out'}`
              )}
            </button>

            <div style={{
              background: '#f5efe6',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #e8ddd0',
              marginTop: '4px'
            }}>
              <p style={{
                fontSize: '11px',
                color: '#8b7a66',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#5a8f6c'
                }}></span>
                <span style={{ fontWeight: '600', color: '#4a3520' }}>Device:</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  color: '#4a3520'
                }}>
                  {deviceId.substring(0, 12)}...
                </span>
              </p>
            </div>
          </form>

          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#8b7a66',
              margin: 0
            }}>
              Need to register? <a href="/register" style={{
                color: '#6b4c2a',
                fontWeight: '600',
                textDecoration: 'none',
                borderBottom: '2px solid #6b4c2a'
              }}>Register Device</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckin;