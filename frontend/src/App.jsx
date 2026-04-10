import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import TeacherManager from './pages/TeacherManager';
import SubjectManager from './pages/SubjectManager';
import ClassManager from './pages/ClassManager';
import RoomManager from './pages/RoomManager';
import TimetableDisplay from './pages/TimetableDisplay';
import Analytics from './pages/Analytics';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('smartsched_token');
    if (token) setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        
        {/* Protected Routes inside Dashboard Layout */}
        <Route path="/" element={isAuthenticated ? <DashboardLayout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />}>
          <Route index element={<DashboardHome />} />
          <Route path="teachers" element={<TeacherManager />} />
          <Route path="subjects" element={<SubjectManager />} />
          <Route path="classes" element={<ClassManager />} />
          <Route path="rooms" element={<RoomManager />} />
          <Route path="timetable" element={<TimetableDisplay />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
