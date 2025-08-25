import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SideBar from '../components/Admin/SideBar';
import StudentTable from '../components/Admin/StudentTable';
import TeacherTable from '../components/Admin/TeacherTable';
import AdminInfo from '../components/Admin/AdminTable';
import '../styles/Admin/AdminDashboard.css';

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
    console.log('Rendering content for view:', selectedView);
    switch (selectedView) {
      case 'students':
        console.log('Rendering StudentTable');
        return <StudentTable />;
      case 'teachers':
        console.log('Rendering TeacherTable');
        return <TeacherTable />;
      case 'admin':
        console.log('Rendering AdminInfo');
        return <AdminInfo />;
      default:
        console.log('Rendering invalid view');
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