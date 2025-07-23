import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SideBar from '../components/Admin/SideBar';
import StudentTable from '../components/Admin/StudentTable';
import TeacherTable from '../components/Admin/TeacherTable';
import AdminInfo from '../components/Admin/AdminTable';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user =
    location.state?.user || JSON.parse(localStorage.getItem('user'));

  const [selectedView, setSelectedView] = useState('students'); // default view

  if (!user) return <p>Unauthorized</p>;

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear stored user
    navigate('/'); // Redirect to login or landing page
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'students':
        return <StudentTable />;
      case 'teachers':
        return <TeacherTable />;
      case 'admin':
        return <AdminInfo />;
      default:
        return <p>Invalid view</p>;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar-container">
        <SideBar user={user} onSelect={setSelectedView} onLogout={handleLogout} />
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;