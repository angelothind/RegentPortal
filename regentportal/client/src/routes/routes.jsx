// routes/routes.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import AdminDashboard from '../pages/AdminDashboard'
import StudentDashboard from '../pages/StudentDashboard'
import TeacherDashboard from '../pages/TeacherDashboard'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/student" element={<StudentDashboard />} />
    <Route path="/teacher" element={<TeacherDashboard />} />
  </Routes>
);

export default AppRoutes;