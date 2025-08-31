import React, { useState, useEffect } from 'react';
import '../../styles/Admin/StudentTable.css';
import API_BASE from '../../utils/api';

const TeacherStudentTable = ({ onStudentSelect, user: propUser }) => {
  const [students, setStudents] = useState([]);
  const [favoritedStudents, setFavoritedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(propUser);

  useEffect(() => {
    // Use propUser if available, otherwise get from localStorage
    if (propUser) {
      console.log('🔍 TeacherStudentTable: Using user from props:', propUser);
      setUser(propUser);
    } else {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
      console.log('🔍 TeacherStudentTable: Stored user data:', storedUser);
      
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
          console.log('🔍 TeacherStudentTable: Parsed user data:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
          console.error('❌ Error parsing user data:', error);
        }
      } else {
        console.log('❌ No user data found in localStorage');
      }
    }

    fetchStudents();
  }, [propUser]);

  useEffect(() => {
    if (user) {
      fetchFavoritedStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      console.log('🔍 TeacherStudentTable: Fetching students...');
      const response = await fetch(`${API_BASE}/api/lookup/lookupstudents`);
      const data = await response.json();
      console.log('🔍 TeacherStudentTable: Received students data:', data);
      setStudents(data.students || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setLoading(false);
    }
  };

  const fetchFavoritedStudents = async () => {
    if (!user) {
      console.log('❌ No user found for fetching favorites');
      return;
    }
    
    console.log('🔍 Fetching favorited students for user:', user._id);
    
    try {
      const response = await fetch(`${API_BASE}/api/teachers/${user._id}/favorites`);
      console.log('🔍 Favorites response status:', response.status);
      
      if (response.ok) {
      const data = await response.json();
        console.log('🔍 Favorites data:', data);
      setFavoritedStudents(data.favoritedStudents || []);
      } else {
        console.error('❌ Failed to fetch favorited students:', response.status);
      }
    } catch (err) {
      console.error('❌ Failed to fetch favorited students:', err);
    }
  };

  const handleToggleFavorite = async (studentId) => {
    if (!user) {
      console.error('❌ No user found for favoriting');
      return;
    }

    console.log('🔍 Toggling favorite for studentId:', studentId);
    console.log('🔍 Current favoritedStudents:', favoritedStudents);
    console.log('🔍 User ID:', user._id);

    try {
      const response = await fetch(`${API_BASE}/api/teachers/${user._id}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Response data:', data);
        
        // Update local state
        if (favoritedStudents.includes(studentId)) {
          setFavoritedStudents(favoritedStudents.filter(id => id !== studentId));
        } else {
          setFavoritedStudents([...favoritedStudents, studentId]);
        }
      } else {
        console.error('❌ Failed to toggle favorite:', response.status);
      }
    } catch (err) {
      console.error('❌ Failed to toggle favorite:', err);
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

  console.log('🔍 TeacherStudentTable render - students:', students);
  console.log('🔍 TeacherStudentTable render - loading:', loading);

  return (
    <div className="student-table-container">
      <div className="student-header">
        <h2>Students</h2>
        <p>Debug: Component is rendering</p>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Favorites</th>
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