export const generateDeviceId = () => {
  let deviceId = localStorage.getItem('attendance_device_id');
  
  if (deviceId) {
    return deviceId;
  }

  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  deviceId = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  localStorage.setItem('attendance_device_id', deviceId);
  return deviceId;
};

export const getDeviceId = () => {
  return localStorage.getItem('attendance_device_id');
};

export const clearDeviceId = () => {
  localStorage.removeItem('attendance_device_id');
};