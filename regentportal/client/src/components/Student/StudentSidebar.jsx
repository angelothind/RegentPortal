import React, { useState, useEffect } from 'react';
import '../../styles/UserLayout/SideBar.css';

const StudentSidebar = ({ onSelectTest, onLogout }) => {
  const [books, setBooks] = useState([]);
  const [openBook, setOpenBook] = useState(null);
  const [openTest, setOpenTest] = useState(null);

  useEffect(() => {
    console.log('📦 StudentSidebar mounted');
    
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();
  }, []);

  const toggleBook = (bookName) => {
    setOpenBook((prev) => (prev === bookName ? null : bookName));
    setOpenTest(null); // reset open test section
  };

  const toggleTest = (testName) => {
    setOpenTest((prev) => (prev === testName ? null : testName));
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Student Portal</h2>
      <ul className="sidebar-nav">
        {books.map((book) => (
          <li key={book._id}>
            <button onClick={() => toggleBook(book.name)}>{book.name}</button>

            {openBook === book.name && (
              <ul className="dropdown">
                {book.tests.map(({ testId, testName }) => (
                  <li key={testId._id}>
                    <button onClick={() => toggleTest(testName)}>{testName}</button>

                    {openTest === testName && (
                      <ul className="dropdown nested">
                        <li>
                          <button onClick={() => onSelectTest({ type: 'Reading', testId })}>
                            Reading
                          </button>
                        </li>
                        <li>
                          <button onClick={() => onSelectTest({ type: 'Listening', testId })}>
                            Listening
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}

        <li>
          <button className="logout" onClick={onLogout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default StudentSidebar;