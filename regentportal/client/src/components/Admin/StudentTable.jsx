import React, { useEffect, useState } from 'react';
import '../../styles/Admin/StudentTable.css';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', username: '', password: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/lookup/lookupstudents');
      const data = await response.json();
      setStudents(data.students || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setLoading(false);
    }
  };

  const handleCreateStudent = () => {
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, username, password } = newStudent;

    if (!name || !username || !password) return alert('All fields are required');

    try {
      const response = await fetch('/api/create/createstudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create student');

      setStudents([...students, { _id: data._id, name, username }]);
      setShowModal(false);
      setNewStudent({ name: '', username: '', password: '' });
    } catch (err) {
      console.error('Error creating student:', err);
      alert('❌ Failed to create student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;

    try {
      const res = await fetch(`/api/delete/deletestudent/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Error deleting student:', err);
      alert('❌ Could not delete student');
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="student-table-container">
      <div className="student-header">
        <h2>Students</h2>
        <button className="create-button" onClick={handleCreateStudent}>
          Create Student
        </button>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="3">No students found.</td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={index} className="table-row">
                <td className="name-cell">
                  <span className="name-text">{student.name}</span>
                </td>
                <td className="username-cell">
                  <span className="username-text">{student.username}</span>
                  <button className="delete-button" onClick={() => handleDelete(student._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Student</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={newStudent.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={newStudent.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newStudent.password}
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

export default StudentTable;