// routes/routes.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/teacher" element={<LandingPage />} />
  </Routes>
);

export default AppRoutes;