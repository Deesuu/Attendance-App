import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { format } from 'date-fns';
import api from '../utils/api';

const TabletDisplay = () => {
  const [qrToken, setQrToken] = useState('');
  const [timestamp, setTimestamp] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateToken = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/attendance/token');
        setQrToken(response.data.token);
        setTimestamp(new Date());
      } catch (error) {
        console.error('Failed to generate QR token:', error);
        const fallbackToken = btoa(`${Date.now()}:${Math.random()}`);
        setQrToken(fallbackToken);
      } finally {
        setIsLoading(false);
      }
    };

    generateToken();
    const tokenInterval = setInterval(generateToken, 5000);

    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchRecentCheckIns = async () => {
      try {
        const response = await api.get('/attendance/today/stats');
        setCheckIns(response.data.details || []);
      } catch (error) {
        console.error('Failed to fetch check-ins:', error);
      }
    };

    fetchRecentCheckIns();
    const checkInInterval = setInterval(fetchRecentCheckIns, 30000);

    return () => {
      clearInterval(tokenInterval);
      clearInterval(clockInterval);
      clearInterval(checkInInterval);
    };
  }, []);

  const qrValue = `http://localhost:3000/checkin?q=${encodeURIComponent(JSON.stringify({
    token: qrToken,
    timestamp: timestamp.toISOString()
  }))}`;

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
        {/* Header Card */}
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
                fontSize: '32px',
                fontWeight: '700',
                color: '#4a3520',
                margin: 0
              }}>
                Attendance System
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#8b7a66',
                margin: '4px 0 0',
                fontWeight: '500'
              }}>
                Scan to check-in / check-out
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '42px',
                fontFamily: 'monospace',
                fontWeight: '700',
                color: '#6b4c2a',
                letterSpacing: '1px'
              }}>
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8b7a66',
                fontWeight: '500'
              }}>
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(139, 115, 85, 0.15)',
          border: '1px solid #e8ddd0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              background: '#faf6f0',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(139, 115, 85, 0.1)',
              border: '2px solid #e8ddd0'
            }}>
              <QRCode 
                value={qrValue}
                size={280}
                level="H"
                includeMargin={true}
                renderAs="svg"
                fgColor="#4a3520"
                bgColor="#faf6f0"
              />
            </div>
            {isLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: '12px'
              }}>
                <div className="animate-spin" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '4px solid #e8ddd0',
                  borderTopColor: '#6b4c2a'
                }}></div>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              background: '#f5efe6',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isLoading ? '#d4a373' : '#5a8f6c'
              }}></div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#4a3520'
              }}>
                {isLoading ? 'Generating...' : 'Ready to scan'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <p style={{
              fontSize: '14px',
              color: '#8b7a66',
              margin: 0
            }}>
              Token expires in <span style={{
                fontFamily: 'monospace',
                fontWeight: '700',
                color: '#b45309',
                fontSize: '16px'
              }}>5 seconds</span>
            </p>
            <p style={{
              fontSize: '12px',
              color: '#b8a692',
              margin: '4px 0 0'
            }}>
              Generated at: {format(timestamp, 'HH:mm:ss.SSS')}
            </p>
          </div>
        </div>

        {/* Today's Check-ins Card */}
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
              Today's Check-ins
            </h2>
            <span style={{
              background: '#f5efe6',
              color: '#6b4c2a',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {checkIns.length} records
            </span>
          </div>
          
          {checkIns.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              color: '#b8a692'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px', opacity: '0.5' }}>◻</div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#8b7a66' }}>
                No check-ins recorded today
              </p>
              <p style={{ fontSize: '14px', marginTop: '4px', color: '#b8a692' }}>
                Employees will appear here once they check in
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
                      Employee ID
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
                      Check In
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
                      Check Out
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
                  {checkIns.map((record, index) => (
                    <tr key={index} style={{
                      borderTop: '1px solid #f0e8de',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{
                        padding: '12px 16px',
                        fontWeight: '600',
                        color: '#4a3520'
                      }}>
                        {record._id}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        {record.checkIns > 0 ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#2d6a4f',
                            fontWeight: '600'
                          }}>
                            Yes
                          </span>
                        ) : (
                          <span style={{ color: '#b8a692' }}>—</span>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        {record.checkOuts > 0 ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#9c2e2e',
                            fontWeight: '600'
                          }}>
                            Yes
                          </span>
                        ) : (
                          <span style={{ color: '#b8a692' }}>—</span>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#e6f0ea',
                          color: '#2d6a4f'
                        }}>
                          Present
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

export default TabletDisplay;