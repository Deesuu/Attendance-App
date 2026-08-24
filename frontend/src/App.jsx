import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TabletDisplay from './components/TabletDisplay';
import MobileCheckin from './components/MobileCheckin';
import EmployeeRegistration from './components/EmployeeRegistration';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<TabletDisplay />} />
          <Route path="/checkin" element={<MobileCheckin />} />
          <Route path="/register" element={<EmployeeRegistration />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;