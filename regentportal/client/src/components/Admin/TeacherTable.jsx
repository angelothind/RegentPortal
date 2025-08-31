import React, { useState, useEffect } from 'react';
import '../../styles/Admin/TeacherTable.css';
import API_BASE from '../../utils/api';

const TeacherTable = ({ onBack }) => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({ username: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/lookup/lookupteachers`);
      const data = await response.json();
      setTeachers(data.teachers || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setLoading(false);
    }
  };

  const handleCreateTeacher = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setNewTeacher({ ...newTeacher, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = newTeacher;
    if (!username || !password) return alert('Username and password required');

    try {
      const response = await fetch(`${API_BASE}/api/create/createteacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create teacher');

      setTeachers([...teachers, { _id: data._id, username: data.username }]);
      setShowModal(false);
      setNewTeacher({ username: '', password: '' });
    } catch (err) {
      console.error('Error creating teacher:', err);
      alert('❌ Failed to create teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/delete/deleteteacher/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setTeachers(teachers.filter((teacher) => teacher._id !== id));
    } catch (err) {
      console.error('Error deleting teacher:', err);
      alert('❌ Could not delete teacher');
    }
  };

  if (loading) return <p>Loading teachers...</p>;

  return (
    <div className="teacher-table-container">
      <div className="teacher-header">
        <h2>Teachers</h2>
        <button className="create-button" onClick={handleCreateTeacher}>Create Teacher</button>
      </div>

      <table className="teacher-table">
        <thead>
          <tr>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr><td>No teachers found.</td></tr>
          ) : (
            teachers.map((teacher, index) => (
              <tr key={index} className="table-row">
                <td className="username-cell">
                  <span className="username-text">{teacher.username}</span>
                  <button className="delete-button" onClick={() => handleDelete(teacher._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Teacher</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newTeacher.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newTeacher.password}
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

export default TeacherTable;