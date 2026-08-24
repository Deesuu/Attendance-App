export const generateDeviceId = () => {
  let deviceId = localStorage.getItem('attendance_device_id');
  
  if (deviceId) {
    return deviceId;
  }

  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.hardwareConcurrency || 0,
    navigator.deviceMemory || 0
  ];

  const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16).padStart(8, '0');
  };

  const fingerprint = components.join('|');
  const newDeviceId = Array.from({ length: 8 }, () => hash(fingerprint + Math.random()))
    .join('')
    .slice(0, 64);

  localStorage.setItem('attendance_device_id', newDeviceId);
  
  return newDeviceId;
};

export const getDeviceId = () => {
  return localStorage.getItem('attendance_device_id');
};

export const clearDeviceId = () => {
  localStorage.removeItem('attendance_device_id');
};