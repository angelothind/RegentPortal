import React, { useEffect, useState } from 'react';
import '../../styles/Admin/TeacherTable.css';

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', username: '', password: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/lookup/lookupteachers');
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
    const { name, username, password } = newTeacher;

    if (!name || !username || !password) return alert('All fields required');

    try {
      const response = await fetch('/api/create/createteacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create teacher');

      setTeachers([...teachers, { _id: data._id, name, username }]);
      setShowModal(false);
      setNewTeacher({ name: '', username: '', password: '' });
    } catch (err) {
      console.error('Error creating teacher:', err);
      alert('❌ Failed to create teacher');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const res = await fetch(`/api/create/deleteteacher/${id}`, { method: 'DELETE' });
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
            <th>Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr><td colSpan="2">No teachers found.</td></tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher._id} className="table-row">
                <td className="name-cell">
                  <span className="name-text">{teacher.name}</span>
                </td>
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
              <input type="text" name="name" placeholder="Name" value={newTeacher.name} onChange={handleInputChange} required />
              <input type="text" name="username" placeholder="Username" value={newTeacher.username} onChange={handleInputChange} required />
              <input type="password" name="password" placeholder="Password" value={newTeacher.password} onChange={handleInputChange} required />
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