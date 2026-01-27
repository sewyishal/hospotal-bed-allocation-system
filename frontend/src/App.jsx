import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BedManagement from './pages/BedManagement';
import WaitingQueue from './pages/WaitingQueue';
import Admission from './pages/Admission';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beds" element={<BedManagement />} />
          <Route path="/queue" element={<WaitingQueue />} />
          <Route path="/admit" element={<Admission />} />
          <Route path="/reports" element={<div className="text-gray-500">Reports Module (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="text-gray-500">Settings Module (Coming Soon)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
