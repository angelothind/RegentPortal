import React, { useEffect, useState } from 'react';
import '../../styles/Admin/AdminTable.css';

const AdminTable = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', password: '' });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/lookup/lookupadmins');
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
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setNewAdmin({ ...newAdmin, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = newAdmin;
    if (!username || !password) return alert('Username and password required');

    try {
      const response = await fetch('/api/create/createadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create admin');

      setAdmins([...admins, { _id: data._id, username: data.username }]);
      setShowModal(false);
      setNewAdmin({ username: '', password: '' });
    } catch (err) {
      console.error('Error creating admin:', err);
      alert('❌ Failed to create admin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admin?')) return;

    try {
      const res = await fetch(`/api/delete/deleteadmin/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setAdmins(admins.filter((admin) => admin._id !== id));
    } catch (err) {
      console.error('Error deleting admin:', err);
      alert('❌ Could not delete admin');
    }
  };

  if (loading) return <p>Loading admins...</p>;

  console.log('Rendering AdminTable with admins:', admins);

  return (
    <div className="admin-table-container">
      <div className="admin-header">
        <h2>Admins</h2>
        <button className="create-button" onClick={handleCreateAdmin}>Create Admin</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {admins.length === 0 ? (
            <tr><td>No admins found.</td></tr>
          ) : (
            admins.map((admin, index) => (
              <tr key={index} className="table-row">
                <td className="username-cell">
                  <span className="username-text">{admin.username}</span>
                  <button className="delete-button" onClick={() => handleDelete(admin._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Admin</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newAdmin.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newAdmin.password}
                onChange={handleInputChange}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTable;