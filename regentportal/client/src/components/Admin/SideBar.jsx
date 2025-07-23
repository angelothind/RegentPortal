import '../../styles/UserLayout/SideBar.css';

const SideBar = ({ user, onSelect, onLogout }) => {
  if (!user) return null;

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Regent Portal</h2>
      <ul className="sidebar-nav">
        {user.userType === 'Admin' && (
          <>
            <li><button onClick={() => onSelect('admin')}>Admin</button></li>
            <li><button onClick={() => onSelect('teachers')}>Teachers</button></li>
            <li><button onClick={() => onSelect('students')}>Students</button></li>
          </>
        )}

        <li><button className="logout" onClick={onLogout}>Logout</button></li>
      </ul>
    </div>
  );
};

export default SideBar;