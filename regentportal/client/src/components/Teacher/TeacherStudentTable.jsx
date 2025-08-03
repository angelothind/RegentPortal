import React, { useEffect, useState } from 'react';
import '../../styles/Admin/StudentTable.css';

const TeacherStudentTable = ({ onStudentSelect }) => {
  const [students, setStudents] = useState([]);
  const [favoritedStudents, setFavoritedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    fetchStudents();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavoritedStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
<<<<<<< HEAD
      const response = await fetch('/api/lookup/lookupstudents');
      const data = await response.json();
=======
      console.log('🔍 TeacherStudentTable: Fetching students...');
      const response = await fetch('/api/lookup/lookupstudents');
      const data = await response.json();
      console.log('🔍 TeacherStudentTable: Received students data:', data);
>>>>>>> student-teacher-testanalysis
      setStudents(data.students || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setLoading(false);
    }
  };

  const fetchFavoritedStudents = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/teachers/${user._id}/favorites`);
      const data = await response.json();
      setFavoritedStudents(data.favoritedStudents || []);
    } catch (err) {
      console.error('Failed to fetch favorited students:', err);
    }
  };

  const handleToggleFavorite = async (studentId) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/teachers/${user._id}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        // Update local state
        if (favoritedStudents.includes(studentId)) {
          setFavoritedStudents(favoritedStudents.filter(id => id !== studentId));
        } else {
          setFavoritedStudents([...favoritedStudents, studentId]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleStudentClick = (student) => {
    onStudentSelect(student);
  };

  // Sort students: favorited first, then alphabetically
  const sortedStudents = [...students].sort((a, b) => {
    const aFavorited = favoritedStudents.includes(a._id);
    const bFavorited = favoritedStudents.includes(b._id);
    
    if (aFavorited && !bFavorited) return -1;
    if (!aFavorited && bFavorited) return 1;
    
    return a.name.localeCompare(b.name);
  });

  if (loading) return <p>Loading students...</p>;

<<<<<<< HEAD
=======
  console.log('🔍 TeacherStudentTable render - students:', students);
  console.log('🔍 TeacherStudentTable render - loading:', loading);

>>>>>>> student-teacher-testanalysis
  return (
    <div className="student-table-container">
      <div className="student-header">
        <h2>Students</h2>
<<<<<<< HEAD
=======
        <p>Debug: Component is rendering</p>
>>>>>>> student-teacher-testanalysis
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.length === 0 ? (
            <tr>
              <td colSpan="3">No students found.</td>
            </tr>
          ) : (
            sortedStudents.map((student, index) => (
              <tr 
                key={index} 
                className={`table-row ${favoritedStudents.includes(student._id) ? 'favorited' : ''}`}
                onClick={() => handleStudentClick(student)}
                style={{ cursor: 'pointer' }}
              >
                <td className="name-cell">
                  <span className="name-text">
                    {favoritedStudents.includes(student._id) && '⭐ '}
                    {student.name}
                  </span>
                </td>
                <td className="username-cell">
                  <span className="username-text">{student.username}</span>
                </td>
                <td>
                  <button 
                    className="favorite-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(student._id);
                    }}
                    title={favoritedStudents.includes(student._id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {favoritedStudents.includes(student._id) ? '★' : '☆'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherStudentTable; 