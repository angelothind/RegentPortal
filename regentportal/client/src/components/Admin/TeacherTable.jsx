import React, { useEffect, useState } from 'react';
import '../../styles/Admin/TeacherTable.css';

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        const data = await response.json();
        setTeachers(data.teachers || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch teachers:', err);
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleCreateTeacher = () => {
    // TODO: implement modal or redirect for creating a teacher
    console.log('🧠 "Create Teacher" clicked');
  };

  if (loading) return <p>Loading teachers...</p>;

  return (
    <div className="teacher-table-container">
      <div className="teacher-header">
        <h2>Teachers</h2>
        <button className="create-button" onClick={handleCreateTeacher}>
          Create Teacher
        </button>
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
            <tr>
              <td colSpan="2">No teachers found.</td>
            </tr>
          ) : (
            teachers.map((teacher, index) => (
              <tr key={index}>
                <td>{teacher.name}</td>
                <td>{teacher.username}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherTable;