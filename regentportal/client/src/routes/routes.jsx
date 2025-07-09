// routes/routes.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import AdminDashboard from '../pages/AdminDashboard'

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
);

export default AppRoutes;