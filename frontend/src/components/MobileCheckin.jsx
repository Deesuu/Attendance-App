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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Employee Check-in
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Scan the QR code at the office entrance
            </p>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${location ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {location ? 'GPS Active' : 'Acquiring GPS...'}
                </span>
              </div>
              <button
                onClick={getCurrentLocation}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Refresh
              </button>
            </div>
            {location && (
              <p className="text-xs text-gray-500 mt-1">
                Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                {location.accuracy && ` (Accuracy: +/-${location.accuracy.toFixed(0)}m)`}
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-500 mt-1">{locationError}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                QR Code Status
              </span>
              <span className={`text-xs font-medium ${qrData ? 'text-green-600' : 'text-yellow-600'}`}>
                {qrData ? 'Scanned' : 'Not scanned'}
              </span>
            </div>
            {qrData && (
              <p className="text-xs text-gray-500 mt-1">
                Token: {qrData.token.substring(0, 20)}...
              </p>
            )}
            {!qrData && (
              <button
                onClick={handleRescanQR}
                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                Scan QR Code
              </button>
            )}
          </div>

          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your employee ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCheckInType('IN')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    checkInType === 'IN'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Check In
                </button>
                <button
                  type="button"
                  onClick={() => setCheckInType('OUT')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                    checkInType === 'OUT'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Check Out
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !location || !qrData}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <ThreeDots color="white" height={30} width={30} />
              ) : (
                `Check ${checkInType === 'IN' ? 'In' : 'Out'}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
              Device ID: {deviceId.substring(0, 12)}...
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckin;