import React, { useEffect, useState } from 'react';
import '../../styles/Admin/StudentTable.css';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students'); // Update this if needed
        const data = await response.json();
        setStudents(data.students || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleCreateStudent = () => {
    // TODO: Replace this with modal/form/redirect
    console.log('📚 Create Student clicked');
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
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="3">No students found.</td>
            </tr>
          ) : (
            students.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.username}</td>
                <td>{student.password}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;