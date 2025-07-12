import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import SideBar from '../components/UserLayout/SideBar';
import StudentTable from '../components/Admin/StudentTable';
import TeacherTable from '../components/Admin/TeacherTable';
import AdminInfo from '../components/Admin/AdminTable';

const AdminDashboard = () => {
  const location = useLocation();
  const user =
    location.state?.user || JSON.parse(localStorage.getItem('user'));

  const [selectedView, setSelectedView] = useState('students'); // default view

  if (!user) return <p>Unauthorized</p>;

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
      <SideBar user={user} onSelect={setSelectedView} />
    </div>
    <div className="main-content">
      {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;