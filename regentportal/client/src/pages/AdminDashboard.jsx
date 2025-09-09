import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SideBar from '../components/Admin/SideBar';
import StudentTable from '../components/Admin/StudentTable';
import TeacherTable from '../components/Admin/TeacherTable';
import AdminInfo from '../components/Admin/AdminTable';
import '../styles/Admin/AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedView, setSelectedView] = useState('students'); // default view

  // Get user data from navigation state or localStorage with validation
  useEffect(() => {
    const userData = location.state?.user;
    console.log('🔍 AdminDashboard received userData from location.state:', userData);
    
    if (userData) {
      setUser(userData);
    } else {
      // Fallback to localStorage if navigation state is not available
      const storedUser = localStorage.getItem('user');
      const currentUserId = localStorage.getItem('currentUserId');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 AdminDashboard using user data from localStorage:', parsedUser);
          console.log('🔍 Current user ID from localStorage:', currentUserId);
          
          // TEMPORARILY DISABLED: Validate that the stored user matches the current user ID
          if (currentUserId && parsedUser._id !== currentUserId) {
            console.warn('⚠️ WARNING: Stored user data does not match current user ID!');
            console.warn('⚠️ Stored user ID:', parsedUser._id);
            console.warn('⚠️ Current user ID:', currentUserId);
            console.warn('⚠️ This could cause cross-user data leakage!');
            
            // TEMPORARILY DISABLED: Clear potentially corrupted user data
            // localStorage.removeItem('user');
            // localStorage.removeItem('currentUserId');
            // alert('Security Error: User session mismatch detected. Please log in again.');
            // navigate('/');
            // return;
          }
          
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ Error parsing user data from localStorage:', error);
        }
      } else {
        console.log('❌ No user data found in navigation state or localStorage');
      }
    }
  }, [location, navigate]);

  if (!user) return <p>Unauthorized</p>;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
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