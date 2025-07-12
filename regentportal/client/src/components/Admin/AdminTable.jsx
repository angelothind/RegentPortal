import React, { useEffect, useState } from 'react';
import '../../styles/Admin/AdminTable.css';

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/admins'); // Adjust to your actual endpoint
        const data = await response.json();
        setAdmins(data.admins || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admins:', err);
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleCreateAdmin = () => {
    console.log('➕ Create Admin clicked');
    // TODO: implement modal or redirect for creating admin
  };

  if (loading) return <p>Loading admins...</p>;

  return (
    <div className="admin-table-container">
      <div className="admin-header">
        <h2>Admins</h2>
        <button className="create-button" onClick={handleCreateAdmin}>
          Create Admin
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr>
              <td colSpan="3">No admins found.</td>
            </tr>
          ) : (
            admins.map((admin, index) => (
              <tr key={index}>
                <td>{admin.name}</td>
                <td>{admin.username}</td>
                <td>{admin.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;