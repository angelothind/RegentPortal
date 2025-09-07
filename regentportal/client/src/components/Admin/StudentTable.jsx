import React, { useState, useEffect } from 'react';
import '../../styles/Admin/StudentTable.css';
import API_BASE from '../../utils/api';

const StudentTable = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({ name: '', nickname: '', username: '', password: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/lookup/lookupstudents`);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, nickname, username, password } = newStudent;
    if (!name || !nickname || !username || !password) {
      return alert('All fields are required: Name, Nickname, Username, and Password');
    }

    try {
      const response = await fetch(`${API_BASE}/api/create/createstudent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create student');

      console.log('✅ Student created successfully:', data);
      console.log('📝 Backend response data:', data);
      
      // Create complete user object with all fields
      const newUser = {
        _id: data._id,
        name: newStudent.name,
        nickname: newStudent.nickname,
        username: newStudent.username
      };
      
      console.log('📝 Adding new user to state:', newUser);
      setStudents([...students, newUser]);
      setShowModal(false);
      setNewStudent({ name: '', nickname: '', username: '', password: '' });
    } catch (err) {
      console.error('Error creating student:', err);
      alert('❌ Failed to create student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/delete/deletestudent/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setStudents(students.filter((student) => student._id !== id));
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
        <button className="create-button" onClick={handleCreateStudent}>Create Student</button>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search students by name, nickname, or username..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {searchTerm && (
          <span className="search-results-count">
            {filteredStudents.length} of {students.length} students
          </span>
        )}
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Nickname</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody key={filteredStudents.length}>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan="3">
                {searchTerm ? `No students found matching "${searchTerm}"` : 'No students found.'}
              </td>
            </tr>
          ) : (
            filteredStudents.map((student, index) => (
              <tr key={student._id || index} className="table-row">
                <td className="name-cell">
                  <span className="name-text">{student.name}</span>
                </td>
                <td className="nickname-cell">
                  <span className="nickname-text">{student.nickname}</span>
                </td>
                <td className="username-cell">
                  <span className="username-text">{student.username}</span>
                  <button className="delete-button" onClick={() => handleDelete(student._id)}>Delete</button>
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
                placeholder="Full Name"
                value={newStudent.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="nickname"
                placeholder="Nickname"
                value={newStudent.nickname}
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